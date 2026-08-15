package com.example.map.entity;

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

    public String comment() {
        return switch (this) {
            case BURAL_MATE -> "이름만 접었는데 이미 같은 반임";
            case TRUE_MATE -> "오래 안 봐도 다시 만나면 바로 그 말투";
            case BIZ_MATE -> "필요할 때 연락하면 되는 사이";
            case AWKWARD_MATE -> "인사하고 어색한 침묵이 남음";
            case DANGER_MATE -> "점수는 구라고, 그래서 더 웃김";
        };
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
