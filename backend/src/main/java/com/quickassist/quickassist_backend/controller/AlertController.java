package com.quickassist.quickassist_backend.controller;

import com.quickassist.quickassist_backend.model.SmsRequest;
import com.quickassist.quickassist_backend.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")  // allows React frontend to call backend
public class AlertController {

    @Autowired
    private SmsService smsService;

    @PostMapping("/send-sms")
    public String sendSms(@RequestBody SmsRequest smsRequest) {
        boolean success = smsService.sendSms(smsRequest);
        if (success) {
            return "Alert sent successfully!";
        } else {
            return "Failed to send alert!";
        }
    }

    @PostMapping("/alert")
    public String logAlert(@RequestBody Object payload) {
        System.out.println("🚨 Alert received: " + payload);
        return "Alert logged successfully!";
    }
}
