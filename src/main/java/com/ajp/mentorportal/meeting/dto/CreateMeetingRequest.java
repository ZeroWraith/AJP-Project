package com.ajp.mentorportal.meeting.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateMeetingRequest {
    @NotNull
    private String title;

    private String description;

    @NotNull
    private LocalDateTime meetingDate;

    private String location;

    @NotNull
    private Long mentorId;

    @NotNull
    private Long menteeId;
}
