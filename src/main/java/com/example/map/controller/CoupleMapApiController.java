package com.example.map.controller;

import com.example.map.dto.ClaimMapsRequest;
import com.example.map.dto.CreateMapRequest;
import com.example.map.dto.CreatedMapResponse;
import com.example.map.dto.JoinMapRequest;
import com.example.map.dto.JoinMapResponse;
import com.example.map.dto.MapView;
import com.example.map.dto.UpdateGuestRequest;
import com.example.map.dto.UpdateMapRequest;
import com.example.map.service.AnonymousCreateGuard;
import com.example.map.service.CoupleMapService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/maps")
@RequiredArgsConstructor
public class CoupleMapApiController {

    private final CoupleMapService coupleMapService;
    private final AnonymousCreateGuard anonymousCreateGuard;

    @PostMapping
    public CreatedMapResponse create(
            @RequestBody CreateMapRequest body,
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        String userId = KakaoAuth.userId(authentication);
        if ((userId == null || userId.isBlank()) && !anonymousCreateGuard.allow(clientKey(request))) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "오늘은 지도를 너무 많이 만들었어요. 내일 다시 시도하거나 카카오 로그인 후 만들어 주세요."
            );
        }
        CreatedMapResponse created = coupleMapService.create(
                body.hostName(),
                body.hostSigunguCode(),
                body.hostBirthDate(),
                body.hostMbti(),
                userId
        );
        HostTokenSupport.write(request, response, created.id(), created.hostToken());
        return created;
    }

    private static String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/claim")
    public Map<String, Integer> claim(@RequestBody ClaimMapsRequest body, Authentication authentication) {
        int claimed = coupleMapService.claim(KakaoAuth.userId(authentication), body.maps());
        return Map.of("claimed", claimed);
    }

    @GetMapping("/{id}")
    public MapView view(@PathVariable String id, HttpServletRequest request, Authentication authentication) {
        return coupleMapService.view(id, HostTokenSupport.read(request, id), KakaoAuth.userId(authentication));
    }

    @PostMapping("/{id}/join")
    public JoinMapResponse join(@PathVariable String id, @RequestBody JoinMapRequest body) {
        return coupleMapService.join(id, body.guestName(), body.sigunguCode(), body.birthDate(), body.mbti());
    }

    @PatchMapping("/{id}/me")
    public JoinMapResponse updateGuest(@PathVariable String id, @RequestBody UpdateGuestRequest body) {
        return coupleMapService.updateGuest(
                id,
                body.previousName(),
                body.guestName(),
                body.sigunguCode(),
                body.birthDate(),
                body.mbti()
        );
    }

    @PatchMapping("/{id}")
    public MapView update(
            @PathVariable String id,
            @RequestBody UpdateMapRequest body,
            HttpServletRequest request,
            Authentication authentication
    ) {
        return coupleMapService.updateHost(
                id,
                HostTokenSupport.read(request, id),
                KakaoAuth.userId(authentication),
                body.hostName(),
                body.hostSigunguCode(),
                body.hostBirthDate(),
                body.hostMbti()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        coupleMapService.deleteMap(id, HostTokenSupport.read(request, id), KakaoAuth.userId(authentication));
        HostTokenSupport.clear(request, response, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/people/{personId}")
    public MapView deletePerson(
            @PathVariable String id,
            @PathVariable Long personId,
            HttpServletRequest request,
            Authentication authentication
    ) {
        return coupleMapService.deletePerson(
                id,
                HostTokenSupport.read(request, id),
                KakaoAuth.userId(authentication),
                personId
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> unreadable(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", "이름, 생년월일, 사는 곳을 다시 확인해 주세요."));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> dataAccess(DataAccessException exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", dbHint(exception)));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        return ResponseEntity.status(status).body(Map.of("message", exception.getReason() == null ? "" : exception.getReason()));
    }

    private static String dbHint(Throwable error) {
        String text = "";
        for (Throwable current = error; current != null; current = current.getCause()) {
            if (current.getMessage() != null) {
                text += current.getMessage();
            }
        }
        if (text.contains("host_mbti") || text.contains("Unknown column 'mbti'") || text.contains("Unknown column")) {
            return "DB에 MBTI 칸이 없어요. couple_map.host_mbti와 couple_map_person.mbti를 추가해 주세요.";
        }
        if (text.contains("user_id") && (text.contains("cannot be null") || text.contains("doesn't have a default"))) {
            return "로그인 없이 만들려면 couple_map.user_id를 NULL 허용으로 바꿔 주세요.";
        }
        return "다시 시도해 주세요.";
    }
}
