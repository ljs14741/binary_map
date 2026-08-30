package com.example.map.service;

import com.example.map.entity.MbtiLabel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 이름 획수와 합산하지 않는 성격궁합.
 * 축마다 가중치가 다르다. S/N·T/F가 무겁고 E/I는 가볍게.
 */
@Service
public class MbtiCompatibilityService {

    public record MbtiResult(
            String hostMbti,
            String guestMbti,
            int score,
            String label,
            String color,
            String line,
            List<String> axes
    ) {
    }

    public String normalize(String raw) {
        if (raw == null) {
            return null;
        }
        String text = raw.trim().toUpperCase(Locale.ROOT);
        if (text.isEmpty() || "SKIP".equals(text) || "UNKNOWN".equals(text) || "몰라요".equals(raw.trim())) {
            return null;
        }
        if (!text.matches("[EI][SN][TF][JP]")) {
            throw new IllegalArgumentException("MBTI를 다시 골라 주세요.");
        }
        return text;
    }

    public MbtiResult calculate(String hostRaw, String guestRaw) {
        String host = normalize(hostRaw);
        String guest = normalize(guestRaw);
        if (host == null || guest == null) {
            return null;
        }
        int score = axisScore(host.charAt(0), guest.charAt(0), 15, 8)
                + axisScore(host.charAt(1), guest.charAt(1), 35, 5)
                + axisScore(host.charAt(2), guest.charAt(2), 30, 6)
                + axisScore(host.charAt(3), guest.charAt(3), 20, 7);
        MbtiLabel label = MbtiLabel.fromScore(score);
        List<String> axes = List.of(
                axisLine(0, host.charAt(0), guest.charAt(0)),
                axisLine(1, host.charAt(1), guest.charAt(1)),
                axisLine(2, host.charAt(2), guest.charAt(2)),
                axisLine(3, host.charAt(3), guest.charAt(3))
        );
        return new MbtiResult(host, guest, score, label.displayName(), label.color(), pickLine(host, guest), axes);
    }

    /** 두 명 이상 골라야 편중 문장이 의미가 있다. */
    public String headline(String hostMbti, List<String> guestMbtis) {
        List<String> all = new ArrayList<>();
        String host = normalizeQuiet(hostMbti);
        if (host != null) {
            all.add(host);
        }
        for (String item : guestMbtis) {
            String typed = normalizeQuiet(item);
            if (typed != null) {
                all.add(typed);
            }
        }
        if (all.size() < 2) {
            return null;
        }
        Map<Character, Integer> counts = new LinkedHashMap<>();
        for (char letter : new char[] {'E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'}) {
            counts.put(letter, 0);
        }
        for (String typed : all) {
            for (int index = 0; index < 4; index++) {
                counts.merge(typed.charAt(index), 1, Integer::sum);
            }
        }
        char[][] pairs = {{'T', 'F'}, {'S', 'N'}, {'E', 'I'}, {'J', 'P'}};
        char left = 'T';
        char right = 'F';
        int bestGap = -1;
        for (char[] pair : pairs) {
            int a = counts.get(pair[0]);
            int b = counts.get(pair[1]);
            int gap = Math.abs(a - b);
            if (gap > bestGap) {
                bestGap = gap;
                left = a >= b ? pair[0] : pair[1];
                right = a >= b ? pair[1] : pair[0];
            }
        }
        int more = counts.get(left);
        int less = counts.get(right);
        if (host != null) {
            char hostLetter = letterOf(host, left, right);
            if (hostLetter != left && more >= less + 2) {
                return "나는 " + hostLetter + "인데 주변은 " + left + "가 " + more + "명";
            }
        }
        if (less == 0) {
            return left + "가 " + more + "명. " + right + "는 아직 없어요";
        }
        return left + "가 " + more + "명, " + right + "는 " + less + "명";
    }

    private static int axisScore(char host, char guest, int same, int different) {
        return host == guest ? same : different;
    }

    private static String axisLine(int axis, char host, char guest) {
        boolean same = host == guest;
        return switch (axis) {
            case 0 -> same ? "에너지 쓰는 타이밍이 같아요" : "한 명이 끌고, 한 명이 충전해요";
            case 1 -> same ? "세상을 보는 렌즈가 같아요" : "한 명은 디테일, 한 명은 큰 그림";
            case 2 -> same ? "판단하는 기준이 같아요" : "머리와 마음이 한 팀이 돼요";
            default -> same ? "일을 쳐내는 리듬이 같아요" : "계획과 즉흥이 섞여요";
        };
    }

    private static String pickLine(String host, String guest) {
        int[] order = {1, 2, 3, 0};
        for (int axis : order) {
            if (host.charAt(axis) != guest.charAt(axis)) {
                return axisLine(axis, host.charAt(axis), guest.charAt(axis));
            }
        }
        return "네 글자가 같아요. 거의 같은 사람이에요";
    }

    private String normalizeQuiet(String raw) {
        try {
            return normalize(raw);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static char letterOf(String mbti, char a, char b) {
        for (int index = 0; index < 4; index++) {
            char letter = mbti.charAt(index);
            if (letter == a || letter == b) {
                return letter;
            }
        }
        return a;
    }
}
