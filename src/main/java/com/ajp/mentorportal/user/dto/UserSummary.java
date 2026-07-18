package com.ajp.mentorportal.user.dto;

import com.ajp.mentorportal.user.Role;
import com.ajp.mentorportal.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserSummary {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;

    public static UserSummary fromEntity(User user) {
        return UserSummary.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
