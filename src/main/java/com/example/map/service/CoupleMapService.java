package com.example.map.service;

import com.example.map.dto.CreatedMapResponse;
import com.example.map.dto.JoinMapResponse;
import com.example.map.dto.MapPersonView;
import com.example.map.dto.MapView;
import com.example.map.dto.SampleLabelCount;
import com.example.map.entity.CoupleMap;
import com.example.map.entity.CoupleMapPerson;
import com.example.map.entity.RelationLabel;
import com.example.map.entity.Sido;
import com.example.map.repository.CoupleMapPersonRepository;
import com.example.map.repository.CoupleMapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoupleMapService {

    public static final int MAX_PEOPLE = 60;
    private static final String SHARE_BASE = "https://map.binaryworld.kr/m/";

    private final CoupleMapRepository coupleMapRepository;
    private final CoupleMapPersonRepository coupleMapPersonRepository;
    private final NameCompatibilityService nameCompatibilityService;

    @Transactional
    public CreatedMapResponse create(String hostName, String hostSidoCode) {
        String name = requireName(hostName);
        Sido sido = Sido.fromCode(hostSidoCode);
        LocalDateTime now = LocalDateTime.now();

        CoupleMap map = new CoupleMap();
        map.setId(UUID.randomUUID().toString());
        map.setHostName(name);
        map.setHostSidoCode(sido.code());
        map.setHostToken(UUID.randomUUID().toString());
        map.setCreatedAt(now);
        map.setUpdatedAt(now);
        coupleMapRepository.save(map);

        return new CreatedMapResponse(
                map.getId(),
                map.getHostName(),
                map.getHostSidoCode(),
                map.getHostToken(),
                shareUrl(map.getId())
        );
    }

    @Transactional(readOnly = true)
    public MapView view(String mapId, String hostToken) {
        CoupleMap map = getMap(mapId);
        return toView(map, isHost(map, hostToken));
    }

    @Transactional
    public JoinMapResponse join(String mapId, String guestName, String sidoCode) {
        CoupleMap map = getMap(mapId);
        String name = requireName(guestName);
        Sido sido = Sido.fromCode(sidoCode);
        if (name.equals(map.getHostName())) {
            throw new IllegalArgumentException("방장과 같은 이름은 쓸 수 없어요. 별명을 적어 주세요.");
        }

        var result = nameCompatibilityService.calculate(map.getHostName(), name);
        RelationLabel label = result.label();
        LocalDateTime now = LocalDateTime.now();

        CoupleMapPerson person = coupleMapPersonRepository
                .findByMap_IdAndPersonName(mapId, name)
                .orElseGet(CoupleMapPerson::new);

        if (person.getId() == null && coupleMapPersonRepository.countByMap_Id(mapId) >= MAX_PEOPLE) {
            throw new IllegalArgumentException("이 지도는 친구가 가득 찼어요.");
        }

        person.setMap(map);
        person.setPersonName(name);
        person.setSidoCode(sido.code());
        person.setScore(result.score());
        person.setLabel(label.displayName());
        if (person.getCreatedAt() == null) {
            person.setCreatedAt(now);
        }
        person.setUpdatedAt(now);
        coupleMapPersonRepository.save(person);

        return new JoinMapResponse(
                map.getHostName(),
                name,
                result.letters(),
                result.stages(),
                result.score(),
                label.titledName(),
                label.mapColor(),
                label.comment(),
                toView(map, false)
        );
    }

    @Transactional
    public MapView updateHost(String mapId, String hostToken, String hostName, String hostSidoCode) {
        CoupleMap map = requireHost(mapId, hostToken);
        String name = requireName(hostName);
        Sido sido = Sido.fromCode(hostSidoCode);
        boolean nameChanged = !name.equals(map.getHostName());
        if (nameChanged && coupleMapPersonRepository.findByMap_IdAndPersonName(mapId, name).isPresent()) {
            throw new IllegalArgumentException("이미 그 이름으로 들어온 친구가 있어요. 다른 이름을 써 주세요.");
        }
        map.setHostName(name);
        map.setHostSidoCode(sido.code());
        map.setUpdatedAt(LocalDateTime.now());
        if (nameChanged) {
            recalculate(map);
        }
        return toView(map, true);
    }

    @Transactional
    public void deleteMap(String mapId, String hostToken) {
        CoupleMap map = requireHost(mapId, hostToken);
        List<CoupleMapPerson> people = coupleMapPersonRepository.findByMap_IdOrderByScoreDescCreatedAtAsc(mapId);
        coupleMapPersonRepository.deleteAll(people);
        coupleMapRepository.delete(map);
    }

    @Transactional
    public MapView deletePerson(String mapId, String hostToken, Long personId) {
        CoupleMap map = requireHost(mapId, hostToken);
        CoupleMapPerson person = coupleMapPersonRepository.findByIdAndMap_Id(personId, mapId)
                .orElseThrow(() -> new IllegalArgumentException("친구를 찾을 수 없어요."));
        coupleMapPersonRepository.delete(person);
        return toView(map, true);
    }

    private void recalculate(CoupleMap map) {
        List<CoupleMapPerson> people = coupleMapPersonRepository.findByMap_IdOrderByScoreDescCreatedAtAsc(map.getId());
        LocalDateTime now = LocalDateTime.now();
        for (CoupleMapPerson person : people) {
            var result = nameCompatibilityService.calculate(map.getHostName(), person.getPersonName());
            person.setScore(result.score());
            person.setLabel(result.label().displayName());
            person.setUpdatedAt(now);
        }
    }

    private CoupleMap requireHost(String mapId, String hostToken) {
        CoupleMap map = getMap(mapId);
        if (!isHost(map, hostToken)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 지도를 관리할 수 없어요.");
        }
        return map;
    }

    private CoupleMap getMap(String mapId) {
        return coupleMapRepository.findById(mapId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지도를 찾을 수 없어요."));
    }

    private boolean isHost(CoupleMap map, String hostToken) {
        return hostToken != null && !hostToken.isBlank() && hostToken.equals(map.getHostToken());
    }

    private MapView toView(CoupleMap map, boolean host) {
        List<CoupleMapPerson> rows = coupleMapPersonRepository.findByMap_IdOrderByScoreDescCreatedAtAsc(map.getId());
        List<MapPersonView> people = rows.stream().map(this::toPerson).toList();
        return new MapView(
                map.getId(),
                map.getHostName(),
                Sido.fromCode(map.getHostSidoCode()).label(),
                map.getHostSidoCode(),
                shareUrl(map.getId()),
                host,
                people.size(),
                countsOf(people),
                people
        );
    }

    private MapPersonView toPerson(CoupleMapPerson person) {
        RelationLabel label = RelationLabel.fromScore(person.getScore());
        return new MapPersonView(
                person.getId(),
                person.getPersonName(),
                Sido.fromCode(person.getSidoCode()).label(),
                person.getSidoCode(),
                person.getScore(),
                label.displayName(),
                label.mapColor()
        );
    }

    private List<SampleLabelCount> countsOf(List<MapPersonView> people) {
        Map<String, Long> grouped = people.stream()
                .collect(Collectors.groupingBy(MapPersonView::label, Collectors.counting()));
        List<SampleLabelCount> counts = new ArrayList<>();
        for (RelationLabel label : RelationLabel.values()) {
            counts.add(new SampleLabelCount(
                    label.titledName(),
                    label.mapColor(),
                    grouped.getOrDefault(label.displayName(), 0L).intValue(),
                    label.displayName()
            ));
        }
        return counts;
    }

    private String requireName(String value) {
        String name = nameCompatibilityService.normalize(value);
        if (name.isEmpty()) {
            throw new IllegalArgumentException("한글 이름을 입력해 주세요.");
        }
        if (name.length() > 20) {
            throw new IllegalArgumentException("이름이 너무 길어요.");
        }
        return name;
    }

    private String shareUrl(String mapId) {
        return SHARE_BASE + mapId;
    }
}
