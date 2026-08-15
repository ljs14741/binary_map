package com.example.map.dto;

import java.util.List;

public record MapView(
        String id,
        String hostName,
        String hostSido,
        String hostSidoCode,
        String hostSigunguCode,
        String shareUrl,
        boolean host,
        boolean claimed,
        int total,
        List<SampleLabelCount> counts,
        List<MapPersonView> people
) {
}
