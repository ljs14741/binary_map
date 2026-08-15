package com.example.map.controller;

import com.example.map.domain.RelationLabel;
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
        var result = nameCompatibilityService.calculate(host, guest);
        RelationLabel label = result.label();
        return new CompatibilityResponse(
                host,
                guest,
                result.letters(),
                result.stages(),
                result.score(),
                label.displayName(),
                label.mapColor(),
                commentOf(label)
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    private String commentOf(RelationLabel label) {
        return switch (label) {
            case BEST_FRIEND -> "공책에 나란히 적어도 어색하지 않은 사이";
            case COMFORTABLE -> "오래 안 봐도 다시 만나면 바로 그 말투";
            case ACQUAINTANCE -> "이름만 접었을 뿐, 사이는 앞으로 만들면 됨";
            case NOT_A_MATCH -> "점수는 구라고, 그래서 더 웃김";
        };
    }
}
