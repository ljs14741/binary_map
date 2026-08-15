package com.example.map.dto;

public record CreatedMapResponse(
        String id,
        String hostName,
        String hostSidoCode,
        String hostToken,
        String shareUrl
) {
}
