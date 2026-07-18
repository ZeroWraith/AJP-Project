package com.ajp.mentorportal.sms.provider;

import com.ajp.mentorportal.sms.SmsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
public class MockSmsProvider implements SmsProvider {

    @Override
    public SmsResponse send(String phone, String message) {
        log.info("Sending mock SMS to phone: {} | Message: {}", phone, message);
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return SmsResponse.builder()
                .phone(phone)
                .success(true)
                .messageId(UUID.randomUUID().toString())
                .status("SENT")
                .build();
    }

    @Override
    public String getName() {
        return "mock";
    }
}
