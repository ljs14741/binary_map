package com.example.map.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RegionCatalogTest {

    private final RegionCatalog catalog = new RegionCatalog(new ObjectMapper());

    @Test
    void loadsGangnam() {
        var gangnam = catalog.fromCode("11680");
        assertThat(gangnam.sidoCode()).isEqualTo("11");
        assertThat(gangnam.label()).isEqualTo("강남구");
        assertThat(catalog.displayName(gangnam)).isEqualTo("서울 강남구");
    }

    @Test
    void sortsSigunguByHangulWithinSido() {
        var seoul = catalog.all().stream()
                .filter(item -> item.sidoCode().equals("11"))
                .map(com.example.map.entity.Sigungu::label)
                .toList();
        assertThat(seoul.get(0)).isEqualTo("강남구");
        assertThat(seoul.indexOf("강남구")).isLessThan(seoul.indexOf("종로구"));
    }

    @Test
    void rejectsUnknownCode() {
        assertThatThrownBy(() -> catalog.fromCode("00000"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
