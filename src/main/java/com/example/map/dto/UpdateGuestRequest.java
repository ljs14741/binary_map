package com.example.map.dto;

import java.time.LocalDate;

public record UpdateGuestRequest(
        String previousName,
        String guestName,
        String sigunguCode,
        LocalDate birthDate
) {
}
