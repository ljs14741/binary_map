package com.example.map.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 로그인 없이 만드는 지도의 하루 상한. 컨테이너 메모리에만 둔다.
 * 재시작하면 풀리지만 대량 생성을 막는 데는 충분하다.
 */
@Service
public class AnonymousCreateGuard {

    private static final int DAILY_LIMIT = 10;

    private final Map<String, AtomicInteger> counters = new ConcurrentHashMap<>();
    private volatile LocalDate windowDate = LocalDate.now();

    public boolean allow(String clientKey) {
        if (clientKey == null || clientKey.isBlank()) {
            return true;
        }
        rollWindow();
        return counters.computeIfAbsent(clientKey, key -> new AtomicInteger()).incrementAndGet() <= DAILY_LIMIT;
    }

    private void rollWindow() {
        LocalDate today = LocalDate.now();
        if (today.equals(windowDate)) {
            return;
        }
        synchronized (this) {
            if (!today.equals(windowDate)) {
                counters.clear();
                windowDate = today;
            }
        }
    }
}
