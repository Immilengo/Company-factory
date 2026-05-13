package com.company.core.modules.auth.service;

import com.company.core.exceptions.BusinessException;
import com.company.core.modules.auth.dto.LoginRequest;
import com.company.core.modules.auth.dto.ForgotPasswordRequest;
import com.company.core.modules.auth.dto.RefreshRequest;
import com.company.core.modules.auth.dto.RegisterRequest;
import com.company.core.modules.auth.dto.ResendVerificationEmailRequest;
import com.company.core.modules.auth.dto.ResetPasswordRequest;
import com.company.core.modules.auth.dto.TokenResponse;
import com.company.core.modules.auth.dto.VerifyEmailRequest;
import com.company.core.modules.email.service.EmailService;
import com.company.core.modules.auth.entity.RefreshToken;
import com.company.core.modules.auth.repository.RefreshTokenRepository;
import com.company.core.modules.roles.repository.RoleRepository;
import com.company.core.modules.statuses.service.StatusService;
import com.company.core.modules.users.entity.User;
import com.company.core.modules.users.repository.UserRepository;
import com.company.core.security.JwtService;
import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.security.SecureRandom;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final StatusService statusService;
    private final EmailService emailService;
    private final long refreshExpirationMs;
    private final String publicBaseUrl;
    private static final Duration EMAIL_TOKEN_TTL = Duration.ofHours(24);
    private static final Duration RESET_TOKEN_TTL = Duration.ofHours(1);
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager,
                       StatusService statusService, EmailService emailService,
                       @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs,
                       @Value("${app.public-base-url}") String publicBaseUrl) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.statusService = statusService;
        this.emailService = emailService;
        this.refreshExpirationMs = refreshExpirationMs;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Transactional
    public boolean register(RegisterRequest request) {
        if (userRepository.findByEmailAndDeletedFalse(request.email().toLowerCase()).isPresent()) {
            throw new BusinessException("Email already in use");
        }
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFullName(request.fullName());
        user.setEmail(request.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setStatus(statusService.getByCode("PENDING"));
        user.setEmailVerified(false);
        user.setEmailVerificationToken(generateOpaqueToken());
        user.setEmailVerificationExpiresAt(OffsetDateTime.now().plus(EMAIL_TOKEN_TTL));
        roleRepository.findByName("USER").ifPresent(role -> user.getRoles().add(role));
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            log.error("register persistence error email={} reason={}", user.getEmail(), ex.getMostSpecificCause().getMessage());
            throw new BusinessException("Could not register user due to invalid persisted data constraints. Please contact support.");
        }
        return sendVerificationEmail(user);
    }

    public TokenResponse login(LoginRequest request) {
        String email = request.email().toLowerCase();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException ex) {
            throw new BusinessException("Invalid credentials");
        } catch (AuthenticationException ex) {
            throw new BusinessException("Authentication failed");
        }
        User user = userRepository.findByEmailAndDeletedFalse(email)
            .orElseThrow(() -> new BusinessException("Invalid credentials"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessException("Email not verified. Please verify your account before login.");
        }
        String statusCode = user.getStatus() == null ? null : user.getStatus().getCode();
        if (!"ACTIVE".equalsIgnoreCase(statusCode)) {
            throw new BusinessException("Account is not active. Please contact support.");
        }

        return issueTokens(user);
    }

    @Transactional
    public TokenResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndDeletedFalse(request.refreshToken())
            .orElseThrow(() -> new BusinessException("Invalid refresh token"));

        if (Boolean.TRUE.equals(refreshToken.getRevoked())) {
            throw new BusinessException("Refresh token revoked. Please login again.");
        }
        if (!refreshToken.getExpiresAt().isAfter(OffsetDateTime.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BusinessException("Refresh token expired. Please login again.");
        }

        User user = refreshToken.getUser();
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessException("Email not verified. Please verify your account before login.");
        }
        String statusCode = user.getStatus() == null ? null : user.getStatus().getCode();
        if (!"ACTIVE".equalsIgnoreCase(statusCode)) {
            throw new BusinessException("Account is not active. Please contact support.");
        }

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        return issueTokens(user);
    }

    @Transactional
    public void logout(RefreshRequest request) {
        RefreshToken token = refreshTokenRepository.findByTokenAndDeletedFalse(request.refreshToken())
            .orElseThrow(() -> new BusinessException("Invalid refresh token"));
        token.setRevoked(true);
        token.setDeleted(true);
        refreshTokenRepository.save(token);
    }

    @Transactional
    public boolean forgotPassword(ForgotPasswordRequest request) {
        final boolean[] emailSent = {false};
        userRepository.findByEmailAndDeletedFalse(request.email().toLowerCase()).ifPresent(user -> {
            user.setPasswordResetToken(generateOpaqueToken());
            user.setPasswordResetExpiresAt(OffsetDateTime.now().plus(RESET_TOKEN_TTL));
            userRepository.save(user);
            emailSent[0] = sendResetPasswordEmail(user);
        });
        return emailSent[0];
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetTokenAndDeletedFalse(request.token())
            .orElseThrow(() -> new BusinessException("Invalid reset token"));

        if (user.getPasswordResetExpiresAt() == null || !user.getPasswordResetExpiresAt().isAfter(OffsetDateTime.now())) {
            user.setPasswordResetToken(null);
            user.setPasswordResetExpiresAt(null);
            userRepository.save(user);
            throw new BusinessException("Reset token expired. Please request a new password reset.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmailVerificationTokenAndDeletedFalse(request.token())
            .orElseThrow(() -> new BusinessException("Invalid verification token"));

        if (user.getEmailVerificationExpiresAt() == null || !user.getEmailVerificationExpiresAt().isAfter(OffsetDateTime.now())) {
            user.setEmailVerificationToken(null);
            user.setEmailVerificationExpiresAt(null);
            userRepository.save(user);
            throw new BusinessException("Verification token expired. Please request a new verification email.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        user.setStatus(statusService.getByCode("ACTIVE"));
        userRepository.save(user);
    }

    @Transactional
    public boolean resendVerificationEmail(ResendVerificationEmailRequest request) {
        User user = userRepository.findByEmailAndDeletedFalse(request.email().toLowerCase())
            .orElseThrow(() -> new BusinessException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BusinessException("Email is already verified");
        }

        user.setEmailVerificationToken(generateOpaqueToken());
        user.setEmailVerificationExpiresAt(OffsetDateTime.now().plus(EMAIL_TOKEN_TTL));
        userRepository.save(user);
        return sendVerificationEmail(user);
    }

    @Transactional
    private TokenResponse issueTokens(User user) {
        refreshTokenRepository.findByUserIdAndRevokedFalseAndDeletedFalse(user.getId())
            .forEach(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), Map.of("roles", user.getRoles().stream().map(r -> r.getName()).toList()));
        String refresh = UUID.randomUUID() + "." + UUID.randomUUID();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID());
        refreshToken.setToken(refresh);
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(OffsetDateTime.now().plusNanos(refreshExpirationMs * 1_000_000));
        refreshTokenRepository.save(refreshToken);
        return new TokenResponse(accessToken, refresh);
    }

    private boolean sendVerificationEmail(User user) {
        String link = publicBaseUrl + "/public/auth/verify-email?token=" + user.getEmailVerificationToken();
        try {
            emailService.send(
                user.getEmail(),
                "Verificacao de conta",
                "Use este link para verificar a sua conta: " + link
            );
            return true;
        } catch (Exception ex) {
            log.warn("verification email failed userId={} email={} reason={}", user.getId(), user.getEmail(), ex.getMessage());
            return false;
        }
    }

    private boolean sendResetPasswordEmail(User user) {
        String link = publicBaseUrl + "/public/auth/reset-password?token=" + user.getPasswordResetToken();
        try {
            emailService.send(
                user.getEmail(),
                "Recuperacao de senha",
                "Use este link para redefinir a sua senha: " + link
            );
            return true;
        } catch (Exception ex) {
            log.warn("reset email failed userId={} email={} reason={}", user.getId(), user.getEmail(), ex.getMessage());
            return false;
        }
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
