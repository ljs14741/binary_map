package com.example.map.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

public final class KakaoAuth {

    private KakaoAuth() {
    }

    public static String userId(Authentication authentication) {
        OAuth2User user = user(authentication);
        if (user == null) {
            return "";
        }
        Object id = user.getAttribute("id");
        return id == null ? "" : String.valueOf(id);
    }

    public static String nickname(Authentication authentication) {
        OAuth2User user = user(authentication);
        if (user == null) {
            return "";
        }
        Object properties = user.getAttribute("properties");
        if (properties instanceof Map<?, ?> map) {
            Object nickname = map.get("nickname");
            if (nickname != null) {
                return String.valueOf(nickname);
            }
        }
        return "카카오";
    }

    private static OAuth2User user(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        if (authentication.getPrincipal() instanceof OAuth2User oauthUser) {
            return oauthUser;
        }
        return null;
    }
}
