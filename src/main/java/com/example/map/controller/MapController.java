package com.example.map.controller;

import com.example.map.dto.SampleFriend;
import com.example.map.dto.SampleLabelCount;
import com.example.map.dto.SampleRegion;
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

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MapController {

    private final ObjectMapper objectMapper;
    private final CoupleMapService coupleMapService;
    private final RegionCatalog regionCatalog;

    @GetMapping("/")
    public String home(Model model) throws JsonProcessingException {
        List<SampleRegion> regions = sampleRegions();
        model.addAttribute("sampleRegions", regions);
        model.addAttribute("sampleJson", objectMapper.writeValueAsString(regions));
        List<SampleFriend> friends = sampleFriends();
        model.addAttribute("sampleFriends", friends);
        model.addAttribute("sampleFriendsJson", objectMapper.writeValueAsString(friends));
        model.addAttribute("sampleCounts", sampleCounts());
        model.addAttribute("sampleTotal", 50);
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

    private void addRegionAttrs(Model model) throws JsonProcessingException {
        model.addAttribute("sidos", Sido.all());
        model.addAttribute("sigungusJson", objectMapper.writeValueAsString(regionCatalog.all()));
    }

    private List<SampleRegion> sampleRegions() {
        return List.of(
                region("11", "서울", 8, RelationLabel.BURAL_MATE),
                region("41", "경기", 10, RelationLabel.TRUE_MATE),
                region("26", "부산", 4, RelationLabel.TRUE_MATE),
                region("28", "인천", 3, RelationLabel.BIZ_MATE),
                region("27", "대구", 3, RelationLabel.AWKWARD_MATE),
                region("29", "광주", 2, RelationLabel.BURAL_MATE),
                region("30", "대전", 2, RelationLabel.BIZ_MATE),
                region("31", "울산", 2, RelationLabel.DANGER_MATE),
                region("36", "세종", 1, RelationLabel.BIZ_MATE),
                region("42", "강원", 2, RelationLabel.AWKWARD_MATE),
                region("43", "충북", 2, RelationLabel.TRUE_MATE),
                region("44", "충남", 3, RelationLabel.BIZ_MATE),
                region("45", "전북", 2, RelationLabel.AWKWARD_MATE),
                region("46", "전남", 1, RelationLabel.TRUE_MATE),
                region("47", "경북", 2, RelationLabel.BIZ_MATE),
                region("48", "경남", 2, RelationLabel.BURAL_MATE),
                region("50", "제주", 1, RelationLabel.BURAL_MATE)
        );
    }

    private List<SampleFriend> sampleFriends() {
        return List.of(
                friend("민지", "서울 강남구", "11", 96, RelationLabel.BURAL_MATE),
                friend("하은", "제주 제주시", "50", 88, RelationLabel.BURAL_MATE),
                friend("예린", "광주 북구", "29", 91, RelationLabel.BURAL_MATE),
                friend("서준", "부산 해운대구", "26", 82, RelationLabel.TRUE_MATE),
                friend("도윤", "경기 성남 분당구", "41", 74, RelationLabel.TRUE_MATE),
                friend("나연", "충북 청주 흥덕구", "43", 78, RelationLabel.TRUE_MATE),
                friend("지아", "인천 연수구", "28", 61, RelationLabel.BIZ_MATE),
                friend("시우", "대전 유성구", "30", 58, RelationLabel.BIZ_MATE),
                friend("현우", "대구 수성구", "27", 41, RelationLabel.AWKWARD_MATE),
                friend("수아", "강원 춘천시", "42", 35, RelationLabel.AWKWARD_MATE),
                friend("태민", "울산 남구", "31", 18, RelationLabel.DANGER_MATE)
        );
    }

    private SampleFriend friend(String name, String sido, String sidoCode, int score, RelationLabel label) {
        return new SampleFriend(name, sido, sidoCode, score, label.displayName(), label.mapColor());
    }

    private List<SampleLabelCount> sampleCounts() {
        return List.of(
                countOf(RelationLabel.BURAL_MATE, 13),
                countOf(RelationLabel.TRUE_MATE, 17),
                countOf(RelationLabel.BIZ_MATE, 11),
                countOf(RelationLabel.AWKWARD_MATE, 7),
                countOf(RelationLabel.DANGER_MATE, 2)
        );
    }

    private SampleLabelCount countOf(RelationLabel label, int count) {
        return new SampleLabelCount(label.titledName(), label.mapColor(), count, label.displayName());
    }

    private SampleRegion region(String code, String name, int count, RelationLabel label) {
        return new SampleRegion(code, name, count, label.displayName(), label.mapColor());
    }
}
