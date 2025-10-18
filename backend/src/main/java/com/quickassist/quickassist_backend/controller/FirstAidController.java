package com.quickassist.quickassist_backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/firstaid")
@CrossOrigin(origins = "http://localhost:5173") // allow your React dev server
public class FirstAidController {

    @GetMapping
    public List<Map<String, Object>> getFirstAidGuides() {
        List<Map<String, Object>> guides = new ArrayList<>();

        guides.add(createGuide("Cuts and Scrapes", Arrays.asList(
                "Clean the wound with water and mild soap.",
                "Apply an antiseptic to prevent infection.",
                "Cover with a sterile bandage.",
                "If bleeding doesn’t stop, apply pressure and seek medical help."
        )));

        guides.add(createGuide("Burns", Arrays.asList(
                "Cool the burn under running water for at least 10 minutes.",
                "Do not apply ice or butter.",
                "Cover with a sterile, non-stick dressing.",
                "Seek medical attention if severe."
        )));

        guides.add(createGuide("Choking", Arrays.asList(
                "Ask the person to cough to clear the obstruction.",
                "If unable to breathe, perform the Heimlich maneuver.",
                "If unresponsive, begin CPR and call emergency services immediately."
        )));

        guides.add(createGuide("Allergic Reaction", Arrays.asList(
                "Check for an epinephrine auto-injector (EpiPen) and use it if available.",
                "Call emergency services immediately.",
                "Keep the person lying down with legs elevated."
        )));

        return guides;
    }

    private Map<String, Object> createGuide(String title, List<String> steps) {
        Map<String, Object> guide = new HashMap<>();
        guide.put("title", title);
        guide.put("steps", steps);
        return guide;
    }
}
