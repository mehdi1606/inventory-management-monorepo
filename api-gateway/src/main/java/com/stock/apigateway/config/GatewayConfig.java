package com.stock.apigateway.config;

import com.stock.apigateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service - NO JWT FILTER, NO REWRITE
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("http://localhost:8083"))

                // Product Service - NO REWRITE
                .route("product-service", r -> r
                        .path("/api/products/**", "/api/categories/**", "/api/items/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8082"))

                // Inventory Service - NO REWRITE
                .route("inventory-service", r -> r
                        .path("/api/inventory/**", "/api/lots/**","/api/serials/**", "/api/v1/admin/cache/items/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8086"))

                // Movement Service - NO REWRITE
                .route("movement-service", r -> r
                        .path("/api/movement-tasks/**", "/api/movement-lines/**","/api/movements/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8084"))

                // Location Service - FIX PORT + NO REWRITE
                .route("location-service", r -> r
                        .path("/api/locations/**", "/api/sites/**", "/api/warehouses/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8085"))

                // Quality Service - NO REWRITE
                .route("quality-service", r -> r
                        .path("/api/quality/**", "/api/quarantine/**", "/api/inspections/**")
                        .filters(f -> f
                                .filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8087"))

                .build();
    }
}
