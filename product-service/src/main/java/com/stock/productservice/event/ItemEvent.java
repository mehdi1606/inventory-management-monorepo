package com.stock.productservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemEvent {
    private String id;
    private String sku;
    private String name;
    private String categoryId;
    private String itemVariantId;
    private Boolean isActive;
    private LocalDateTime timestamp;
    private String eventType; // CREATED, UPDATED, DELETED
}