package com.ajp.mentorportal.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailResponse {
    private String to;
    private String subject;
    private boolean success;
    private String status;
    private String messageId;
    private String errorMessage;
}