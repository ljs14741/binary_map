package com.example.map.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class KakaoLoginController {

    @GetMapping("/login/kakao")
    public String login(@RequestParam(name = "next", required = false) String next, HttpSession session) {
        if (KakaoLoginSuccessHandler.isSafeNext(next)) {
            session.setAttribute(KakaoLoginSuccessHandler.NEXT_KEY, next);
        }
        return "redirect:/oauth2/authorization/kakao";
    }
}
