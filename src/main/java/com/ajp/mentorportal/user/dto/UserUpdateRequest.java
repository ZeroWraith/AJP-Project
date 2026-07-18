package com.ajp.mentorportal.user.dto;

import com.ajp.mentorportal.user.Role;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private Role role;
    private Boolean isActive;
}
