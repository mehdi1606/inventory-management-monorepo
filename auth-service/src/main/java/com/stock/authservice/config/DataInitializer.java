package com.stock.authservice.config;

import com.stock.authservice.entity.Role;
import com.stock.authservice.entity.User;
import com.stock.authservice.repository.RoleRepository;
import com.stock.authservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initializeRoles();
        initializeAdminUser();
    }

    private void initializeRoles() {
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            Role adminRole = Role.builder()
                    .name("ADMIN")
                    .description("Full system access")
                    .isSystem(true)
                    .isActive(true)
                    .build();
            roleRepository.save(adminRole);
            log.info("ADMIN role created");
        }
    }

    private void initializeAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow();

            User admin = User.builder()
                    .username("admin")
                    .email("admin@stock.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .isActive(true)
                    .isEmailVerified(true)
                    .mfaEnabled(false)
                    .failedLoginAttempts(0)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("Admin user created: admin / Admin@123");
        }
    }
}
