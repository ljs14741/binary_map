package com.example.map.controller;

import com.example.map.domain.RelationLabel;
import com.example.map.dto.SampleFriend;
import com.example.map.dto.SampleLabelCount;
import com.example.map.dto.SampleRegion;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class MapController {

    private final ObjectMapper objectMapper;

    @GetMapping("/")
    public String home(Model model) throws JsonProcessingException {
        List<SampleRegion> regions = sampleRegions();
        model.addAttribute("sampleRegions", regions);
        model.addAttribute("sampleJson", objectMapper.writeValueAsString(regions));
        model.addAttribute("sampleFriends", sampleFriends());
        model.addAttribute("sampleCounts", sampleCounts());
        model.addAttribute("sampleTotal", 50);
        return "main";
    }

    private List<SampleRegion> sampleRegions() {
        return List.of(
                region("11", "서울", 11, RelationLabel.BEST_FRIEND),
                region("41", "경기", 9, RelationLabel.COMFORTABLE),
                region("26", "부산", 4, RelationLabel.BEST_FRIEND),
                region("28", "인천", 3, RelationLabel.COMFORTABLE),
                region("27", "대구", 2, RelationLabel.ACQUAINTANCE),
                region("29", "광주", 2, RelationLabel.BEST_FRIEND),
                region("30", "대전", 2, RelationLabel.COMFORTABLE),
                region("31", "울산", 1, RelationLabel.NOT_A_MATCH),
                region("36", "세종", 1, RelationLabel.COMFORTABLE),
                region("42", "강원", 2, RelationLabel.ACQUAINTANCE),
                region("43", "충북", 2, RelationLabel.BEST_FRIEND),
                region("44", "충남", 2, RelationLabel.COMFORTABLE),
                region("45", "전북", 2, RelationLabel.ACQUAINTANCE),
                region("46", "전남", 1, RelationLabel.BEST_FRIEND),
                region("47", "경북", 2, RelationLabel.COMFORTABLE),
                region("48", "경남", 3, RelationLabel.BEST_FRIEND),
                region("50", "제주", 1, RelationLabel.BEST_FRIEND)
        );
    }

    private List<SampleFriend> sampleFriends() {
        return List.of(
                new SampleFriend("민지", "서울", 88, RelationLabel.BEST_FRIEND.displayName(), RelationLabel.BEST_FRIEND.mapColor()),
                new SampleFriend("서준", "부산", 84, RelationLabel.BEST_FRIEND.displayName(), RelationLabel.BEST_FRIEND.mapColor()),
                new SampleFriend("하은", "제주", 79, RelationLabel.BEST_FRIEND.displayName(), RelationLabel.BEST_FRIEND.mapColor()),
                new SampleFriend("도윤", "경기", 71, RelationLabel.COMFORTABLE.displayName(), RelationLabel.COMFORTABLE.mapColor()),
                new SampleFriend("지아", "인천", 66, RelationLabel.COMFORTABLE.displayName(), RelationLabel.COMFORTABLE.mapColor()),
                new SampleFriend("현우", "대구", 47, RelationLabel.ACQUAINTANCE.displayName(), RelationLabel.ACQUAINTANCE.mapColor()),
                new SampleFriend("수아", "강원", 38, RelationLabel.ACQUAINTANCE.displayName(), RelationLabel.ACQUAINTANCE.mapColor()),
                new SampleFriend("태민", "울산", 19, RelationLabel.NOT_A_MATCH.displayName(), RelationLabel.NOT_A_MATCH.mapColor())
        );
    }

    private List<SampleLabelCount> sampleCounts() {
        return List.of(
                new SampleLabelCount(RelationLabel.BEST_FRIEND.displayName(), RelationLabel.BEST_FRIEND.mapColor(), 24),
                new SampleLabelCount(RelationLabel.COMFORTABLE.displayName(), RelationLabel.COMFORTABLE.mapColor(), 19),
                new SampleLabelCount(RelationLabel.ACQUAINTANCE.displayName(), RelationLabel.ACQUAINTANCE.mapColor(), 6),
                new SampleLabelCount(RelationLabel.NOT_A_MATCH.displayName(), RelationLabel.NOT_A_MATCH.mapColor(), 1)
        );
    }

    private SampleRegion region(String code, String name, int count, RelationLabel label) {
        return new SampleRegion(code, name, count, label.displayName(), label.mapColor());
    }
}
