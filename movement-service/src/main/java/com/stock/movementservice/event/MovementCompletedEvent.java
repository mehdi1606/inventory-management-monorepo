package com.stock.movementservice.event;

import com.stock.movementservice.entity.enums.MovementType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class MovementCompletedEvent extends BaseMovementEvent {
    private UUID movementId;
    private MovementType movementType;
    private UUID warehouseId;
    private UUID sourceLocationId;
    private UUID destinationLocationId;
    private String referenceNumber;
    private LocalDateTime completedAt;
    private Integer totalLines;
    private Integer completedLines;

    public MovementCompletedEvent(UUID movementId, MovementType movementType, UUID warehouseId,
                                  UUID sourceLocationId, UUID destinationLocationId,
                                  String referenceNumber, LocalDateTime completedAt,
                                  Integer totalLines, Integer completedLines, UUID userId) {
        super("MOVEMENT_COMPLETED", userId);
        this.movementId = movementId;
        this.movementType = movementType;
        this.warehouseId = warehouseId;
        this.sourceLocationId = sourceLocationId;
        this.destinationLocationId = destinationLocationId;
        this.referenceNumber = referenceNumber;
        this.completedAt = completedAt;
        this.totalLines = totalLines;
        this.completedLines = completedLines;
    }
}
