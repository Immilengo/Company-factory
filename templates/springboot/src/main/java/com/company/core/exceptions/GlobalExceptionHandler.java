package com.company.core.exceptions;

import com.company.core.modules.common.dto.ApiErrorResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiErrorResponse.builder()
            .success(false).message(ex.getMessage()).errors(List.of()).build());
    }

    @ExceptionHandler({BusinessException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiErrorResponse> handleBusiness(Exception ex) {
        return ResponseEntity.badRequest().body(ApiErrorResponse.builder()
            .success(false).message(ex.getMessage()).errors(List.of()).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getAllErrors().stream()
            .map(error -> error instanceof FieldError fe ? fe.getField() + ": " + fe.getDefaultMessage() : error.getDefaultMessage())
            .toList();
        return ResponseEntity.badRequest().body(ApiErrorResponse.builder()
            .success(false).message("Validation error").errors(errors).build());
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiErrorResponse> handleBadArguments(Exception ex) {
        return ResponseEntity.badRequest().body(ApiErrorResponse.builder()
            .success(false).message(ex.getMessage()).errors(List.of()).build());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        String root = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiErrorResponse.builder()
            .success(false)
            .message("Database constraint violation: " + root)
            .errors(List.of())
            .build());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiErrorResponse.builder()
            .success(false).message("Access denied").errors(List.of()).build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponse.builder()
            .success(false).message("Internal server error").errors(List.of()).build());
    }
}
