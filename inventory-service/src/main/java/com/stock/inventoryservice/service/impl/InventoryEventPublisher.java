package com.stock.inventoryservice.service.impl;

import com.stock.inventoryservice.event.dto.InventoryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String INVENTORY_CREATED_TOPIC = "inventory.created";
    private static final String INVENTORY_UPDATED_TOPIC = "inventory.updated";
    private static final String INVENTORY_DELETED_TOPIC = "inventory.deleted";
    private static final String INVENTORY_ADJUSTED_TOPIC = "inventory.adjusted";
    private static final String INVENTORY_RESERVED_TOPIC = "inventory.reserved";
    private static final String INVENTORY_RELEASED_TOPIC = "inventory.released";
    private static final String INVENTORY_TRANSFERRED_TOPIC = "inventory.transferred";

    /**
     * Publish inventory event based on event type
     */
    public void publishInventoryEvent(InventoryEvent event) {
        String topic = getTopicByEventType(event.getEventType());

        log.info("Publishing inventory event: {} to topic: {}", event.getEventType(), topic);

        try {
            kafkaTemplate.send(topic, event.getInventoryId(), event)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("Successfully published inventory event: {} for inventory: {}",
                                    event.getEventType(), event.getInventoryId());
                        } else {
                            log.error("Failed to publish inventory event: {} for inventory: {}",
                                    event.getEventType(), event.getInventoryId(), ex);
                        }
                    });
        } catch (Exception e) {
            log.error("Error publishing inventory event: {}", event.getEventType(), e);
        }
    }

    /**
     * Get Kafka topic based on event type
     */
    private String getTopicByEventType(String eventType) {
        return switch (eventType.toUpperCase()) {
            case "CREATED" -> INVENTORY_CREATED_TOPIC;
            case "UPDATED" -> INVENTORY_UPDATED_TOPIC;
            case "DELETED" -> INVENTORY_DELETED_TOPIC;
            case "ADJUSTED" -> INVENTORY_ADJUSTED_TOPIC;
            case "RESERVED" -> INVENTORY_RESERVED_TOPIC;
            case "RELEASED" -> INVENTORY_RELEASED_TOPIC;
            case "TRANSFERRED" -> INVENTORY_TRANSFERRED_TOPIC;
            default -> INVENTORY_UPDATED_TOPIC;
        };
    }
}
