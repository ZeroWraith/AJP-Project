package com.ajp.mentorportal.group.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AddMembersRequest {
    @NotNull
    private List<Long> userIds;
}
