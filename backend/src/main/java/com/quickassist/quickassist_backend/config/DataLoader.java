package com.quickassist.quickassist_backend.config;

import com.quickassist.quickassist_backend.model.Hospital;

import com.quickassist.quickassist_backend.repository.HospitalRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final HospitalRepository repo;

    public DataLoader(HospitalRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        repo.save(new Hospital("City General Hospital", "123 Health St, Metro City", "9876543210", 12.9716, 77.5946));
        repo.save(new Hospital("Metro Clinic", "45 Wellness Ave, Metro City", "9876509876", 12.9721, 77.5950));
    }
}
