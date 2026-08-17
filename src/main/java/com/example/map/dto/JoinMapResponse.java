package com.example.map.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record JoinMapResponse(
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
        String reverseColor,
        MapView map,
        String chemistryLine,
        String animalFitLabel,
        String hostAnimal,
        String hostAnimalEmoji,
        String guestAnimal,
        String guestAnimalEmoji,
        String hostStarSign,
        String guestStarSign
) {
}
