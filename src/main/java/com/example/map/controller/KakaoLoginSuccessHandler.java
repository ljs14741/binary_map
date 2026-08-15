package com.example.map.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class KakaoLoginSuccessHandler implements AuthenticationSuccessHandler {

    static final String NEXT_KEY = "LOGIN_NEXT";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        HttpSession session = request.getSession(false);
        String next = session == null ? null : (String) session.getAttribute(NEXT_KEY);
        if (session != null) {
            session.removeAttribute(NEXT_KEY);
        }
        if (!isSafeNext(next)) {
            next = "/";
        }
        response.sendRedirect(next);
    }

    static boolean isSafeNext(String next) {
        return next != null && next.startsWith("/") && !next.startsWith("//") && !next.contains("://");
    }
}
