package com.ajp.mentorportal.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class MenteeDashboardResponse {
    private Map<String, Object> mentor;
    private long upcomingMeetings;
    private long completedMeetings;
    private long messagesReceived;
    private List<Map<String, Object>> upcomingMeetingsList;
    private List<Map<String, Object>> recentMessages;
}
