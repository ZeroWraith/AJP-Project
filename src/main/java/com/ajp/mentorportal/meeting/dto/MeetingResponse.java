package com.ajp.mentorportal.meeting.dto;

import com.ajp.mentorportal.meeting.MeetingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class MeetingResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime meetingDate;
    private String location;
    private Long mentorId;
    private String mentorName;
    private Long menteeId;
    private String menteeName;
    private MeetingStatus status;
    private LocalDateTime createdAt;
}
