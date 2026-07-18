package com.ajp.mentorportal.sms.provider;

import com.ajp.mentorportal.sms.SmsProperties;
import com.ajp.mentorportal.sms.SmsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class TwilioSmsProvider implements SmsProvider {

    private final SmsProperties smsProperties;
    private final RestTemplate smsRestTemplate;

    @Override
    public SmsResponse send(String phone, String message) {
        String apiKey = smsProperties.getApiKey();
        if (apiKey == null || !apiKey.contains(":")) {
            throw new IllegalArgumentException("Twilio API key must be configured in 'AccountSid:AuthToken:FromPhoneNumber' format in application.yml");
        }

        String[] parts = apiKey.split(":");
        if (parts.length < 3) {
            throw new IllegalArgumentException("Twilio API key must contain AccountSid, AuthToken, and FromPhoneNumber separated by colons");
        }

        String accountSid = parts[0];
        String authToken = parts[1];
        String fromNumber = parts[2];

        String url = smsProperties.getProviderUrl();
        if (url == null || url.trim().isEmpty() || url.contains("${SMS_PROVIDER_URL}")) {
            url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        // Basic Authentication
        String auth = accountSid + ":" + authToken;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("To", phone);
        map.add("From", fromNumber);
        map.add("Body", message);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

        try {
            log.info("Sending Twilio SMS to {} via URL {}", phone, url);
            ResponseEntity<Map> response = smsRestTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String messageSid = (String) body.get("sid");
                String status = (String) body.get("status");
                return SmsResponse.builder()
                        .phone(phone)
                        .success(true)
                        .messageId(messageSid)
                        .status(status != null ? status.toUpperCase() : "SENT")
                        .build();
            } else {
                return SmsResponse.builder()
                        .phone(phone)
                        .success(false)
                        .status("FAILED")
                        .errorMessage("Twilio API returned status: " + response.getStatusCode())
                        .build();
            }
        } catch (Exception e) {
            log.error("Error calling Twilio API for phone: {}", phone, e);
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
        return "twilio";
    }
}
