package com.example.map.domain;

public enum RelationLabel {
    BEST_FRIEND(75, 100, "단짝", "#2f9e44"),
    COMFORTABLE(50, 74, "편한 사이", "#1971c2"),
    ACQUAINTANCE(25, 49, "그냥 아는 사이", "#f59f00"),
    NOT_A_MATCH(0, 24, "안 맞음", "#868e96");

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
