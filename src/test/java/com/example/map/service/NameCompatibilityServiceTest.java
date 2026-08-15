package com.example.map.service;

import com.example.map.entity.RelationLabel;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NameCompatibilityServiceTest {

    private final NameCompatibilityService service = new NameCompatibilityService();

    @Test
    void interleavesHostFirstAndFoldsToTwoDigits() {
        NameCompatibilityService.CompatibilityResult result =
                service.calculate("이진수", "홍길동");

        assertThat(result.letters()).containsExactly("이", "홍", "진", "길", "수", "동");
        assertThat(result.score()).isBetween(0, 100);
        assertThat(result.label()).isNotNull();
        assertThat(result.stages()).isNotEmpty();
        assertThat(result.stages().get(result.stages().size() - 1).size()).isLessThanOrEqualTo(3);
    }

    @Test
    void sameNamesAlwaysProduceSameScore() {
        int first = service.calculate("김민수", "박서연").score();
        int second = service.calculate("김민수", "박서연").score();
        assertThat(first).isEqualTo(second);
    }

    @Test
    void stripsNonHangul() {
        assertThat(service.normalize("Lee이진수!")).isEqualTo("이진수");
    }

    @Test
    void mapsScoreToEverydayLabel() {
        assertThat(RelationLabel.fromScore(96)).isEqualTo(RelationLabel.BURAL_MATE);
        assertThat(RelationLabel.fromScore(82)).isEqualTo(RelationLabel.TRUE_MATE);
        assertThat(RelationLabel.fromScore(61)).isEqualTo(RelationLabel.BIZ_MATE);
        assertThat(RelationLabel.fromScore(41)).isEqualTo(RelationLabel.AWKWARD_MATE);
        assertThat(RelationLabel.fromScore(12)).isEqualTo(RelationLabel.DANGER_MATE);
    }
}
