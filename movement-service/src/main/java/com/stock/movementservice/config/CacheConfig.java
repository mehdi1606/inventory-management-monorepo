package com.stock.movementservice.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String MOVEMENT_CACHE = "movements";
    public static final String MOVEMENT_LINE_CACHE = "movementLines";
    public static final String MOVEMENT_TASK_CACHE = "movementTasks";
    public static final String MOVEMENT_STATISTICS_CACHE = "movementStatistics";

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
                new ConcurrentMapCache(MOVEMENT_CACHE),
                new ConcurrentMapCache(MOVEMENT_LINE_CACHE),
                new ConcurrentMapCache(MOVEMENT_TASK_CACHE),
                new ConcurrentMapCache(MOVEMENT_STATISTICS_CACHE)
        ));
        return cacheManager;
    }
}
