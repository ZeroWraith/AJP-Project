package com.ajp.mentorportal.dashboard;

import com.ajp.mentorportal.assignment.AssignmentStatus;
import com.ajp.mentorportal.assignment.MentorMenteeRepository;
import com.ajp.mentorportal.dashboard.dto.AdminDashboardResponse;
import com.ajp.mentorportal.dashboard.dto.MenteeDashboardResponse;
import com.ajp.mentorportal.dashboard.dto.MentorDashboardResponse;
import com.ajp.mentorportal.user.Role;
import com.ajp.mentorportal.user.User;
import com.ajp.mentorportal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final MentorMenteeRepository mentorMenteeRepository;

    public AdminDashboardResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalMentors = userRepository.findByRole(Role.MENTOR).size();
        long totalMentees = userRepository.findByRole(Role.MENTEE).size();
        long activeAssignments = mentorMenteeRepository.findByStatus(AssignmentStatus.ACTIVE).size();

        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("ADMIN", (long) userRepository.findByRole(Role.ADMIN).size());
        usersByRole.put("MENTOR", totalMentors);
        usersByRole.put("MENTEE", totalMentees);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalMentors(totalMentors)
                .totalMentees(totalMentees)
                .activeAssignments(activeAssignments)
                .meetingsThisWeek(0)
                .messagesSent(0)
                .usersByRole(usersByRole)
                .meetingsOverTime(Collections.emptyList())
                .recentActivity(Collections.emptyList())
                .build();
    }

    public MentorDashboardResponse getMentorDashboard(User user) {
        return MentorDashboardResponse.builder()
                .myMentees(mentorMenteeRepository.findByMentorId(user.getId()).size())
                .upcomingMeetings(0)
                .completedMeetings(0)
                .messagesSent(0)
                .mentees(Collections.emptyList())
                .upcomingMeetingsList(Collections.emptyList())
                .recentMessages(Collections.emptyList())
                .build();
    }

    public MenteeDashboardResponse getMenteeDashboard(User user) {
        Map<String, Object> mentor = new HashMap<>();
        var assignments = mentorMenteeRepository.findByUserId(user.getId());
        if (!assignments.isEmpty()) {
            var assignment = assignments.getFirst();
            var mentorUser = userRepository.findById(assignment.getMentorId()).orElse(null);
            if (mentorUser != null) {
                mentor.put("name", mentorUser.getFirstName() + " " + mentorUser.getLastName());
                mentor.put("email", mentorUser.getEmail());
                mentor.put("phone", mentorUser.getPhone());
            }
        }

        return MenteeDashboardResponse.builder()
                .mentor(mentor)
                .upcomingMeetings(0)
                .completedMeetings(0)
                .messagesReceived(0)
                .upcomingMeetingsList(Collections.emptyList())
                .recentMessages(Collections.emptyList())
                .build();
    }
}
