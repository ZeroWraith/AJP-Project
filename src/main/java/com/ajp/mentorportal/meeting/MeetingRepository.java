package com.ajp.mentorportal.meeting;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByMentorId(Long mentorId);
    List<Meeting> findByMenteeId(Long menteeId);
    List<Meeting> findByMentorIdOrMenteeId(Long mentorId, Long menteeId);
    List<Meeting> findByStatus(MeetingStatus status);
    List<Meeting> findByMeetingDateAfter(LocalDateTime date);
    Page<Meeting> findByMentorIdOrMenteeId(Long mentorId, Long menteeId, Pageable pageable);
}
