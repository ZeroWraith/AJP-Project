package com.ajp.mentorportal.dashboard;

import com.ajp.mentorportal.dashboard.dto.AdminDashboardResponse;
import com.ajp.mentorportal.dashboard.dto.MenteeDashboardResponse;
import com.ajp.mentorportal.dashboard.dto.MentorDashboardResponse;
import com.ajp.mentorportal.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/mentor")
    public ResponseEntity<MentorDashboardResponse> getMentorDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getMentorDashboard(user));
    }

    @GetMapping("/mentee")
    public ResponseEntity<MenteeDashboardResponse> getMenteeDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getMenteeDashboard(user));
    }
}
