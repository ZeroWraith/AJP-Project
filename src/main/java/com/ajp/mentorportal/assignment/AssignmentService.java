package com.ajp.mentorportal.assignment;

import com.ajp.mentorportal.assignment.dto.AssignmentRequest;
import com.ajp.mentorportal.assignment.dto.AssignmentResponse;
import com.ajp.mentorportal.assignment.dto.StatusUpdateRequest;
import com.ajp.mentorportal.user.User;
import com.ajp.mentorportal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final MentorMenteeRepository repository;
    private final UserRepository userRepository;

    public List<AssignmentResponse> getAllAssignments() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AssignmentResponse> getMyAssignments(Long userId, String role) {
        if ("MENTOR".equals(role)) {
            return repository.findByMentorId(userId).stream()
                    .map(this::toResponse)
                    .toList();
        }
        return repository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        if (repository.existsByUserIdAndMentorId(request.getUserId(), request.getMentorId())) {
            throw new IllegalArgumentException("Assignment already exists between these users");
        }

        MentorMentee assignment = MentorMentee.builder()
                .userId(request.getUserId())
                .mentorId(request.getMentorId())
                .notes(request.getNotes())
                .status(AssignmentStatus.PENDING)
                .build();

        assignment = repository.save(assignment);
        return toResponse(assignment);
    }

    @Transactional
    public AssignmentResponse updateStatus(Long id, StatusUpdateRequest request) {
        MentorMentee assignment = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found with id: " + id));
        assignment.setStatus(request.getStatus());
        assignment = repository.save(assignment);
        return toResponse(assignment);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        repository.deleteById(id);
    }

    private AssignmentResponse toResponse(MentorMentee assignment) {
        AssignmentResponse response = new AssignmentResponse();
        response.setId(assignment.getId());
        response.setUserId(assignment.getUserId());
        response.setMentorId(assignment.getMentorId());
        response.setStatus(assignment.getStatus());
        response.setNotes(assignment.getNotes());
        response.setAssignedDate(assignment.getAssignedDate());

        userRepository.findById(assignment.getUserId()).ifPresent(mentee -> {
            response.setMenteeName(mentee.getFirstName() + " " + mentee.getLastName());
            response.setMenteeEmail(mentee.getEmail());
        });

        userRepository.findById(assignment.getMentorId()).ifPresent(mentor -> {
            response.setMentorName(mentor.getFirstName() + " " + mentor.getLastName());
            response.setMentorEmail(mentor.getEmail());
        });

        return response;
    }
}
