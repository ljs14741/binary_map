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
    public String leadText() {
        int bural = 0;
        if (counts != null) {
            for (SampleLabelCount count : counts) {
                if ("부랄짝꿍".equals(count.filterKey())) {
                    bural = count.count();
                    break;
                }
            }
        }
        return hostSido + " · " + total + "명 참여 · 부랄친구 " + bural + "명";
    }
}
