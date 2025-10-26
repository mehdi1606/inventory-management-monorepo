package com.stock.movementservice.config;

import com.stock.movementservice.event.*;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.producer.client-id:movement-service-producer}")
    private String clientId;

    /**
     * Common producer configuration
     */
    private Map<String, Object> producerConfigs() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.CLIENT_ID_CONFIG, clientId);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.RETRY_BACKOFF_MS_CONFIG, 1000);
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        props.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        props.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return props;
    }

    /**
     * Producer Factory for Movement Events
     */
    @Bean
    public ProducerFactory<String, Object> movementEventProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Movement Events
     */
    @Bean
    public KafkaTemplate<String, Object> movementEventKafkaTemplate() {
        return new KafkaTemplate<>(movementEventProducerFactory());
    }

    /**
     * Producer Factory for Movement Created Event
     */
    @Bean
    public ProducerFactory<String, MovementCreatedEvent> movementCreatedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Movement Created Event
     */
    @Bean
    public KafkaTemplate<String, MovementCreatedEvent> movementCreatedKafkaTemplate() {
        return new KafkaTemplate<>(movementCreatedProducerFactory());
    }

    /**
     * Producer Factory for Movement Completed Event
     */
    @Bean
    public ProducerFactory<String, MovementCompletedEvent> movementCompletedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Movement Completed Event
     */
    @Bean
    public KafkaTemplate<String, MovementCompletedEvent> movementCompletedKafkaTemplate() {
        return new KafkaTemplate<>(movementCompletedProducerFactory());
    }

    /**
     * Producer Factory for Movement Cancelled Event
     */
    @Bean
    public ProducerFactory<String, MovementCancelledEvent> movementCancelledProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Movement Cancelled Event
     */
    @Bean
    public KafkaTemplate<String, MovementCancelledEvent> movementCancelledKafkaTemplate() {
        return new KafkaTemplate<>(movementCancelledProducerFactory());
    }

    /**
     * Producer Factory for Movement Status Changed Event
     */
    @Bean
    public ProducerFactory<String, MovementStatusChangedEvent> movementStatusChangedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Movement Status Changed Event
     */
    @Bean
    public KafkaTemplate<String, MovementStatusChangedEvent> movementStatusChangedKafkaTemplate() {
        return new KafkaTemplate<>(movementStatusChangedProducerFactory());
    }

    /**
     * Producer Factory for Task Assigned Event
     */
    @Bean
    public ProducerFactory<String, TaskAssignedEvent> taskAssignedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Task Assigned Event
     */
    @Bean
    public KafkaTemplate<String, TaskAssignedEvent> taskAssignedKafkaTemplate() {
        return new KafkaTemplate<>(taskAssignedProducerFactory());
    }

    /**
     * Producer Factory for Task Completed Event
     */
    @Bean
    public ProducerFactory<String, TaskCompletedEvent> taskCompletedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Task Completed Event
     */
    @Bean
    public KafkaTemplate<String, TaskCompletedEvent> taskCompletedKafkaTemplate() {
        return new KafkaTemplate<>(taskCompletedProducerFactory());
    }

    /**
     * Producer Factory for Inventory Update Event
     */
    @Bean
    public ProducerFactory<String, InventoryUpdateEvent> inventoryUpdateProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    /**
     * Kafka Template for Inventory Update Event
     */
    @Bean
    public KafkaTemplate<String, InventoryUpdateEvent> inventoryUpdateKafkaTemplate() {
        return new KafkaTemplate<>(inventoryUpdateProducerFactory());
    }
}
