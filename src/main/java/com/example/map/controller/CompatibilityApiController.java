package com.example.map.controller;

import com.example.map.dto.CompatibilityRequest;
import com.example.map.dto.CompatibilityResponse;
import com.example.map.service.NameCompatibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CompatibilityApiController {

    private final NameCompatibilityService nameCompatibilityService;

    @PostMapping("/compatibility")
    public CompatibilityResponse calculate(@RequestBody CompatibilityRequest request) {
        String host = nameCompatibilityService.normalize(request.hostName());
        String guest = nameCompatibilityService.normalize(request.guestName());
        var forward = nameCompatibilityService.calculate(host, guest);
        var reverse = nameCompatibilityService.calculate(guest, host);
        return new CompatibilityResponse(
                host,
                guest,
                forward.letters(),
                forward.stages(),
                forward.score(),
                forward.label().titledName(),
                forward.label().mapColor(),
                forward.label().comment(),
                reverse.score(),
                reverse.label().titledName(),
                reverse.label().mapColor(),
                reverse.label().comment()
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }
}
