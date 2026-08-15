package com.example.map.controller;

import com.example.map.domain.Sido;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MapController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("sidos", Sido.all());
        return "main";
    }
}
