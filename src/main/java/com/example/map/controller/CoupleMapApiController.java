package com.example.map.controller;

import com.example.map.dto.ClaimMapsRequest;
import com.example.map.dto.CreateMapRequest;
import com.example.map.dto.CreatedMapResponse;
import com.example.map.dto.JoinMapRequest;
import com.example.map.dto.JoinMapResponse;
import com.example.map.dto.MapView;
import com.example.map.dto.UpdateMapRequest;
import com.example.map.service.CoupleMapService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public CreatedMapResponse create(
            @RequestBody CreateMapRequest body,
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        CreatedMapResponse created = coupleMapService.create(
                body.hostName(),
                body.hostSigunguCode(),
                body.hostBirthDate(),
                KakaoAuth.userId(authentication)
        );
        HostTokenSupport.write(request, response, created.id(), created.hostToken());
        return created;
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
        return coupleMapService.join(id, body.guestName(), body.sigunguCode(), body.birthDate());
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
                body.hostBirthDate()
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

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException exception) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        return ResponseEntity.status(status).body(Map.of("message", exception.getReason() == null ? "" : exception.getReason()));
    }
}
