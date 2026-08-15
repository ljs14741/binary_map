package com.example.map.dto;

import java.util.List;

public record MapPersonView(
        Long id,
        String name,
        String sido,
        String sidoCode,
        int score,
        String label,
        String color
) {
}
