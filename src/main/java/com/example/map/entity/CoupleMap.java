package com.example.map.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "couple_map")
public class CoupleMap {

    @Id
    @Column(name = "couple_map_id", length = 36)
    private String id;

    @Column(name = "host_name", nullable = false, length = 50)
    private String hostName;

    @Column(name = "host_sigungu_code", nullable = false, length = 5)
    private String hostSigunguCode;

    @Column(name = "host_token", nullable = false, length = 36)
    private String hostToken;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
