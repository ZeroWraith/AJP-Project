package com.ajp.mentorportal.sms;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableAsync
public class SmsConfig {

    @Bean
    public RestTemplate smsRestTemplate() {
        return new RestTemplate();
    }
}
