package com.example.map.service;

import com.example.map.entity.Sido;
import com.example.map.entity.Sigungu;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RegionCatalog {

    private final List<Sigungu> all;
    private final Map<String, Sigungu> byCode;

    public RegionCatalog(ObjectMapper objectMapper) {
        this.all = load(objectMapper);
        this.byCode = all.stream().collect(Collectors.toMap(Sigungu::code, Function.identity()));
    }

    public List<Sigungu> all() {
        return all;
    }

    public Sigungu fromCode(String code) {
        Sigungu found = byCode.get(code);
        if (found == null) {
            throw new IllegalArgumentException("사는 곳을 다시 선택해 주세요.");
        }
        return found;
    }

    public String displayName(String sigunguCode) {
        return displayName(fromCode(sigunguCode));
    }

    public String displayName(Sigungu sigungu) {
        return Sido.fromCode(sigungu.sidoCode()).label() + " " + sigungu.label();
    }

    private List<Sigungu> load(ObjectMapper objectMapper) {
        try (InputStream input = RegionCatalog.class.getResourceAsStream("/data/sigungu.json")) {
            if (input == null) {
                throw new IllegalStateException("시군구 데이터가 없어요.");
            }
            return objectMapper.readValue(input, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalStateException("시군구 데이터를 읽지 못했어요.", exception);
        }
    }
}
