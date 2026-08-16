package com.example.map.dto;

import java.util.List;

public record CompatibilityResponse(
        String hostName,
        String guestName,
        List<String> letters,
        List<List<Integer>> stages,
        int score,
        String label,
        String color,
        List<String> reverseLetters,
        List<List<Integer>> reverseStages,
        int reverseScore,
        String reverseLabel,
        String reverseColor
) {
}
