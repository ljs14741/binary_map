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

    /** 1등 짝꿍 이름. 목록은 이미 점수순 */
    public String topName() {
        if (people == null || people.isEmpty()) {
            return "";
        }
        String name = people.get(0).name();
        return name == null ? "" : name;
    }

    /** 미리보기 제목. 인원이 있으면 숫자를 붙여서 눌러볼 이유를 만든다 */
    public String ogTitle() {
        if (total <= 0) {
            return hostName + "님의 짝꿍지도";
        }
        return hostName + "님의 짝꿍지도 · " + total + "명 참여";
    }

    /** 미리보기 설명. 호스트가 친구를 부르는 말투로, 인원·정복도·1등 이름을 넣는다 */
    public String ogDescription() {
        if (total <= 0) {
            return hostName + ": 내 지도 아직 비었어. 너 어디 살아? 들어와서 핀 찍고 나랑 궁합 봐.";
        }
        String top = topName();
        StringBuilder sb = new StringBuilder();
        sb.append(total).append("명이 핀 찍음 · 정복도 ").append(conquestPercent()).append("%");
        if (!top.isBlank()) {
            sb.append(" · 1등 ").append(top);
        }
        sb.append(". 너 어디 살아? 들어와서 궁합 찍고 ");
        sb.append(top.isBlank() ? "1등 먹어." : top + " 넘어 봐.");
        return sb.toString();
    }
}
