package com.example.map.dto;

import java.util.List;

public record JoinMapResponse(
        String hostName,
        String guestName,
        List<String> letters,
        List<List<Integer>> stages,
        int score,
        String label,
        String color,
        String comment,
        MapView map
) {
}
