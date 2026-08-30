package com.example.map.entity;

/**
 * 지도 등급. 채운 시도 수로만 정한다.
 * 참여자 수가 아니라 지역 수를 쓰는 이유: 빈 시도가 남아 있으면 그 지역 친구를 찾아 초대할 이유가 생긴다.
 * 초반 구간은 관대하게 잡는다. 한 명만 들어와도 칭호가 붙어야 계속 모을 마음이 든다.
 */
public enum MapGrade {

    EMPTY(0, 0, "빈 지도", "🗺️", "링크를 보내면 친구가 사는 곳에 핀이 찍혀요."),
    NEIGHBOR(1, 1, "동네 짝꿍", "🏘️", "한 지역 점령. 다른 도에도 친구를 심어 보세요."),
    NEARBY(2, 3, "옆동네 짝꿍", "🚌", "슬슬 지도가 넓어지고 있어요."),
    WIDE(4, 6, "광역 짝꿍", "🚄", "여기서 절반까지 얼마 안 남았어요."),
    HALF(7, 9, "반전국 짝꿍", "🛫", "전국 절반을 칠했어요."),
    NATIONAL(10, 13, "전국구 인맥왕", "👑", "이 정도면 자랑해도 돼요."),
    ALMOST(14, 16, "정복 직전", "🔥", "몇 곳만 더 채우면 전국 정복이에요."),
    CONQUERED(17, 17, "전국 정복 완료", "🏆", "17개 시도를 다 칠했어요. 진짜 인맥왕.");

    private final int min;
    private final int max;
    private final String displayName;
    private final String emoji;
    private final String note;

    MapGrade(int min, int max, String displayName, String emoji, String note) {
        this.min = min;
        this.max = max;
        this.displayName = displayName;
        this.emoji = emoji;
        this.note = note;
    }

    public String displayName() {
        return displayName;
    }

    public String emoji() {
        return emoji;
    }

    public String note() {
        return note;
    }

    public static MapGrade fromSidoCount(int filled) {
        for (MapGrade grade : values()) {
            if (filled >= grade.min && filled <= grade.max) {
                return grade;
            }
        }
        return filled > CONQUERED.max ? CONQUERED : EMPTY;
    }
}
