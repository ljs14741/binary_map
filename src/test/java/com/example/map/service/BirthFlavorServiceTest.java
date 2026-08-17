package com.example.map.service;

import com.example.map.entity.AnimalFit;
import com.example.map.entity.StarFit;
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
    void starFitUsesElementPairs() {
        assertThat(service.starFit("전갈", "전갈")).isEqualTo(StarFit.SAME);
        assertThat(service.starFit("전갈", "물고기")).isEqualTo(StarFit.HARMONY);
        assertThat(service.starFit("전갈", "사자")).isEqualTo(StarFit.CLASH);
        assertThat(service.starFit("쌍둥이", "사자")).isEqualTo(StarFit.HARMONY);
        assertThat(service.starFit("쌍둥이", "황소")).isEqualTo(StarFit.CLASH);
        assertThat(service.starFit("양", "황소")).isEqualTo(StarFit.NEUTRAL);
    }

    @Test
    void flavorLineUsesAnimalAndStarTogether() {
        assertThat(service.flavorLine(AnimalFit.SAME, StarFit.SAME)).isEqualTo("같은 띠에 같은 별자리");
        assertThat(service.flavorLine(AnimalFit.SAMHAP, StarFit.HARMONY)).isEqualTo("띠도 별자리도 통함");
        assertThat(service.flavorLine(AnimalFit.SAMHAP, StarFit.CLASH)).isEqualTo("띠는 맞는데 별자리는 불꽃");
        assertThat(service.flavorLine(AnimalFit.CLASH, StarFit.HARMONY)).isEqualTo("별자리는 통하는데 띠는 상충");
        assertThat(service.flavorLine(AnimalFit.CLASH, StarFit.CLASH)).isEqualTo("띠도 별자리도 충돌");
        assertThat(service.flavorLine(AnimalFit.NEUTRAL, StarFit.NEUTRAL)).isEqualTo("띠·별자리는 무난");
        assertThat(service.flavorLine(null, StarFit.HARMONY)).isNull();
    }

    @Test
    void rejectsFutureBirthDate() {
        assertThatThrownBy(() -> service.requireBirthDate(LocalDate.now().plusDays(1)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
