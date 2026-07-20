package com.ajp.mentorportal.group.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class MemberInfo {
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
}
