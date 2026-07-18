package com.ajp.mentorportal.assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignmentRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long mentorId;

    private String notes;
}
