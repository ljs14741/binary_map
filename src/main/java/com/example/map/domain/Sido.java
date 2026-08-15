package com.example.map.domain;

import java.util.Arrays;
import java.util.List;

/**
 * 1차 표시/입력 단위. 시군구는 쓰지 않는다.
 * 코드는 법정동 시도 코드 앞 2자리다.
 */
public enum Sido {
    SEOUL("11", "서울"),
    BUSAN("26", "부산"),
    DAEGU("27", "대구"),
    INCHEON("28", "인천"),
    GWANGJU("29", "광주"),
    DAEJEON("30", "대전"),
    ULSAN("31", "울산"),
    SEJONG("36", "세종"),
    GYEONGGI("41", "경기"),
    GANGWON("42", "강원"),
    CHUNGBUK("43", "충북"),
    CHUNGNAM("44", "충남"),
    JEONBUK("45", "전북"),
    JEONNAM("46", "전남"),
    GYEONGBUK("47", "경북"),
    GYEONGNAM("48", "경남"),
    JEJU("50", "제주");

    private final String code;
    private final String label;

    Sido(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String code() {
        return code;
    }

    public String label() {
        return label;
    }

    public static List<Sido> all() {
        return Arrays.asList(values());
    }

    public static Sido fromCode(String code) {
        return Arrays.stream(values())
                .filter(sido -> sido.code.equals(code))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unknown sido: " + code));
    }
}
