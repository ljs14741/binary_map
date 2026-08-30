package com.example.map.entity;

/**
 * 성격궁합 칭호. 이름궁합 라벨과 섞지 않는다.
 * 두 점수가 엇갈릴 때("이름은 부랄, 성격은 다른행성") 캡처 이유가 생긴다.
 */
public enum MbtiLabel {

    CODE(85, 100, "코드일치", "#ff2d95"),
    CLOSE(70, 84, "잘통함", "#22c55e"),
    COMPLEMENT(50, 69, "보완케미", "#3b82f6"),
    GAP(30, 49, "온도차", "#f97316"),
    PLANET(0, 29, "다른행성", "#ef4444");

    private final int min;
    private final int max;
    private final String displayName;
    private final String color;

    MbtiLabel(int min, int max, String displayName, String color) {
        this.min = min;
        this.max = max;
        this.displayName = displayName;
        this.color = color;
    }

    public String displayName() {
        return displayName;
    }

    public String color() {
        return color;
    }

    public static MbtiLabel fromScore(int score) {
        int value = Math.max(0, Math.min(100, score));
        for (MbtiLabel label : values()) {
            if (value >= label.min && value <= label.max) {
                return label;
            }
        }
        return PLANET;
    }
}
