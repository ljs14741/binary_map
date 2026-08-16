package com.example.map.service;

import com.example.map.dto.GuestbookDTO;
import com.example.map.entity.Guestbook;
import com.example.map.repository.GuestbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestbookService {

    private final GuestbookRepository guestbookRepository;

    @Transactional
    public void create(GuestbookDTO dto) {
        String nickname = requireText(dto.nickname(), 10, "닉네임을 확인해 주세요.");
        String password = requireText(dto.password(), 20, "비밀번호를 확인해 주세요.");
        String content = requireText(dto.content(), 1000, "내용을 확인해 주세요.");
        Guestbook guestbook = new Guestbook();
        guestbook.setNickname(nickname);
        guestbook.setPassword(password);
        guestbook.setContent(content);
        guestbook.setCreatedAt(LocalDateTime.now());
        guestbookRepository.save(guestbook);
    }

    @Transactional(readOnly = true)
    public List<GuestbookDTO> getAll() {
        return guestbookRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(this::toPublic)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<GuestbookDTO> getPaged(int page, int size) {
        return guestbookRepository
                .findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")))
                .map(this::toPublic);
    }

    @Transactional
    public boolean delete(Long id, String password) {
        String check = password == null ? "" : password.trim();
        return guestbookRepository.findById(id)
                .filter(item -> item.getPassword().equals(check))
                .map(item -> {
                    guestbookRepository.delete(item);
                    return true;
                })
                .orElse(false);
    }

    private GuestbookDTO toPublic(Guestbook item) {
        return new GuestbookDTO(item.getId(), item.getNickname(), null, item.getContent(), item.getCreatedAt());
    }

    private String requireText(String value, int max, String message) {
        String text = value == null ? "" : value.trim();
        if (text.isEmpty() || text.length() > max) {
            throw new IllegalArgumentException(message);
        }
        return text;
    }
}
