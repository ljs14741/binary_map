package com.example.map.dto;

import java.time.LocalDateTime;

public record GuestbookDTO(
        Long id,
        String nickname,
        String password,
        String content,
        LocalDateTime createdAt
) {
}
