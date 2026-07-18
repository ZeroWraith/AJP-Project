package com.ajp.mentorportal.assignment.dto;

import com.ajp.mentorportal.assignment.AssignmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentResponse {
    private Long id;
    private Long userId;
    private String menteeName;
    private String menteeEmail;
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    private AssignmentStatus status;
    private String notes;
    private LocalDateTime assignedDate;
}
