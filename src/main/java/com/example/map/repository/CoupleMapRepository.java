package com.example.map.repository;

import com.example.map.entity.CoupleMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoupleMapRepository extends JpaRepository<CoupleMap, String> {

    List<CoupleMap> findByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<CoupleMap> findByIdAndHostToken(String id, String hostToken);
}
