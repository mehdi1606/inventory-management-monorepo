package com.stock.qualityservice.event.outgoing;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStatusUpdateEvent {

    private String eventId;
    private String eventType = "INVENTORY_STATUS_UPDATE";
    private LocalDateTime eventTime;

    private String itemId;
    private String lotId;
    private String serialNumber;
    private String fromStatus; // QUARANTINED, ACTIVE, etc.
    private String toStatus;
    private Double quantity;
    private String reason;
    private String updatedBy;
}