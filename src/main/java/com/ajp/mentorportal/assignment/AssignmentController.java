package com.ajp.mentorportal.assignment;

import com.ajp.mentorportal.assignment.dto.AssignmentRequest;
import com.ajp.mentorportal.assignment.dto.AssignmentResponse;
import com.ajp.mentorportal.assignment.dto.StatusUpdateRequest;
import com.ajp.mentorportal.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/my")
    public ResponseEntity<List<AssignmentResponse>> getMyAssignments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(assignmentService.getMyAssignments(user.getId(), user.getRole().name()));
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AssignmentResponse> updateStatus(@PathVariable Long id,
                                                           @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(assignmentService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
