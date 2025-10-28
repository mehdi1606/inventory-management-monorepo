package com.stock.qualityservice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityControlUpdateRequest {

    @NotNull(message = "Inspection type is required")
    @Size(min = 1, max = 50, message = "Inspection type must be between 1 and 50 characters")
    private String inspectionType;

    @NotNull(message = "Status is required")
    @Size(min = 1, max = 30, message = "Status must be between 1 and 30 characters")
    private String status;

    @NotNull(message = "Result is required")
    @Size(min = 1, max = 30, message = "Result must be between 1 and 30 characters")
    private String result;

    private Integer defectCount;

    private Integer samplesInspected;

    private String defectDescription;

    private String correctiveActions;

    private String notes;

    private LocalDateTime inspectionDate;

    private Long inspectorId;

    private String inspectorName;

    private Boolean requiresReinspection;

    private LocalDateTime nextInspectionDate;

    private String certificateNumber;
}