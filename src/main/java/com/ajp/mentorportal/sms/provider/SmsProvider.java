package com.ajp.mentorportal.sms.provider;

import com.ajp.mentorportal.sms.SmsResponse;

public interface SmsProvider {
    SmsResponse send(String phone, String message);
    String getName();
}
