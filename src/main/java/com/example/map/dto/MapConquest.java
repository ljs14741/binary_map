package com.example.map.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * 지도의 자랑 지표. 캡처 카드와 방 상단에 쓴다.
 * topPercent는 비교 대상이 충분할 때만 채운다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MapConquest(
        int sidoFilled,
        int sidoTotal,
        int percent,
        int sigunguFilled,
        String grade,
        String gradeEmoji,
        String gradeNote,
        List<String> emptySidos,
        String inviteNudge,
        Integer topPercent
) {
}
