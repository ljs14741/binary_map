package com.example.map.service;

import com.example.map.domain.RelationLabel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 초등 이름 획수 궁합.
 * 두 이름을 한 글자씩 교차 배치한 뒤 이웃 합의 일의 자리만 남기며 두 자리가 남을 때까지 접는다.
 */
@Service
public class NameCompatibilityService {

    public CompatibilityResult calculate(String hostName, String guestName) {
        String host = normalize(hostName);
        String guest = normalize(guestName);
        if (host.isEmpty() || guest.isEmpty()) {
            throw new IllegalArgumentException("이름을 입력해 주세요.");
        }

        List<String> letters = interleave(host, guest);
        List<Integer> strokes = letters.stream().map(this::strokeOf).toList();

        List<List<Integer>> stages = new ArrayList<>();
        List<Integer> current = new ArrayList<>(strokes);
        stages.add(List.copyOf(current));

        while (current.size() > 2 && !isHundred(current)) {
            current = foldOnce(current);
            stages.add(List.copyOf(current));
        }

        int score = toScore(current);
        return new CompatibilityResult(letters, stages, score, RelationLabel.fromScore(score));
    }

    public String normalize(String name) {
        if (name == null) {
            return "";
        }
        return name.replaceAll("[^가-힣]", "");
    }

    List<String> interleave(String host, String guest) {
        int max = Math.max(host.length(), guest.length());
        List<String> letters = new ArrayList<>(max * 2);
        for (int i = 0; i < max; i++) {
            letters.add(i < host.length() ? String.valueOf(host.charAt(i)) : "");
            letters.add(i < guest.length() ? String.valueOf(guest.charAt(i)) : "");
        }
        return letters;
    }

    int strokeOf(String syllable) {
        if (syllable == null || syllable.isEmpty()) {
            return 0;
        }
        char ch = syllable.charAt(0);
        if (ch < 0xAC00 || ch > 0xD7A3) {
            return 0;
        }
        int syllableIndex = ch - 0xAC00;
        int cho = syllableIndex / (21 * 28);
        int jung = (syllableIndex % (21 * 28)) / 28;
        int jong = syllableIndex % 28;
        return CHO_STROKES[cho] + JUNG_STROKES[jung] + JONG_STROKES[jong];
    }

    private List<Integer> foldOnce(List<Integer> nums) {
        List<Integer> next = new ArrayList<>(nums.size() - 1);
        for (int i = 0; i < nums.size() - 1; i++) {
            next.add((nums.get(i) + nums.get(i + 1)) % 10);
        }
        return next;
    }

    private boolean isHundred(List<Integer> nums) {
        return nums.size() == 3 && nums.get(0) == 1 && nums.get(1) == 0 && nums.get(2) == 0;
    }

    private int toScore(List<Integer> nums) {
        if (isHundred(nums)) {
            return 100;
        }
        if (nums.size() == 1) {
            return nums.get(0);
        }
        return nums.get(0) * 10 + nums.get(1);
    }

    public record CompatibilityResult(
            List<String> letters,
            List<List<Integer>> stages,
            int score,
            RelationLabel label
    ) {
    }

    // 한글 자모 획수표. 사이트마다 다르므로 이 표로 고정한다.
    // 초성 ㄱ~ㅎ
    private static final int[] CHO_STROKES = {
            2, 4, 1, 2, 4, 3, 3, 4, 8, 2, 4, 1, 3, 6, 4, 3, 3, 4, 3
    };
    // 중성 ㅏ~ㅣ
    private static final int[] JUNG_STROKES = {
            2, 3, 3, 4, 2, 3, 3, 4, 2, 4, 5, 3, 3, 2, 4, 5, 3, 3, 1, 2, 1
    };
    // 종성 (없음 포함)
    private static final int[] JONG_STROKES = {
            0, 2, 4, 4, 1, 3, 4, 2, 3, 5, 6, 7, 5, 6, 7, 6, 3, 4, 6, 2, 4, 1, 3, 4, 3, 3, 4, 3
    };
}
