package com.example.map.controller;

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
            HttpServletResponse response
    ) {
        CreatedMapResponse created = coupleMapService.create(body.hostName(), body.hostSidoCode());
        HostTokenSupport.write(request, response, created.id(), created.hostToken());
        return created;
    }

    @GetMapping("/{id}")
    public MapView view(@PathVariable String id, HttpServletRequest request) {
        return coupleMapService.view(id, HostTokenSupport.read(request, id));
    }

    @PostMapping("/{id}/join")
    public JoinMapResponse join(@PathVariable String id, @RequestBody JoinMapRequest body) {
        return coupleMapService.join(id, body.guestName(), body.sidoCode());
    }

    @PatchMapping("/{id}")
    public MapView update(
            @PathVariable String id,
            @RequestBody UpdateMapRequest body,
            HttpServletRequest request
    ) {
        return coupleMapService.updateHost(
                id,
                HostTokenSupport.read(request, id),
                body.hostName(),
                body.hostSidoCode()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        coupleMapService.deleteMap(id, HostTokenSupport.read(request, id));
        HostTokenSupport.clear(request, response, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/people/{personId}")
    public MapView deletePerson(
            @PathVariable String id,
            @PathVariable Long personId,
            HttpServletRequest request
    ) {
        return coupleMapService.deletePerson(id, HostTokenSupport.read(request, id), personId);
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
