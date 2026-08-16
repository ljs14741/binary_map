package com.example.map.controller;

import com.example.map.dto.SampleFriend;
import com.example.map.dto.SampleLabelCount;
import com.example.map.entity.RelationLabel;
import com.example.map.entity.Sido;
import com.example.map.service.CoupleMapService;
import com.example.map.service.RegionCatalog;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class MapController {

    private final ObjectMapper objectMapper;
    private final CoupleMapService coupleMapService;
    private final RegionCatalog regionCatalog;

    @GetMapping("/")
    public String home(Model model) throws JsonProcessingException {
        List<SampleFriend> friends = sampleFriends();
        model.addAttribute("sampleFriends", friends);
        model.addAttribute("sampleFriendsJson", objectMapper.writeValueAsString(friends));
        model.addAttribute("sampleCounts", sampleCounts(friends));
        model.addAttribute("sampleTotal", friends.size());
        addRegionAttrs(model);
        return "main";
    }

    @GetMapping("/m/{id}")
    public String room(
            @PathVariable String id,
            HttpServletRequest request,
            Authentication authentication,
            Model model
    ) throws JsonProcessingException {
        var view = coupleMapService.view(id, HostTokenSupport.read(request, id), KakaoAuth.userId(authentication));
        model.addAttribute("mapView", view);
        model.addAttribute("mapJson", objectMapper.writeValueAsString(view));
        addRegionAttrs(model);
        return "room";
    }

    @GetMapping("/privacy-policy")
    public String privacy() {
        return "privacy-policy";
    }

    @GetMapping("/about")
    public String about() {
        return "redirect:https://binaryworld.kr/about";
    }

    @GetMapping("/contact")
    public String contact() {
        return "redirect:https://binaryworld.kr/contact";
    }

    private void addRegionAttrs(Model model) throws JsonProcessingException {
        model.addAttribute("sidos", Sido.all());
        model.addAttribute("sigungusJson", objectMapper.writeValueAsString(regionCatalog.all()));
    }

    private List<SampleFriend> sampleFriends() {
        List<SampleFriend> friends = List.of(
                friend("민지", "서울 강남구", "11", "11680", 97, 97, RelationLabel.BURAL_MATE, RelationLabel.BURAL_MATE),
                friend("하은", "제주 제주시", "50", "50110", 88, 91, RelationLabel.BURAL_MATE, RelationLabel.BURAL_MATE),
                friend("예린", "광주 북구", "29", "29170", 91, 72, RelationLabel.BURAL_MATE, RelationLabel.TRUE_MATE),
                friend("서준", "부산 해운대구", "26", "26350", 82, 70, RelationLabel.TRUE_MATE, RelationLabel.TRUE_MATE),
                friend("도윤", "경기 성남 분당구", "41", "41135", 74, 80, RelationLabel.TRUE_MATE, RelationLabel.TRUE_MATE),
                friend("나연", "충북 청주 흥덕구", "43", "43113", 78, 55, RelationLabel.TRUE_MATE, RelationLabel.BIZ_MATE),
                friend("지아", "인천 연수구", "28", "28185", 61, 58, RelationLabel.BIZ_MATE, RelationLabel.BIZ_MATE),
                friend("시우", "대전 유성구", "30", "30200", 58, 42, RelationLabel.BIZ_MATE, RelationLabel.AWKWARD_MATE),
                friend("현우", "대구 수성구", "27", "27260", 41, 35, RelationLabel.AWKWARD_MATE, RelationLabel.AWKWARD_MATE),
                friend("지민", "대구 달서구", "27", "27290", 38, 48, RelationLabel.AWKWARD_MATE, RelationLabel.AWKWARD_MATE),
                friend("수아", "강원 춘천시", "42", "42110", 35, 22, RelationLabel.AWKWARD_MATE, RelationLabel.DANGER_MATE),
                friend("태민", "울산 남구", "31", "31140", 18, 7, RelationLabel.DANGER_MATE, RelationLabel.DANGER_MATE)
        );
        return friends.stream()
                .sorted(Comparator
                        .comparingInt((SampleFriend person) -> Math.max(person.score(), person.reverseScore())).reversed()
                        .thenComparingInt((SampleFriend person) -> Math.min(person.score(), person.reverseScore())).reversed()
                        .thenComparing(SampleFriend::name))
                .toList();
    }

    private SampleFriend friend(
            String name,
            String sido,
            String sidoCode,
            String sigunguCode,
            int score,
            int reverseScore,
            RelationLabel label,
            RelationLabel reverse
    ) {
        return new SampleFriend(
                name,
                sido,
                sidoCode,
                sigunguCode,
                score,
                label.displayName(),
                label.mapColor(),
                reverseScore,
                reverse.displayName(),
                reverse.mapColor()
        );
    }

    private List<SampleLabelCount> sampleCounts(List<SampleFriend> friends) {
        Map<String, Long> grouped = friends.stream()
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

    private String rankLabel(SampleFriend friend) {
        return friend.reverseScore() > friend.score() ? friend.reverseLabel() : friend.label();
    }
}
