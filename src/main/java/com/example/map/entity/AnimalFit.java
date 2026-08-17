package com.example.map.entity;

public enum AnimalFit {
    SAME("같은 띠"),
    SAMHAP("삼합"),
    YUKHAP("육합"),
    NEUTRAL("보통"),
    CLASH("상충");

    private final String displayName;

    AnimalFit(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }

    public boolean harmony() {
        return this == SAME || this == SAMHAP || this == YUKHAP;
    }

    public String simpleLabel() {
        return switch (this) {
            case SAME -> "같은 띠";
            case SAMHAP, YUKHAP -> "잘 맞음";
            case NEUTRAL -> "보통";
            case CLASH -> "안 맞음";
        };
    }
}
