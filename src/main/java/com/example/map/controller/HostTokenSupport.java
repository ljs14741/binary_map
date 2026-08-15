package com.example.map.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.time.Duration;

public final class HostTokenSupport {

    private HostTokenSupport() {
    }

    public static String cookieName(String mapId) {
        return "cmh_" + mapId.replace("-", "");
    }

    public static String read(HttpServletRequest request, String mapId) {
        String header = request.getHeader("X-Host-Token");
        if (header != null && !header.isBlank()) {
            return header.trim();
        }
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return "";
        }
        String name = cookieName(mapId);
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue() == null ? "" : cookie.getValue();
            }
        }
        return "";
    }

    public static void write(HttpServletRequest request, HttpServletResponse response, String mapId, String token) {
        ResponseCookie cookie = ResponseCookie.from(cookieName(mapId), token)
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(Duration.ofDays(400))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void clear(HttpServletRequest request, HttpServletResponse response, String mapId) {
        ResponseCookie cookie = ResponseCookie.from(cookieName(mapId), "")
                .httpOnly(true)
                .secure(request.isSecure())
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
