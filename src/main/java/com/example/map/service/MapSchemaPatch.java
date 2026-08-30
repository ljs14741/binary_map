package com.example.map.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * ddl-auto가 none이라 새 칸을 코드만으로 넣을 수 없다.
 * 앱이 뜰 때 없는 칸만 추가하고, 비로그인 생성이 막히지 않게 user_id는 NULL을 받는다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MapSchemaPatch {

    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void ensureColumns() {
        try (var conn = dataSource.getConnection(); Statement statement = conn.createStatement()) {
            ensureColumn(statement, "couple_map", "host_mbti", "CHAR(4) NULL");
            ensureColumn(statement, "couple_map_person", "mbti", "CHAR(4) NULL");
            try {
                statement.executeUpdate("ALTER TABLE couple_map MODIFY user_id VARCHAR(64) NULL");
            } catch (SQLException exception) {
                log.warn("user_id NULL 허용을 건너뜀: {}", exception.getMessage());
            }
        } catch (SQLException exception) {
            log.warn("지도 스키마 보정을 건너뜀: {}", exception.getMessage());
        }
    }

    private void ensureColumn(Statement statement, String table, String column, String definition) {
        try {
            statement.executeUpdate("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
            log.info("컬럼 추가 {}.{}", table, column);
        } catch (SQLException exception) {
            log.debug("컬럼 유지 {}.{}: {}", table, column, exception.getMessage());
        }
    }
}
