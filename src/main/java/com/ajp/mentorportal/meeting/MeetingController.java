package com.ajp.mentorportal.meeting;

import com.ajp.mentorportal.meeting.dto.CreateMeetingRequest;
import com.ajp.mentorportal.meeting.dto.MeetingResponse;
import com.ajp.mentorportal.meeting.dto.MeetingStatusRequest;
import com.ajp.mentorportal.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping
    public ResponseEntity<Page<MeetingResponse>> getAllMeetings(Pageable pageable) {
        return ResponseEntity.ok(meetingService.getAllMeetings(pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<List<MeetingResponse>> getMyMeetings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.getMyMeetings(user.getId()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<MeetingResponse>> getUpcomingMeetings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(meetingService.getUpcomingMeetings(user.getId()));
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@Valid @RequestBody CreateMeetingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.createMeeting(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MeetingResponse> updateStatus(@PathVariable Long id,
                                                         @Valid @RequestBody MeetingStatusRequest request) {
        return ResponseEntity.ok(meetingService.updateStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.noContent().build();
    }
}
