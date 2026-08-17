package com.example.map.service;

import com.example.map.entity.AnimalFit;
import com.example.map.entity.StarFit;
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

    /** 0불 1흙 2바람 3물 */
    private static final int[] STAR_ELEMENT = {
            2, 3, 0, 1, 2, 3,
            0, 1, 2, 3, 0, 1
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

    public StarFit starFit(String leftSign, String rightSign) {
        if (leftSign == null || rightSign == null) {
            return null;
        }
        int left = indexOfSign(leftSign);
        int right = indexOfSign(rightSign);
        if (left < 0 || right < 0) {
            return null;
        }
        if (left == right) {
            return StarFit.SAME;
        }
        int e1 = STAR_ELEMENT[left];
        int e2 = STAR_ELEMENT[right];
        if (e1 == e2) {
            return StarFit.HARMONY;
        }
        if (e1 % 2 == e2 % 2) {
            return StarFit.HARMONY;
        }
        if (e1 + e2 == 3) {
            return StarFit.CLASH;
        }
        return StarFit.NEUTRAL;
    }

    public String flavorLine(BirthProfile host, BirthProfile guest) {
        if (host == null || guest == null) {
            return null;
        }
        return flavorLine(fit(host.animal(), guest.animal()), starFit(host.starSign(), guest.starSign()));
    }

    public String flavorLine(AnimalFit animal, StarFit star) {
        if (animal == null || star == null) {
            return null;
        }
        if (animal == AnimalFit.SAME && star == StarFit.SAME) {
            return "같은 띠에 같은 별자리";
        }
        boolean animalGood = animal.harmony();
        boolean starGood = star.harmony();
        boolean animalBad = animal == AnimalFit.CLASH;
        boolean starBad = star == StarFit.CLASH;
        if (animalGood && starGood) {
            return "띠도 별자리도 통함";
        }
        if (animalGood && starBad) {
            return "띠는 맞는데 별자리는 불꽃";
        }
        if (animalGood) {
            return "띠는 잘 맞음, 별자리는 무난";
        }
        if (animalBad && starGood) {
            return "별자리는 통하는데 띠는 상충";
        }
        if (animalBad && starBad) {
            return "띠도 별자리도 충돌";
        }
        if (animalBad) {
            return "띠는 상충, 별자리는 무난";
        }
        if (starGood) {
            return "별자리는 통함, 띠는 무난";
        }
        if (starBad) {
            return "별자리는 안 맞음";
        }
        return "띠·별자리는 무난";
    }

    private int indexOfSign(String sign) {
        for (int i = 0; i < STAR_SIGNS.length; i++) {
            if (STAR_SIGNS[i].equals(sign)) {
                return i;
            }
        }
        return -1;
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
