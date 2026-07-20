package com.ajp.mentorportal.config;

import com.ajp.mentorportal.user.Role;
import com.ajp.mentorportal.user.User;
import com.ajp.mentorportal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains users, skipping seed");
            return;
        }

        log.info("Seeding default test users...");

        userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@portal.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .isActive(true)
                .build());

        userRepository.save(User.builder()
                .firstName("Mentor")
                .lastName("One")
                .email("mentor1@portal.com")
                .passwordHash(passwordEncoder.encode("mentor123"))
                .role(Role.MENTOR)
                .isActive(true)
                .build());

        userRepository.save(User.builder()
                .firstName("Mentor")
                .lastName("Two")
                .email("mentor2@portal.com")
                .passwordHash(passwordEncoder.encode("mentor123"))
                .role(Role.MENTOR)
                .isActive(true)
                .build());

        userRepository.save(User.builder()
                .firstName("Mentee")
                .lastName("One")
                .email("mentee1@portal.com")
                .passwordHash(passwordEncoder.encode("mentee123"))
                .role(Role.MENTEE)
                .isActive(true)
                .build());

        userRepository.save(User.builder()
                .firstName("Mentee")
                .lastName("Two")
                .email("mentee2@portal.com")
                .passwordHash(passwordEncoder.encode("mentee123"))
                .role(Role.MENTEE)
                .isActive(true)
                .build());

        userRepository.save(User.builder()
                .firstName("Mentee")
                .lastName("Three")
                .email("mentee3@portal.com")
                .passwordHash(passwordEncoder.encode("mentee123"))
                .role(Role.MENTEE)
                .isActive(true)
                .build());

        log.info("Seeded 6 default test users");
    }
}
