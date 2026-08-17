package com.example.map.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
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
        List<AnimalCount> animalCounts,
        List<MapPersonView> people,
        String hostBirthDate,
        String hostAnimal,
        String hostAnimalEmoji,
        String hostStarSign
) {
    public String hostSignText() {
        if (hostAnimal == null || hostAnimal.isBlank()) {
            return "";
        }
        String animal = (hostAnimalEmoji == null ? "" : hostAnimalEmoji + " ") + hostAnimal;
        if (hostStarSign == null || hostStarSign.isBlank()) {
            return animal.trim();
        }
        return animal.trim() + " · " + hostStarSign;
    }

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
        return hostSido
                + (hostBirthDate != null && !hostBirthDate.isBlank() ? " · " + hostBirthDate.replace('-', '.') : "")
                + " · " + total + "명 참여 · 부랄친구 " + bural + "명";
    }
}
