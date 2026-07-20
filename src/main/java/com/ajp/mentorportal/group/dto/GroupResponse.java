package com.ajp.mentorportal.group.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private String createdByName;
    private Long createdBy;
    private int memberCount;
    private List<MemberInfo> members;
    private LocalDateTime createdAt;
}
