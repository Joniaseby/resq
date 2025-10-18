package com.quickassist.quickassist_backend.controller;

import com.quickassist.quickassist_backend.model.Hospital;
import com.quickassist.quickassist_backend.repository.HospitalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@CrossOrigin(origins = "http://localhost:5173") // allow React dev server
public class HospitalController {

    private final HospitalRepository repo;

    public HospitalController(HospitalRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Hospital> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Hospital create(@RequestBody Hospital hospital) {
        return repo.save(hospital);
    }
}
