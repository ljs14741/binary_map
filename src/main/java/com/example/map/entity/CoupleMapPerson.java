package com.example.map.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "couple_map_person")
public class CoupleMapPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "couple_map_person_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "couple_map_id", nullable = false)
    private CoupleMap map;

    @Column(name = "person_name", nullable = false, length = 50)
    private String personName;

    @Column(name = "sigungu_code", nullable = false, length = 5)
    private String sigunguCode;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "reverse_score", nullable = false)
    private Integer reverseScore;

    @Column(name = "label", nullable = false, length = 32)
    private String label;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
