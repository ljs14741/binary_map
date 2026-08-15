package com.example.map.domain;

public enum RelationLabel {
    BURAL_MATE(85, 100, "부랄짝꿍", "#ff2d95", "💖"),
    TRUE_MATE(70, 84, "찐 짝꿍", "#22c55e", "💚"),
    BIZ_MATE(50, 69, "비즈니스짝꿍", "#3b82f6", "💙"),
    AWKWARD_MATE(30, 49, "어색 짝꿍", "#f97316", "🧡"),
    DANGER_MATE(0, 29, "위험 짝꿍", "#ef4444", "❤️");

    private final int min;
    private final int max;
    private final String displayName;
    private final String mapColor;
    private final String emoji;

    RelationLabel(int min, int max, String displayName, String mapColor, String emoji) {
        this.min = min;
        this.max = max;
        this.displayName = displayName;
        this.mapColor = mapColor;
        this.emoji = emoji;
    }

    public String displayName() {
        return displayName;
    }

    public String mapColor() {
        return mapColor;
    }

    public String emoji() {
        return emoji;
    }

    public String titledName() {
        return displayName + " " + emoji;
    }

    public static RelationLabel fromScore(int score) {
        for (RelationLabel label : values()) {
            if (score >= label.min && score <= label.max) {
                return label;
            }
        }
        return DANGER_MATE;
    }
}
