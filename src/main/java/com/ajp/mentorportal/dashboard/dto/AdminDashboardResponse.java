package com.ajp.mentorportal.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalMentors;
    private long totalMentees;
    private long activeAssignments;
    private long meetingsThisWeek;
    private long messagesSent;
    private Map<String, Long> usersByRole;
    private List<Map<String, Object>> meetingsOverTime;
    private List<Map<String, Object>> recentActivity;
}
