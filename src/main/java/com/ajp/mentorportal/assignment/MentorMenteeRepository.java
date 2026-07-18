package com.ajp.mentorportal.assignment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorMenteeRepository extends JpaRepository<MentorMentee, Long> {
    List<MentorMentee> findByMentorId(Long mentorId);
    List<MentorMentee> findByUserId(Long userId);
    List<MentorMentee> findByStatus(AssignmentStatus status);
}
