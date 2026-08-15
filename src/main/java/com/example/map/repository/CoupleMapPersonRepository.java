package com.example.map.repository;

import com.example.map.entity.CoupleMapPerson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoupleMapPersonRepository extends JpaRepository<CoupleMapPerson, Long> {

    List<CoupleMapPerson> findByMap_IdOrderByScoreDescCreatedAtAsc(String mapId);

    Optional<CoupleMapPerson> findByMap_IdAndPersonName(String mapId, String personName);

    long countByMap_Id(String mapId);

    Optional<CoupleMapPerson> findByIdAndMap_Id(Long id, String mapId);
}
