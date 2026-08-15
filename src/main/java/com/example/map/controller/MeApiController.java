package com.example.map.controller;

import com.example.map.dto.MeResponse;
import com.example.map.service.CoupleMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MeApiController {

    private final CoupleMapService coupleMapService;

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        String userId = KakaoAuth.userId(authentication);
        if (userId.isBlank()) {
            return new MeResponse(false, "", "", java.util.List.of());
        }
        return new MeResponse(
                true,
                userId,
                KakaoAuth.nickname(authentication),
                coupleMapService.listByUser(userId)
        );
    }
}
