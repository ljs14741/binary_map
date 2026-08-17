package com.example.map.dto;

import java.time.LocalDate;

public record CreateMapRequest(String hostName, String hostSigunguCode, LocalDate hostBirthDate) {
}
