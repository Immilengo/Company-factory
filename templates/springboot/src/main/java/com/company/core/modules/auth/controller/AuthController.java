package com.company.core.modules.auth.controller;

import com.company.core.modules.auth.dto.ForgotPasswordRequest;
import com.company.core.modules.auth.dto.LoginRequest;
import com.company.core.modules.auth.dto.RefreshRequest;
import com.company.core.modules.auth.dto.RegisterRequest;
import com.company.core.modules.auth.dto.ResendVerificationEmailRequest;
import com.company.core.modules.auth.dto.ResetPasswordRequest;
import com.company.core.modules.auth.dto.TokenResponse;
import com.company.core.modules.auth.dto.VerifyEmailRequest;
import com.company.core.modules.auth.service.AuthService;
import com.company.core.modules.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/auth")
@Tag(name = "Auth", description = "Endpoints publicos para autenticacao, renovacao de token e recuperacao de conta")
@SecurityRequirements(value = {})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar conta", description = "Cria um novo usuario com status inicial pendente e role USER.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Usuario registrado com sucesso"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados invalidos ou email ja utilizado")
    })
    public ResponseEntity<ApiResponse<Void>> register(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Dados de cadastro",
            required = true,
            content = @Content(
                schema = @Schema(implementation = RegisterRequest.class),
                examples = @ExampleObject(value = """
                    {
                      "fullName": "John Doe",
                      "email": "john@company.com",
                      "password": "StrongPass123@",
                      "phone": "+244900000000"
                    }
                    """)
            )
        )
        @Valid @RequestBody RegisterRequest request
    ) {
        boolean emailSent = authService.register(request);
        String message = emailSent
            ? "User registered successfully. Verification email sent."
            : "User registered successfully, but verification email could not be sent now. Use resend verification endpoint.";
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message(message).build());
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuario", description = "Valida credenciais e retorna access token JWT + refresh token.")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login realizado com sucesso"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Credenciais invalidas")
    })
    public ResponseEntity<ApiResponse<TokenResponse>> login(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Credenciais de acesso",
            required = true,
            content = @Content(
                schema = @Schema(implementation = LoginRequest.class),
                examples = @ExampleObject(value = """
                    {
                      "email": "admin@company.com",
                      "password": "Admin123@"
                    }
                    """)
            )
        )
        @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<TokenResponse>builder().success(true).message("Login successful").data(authService.login(request)).build());
    }

    @PostMapping("/logout")
    @Operation(summary = "Encerrar sessao", description = "Invalida o refresh token para impedir nova renovacao de acesso.")
    @SecurityRequirements(value = {})
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Logout successful").build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token", description = "Recebe refresh token valido e devolve novo par de tokens.")
    @SecurityRequirements(value = {})
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.<TokenResponse>builder().success(true).message("Token refreshed").data(authService.refresh(request)).build());
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperacao de senha", description = "Envia email com token de redefinicao de senha.")
    @SecurityRequirements(value = {})
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        boolean emailSent = authService.forgotPassword(request);
        String message = emailSent
            ? "If the email exists, reset instructions were sent"
            : "If the email exists, reset token was generated but email could not be sent now";
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message(message).build());
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Redefinir senha", description = "Confirma token de recuperacao e atualiza senha.")
    @SecurityRequirements(value = {})
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Password reset successfully").build());
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verificar email", description = "Confirma token de verificacao de email.")
    @SecurityRequirements(value = {})
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Parameter(description = "Token de verificacao") @RequestParam String token) {
        authService.verifyEmail(new VerifyEmailRequest(token));
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Email verified successfully").build());
    }

    @PostMapping("/resend-verification-email")
    @Operation(summary = "Reenviar verificacao", description = "Reenvia email de verificacao da conta.")
    @SecurityRequirements(value = {})
    public ResponseEntity<ApiResponse<Void>> resendVerificationEmail(@Valid @RequestBody ResendVerificationEmailRequest request) {
        boolean emailSent = authService.resendVerificationEmail(request);
        String message = emailSent
            ? "Verification email resent"
            : "Verification token regenerated, but email could not be sent now. Try again shortly.";
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message(message).build());
    }
}
