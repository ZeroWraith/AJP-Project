package com.ajp.mentorportal.sms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmsResponse {
    private String phone;
    private boolean success;
    private String messageId;
    private String status;
    private String errorMessage;
}
