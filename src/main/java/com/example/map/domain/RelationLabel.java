package com.example.map.domain;

public enum RelationLabel {
    BEST_FRIEND(75, 100, "단짝", "#34d399"),
    COMFORTABLE(50, 74, "편한 사이", "#7dd3fc"),
    ACQUAINTANCE(25, 49, "그냥 아는 사이", "#fcd34d"),
    NOT_A_MATCH(0, 24, "안 맞음", "#fda4af");

    private final int min;
    private final int max;
    private final String displayName;
    private final String mapColor;

    RelationLabel(int min, int max, String displayName, String mapColor) {
        this.min = min;
        this.max = max;
        this.displayName = displayName;
        this.mapColor = mapColor;
    }

    public String displayName() {
        return displayName;
    }

    public String mapColor() {
        return mapColor;
    }

    public static RelationLabel fromScore(int score) {
        for (RelationLabel label : values()) {
            if (score >= label.min && score <= label.max) {
                return label;
            }
        }
        return NOT_A_MATCH;
    }
}
