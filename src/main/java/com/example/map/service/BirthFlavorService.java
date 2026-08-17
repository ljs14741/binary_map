package com.example.map.service;

import com.example.map.entity.AnimalFit;
import com.example.map.entity.RelationLabel;
import com.example.map.entity.ZodiacAnimal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.ZoneId;

@Service
public class BirthFlavorService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final LocalDate MIN_BIRTH = LocalDate.of(1920, 1, 1);
    /** 입춘 근처. 그 전이면 전년도 띠. */
    private static final MonthDay LICHUN = MonthDay.of(2, 4);

    private static final MonthDay[] STAR_STARTS = {
            MonthDay.of(1, 20),
            MonthDay.of(2, 19),
            MonthDay.of(3, 21),
            MonthDay.of(4, 20),
            MonthDay.of(5, 21),
            MonthDay.of(6, 22),
            MonthDay.of(7, 23),
            MonthDay.of(8, 23),
            MonthDay.of(9, 23),
            MonthDay.of(10, 23),
            MonthDay.of(11, 22),
            MonthDay.of(12, 22)
    };

    private static final String[] STAR_SIGNS = {
            "물병", "물고기", "양", "황소", "쌍둥이", "게",
            "사자", "처녀", "천칭", "전갈", "사수", "염소"
    };

    private static final int[][] SAMHAP = {
            {8, 0, 4},
            {2, 6, 10},
            {5, 9, 1},
            {11, 3, 7}
    };

    private static final int[] YUKHAP_PARTNER = {1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2};

    public LocalDate requireBirthDate(LocalDate birthDate) {
        if (birthDate == null) {
            throw new IllegalArgumentException("생년월일을 적어 주세요.");
        }
        LocalDate today = LocalDate.now(SEOUL);
        if (birthDate.isAfter(today)) {
            throw new IllegalArgumentException("생년월일을 확인해 주세요.");
        }
        if (birthDate.isBefore(MIN_BIRTH)) {
            throw new IllegalArgumentException("생년월일을 확인해 주세요.");
        }
        return birthDate;
    }

    public BirthProfile profile(LocalDate birthDate) {
        if (birthDate == null) {
            return null;
        }
        ZodiacAnimal animal = animalOf(birthDate);
        return new BirthProfile(animal, animal.displayName(), animal.emoji(), starSignOf(birthDate));
    }

    public ZodiacAnimal animalOf(LocalDate birthDate) {
        int year = birthDate.getYear();
        if (MonthDay.from(birthDate).isBefore(LICHUN)) {
            year -= 1;
        }
        return ZodiacAnimal.fromIndex(year - 4);
    }

    public String starSignOf(LocalDate birthDate) {
        MonthDay day = MonthDay.from(birthDate);
        if (day.isBefore(STAR_STARTS[0])) {
            return STAR_SIGNS[11];
        }
        String sign = STAR_SIGNS[11];
        for (int i = 0; i < STAR_STARTS.length; i++) {
            if (!day.isBefore(STAR_STARTS[i])) {
                sign = STAR_SIGNS[i];
            }
        }
        return sign;
    }

    public AnimalFit fit(ZodiacAnimal left, ZodiacAnimal right) {
        if (left == null || right == null) {
            return null;
        }
        int a = left.ordinal();
        int b = right.ordinal();
        if (a == b) {
            return AnimalFit.SAME;
        }
        if ((a + 6) % 12 == b) {
            return AnimalFit.CLASH;
        }
        for (int[] group : SAMHAP) {
            if (inGroup(group, a) && inGroup(group, b)) {
                return AnimalFit.SAMHAP;
            }
        }
        if (YUKHAP_PARTNER[a] == b) {
            return AnimalFit.YUKHAP;
        }
        return AnimalFit.NEUTRAL;
    }

    public String chemistryLine(RelationLabel nameLabel, AnimalFit fit) {
        if (nameLabel == null || fit == null) {
            return null;
        }
        return switch (nameLabel) {
            case BURAL_MATE -> fit.harmony()
                    ? "이름도 띠도 최강"
                    : fit == AnimalFit.CLASH ? "이름은 맞는데 띠는 티격태격" : "이름은 최강, 띠는 무난";
            case TRUE_MATE -> fit.harmony()
                    ? "이름도 띠도 잘 맞음"
                    : fit == AnimalFit.CLASH ? "이름은 찐인데 띠는 부딪힘" : "이름은 찐, 띠는 보통";
            case BIZ_MATE -> fit.harmony()
                    ? "이름은 비즈니스, 띠는 의외로 잘 맞음"
                    : fit == AnimalFit.CLASH ? "이름도 띠도 거리감 있음" : "이름도 띠도 그냥 아는 사이";
            case AWKWARD_MATE -> fit.harmony()
                    ? "이름은 어색한데 띠는 통함"
                    : fit == AnimalFit.CLASH ? "어색한 이름에 띠까지 안 맞음" : "어색한 사이, 띠도 무난";
            case DANGER_MATE -> fit.harmony()
                    ? "띠는 잘 맞아서 기회는 있음"
                    : fit == AnimalFit.CLASH ? "접지 마" : "이름은 위험한 쪽";
        };
    }

    private boolean inGroup(int[] group, int index) {
        for (int value : group) {
            if (value == index) {
                return true;
            }
        }
        return false;
    }

    public record BirthProfile(ZodiacAnimal animal, String animalName, String animalEmoji, String starSign) {
    }
}
