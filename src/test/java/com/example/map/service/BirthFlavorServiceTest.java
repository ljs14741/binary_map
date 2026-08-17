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
    void explainsMatchInPlainKorean() {
        var tiger = service.profile(LocalDate.of(1998, 6, 15));
        var rabbit = service.profile(LocalDate.of(1999, 10, 23));
        assertThat(service.animalExplain(tiger, rabbit)).contains("띠예요");
        assertThat(service.starExplain(tiger, rabbit)).contains("별자리예요");
        assertThat(service.animalExplain(tiger, tiger)).isEqualTo("둘 다 호랑이띠라 잘 맞아요");
    }

    @Test
    void punchLineStaysStableForSamePair() {
        var host = service.profile(LocalDate.of(1998, 6, 15));
        var guest = service.profile(LocalDate.of(1999, 10, 23));
        LocalDate hostBirth = LocalDate.of(1998, 6, 15);
        LocalDate guestBirth = LocalDate.of(1999, 10, 23);
        String first = service.rankComment(host, guest, "민지", hostBirth, guestBirth);
        String again = service.rankComment(host, guest, "민지", hostBirth, guestBirth);
        assertThat(first).isEqualTo(again);
        FlavorCopy.Bucket bucket = service.chemistryBucket(host, guest);
        assertThat(bucket).isNotNull();
        assertThat(FlavorCopy.lines(bucket)).contains(first);
    }

    @Test
    void punchLinesVaryAcrossNamesInSameBucket() {
        var host = service.profile(LocalDate.of(1998, 6, 15));
        LocalDate hostBirth = LocalDate.of(1998, 6, 15);
        LocalDate guestBirth = LocalDate.of(1999, 10, 23);
        var guest = service.profile(guestBirth);
        String[] names = {
                "민지", "하은", "예린", "서준", "도윤", "나연",
                "지아", "시우", "현우", "지민", "수아", "태민"
        };
        var lines = java.util.Arrays.stream(names)
                .map(name -> service.rankComment(host, guest, name, hostBirth, guestBirth))
                .collect(java.util.stream.Collectors.toSet());
        assertThat(lines).hasSizeGreaterThan(5);
    }

    @Test
    void sameBirthSameSignGoesToGoodBucket() {
        var twin = service.profile(LocalDate.of(1998, 6, 15));
        assertThat(service.chemistryBucket(twin, twin)).isEqualTo(FlavorCopy.Bucket.GOOD);
        assertThat(FlavorCopy.GOOD).contains(
                "같이 술 마시면 아침까지 안 취하고 달리는 무적 조합 🍻");
        assertThat(FlavorCopy.OK).contains(
                "낮에 아메리카노 한 잔 때리면서 수다 떨기 딱 좋은 관계 ☕");
        assertThat(FlavorCopy.BAD).contains(
                "둘만 남겨지면 3초 만에 정적 흐르는 위험한 정막존 ⚡");
    }

    @Test
    void rejectsFutureBirthDate() {
        assertThatThrownBy(() -> service.requireBirthDate(LocalDate.now().plusDays(1)))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
