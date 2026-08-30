package com.example.map.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MapView(
        String id,
        String hostName,
        String hostSido,
        String hostSidoCode,
        String hostSigunguCode,
        String shareUrl,
        boolean host,
        boolean claimed,
        int total,
        List<SampleLabelCount> counts,
        List<AnimalCount> animalCounts,
        List<MapPersonView> people,
        String hostBirthDate,
        String hostAnimal,
        String hostAnimalEmoji,
        String hostStarSign,
        String hostStarEmoji,
        MapConquest conquest,
        String hostMbti,
        String mbtiHeadline
) {
    public String hostSignText() {
        if (hostAnimal == null || hostAnimal.isBlank()) {
            return "";
        }
        String animal = (hostAnimalEmoji == null ? "" : hostAnimalEmoji + " ") + hostAnimal;
        if (hostStarSign == null || hostStarSign.isBlank()) {
            return animal.trim();
        }
        String star = (hostStarEmoji == null ? "" : hostStarEmoji + " ") + hostStarSign;
        return animal.trim() + " · " + star.trim();
    }

    public String gradeText() {
        if (conquest == null || conquest.grade() == null) {
            return "";
        }
        String emoji = conquest.gradeEmoji() == null ? "" : conquest.gradeEmoji() + " ";
        return emoji + conquest.grade();
    }

    public String conquestText() {
        if (conquest == null) {
            return "";
        }
        return "전국 정복도 " + conquest.percent() + "% · "
                + conquest.sidoFilled() + "/" + conquest.sidoTotal() + "개 시도";
    }

    public int conquestPercent() {
        return conquest == null ? 0 : conquest.percent();
    }

    public String leadText() {
        int bural = 0;
        if (counts != null) {
            for (SampleLabelCount count : counts) {
                if ("부랄짝꿍".equals(count.filterKey())) {
                    bural = count.count();
                    break;
                }
            }
        }
        return hostSido
                + (hostBirthDate != null && !hostBirthDate.isBlank() ? " · " + hostBirthDate.replace('-', '.') : "")
                + " · " + total + "명 참여 · 부랄친구 " + bural + "명";
    }

    /** 카톡·SNS 크롤러가 가져갈 미리보기 이미지. 인원이 바뀌면 쿼리가 바뀌어 캐시가 갱신된다. */
    public String ogImageUrl() {
        return shareUrl + "/og.png?v=" + total + "-" + conquestPercent();
    }

    /** 미리보기 설명. 정복도와 빈 지역을 넣어서 클릭 이유를 만든다. */
    public String ogDescription() {
        if (conquest != null && conquest.inviteNudge() != null && !conquest.inviteNudge().isBlank()) {
            return total + "명 참여 · " + conquestText() + ". " + conquest.inviteNudge();
        }
        return total + "명 참여. 닉네임과 생일을 적으면 궁합이 나오고, 사는 곳에 핀이 찍혀요.";
    }
}
