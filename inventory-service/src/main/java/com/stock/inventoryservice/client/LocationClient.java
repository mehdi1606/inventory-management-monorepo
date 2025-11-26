package com.stock.inventoryservice.client;

import com.stock.inventoryservice.dto.external.LocationResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Client to communicate with location-service
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LocationClient {

    private final WebClient webClient;

    @Value("${services.location-service.url:http://localhost:8085}")
    private String locationServiceUrl;

    /**
     * Fetch location details by ID
     */
    public LocationResponseDTO getLocationById(String locationId) {
        log.debug("Fetching location from location-service: {}", locationId);

        try {
            return webClient.get()
                    .uri(locationServiceUrl + "/api/locations/{id}", locationId)
                    .retrieve()
                    .bodyToMono(LocationResponseDTO.class)
                    .block(); // Blocking call for simplicity
        } catch (Exception e) {
            log.error("Failed to fetch location with ID: {}", locationId, e);
            throw new RuntimeException("Unable to fetch location details from location-service", e);
        }
    }

    /**
     * Fetch location details by ID (async version)
     */
    public Mono<LocationResponseDTO> getLocationByIdAsync(String locationId) {
        log.debug("Fetching location asynchronously from location-service: {}", locationId);

        return webClient.get()
                .uri(locationServiceUrl + "/api/locations/{id}", locationId)
                .retrieve()
                .bodyToMono(LocationResponseDTO.class)
                .doOnError(e -> log.error("Failed to fetch location with ID: {}", locationId, e));
    }
}
