package com.example.map.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
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
        String animal,
        String animalEmoji,
        LocalDateTime createdAt
) {
}
