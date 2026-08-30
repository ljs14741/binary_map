# 도커가 사용할 기본 이미지
FROM eclipse-temurin:17-jdk-jammy

RUN apt-get update \
    && apt-get install -y --no-install-recommends fonts-nanum fontconfig \
    && fc-cache -f \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY build/libs/map-0.0.1-SNAPSHOT.war /app/map.war

COPY src/main/resources/templates/error/*.html /usr/share/nginx/html/

ENV TZ=Asia/Seoul

CMD ["java", "-jar", "-Duser.timezone=Asia/Seoul", "/app/map.war"]
