package com.example.map.dto;

public record MapSummary(
        String id,
        String hostName,
        String place,
        int total,
        String shareUrl
) {
}
