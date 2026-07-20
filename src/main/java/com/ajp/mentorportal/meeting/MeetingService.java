package com.ajp.mentorportal.meeting;

import com.ajp.mentorportal.common.ResourceNotFoundException;
import com.ajp.mentorportal.meeting.dto.CreateMeetingRequest;
import com.ajp.mentorportal.meeting.dto.MeetingResponse;
import com.ajp.mentorportal.user.User;
import com.ajp.mentorportal.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    public Page<MeetingResponse> getAllMeetings(Pageable pageable) {
        return meetingRepository.findAll(pageable).map(this::toResponse);
    }

    public List<MeetingResponse> getMyMeetings(Long userId) {
        return meetingRepository.findByMentorIdOrMenteeId(userId, userId)
                .stream().map(this::toResponse).toList();
    }

    public List<MeetingResponse> getUpcomingMeetings(Long userId) {
        return meetingRepository.findByMentorIdOrMenteeId(userId, userId)
                .stream()
                .filter(m -> m.getStatus() == MeetingStatus.SCHEDULED || m.getStatus() == MeetingStatus.CONFIRMED)
                .map(this::toResponse)
                .toList();
    }

    public MeetingResponse createMeeting(CreateMeetingRequest request) {
        Meeting meeting = Meeting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .meetingDate(request.getMeetingDate())
                .location(request.getLocation())
                .mentorId(request.getMentorId())
                .menteeId(request.getMenteeId())
                .build();
        return toResponse(meetingRepository.save(meeting));
    }

    public MeetingResponse updateStatus(Long id, MeetingStatus status) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));
        meeting.setStatus(status);
        return toResponse(meetingRepository.save(meeting));
    }

    public void deleteMeeting(Long id) {
        meetingRepository.deleteById(id);
    }

    private MeetingResponse toResponse(Meeting meeting) {
        String mentorName = userRepository.findById(meeting.getMentorId())
                .map(u -> u.getFirstName() + " " + u.getLastName()).orElse("Unknown");
        String menteeName = userRepository.findById(meeting.getMenteeId())
                .map(u -> u.getFirstName() + " " + u.getLastName()).orElse("Unknown");

        return MeetingResponse.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .meetingDate(meeting.getMeetingDate())
                .location(meeting.getLocation())
                .mentorId(meeting.getMentorId())
                .mentorName(mentorName)
                .menteeId(meeting.getMenteeId())
                .menteeName(menteeName)
                .status(meeting.getStatus())
                .createdAt(meeting.getCreatedAt())
                .build();
    }
}
