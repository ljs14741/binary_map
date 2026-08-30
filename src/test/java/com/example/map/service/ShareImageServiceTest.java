package com.example.map.service;

import com.example.map.dto.MapConquest;
import com.example.map.dto.MapView;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ShareImageServiceTest {

    private final ShareImageService service = new ShareImageService();

    @Test
    void emptyMapRendersPng() {
        byte[] png = service.render(view(0, conquest(0, "빈 지도", "아직 아무도 없어요.", null)));
        assertPng(png);
    }

    @Test
    void populatedMapRendersPng() {
        byte[] png = service.render(view(7, conquest(7, "반전국 짝꿍", "제주·울산만 비었어요.", 8)));
        assertPng(png);
        assertThat(png.length).isGreaterThan(8_000);
    }

    @Test
    void ogUrlChangesWhenPeopleJoin() {
        MapView empty = view(0, conquest(0, "빈 지도", "아직 아무도 없어요.", null));
        MapView filled = view(7, conquest(7, "반전국 짝꿍", "제주·울산만 비었어요.", 8));
        assertThat(empty.ogImageUrl()).contains("/og.png?v=0-0");
        assertThat(filled.ogImageUrl()).contains("/og.png?v=7-41");
        assertThat(filled.ogDescription()).contains("7명 참여").contains("제주");
    }

    private static void assertPng(byte[] png) {
        assertThat(png).hasSizeGreaterThan(100);
        assertThat(png[0]).isEqualTo((byte) 0x89);
        assertThat(png[1]).isEqualTo((byte) 0x50);
        assertThat(png[2]).isEqualTo((byte) 0x4E);
        assertThat(png[3]).isEqualTo((byte) 0x47);
    }

    private static MapView view(int total, MapConquest conquest) {
        return new MapView(
                "map-1",
                "수현",
                "서울",
                "11",
                "11680",
                "https://map.binaryworld.kr/m/map-1",
                false,
                false,
                total,
                List.of(),
                List.of(),
                List.of(),
                "1998-06-15",
                "호랑이",
                "🐯",
                "쌍둥이",
                "👯",
                conquest,
                null,
                null
        );
    }

    private static MapConquest conquest(int filled, String grade, String nudge, Integer top) {
        return new MapConquest(
                filled,
                17,
                Math.round(filled * 100f / 17),
                filled,
                grade,
                "",
                "",
                List.of(),
                nudge,
                top
        );
    }
}
