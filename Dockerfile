# 도커가 사용할 기본 이미지
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY build/libs/map-0.0.1-SNAPSHOT.war /app/map.war

COPY src/main/resources/templates/error/*.html /usr/share/nginx/html/

ENV TZ=Asia/Seoul

CMD ["java", "-jar", "-Duser.timezone=Asia/Seoul", "/app/map.war"]
