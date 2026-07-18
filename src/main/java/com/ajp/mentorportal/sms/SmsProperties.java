package com.ajp.mentorportal.sms;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "sms")
public class SmsProperties {
    private String provider;
    private String apiKey;
    private String providerUrl;
}
