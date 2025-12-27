package com.stock.qualityservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(InspectionNotFoundException.class)
    public ResponseEntity<Object> handleInspectionNotFoundException(
            InspectionNotFoundException ex, WebRequest request) {
        log.error("Inspection not found: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(QuarantineNotFoundException.class)
    public ResponseEntity<Object> handleQuarantineNotFoundException(
            QuarantineNotFoundException ex, WebRequest request) {
        log.error("Quarantine not found: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(QualityProfileNotFoundException.class)
    public ResponseEntity<Object> handleQualityProfileNotFoundException(
            QualityProfileNotFoundException ex, WebRequest request) {
        log.error("Quality profile not found: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(SamplingPlanNotFoundException.class)
    public ResponseEntity<Object> handleSamplingPlanNotFoundException(
            SamplingPlanNotFoundException ex, WebRequest request) {
        log.error("Sampling plan not found: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        log.error("Resource not found: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(DuplicateInspectionException.class)
    public ResponseEntity<Object> handleDuplicateInspectionException(
            DuplicateInspectionException ex, WebRequest request) {
        log.error("Duplicate inspection: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(DuplicateQuarantineException.class)
    public ResponseEntity<Object> handleDuplicateQuarantineException(
            DuplicateQuarantineException ex, WebRequest request) {
        log.error("Duplicate quarantine: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Object> handleDuplicateResourceException(
            DuplicateResourceException ex, WebRequest request) {
        log.error("Duplicate resource: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(InvalidInspectionStateException.class)
    public ResponseEntity<Object> handleInvalidInspectionStateException(
            InvalidInspectionStateException ex, WebRequest request) {
        log.error("Invalid inspection state: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(InvalidQuarantineStateException.class)
    public ResponseEntity<Object> handleInvalidQuarantineStateException(
            InvalidQuarantineStateException ex, WebRequest request) {
        log.error("Invalid quarantine state: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(InspectionAlreadyCompletedException.class)
    public ResponseEntity<Object> handleInspectionAlreadyCompletedException(
            InspectionAlreadyCompletedException ex, WebRequest request) {
        log.error("Inspection already completed: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(QuarantineAlreadyReleasedException.class)
    public ResponseEntity<Object> handleQuarantineAlreadyReleasedException(
            QuarantineAlreadyReleasedException ex, WebRequest request) {
        log.error("Quarantine already released: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(InvalidSampleSizeException.class)
    public ResponseEntity<Object> handleInvalidSampleSizeException(
            InvalidSampleSizeException ex, WebRequest request) {
        log.error("Invalid sample size: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(InsufficientQuantityException.class)
    public ResponseEntity<Object> handleInsufficientQuantityException(
            InsufficientQuantityException ex, WebRequest request) {
        log.error("Insufficient quantity: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(InvalidFileTypeException.class)
    public ResponseEntity<Object> handleInvalidFileTypeException(
            InvalidFileTypeException ex, WebRequest request) {
        log.error("Invalid file type: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<Object> handleFileUploadException(
            FileUploadException ex, WebRequest request) {
        log.error("File upload error: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<Object> handleBusinessRuleViolationException(
            BusinessRuleViolationException ex, WebRequest request) {
        log.error("Business rule violation: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(QualityServiceException.class)
    public ResponseEntity<Object> handleQualityServiceException(
            QualityServiceException ex, WebRequest request) {
        log.error("Quality service error: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        log.error("Illegal argument: {}", ex.getMessage());
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(
            Exception ex, WebRequest request) {
        log.error("Unexpected error occurred", ex);
        return buildErrorResponse(
                "An unexpected error occurred. Please contact support.",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request
        );
    }

    private ResponseEntity<Object> buildErrorResponse(
            String message,
            HttpStatus status,
            WebRequest request) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, status);
    }
}
