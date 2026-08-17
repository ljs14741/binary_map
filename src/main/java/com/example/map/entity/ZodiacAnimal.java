package com.example.map.entity;

public enum ZodiacAnimal {
    RAT("쥐", "🐭"),
    OX("소", "🐮"),
    TIGER("호랑이", "🐯"),
    RABBIT("토끼", "🐰"),
    DRAGON("용", "🐲"),
    SNAKE("뱀", "🐍"),
    HORSE("말", "🐴"),
    SHEEP("양", "🐑"),
    MONKEY("원숭이", "🐵"),
    ROOSTER("닭", "🐔"),
    DOG("개", "🐶"),
    PIG("돼지", "🐷");

    private final String displayName;
    private final String emoji;

    ZodiacAnimal(String displayName, String emoji) {
        this.displayName = displayName;
        this.emoji = emoji;
    }

    public String displayName() {
        return displayName;
    }

    public String emoji() {
        return emoji;
    }

    public static ZodiacAnimal fromIndex(int index) {
        return values()[Math.floorMod(index, 12)];
    }
}
