package com.example.map.dto;

import java.time.LocalDate;

public record UpdateMapRequest(String hostName, String hostSigunguCode, LocalDate hostBirthDate) {
}
