package com.example.map.repository;

import com.example.map.entity.CoupleMapPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CoupleMapPersonRepository extends JpaRepository<CoupleMapPerson, Long> {

    List<CoupleMapPerson> findByMap_IdOrderByScoreDescCreatedAtAsc(String mapId);

    Optional<CoupleMapPerson> findByMap_IdAndPersonName(String mapId, String personName);

    long countByMap_Id(String mapId);

    Optional<CoupleMapPerson> findByIdAndMap_Id(Long id, String mapId);

    /** 나보다 친구가 많은 지도 수. 상위 몇 %인지 보여줄 때 쓴다. */
    @Query(value = """
            SELECT COUNT(*) FROM (
              SELECT couple_map_id FROM couple_map_person
              GROUP BY couple_map_id HAVING COUNT(*) > :people
            ) ranked
            """, nativeQuery = true)
    long countMapsWithMorePeopleThan(@Param("people") int people);
}
