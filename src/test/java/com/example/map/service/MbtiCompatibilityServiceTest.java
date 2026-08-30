package com.example.map.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MbtiCompatibilityServiceTest {

    private final MbtiCompatibilityService service = new MbtiCompatibilityService();

    @Test
    void blankIsSkipped() {
        assertThat(service.normalize("")).isNull();
        assertThat(service.normalize("몰라요")).isNull();
        assertThat(service.calculate("ENFP", "")).isNull();
    }

    @Test
    void rejectsBrokenType() {
        assertThatThrownBy(() -> service.normalize("ABCD"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void sameTypeScoresHundred() {
        var result = service.calculate("enfp", "ENFP");
        assertThat(result.score()).isEqualTo(100);
        assertThat(result.label()).isEqualTo("코드일치");
        assertThat(result.line()).contains("같은 사람");
    }

    @Test
    void oppositeTypeIsLowButNotZero() {
        var result = service.calculate("ENFP", "ISTJ");
        assertThat(result.score()).isEqualTo(8 + 5 + 6 + 7);
        assertThat(result.label()).isEqualTo("다른행성");
        assertThat(result.line()).isNotBlank();
    }

    @Test
    void snMismatchWeighsMoreThanEi() {
        var sn = service.calculate("ENFP", "ESFP");
        var ei = service.calculate("ENFP", "INFP");
        assertThat(sn.score()).isLessThan(ei.score());
    }

    @Test
    void headlinePrefersLopsidedAxis() {
        String line = service.headline("INTJ", List.of("ENFP", "ISFP", "ESFJ", "INFP"));
        assertThat(line).contains("F");
    }

    @Test
    void headlineNeedsTwoPeople() {
        assertThat(service.headline("ENFP", List.of())).isNull();
    }
}
