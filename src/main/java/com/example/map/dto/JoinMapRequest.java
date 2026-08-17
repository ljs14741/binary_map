package com.example.map.dto;

import java.time.LocalDate;

public record JoinMapRequest(String guestName, String sigunguCode, LocalDate birthDate) {
}
