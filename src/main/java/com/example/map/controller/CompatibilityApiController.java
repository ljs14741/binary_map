package com.example.map.controller;

import com.example.map.dto.CompatibilityRequest;
import com.example.map.dto.CompatibilityResponse;
import com.example.map.service.MbtiCompatibilityService;
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
    private final MbtiCompatibilityService mbtiCompatibilityService;

    @PostMapping("/compatibility")
    public CompatibilityResponse calculate(@RequestBody CompatibilityRequest request) {
        String host = nameCompatibilityService.normalize(request.hostName());
        String guest = nameCompatibilityService.normalize(request.guestName());
        var forward = nameCompatibilityService.calculate(host, guest);
        var reverse = nameCompatibilityService.calculate(guest, host);
        var mbti = mbtiCompatibilityService.calculate(request.hostMbti(), request.guestMbti());
        return new CompatibilityResponse(
                host,
                guest,
                forward.letters(),
                forward.stages(),
                forward.score(),
                forward.label().titledName(),
                forward.label().mapColor(),
                reverse.letters(),
                reverse.stages(),
                reverse.score(),
                reverse.label().titledName(),
                reverse.label().mapColor(),
                mbti == null ? null : mbti.hostMbti(),
                mbti == null ? null : mbti.guestMbti(),
                mbti == null ? null : mbti.score(),
                mbti == null ? null : mbti.label(),
                mbti == null ? null : mbti.color(),
                mbti == null ? null : mbti.line()
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }
}
