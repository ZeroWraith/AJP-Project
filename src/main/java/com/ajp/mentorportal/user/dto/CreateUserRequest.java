package com.ajp.mentorportal.user.dto;

import com.ajp.mentorportal.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @Email
    private String email;

    private String phone;

    @NotNull
    private Role role;

    @NotBlank
    @Size(min = 6)
    private String password;
}
