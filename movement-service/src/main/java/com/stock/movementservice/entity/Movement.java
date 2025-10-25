package com.stock.movementservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movements",
        uniqueConstraints = @UniqueConstraint(columnNames = {"reference_number"}),
        indexes = {
                @Index(name = "idx_movement_type", columnList = "movement_type"),
                @Index(name = "idx_movement_status", columnList = "status"),
                @Index(name = "idx_source_location", columnList = "source_location_id"),
                @Index(name = "idx_destination_location", columnList = "destination_location_id"),
                @Index(name = "idx_item", columnList = "item_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Version
    private Long version;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 50)
    private MovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MovementStatus status;

    @Column(name = "reference_number", unique = true, nullable = false, length = 100)
    private String referenceNumber;

    @Column(name = "source_location_id", length = 255)
    private String sourceLocationId;

    @Column(name = "destination_location_id", length = 255)
    private String destinationLocationId;

    @Column(name = "item_id", nullable = false, length = 255)
    private String itemId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity;

    @Column(name = "requested_quantity", precision = 19, scale = 4)
    private BigDecimal requestedQuantity;

    @Column(name = "completed_quantity", precision = 19, scale = 4)
    private BigDecimal completedQuantity;

    @Column(name = "lot_number", length = 100)
    private String lotNumber;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "reason_code", length = 50)
    private String reasonCode;

    @Column(length = 1000)
    private String notes;

    @Column(name = "requested_by", length = 255)
    private String requestedBy;

    @Column(name = "approved_by", length = 255)
    private String approvedBy;

    @Column(name = "completed_by", length = 255)
    private String completedBy;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "expected_date")
    private LocalDateTime expectedDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
