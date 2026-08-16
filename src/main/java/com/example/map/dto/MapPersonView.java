package com.example.map.dto;

import java.time.LocalDateTime;

public record MapPersonView(
        Long id,
        String name,
        String sido,
        String sidoCode,
        String sigunguCode,
        int score,
        String label,
        String color,
        int reverseScore,
        String reverseLabel,
        String reverseColor,
        LocalDateTime createdAt
) {
}
