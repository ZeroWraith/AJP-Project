package com.ajp.mentorportal.assignment.dto;

import com.ajp.mentorportal.assignment.AssignmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull
    private AssignmentStatus status;
}
