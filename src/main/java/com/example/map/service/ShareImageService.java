package com.example.map.service;

import com.example.map.dto.MapConquest;
import com.example.map.dto.MapView;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.RenderingHints;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.Locale;

/**
 * 카톡·SNS 미리보기용 1200x630 카드.
 * 지도 SVG를 넣지 않는 이유: 크롤러가 보는 작은 썸네일에서는 숫자·등급·빈 지역이 더 잘 읽힌다.
 */
@Service
public class ShareImageService {

    public static final int WIDTH = 1200;
    public static final int HEIGHT = 630;

    private static final Color BG = new Color(0xFF, 0xF4, 0xEA);
    private static final Color INK = new Color(0x2A, 0x1F, 0x1A);
    private static final Color MUTED = new Color(0x8A, 0x74, 0x68);
    private static final Color CARD = new Color(0xFF, 0xFD, 0xF9);
    private static final Color CORAL = new Color(0xFF, 0x7A, 0x59);
    private static final Color PINK = new Color(0xFF, 0x2D, 0x95);
    private static final Color BAR_BG = new Color(0xF0, 0xDD, 0xD0);
    private static final Color PILL = Color.WHITE;

    public byte[] render(MapView view) {
        BufferedImage image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            paint(g, view);
        } finally {
            g.dispose();
        }
        return toPng(image);
    }

    private void paint(Graphics2D g, MapView view) {
        g.setColor(BG);
        g.fillRect(0, 0, WIDTH, HEIGHT);
        g.setColor(new Color(255, 168, 140, 70));
        g.fillOval(-180, -160, 520, 380);
        g.setColor(new Color(125, 211, 252, 60));
        g.fillOval(780, -80, 520, 360);
        g.setColor(new Color(52, 211, 153, 40));
        g.fillOval(640, 420, 480, 280);

        int pad = 72;
        int x = pad;
        int y = 58;

        g.setFont(font(28, Font.BOLD));
        g.setColor(CORAL);
        g.drawString("짝꿍지도", x, y + 28);
        y += 56;

        String host = view.hostName() == null || view.hostName().isBlank() ? "내" : view.hostName();
        g.setFont(font(58, Font.BOLD));
        g.setColor(INK);
        g.drawString(fit(g, host + "님의 짝꿍지도", WIDTH - pad * 2), x, y + 52);
        y += 86;

        MapConquest conquest = view.conquest();
        String grade = conquest == null || conquest.grade() == null ? "빈 지도" : conquest.grade();
        Integer top = conquest == null ? null : conquest.topPercent();
        g.setFont(font(26, Font.BOLD));
        FontMetrics fm = g.getFontMetrics();
        int pillH = 48;
        int pillPad = 22;
        int pillW = fm.stringWidth(grade) + pillPad * 2;
        g.setColor(PILL);
        g.fill(new RoundRectangle2D.Float(x, y, pillW, pillH, 28, 28));
        g.setColor(INK);
        g.drawString(grade, x + pillPad, y + 34);
        if (top != null) {
            g.setColor(PINK);
            g.drawString("상위 " + top + "%", x + pillW + 18, y + 34);
        }
        y += 78;

        g.setFont(font(72, Font.BOLD));
        g.setColor(INK);
        g.drawString(view.total() + "명 참여", x, y + 62);
        y += 92;

        int percent = view.conquestPercent();
        int barW = WIDTH - pad * 2;
        int barH = 22;
        g.setColor(BAR_BG);
        g.fill(new RoundRectangle2D.Float(x, y, barW, barH, 22, 22));
        int fillW = Math.max(percent == 0 ? 0 : 18, Math.round(barW * percent / 100f));
        if (percent > 0) {
            g.setColor(CORAL);
            g.fill(new RoundRectangle2D.Float(x, y, Math.min(barW, fillW), barH, 22, 22));
        }
        y += 46;

        g.setFont(font(26, Font.BOLD));
        g.setColor(MUTED);
        g.drawString(fit(g, view.conquestText(), barW), x, y + 24);
        y += 52;

        String nudge = conquest == null || conquest.inviteNudge() == null ? "" : conquest.inviteNudge();
        if (!nudge.isBlank()) {
            g.setColor(CARD);
            g.fill(new RoundRectangle2D.Float(x, y, barW, 72, 24, 24));
            g.setStroke(new BasicStroke(2f));
            g.setColor(new Color(0xF0, 0xDD, 0xD0));
            g.draw(new RoundRectangle2D.Float(x, y, barW, 72, 24, 24));
            g.setFont(font(24, Font.BOLD));
            g.setColor(INK);
            g.drawString(fit(g, nudge, barW - 40), x + 22, y + 46);
        }

        g.setFont(font(22, Font.BOLD));
        g.setColor(MUTED);
        String foot = "map.binaryworld.kr";
        int footW = g.getFontMetrics().stringWidth(foot);
        g.drawString(foot, (WIDTH - footW) / 2, HEIGHT - 36);
    }

    private static String fit(Graphics2D g, String text, int maxWidth) {
        if (text == null) {
            return "";
        }
        if (g.getFontMetrics().stringWidth(text) <= maxWidth) {
            return text;
        }
        String value = text;
        while (value.length() > 1 && g.getFontMetrics().stringWidth(value + "…") > maxWidth) {
            value = value.substring(0, value.length() - 1);
        }
        return value + "…";
    }

    private static Font font(float size, int style) {
        String[] names = {
                "Malgun Gothic",
                "Apple SD Gothic Neo",
                "NanumGothic",
                "Noto Sans CJK KR",
                "Noto Sans KR",
                "SansSerif"
        };
        var available = Arrays.asList(GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames());
        for (String name : names) {
            for (String found : available) {
                if (found.equalsIgnoreCase(name) || found.toLowerCase(Locale.ROOT).contains(name.toLowerCase(Locale.ROOT))) {
                    return new Font(found, style, Math.round(size));
                }
            }
        }
        return new Font(Font.SANS_SERIF, style, Math.round(size));
    }

    private static byte[] toPng(BufferedImage image) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            if (!ImageIO.write(image, "png", out)) {
                throw new IllegalStateException("PNG 인코더를 찾지 못했어요.");
            }
            return out.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("미리보기 이미지를 만들지 못했어요.", exception);
        }
    }
}
