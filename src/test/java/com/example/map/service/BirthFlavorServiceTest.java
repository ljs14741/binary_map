package com.example.map.service;

import com.example.map.entity.AnimalFit;
import com.example.map.entity.RelationLabel;
import com.example.map.entity.ZodiacAnimal;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BirthFlavorServiceTest {

    private final BirthFlavorService service = new BirthFlavorService();

    @Test
    void ratYearStartsAtLichun() {
        assertThat(service.animalOf(LocalDate.of(2020, 2, 4))).isEqualTo(ZodiacAnimal.RAT);
        assertThat(service.animalOf(LocalDate.of(2020, 2, 3))).isEqualTo(ZodiacAnimal.PIG);
        assertThat(service.animalOf(LocalDate.of(2008, 6, 1))).isEqualTo(ZodiacAnimal.RAT);
    }

    @Test
    void starSignsUseTropicalBounds() {
        assertThat(service.starSignOf(LocalDate.of(1999, 1, 19))).isEqualTo("염소");
        assertThat(service.starSignOf(LocalDate.of(1999, 1, 20))).isEqualTo("물병");
        assertThat(service.starSignOf(LocalDate.of(1999, 3, 21))).isEqualTo("양");
        assertThat(service.starSignOf(LocalDate.of(1999, 10, 23))).isEqualTo("전갈");
        assertThat(service.starSignOf(LocalDate.of(1999, 12, 21))).isEqualTo("사수");
        assertThat(service.starSignOf(LocalDate.of(1999, 12, 22))).isEqualTo("염소");
    }

    @Test
    void animalFitCoversSameSamhapYukhapAndClash() {
        assertThat(service.fit(ZodiacAnimal.RAT, ZodiacAnimal.RAT)).isEqualTo(AnimalFit.SAME);
        assertThat(service.fit(ZodiacAnimal.RAT, ZodiacAnimal.DRAGON)).isEqualTo(AnimalFit.SAMHAP);
        assertThat(service.fit(ZodiacAnimal.RAT, ZodiacAnimal.OX)).isEqualTo(AnimalFit.YUKHAP);
        assertThat(service.fit(ZodiacAnimal.RAT, ZodiacAnimal.HORSE)).isEqualTo(AnimalFit.CLASH);
        assertThat(service.fit(ZodiacAnimal.TIGER, ZodiacAnimal.RABBIT)).isEqualTo(AnimalFit.NEUTRAL);
    }

    @Test
    void chemistryKeepsNameScoreSeparate() {
        assertThat(service.chemistryLine(RelationLabel.BURAL_MATE, AnimalFit.SAMHAP))
                .isEqualTo("이름도 띠도 최강");
        assertThat(service.chemistryLine(RelationLabel.BURAL_MATE, AnimalFit.CLASH))
                .isEqualTo("이름은 맞는데 띠는 티격태격");
        assertThat(service.chemistryLine(RelationLabel.DANGER_MATE, AnimalFit.SAMHAP))
                .isEqualTo("띠는 잘 맞아서 기회는 있음");
        assertThat(service.chemistryLine(RelationLabel.DANGER_MATE, AnimalFit.CLASH))
                .isEqualTo("접지 마");
    }

    @Test
    void rejectsFutureBirthDate() {
        assertThatThrownBy(() -> service.requireBirthDate(LocalDate.now().plusDays(1)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
