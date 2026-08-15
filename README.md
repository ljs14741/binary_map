# 짝꿍지도 (binary_map)

이름 획수 궁합으로 친구와의 점수를 보고, 친구가 사는 도가 내 한국 지도에 칠해지는 소셜 웹 서비스.

| 구분 | 값 |
|------|------|
| 브랜드 | 짝꿍지도 |
| 검색용 이름 | 이름궁합 |
| 주소 | https://map.binaryworld.kr |
| 모듈 | binary_map |
| 스택 | Spring Boot 3.2.5, Java 17, Thymeleaf |
| 1차 DB | 아직 없음. 방/참여 기능 붙일 때 MySQL + JPA |

탭 제목 예: `이름궁합 테스트 - 친구 동네가 칠해지는 짝꿍지도`  
카톡 공유 제목 예: `이진수님의 짝꿍지도`

로컬 실행:

```bash
./gradlew bootRun
```

http://localhost:8080

상세 설계는 [DESIGN.md](DESIGN.md)를 본다.
