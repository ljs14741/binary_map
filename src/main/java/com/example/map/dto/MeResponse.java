package com.example.map.dto;

import java.util.List;

public record MeResponse(
        boolean loggedIn,
        String userId,
        String nickname,
        List<MapSummary> maps
) {
}
