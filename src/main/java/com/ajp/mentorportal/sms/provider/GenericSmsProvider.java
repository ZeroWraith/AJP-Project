package com.ajp.mentorportal.sms.provider;

import com.ajp.mentorportal.sms.SmsProperties;
import com.ajp.mentorportal.sms.SmsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class GenericSmsProvider implements SmsProvider {

    private final SmsProperties smsProperties;
    private final RestTemplate smsRestTemplate;

    @Override
    public SmsResponse send(String phone, String message) {
        String url = smsProperties.getProviderUrl();
        if (url == null || url.trim().isEmpty() || url.contains("${SMS_PROVIDER_URL}")) {
            throw new IllegalArgumentException("Generic SMS provider URL is not configured in application.yml");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String apiKey = smsProperties.getApiKey();
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("${SMS_API_KEY}")) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        Map<String, String> body = new HashMap<>();
        body.put("to", phone);
        body.put("message", message);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            log.info("Sending generic SMS to {} via URL {}", phone, url);
            ResponseEntity<Map> response = smsRestTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                String messageId = responseBody.containsKey("messageId") 
                        ? (String) responseBody.get("messageId") 
                        : (String) responseBody.get("id");
                if (messageId == null) {
                    messageId = UUID.randomUUID().toString();
                }
                return SmsResponse.builder()
                        .phone(phone)
                        .success(true)
                        .messageId(messageId)
                        .status("SENT")
                        .build();
            } else {
                return SmsResponse.builder()
                        .phone(phone)
                        .success(false)
                        .status("FAILED")
                        .errorMessage("Generic SMS API returned status: " + response.getStatusCode())
                        .build();
            }
        } catch (Exception e) {
            log.error("Error calling Generic SMS API for phone: {}", phone, e);
            return SmsResponse.builder()
                    .phone(phone)
                    .success(false)
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .build();
        }
    }

    @Override
    public String getName() {
        return "generic";
    }
}
