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
public class QuarantineUpdateRequest {

    @NotNull(message = "Status is required")
    @Size(min = 1, max = 30, message = "Status must be between 1 and 30 characters")
    private String status;

    @NotNull(message = "Reason is required")
    @Size(min = 1, max = 500, message = "Reason must be between 1 and 500 characters")
    private String reason;

    private Long locationId;

    private String locationName;

    private Integer quantityQuarantined;

    private LocalDateTime quarantineStartDate;

    private LocalDateTime quarantineEndDate;

    private String severity;

    private String handlingInstructions;

    private String releaseConditions;

    private String releaseNotes;

    private LocalDateTime releaseDate;

    private Long releasedById;

    private String releasedByName;

    private String notes;
}