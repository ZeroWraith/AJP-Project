package com.ajp.mentorportal.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
            }))
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints (public except /api/auth/me/**)
                .requestMatchers("/api/auth/me/**").authenticated()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // ADMIN only
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/assignments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/assignments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/assignments/**").hasRole("ADMIN")
                .requestMatchers("/api/bulk-messages/**").hasRole("ADMIN")
                .requestMatchers("/api/templates/**").hasRole("ADMIN")
                .requestMatchers("/api/groups/**").hasRole("ADMIN")

                // Authenticated
                .requestMatchers("/api/assignments/my").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/assignments/**").authenticated()
                .requestMatchers("/api/meetings/**").authenticated()
                .requestMatchers("/api/messages/**").authenticated()
                .requestMatchers("/api/dashboard/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
