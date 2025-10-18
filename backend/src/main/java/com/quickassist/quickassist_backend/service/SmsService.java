package com.quickassist.quickassist_backend.service;

import com.quickassist.quickassist_backend.model.SmsRequest;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    public boolean sendSms(SmsRequest request) {
        // For now, just simulate sending an SMS
        System.out.println("📨 Sending SMS to " + request.getPhoneNumber() +
                ": " + request.getMessage());
        return true; // always success for now
    }
}



