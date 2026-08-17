# 짝꿍지도 (binary_map)

이름 획수 궁합으로 친구와의 점수를 보고, 친구가 사는 곳에 핀이 찍히는 소셜 웹 서비스. 생년월일로 띠를 보여 주고, 별자리는 결과 카드 하단에만 적는다.

| 구분 | 값 |
|------|------|
| 브랜드 | 짝꿍지도 |
| 검색용 이름 | 이름궁합 |
| 주소 | https://map.binaryworld.kr |
| 모듈 | binary_map |
| 스택 | Spring Boot 3.2.5, Java 17, Thymeleaf |
| 1차 DB | 같은 RDS의 `map` 데이터베이스. 테이블은 [SCHEMA.md](SCHEMA.md) |

탭 제목 예: `이름궁합 테스트 - 친구 동네가 칠해지는 짝꿍지도`  
카톡 공유 제목 예: `이진수님의 짝꿍지도`

로컬 실행:

```bash
./gradlew bootRun
```

http://localhost:8080

카카오 로그인 Redirect URI:

- `http://localhost:8080/login/oauth2/code/kakao`
- `https://map.binaryworld.kr/login/oauth2/code/kakao`

시군구·생년월일을 반영하려면 [SCHEMA.md](SCHEMA.md)를 본다. 이미 테이블이 있으면 `ALTER`만 실행하면 된다.

상세 설계는 [DESIGN.md](DESIGN.md)를 본다.
