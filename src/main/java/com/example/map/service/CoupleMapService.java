package com.example.map.service;

import com.example.map.dto.AnimalCount;
import com.example.map.dto.ClaimMapItem;
import com.example.map.dto.CreatedMapResponse;
import com.example.map.dto.JoinMapResponse;
import com.example.map.dto.MapPersonView;
import com.example.map.dto.MapSummary;
import com.example.map.dto.MapView;
import com.example.map.dto.SampleLabelCount;
import com.example.map.entity.AnimalFit;
import com.example.map.entity.CoupleMap;
import com.example.map.entity.CoupleMapPerson;
import com.example.map.entity.RelationLabel;
import com.example.map.entity.Sigungu;
import com.example.map.entity.ZodiacAnimal;
import com.example.map.repository.CoupleMapPersonRepository;
import com.example.map.repository.CoupleMapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
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
    private final BirthFlavorService birthFlavorService;
    private final RegionCatalog regionCatalog;

    @Transactional
    public CreatedMapResponse create(String hostName, String hostSigunguCode, LocalDate hostBirthDate, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "카카오 로그인 후 지도를 만들 수 있어요.");
        }
        var existing = coupleMapRepository.findFirstByUserIdOrderByCreatedAtAsc(userId);
        if (existing.isPresent()) {
            return toCreated(existing.get());
        }
        String name = requireName(hostName);
        Sigungu sigungu = regionCatalog.fromCode(hostSigunguCode);
        LocalDate birth = birthFlavorService.requireBirthDate(hostBirthDate);
        LocalDateTime now = LocalDateTime.now();

        CoupleMap map = new CoupleMap();
        map.setId(UUID.randomUUID().toString());
        map.setHostName(name);
        map.setHostSigunguCode(sigungu.code());
        map.setHostBirthDate(birth);
        map.setHostToken(UUID.randomUUID().toString());
        map.setUserId(userId);
        map.setCreatedAt(now);
        map.setUpdatedAt(now);
        coupleMapRepository.save(map);

        return toCreated(map);
    }

    @Transactional(readOnly = true)
    public MapView view(String mapId, String hostToken, String userId) {
        CoupleMap map = getMap(mapId);
        return toView(map, isHost(map, hostToken, userId));
    }

    @Transactional(readOnly = true)
    public List<MapSummary> listByUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return coupleMapRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional
    public JoinMapResponse join(String mapId, String guestName, String sigunguCode, LocalDate birthDate) {
        CoupleMap map = getMap(mapId);
        String name = requireName(guestName);
        Sigungu sigungu = regionCatalog.fromCode(sigunguCode);
        LocalDate birth = birthFlavorService.requireBirthDate(birthDate);
        if (name.equals(map.getHostName())) {
            throw new IllegalArgumentException("지도 닉네임과 같은 이름은 쓸 수 없어요. 다른 닉네임을 적어 주세요.");
        }
        if (coupleMapPersonRepository.findByMap_IdAndPersonName(mapId, name).isPresent()) {
            throw new IllegalArgumentException("이미 그 닉네임으로 들어온 친구가 있어요. 다른 닉네임을 써 주세요.");
        }
        if (coupleMapPersonRepository.countByMap_Id(mapId) >= MAX_PEOPLE) {
            throw new IllegalArgumentException("이 지도는 친구가 가득 찼어요.");
        }

        LocalDateTime now = LocalDateTime.now();
        CoupleMapPerson person = new CoupleMapPerson();
        person.setMap(map);
        person.setPersonName(name);
        person.setSigunguCode(sigungu.code());
        person.setBirthDate(birth);
        person.setCreatedAt(now);
        person.setUpdatedAt(now);
        applyScores(map, person);
        coupleMapPersonRepository.save(person);
        return toJoinResponse(map, person);
    }

    @Transactional
    public JoinMapResponse updateGuest(
            String mapId,
            String previousName,
            String guestName,
            String sigunguCode,
            LocalDate birthDate
    ) {
        CoupleMap map = getMap(mapId);
        String oldName = requireName(previousName);
        CoupleMapPerson person = coupleMapPersonRepository.findByMap_IdAndPersonName(mapId, oldName)
                .orElseThrow(() -> new IllegalArgumentException("이 지도에서 내 기록을 찾을 수 없어요. 다시 들어와 주세요."));
        String name = requireName(guestName);
        Sigungu sigungu = regionCatalog.fromCode(sigunguCode);
        LocalDate birth = birthFlavorService.requireBirthDate(birthDate);
        if (name.equals(map.getHostName())) {
            throw new IllegalArgumentException("지도 닉네임과 같은 이름은 쓸 수 없어요. 다른 닉네임을 적어 주세요.");
        }
        boolean nameChanged = !name.equals(person.getPersonName());
        if (nameChanged && coupleMapPersonRepository.findByMap_IdAndPersonName(mapId, name).isPresent()) {
            throw new IllegalArgumentException("이미 그 닉네임으로 들어온 친구가 있어요. 다른 닉네임을 써 주세요.");
        }
        person.setPersonName(name);
        person.setSigunguCode(sigungu.code());
        person.setBirthDate(birth);
        person.setUpdatedAt(LocalDateTime.now());
        if (nameChanged) {
            applyScores(map, person);
        }
        return toJoinResponse(map, person);
    }

    @Transactional
    public MapView updateHost(
            String mapId,
            String hostToken,
            String userId,
            String hostName,
            String hostSigunguCode,
            LocalDate hostBirthDate
    ) {
        CoupleMap map = requireHost(mapId, hostToken, userId);
        String name = requireName(hostName);
        Sigungu sigungu = regionCatalog.fromCode(hostSigunguCode);
        LocalDate birth = birthFlavorService.requireBirthDate(hostBirthDate);
        boolean nameChanged = !name.equals(map.getHostName());
        if (nameChanged && coupleMapPersonRepository.findByMap_IdAndPersonName(mapId, name).isPresent()) {
            throw new IllegalArgumentException("이미 그 이름으로 들어온 친구가 있어요. 다른 이름을 써 주세요.");
        }
        map.setHostName(name);
        map.setHostSigunguCode(sigungu.code());
        map.setHostBirthDate(birth);
        map.setUpdatedAt(LocalDateTime.now());
        if (nameChanged) {
            recalculate(map);
        }
        return toView(map, true);
    }

    @Transactional
    public int claim(String userId, List<ClaimMapItem> items) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "카카오 로그인이 필요해요.");
        }
        if (items == null || items.isEmpty()) {
            return 0;
        }
        int claimed = 0;
        LocalDateTime now = LocalDateTime.now();
        for (ClaimMapItem item : items) {
            if (item == null || item.id() == null || item.token() == null) {
                continue;
            }
            var map = coupleMapRepository.findByIdAndHostToken(item.id(), item.token());
            if (map.isEmpty()) {
                continue;
            }
            CoupleMap found = map.get();
            if (found.getUserId() != null && !found.getUserId().equals(userId)) {
                continue;
            }
            if (userId.equals(found.getUserId())) {
                continue;
            }
            if (!coupleMapRepository.findByUserIdOrderByUpdatedAtDesc(userId).isEmpty()) {
                continue;
            }
            found.setUserId(userId);
            found.setUpdatedAt(now);
            claimed += 1;
        }
        return claimed;
    }

    @Transactional
    public void deleteMap(String mapId, String hostToken, String userId) {
        CoupleMap map = requireHost(mapId, hostToken, userId);
        List<CoupleMapPerson> people = coupleMapPersonRepository.findByMap_IdOrderByScoreDescCreatedAtAsc(mapId);
        coupleMapPersonRepository.deleteAll(people);
        coupleMapRepository.delete(map);
    }

    @Transactional
    public MapView deletePerson(String mapId, String hostToken, String userId, Long personId) {
        CoupleMap map = requireHost(mapId, hostToken, userId);
        CoupleMapPerson person = coupleMapPersonRepository.findByIdAndMap_Id(personId, mapId)
                .orElseThrow(() -> new IllegalArgumentException("친구를 찾을 수 없어요."));
        coupleMapPersonRepository.delete(person);
        return toView(map, true);
    }

    private void recalculate(CoupleMap map) {
        List<CoupleMapPerson> people = coupleMapPersonRepository.findByMap_IdOrderByScoreDescCreatedAtAsc(map.getId());
        LocalDateTime now = LocalDateTime.now();
        for (CoupleMapPerson person : people) {
            applyScores(map, person);
            person.setUpdatedAt(now);
        }
    }

    private void applyScores(CoupleMap map, CoupleMapPerson person) {
        var forward = nameCompatibilityService.calculate(map.getHostName(), person.getPersonName());
        var reverse = nameCompatibilityService.calculate(person.getPersonName(), map.getHostName());
        person.setScore(forward.score());
        person.setReverseScore(reverse.score());
        person.setLabel(forward.label().displayName());
    }

    private JoinMapResponse toJoinResponse(CoupleMap map, CoupleMapPerson person) {
        var forward = nameCompatibilityService.calculate(map.getHostName(), person.getPersonName());
        var reverse = nameCompatibilityService.calculate(person.getPersonName(), map.getHostName());
        RelationLabel label = forward.label();
        var hostProfile = birthFlavorService.profile(map.getHostBirthDate());
        var guestProfile = birthFlavorService.profile(person.getBirthDate());
        AnimalFit fit = hostProfile == null || guestProfile == null
                ? null
                : birthFlavorService.fit(hostProfile.animal(), guestProfile.animal());
        var starFit = hostProfile == null || guestProfile == null
                ? null
                : birthFlavorService.starFit(hostProfile.starSign(), guestProfile.starSign());
        return new JoinMapResponse(
                map.getHostName(),
                person.getPersonName(),
                forward.letters(),
                forward.stages(),
                forward.score(),
                label.titledName(),
                label.mapColor(),
                reverse.letters(),
                reverse.stages(),
                reverse.score(),
                reverse.label().titledName(),
                reverse.label().mapColor(),
                toView(map, false),
                birthFlavorService.rankComment(
                        hostProfile,
                        guestProfile,
                        person.getPersonName(),
                        map.getHostBirthDate(),
                        person.getBirthDate()
                ),
                fit == null ? null : fit.simpleLabel(),
                starFit == null ? null : starFit.displayName(),
                birthFlavorService.animalExplain(hostProfile, guestProfile),
                birthFlavorService.starExplain(hostProfile, guestProfile),
                hostProfile == null ? null : hostProfile.animalName(),
                hostProfile == null ? null : hostProfile.animalEmoji(),
                guestProfile == null ? null : guestProfile.animalName(),
                guestProfile == null ? null : guestProfile.animalEmoji(),
                hostProfile == null ? null : hostProfile.starSign(),
                hostProfile == null ? null : hostProfile.starEmoji(),
                guestProfile == null ? null : guestProfile.starSign(),
                guestProfile == null ? null : guestProfile.starEmoji()
        );
    }

    private CoupleMap requireHost(String mapId, String hostToken, String userId) {
        CoupleMap map = getMap(mapId);
        if (!isHost(map, hostToken, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 지도를 관리할 수 없어요.");
        }
        return map;
    }

    private CoupleMap getMap(String mapId) {
        return coupleMapRepository.findById(mapId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지도를 찾을 수 없어요."));
    }

    private boolean isHost(CoupleMap map, String hostToken, String userId) {
        if (hostToken != null && !hostToken.isBlank() && hostToken.equals(map.getHostToken())) {
            return true;
        }
        return userId != null && !userId.isBlank() && userId.equals(map.getUserId());
    }

    private MapView toView(CoupleMap map, boolean host) {
        List<CoupleMapPerson> rows = coupleMapPersonRepository.findByMap_IdOrderByScoreDescCreatedAtAsc(map.getId());
        Sigungu sigungu = regionCatalog.fromCode(map.getHostSigunguCode());
        var hostProfile = birthFlavorService.profile(map.getHostBirthDate());
        List<MapPersonView> people = rows.stream()
                .map(person -> toPerson(person, map, hostProfile))
                .sorted(this::compareRank)
                .toList();
        return new MapView(
                map.getId(),
                map.getHostName(),
                regionCatalog.displayName(sigungu),
                sigungu.sidoCode(),
                sigungu.code(),
                shareUrl(map.getId()),
                host,
                map.getUserId() != null && !map.getUserId().isBlank(),
                people.size(),
                countsOf(people),
                animalCountsOf(hostProfile, rows),
                people,
                map.getHostBirthDate() == null ? null : map.getHostBirthDate().toString(),
                hostProfile == null ? null : hostProfile.animalName(),
                hostProfile == null ? null : hostProfile.animalEmoji(),
                hostProfile == null ? null : hostProfile.starSign(),
                hostProfile == null ? null : hostProfile.starEmoji()
        );
    }

    private MapSummary toSummary(CoupleMap map) {
        return new MapSummary(
                map.getId(),
                map.getHostName(),
                regionCatalog.displayName(map.getHostSigunguCode()),
                (int) coupleMapPersonRepository.countByMap_Id(map.getId()),
                shareUrl(map.getId())
        );
    }

    private CreatedMapResponse toCreated(CoupleMap map) {
        return new CreatedMapResponse(
                map.getId(),
                map.getHostName(),
                map.getHostSigunguCode(),
                map.getHostToken(),
                shareUrl(map.getId())
        );
    }

    private MapPersonView toPerson(
            CoupleMapPerson person,
            CoupleMap map,
            BirthFlavorService.BirthProfile hostProfile
    ) {
        RelationLabel label = RelationLabel.fromScore(person.getScore());
        RelationLabel reverse = RelationLabel.fromScore(person.getReverseScore());
        Sigungu sigungu = regionCatalog.fromCode(person.getSigunguCode());
        var profile = birthFlavorService.profile(person.getBirthDate());
        return new MapPersonView(
                person.getId(),
                person.getPersonName(),
                regionCatalog.displayName(sigungu),
                sigungu.sidoCode(),
                sigungu.code(),
                person.getScore(),
                label.displayName(),
                label.mapColor(),
                person.getReverseScore(),
                reverse.displayName(),
                reverse.mapColor(),
                profile == null ? null : profile.animalName(),
                profile == null ? null : profile.animalEmoji(),
                profile == null ? null : profile.starSign(),
                profile == null ? null : profile.starEmoji(),
                person.getBirthDate() == null ? null : person.getBirthDate().toString(),
                birthFlavorService.rankComment(
                        hostProfile,
                        profile,
                        person.getPersonName(),
                        map.getHostBirthDate(),
                        person.getBirthDate()
                ),
                person.getCreatedAt()
        );
    }

    private int compareRank(MapPersonView a, MapPersonView b) {
        int high = Integer.compare(
                Math.max(b.score(), b.reverseScore()),
                Math.max(a.score(), a.reverseScore()));
        if (high != 0) {
            return high;
        }
        int low = Integer.compare(
                Math.min(b.score(), b.reverseScore()),
                Math.min(a.score(), a.reverseScore()));
        if (low != 0) {
            return low;
        }
        return a.createdAt().compareTo(b.createdAt());
    }

    private List<SampleLabelCount> countsOf(List<MapPersonView> people) {
        Map<String, Long> grouped = people.stream()
                .collect(Collectors.groupingBy(this::rankLabel, Collectors.counting()));
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

    private List<AnimalCount> animalCountsOf(
            BirthFlavorService.BirthProfile hostProfile,
            List<CoupleMapPerson> rows
    ) {
        EnumMap<ZodiacAnimal, Integer> grouped = new EnumMap<>(ZodiacAnimal.class);
        if (hostProfile != null) {
            grouped.merge(hostProfile.animal(), 1, Integer::sum);
        }
        for (CoupleMapPerson person : rows) {
            var profile = birthFlavorService.profile(person.getBirthDate());
            if (profile != null) {
                grouped.merge(profile.animal(), 1, Integer::sum);
            }
        }
        return grouped.entrySet().stream()
                .sorted(Comparator
                        .<Map.Entry<ZodiacAnimal, Integer>>comparingInt(Map.Entry::getValue)
                        .reversed()
                        .thenComparingInt(entry -> entry.getKey().ordinal()))
                .map(entry -> new AnimalCount(
                        entry.getKey().displayName(),
                        entry.getKey().emoji(),
                        entry.getValue()
                ))
                .toList();
    }

    private String requireName(String value) {
        String name = nameCompatibilityService.normalize(value);
        if (name.length() < 2) {
            throw new IllegalArgumentException("한글 닉네임을 두 글자 이상 적어 주세요.");
        }
        if (name.length() > 8) {
            throw new IllegalArgumentException("닉네임은 여덟 글자까지예요.");
        }
        return name;
    }

    private String rankLabel(MapPersonView person) {
        return person.score() >= person.reverseScore() ? person.label() : person.reverseLabel();
    }

    private String shareUrl(String mapId) {
        return SHARE_BASE + mapId;
    }
}
