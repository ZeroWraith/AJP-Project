package com.ajp.mentorportal.meeting.dto;

import com.ajp.mentorportal.meeting.MeetingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MeetingStatusRequest {
    @NotNull
    private MeetingStatus status;
}
