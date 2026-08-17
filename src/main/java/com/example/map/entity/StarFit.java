package com.example.map.entity;

public enum StarFit {
    SAME("같은 자리"),
    HARMONY("잘 맞음"),
    NEUTRAL("보통"),
    CLASH("안 맞음");

    private final String displayName;

    StarFit(String displayName) {
        this.displayName = displayName;
    }

    public String displayName() {
        return displayName;
    }

    public boolean harmony() {
        return this == SAME || this == HARMONY;
    }
}
