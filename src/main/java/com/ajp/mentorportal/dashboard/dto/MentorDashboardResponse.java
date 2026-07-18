package com.ajp.mentorportal.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class MentorDashboardResponse {
    private long myMentees;
    private long upcomingMeetings;
    private long completedMeetings;
    private long messagesSent;
    private List<Map<String, Object>> mentees;
    private List<Map<String, Object>> upcomingMeetingsList;
    private List<Map<String, Object>> recentMessages;
}
