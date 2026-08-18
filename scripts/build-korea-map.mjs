import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SIDO_SVG = join(ROOT, "src/main/resources/static/img/korea-sido.svg");
const OUT_SVG = join(ROOT, "src/main/resources/static/img/korea-map.svg");
const CATALOG = join(ROOT, "src/main/resources/data/sigungu.json");
const BASE = "https://raw.githubusercontent.com/statgarten/maps/main/svg/simple/";

const FILES = {
  11: "서울특별시_시군구_경계.svg",
  26: "부산광역시_시군구_경계.svg",
  27: "대구광역시_시군구_경계.svg",
  28: "인천광역시_시군구_경계.svg",
  29: "광주광역시_시군구_경계.svg",
  30: "대전광역시_시군구_경계.svg",
  31: "울산광역시_시군구_경계.svg",
  36: "세종특별자치시_시군구_경계.svg",
  41: "경기도_시군구_경계.svg",
  42: "강원도_시군구_경계.svg",
  43: "충청북도_시군구_경계.svg",
  44: "충청남도_시군구_경계.svg",
  45: "전라북도_시군구_경계.svg",
  46: "전라남도_시군구_경계.svg",
  47: "경상북도_시군구_경계.svg",
  48: "경상남도_시군구_경계.svg",
  50: "제주특별자치도_시군구_경계.svg"
};

function compact(value) {
  return String(value || "")
    .replace(/\(.*?\)/g, "")
    .replace(/[\s·.\-]/g, "")
    .replace(/특별자치시|특별자치도|광역시|특별시/g, "");
}

function namesOf(item) {
  const label = item.label;
  const parts = label.split(/\s+/);
  const last = parts[parts.length - 1];
  const joined = compact(label);
  const names = new Set([compact(label), compact(last), joined]);
  if (parts.length === 2) {
    names.add(compact(parts[0] + "시" + parts[1]));
    names.add(compact(parts[0] + parts[1]));
  }
  if (label === "세종시") {
    names.add("세종");
    names.add("세종특별자치시");
  }
  return names;
}

function attr(blob, name) {
  const match = blob.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : "";
}

function parsePaths(svgText) {
  const out = [];
  const re = /<path\b([^>]*)\/?>/g;
  let match;
  while ((match = re.exec(svgText))) {
    const blob = match[1];
    const d = attr(blob, "d");
    if (!d) {
      continue;
    }
    out.push({
      id: attr(blob, "id"),
      code: attr(blob, "data-code"),
      name: attr(blob, "data-name"),
      d
    });
  }
  return out;
}

function pathBox(d) {
  const nums = d.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi) || [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    w: maxX - minX,
    h: maxY - minY
  };
}

function unionBox(paths) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  paths.forEach((path) => {
    const box = pathBox(path.d);
    if (!Number.isFinite(box.w) || box.w < 0.4 || box.h < 0.4) {
      return;
    }
    minX = Math.min(minX, box.minX);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX);
    maxY = Math.max(maxY, box.maxY);
  });
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

function transformD(d, mapX, mapY) {
  let axis = 0;
  return d.replace(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi, (num) => {
    const value = Number(num);
    const next = axis === 0 ? mapX(value) : mapY(value);
    axis = 1 - axis;
    return Number.isFinite(next) ? next.toFixed(2).replace(/\.00$/, "") : num;
  });
}

const SPECIAL = {
  "41:부천시": { code: "41192", alias: ["41194", "41196"], label: "부천시", sidoCode: "41" },
  "47:군위군": { code: "27720", alias: [], label: "군위군", sidoCode: "27" }
};

function matchItem(id, items) {
  const key = compact(id);
  if (!key) {
    return null;
  }
  const scored = items.map((item) => {
    const names = namesOf(item);
    let score = 0;
    if (names.has(key)) {
      score = 3;
    } else if ([...names].some((name) => name && (name === key || key.endsWith(name) || name.endsWith(key)))) {
      score = nameLengthScore(key, names);
    }
    return { item, score };
  }).filter((row) => row.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item || null;
}

function nameLengthScore(key, names) {
  let best = 0;
  names.forEach((name) => {
    if (!name) {
      return;
    }
    if (key === name) {
      best = Math.max(best, 3);
    } else if (key.endsWith(name) || name.endsWith(key)) {
      best = Math.max(best, 1 + Math.min(key.length, name.length) / 20);
    }
  });
  return best;
}

const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const bySido = new Map();
catalog.forEach((item) => {
  if (!bySido.has(item.sidoCode)) {
    bySido.set(item.sidoCode, []);
  }
  bySido.get(item.sidoCode).push(item);
});

const sidoSvg = readFileSync(SIDO_SVG, "utf8");
const sidoPaths = parsePaths(sidoSvg);
const sidoByCode = new Map(sidoPaths.map((path) => [path.code, path]));

const used = new Set();
const unmatchedIds = [];
const landPaths = [];

for (const [sidoCode, fileName] of Object.entries(FILES)) {
  const url = BASE + encodeURIComponent(fileName);
  process.stdout.write(`download ${fileName}\n`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} -> ${res.status}`);
  }
  const text = await res.text();
  const local = parsePaths(text);
  const sido = sidoByCode.get(sidoCode);
  if (!sido) {
    throw new Error(`missing sido ${sidoCode}`);
  }
  const from = unionBox(local);
  const to = pathBox(sido.d);
  if (!from.w || !from.h || !to.w || !to.h) {
    throw new Error(`bad bbox ${sidoCode}`);
  }
  const mapX = (x) => to.minX + ((x - from.minX) / from.w) * to.w;
  const mapY = (y) => to.minY + ((y - from.minY) / from.h) * to.h;
  const items = bySido.get(sidoCode) || [];
  local.forEach((path) => {
    const box = pathBox(path.d);
    if (!Number.isFinite(box.w) || (box.w < 0.4 && box.h < 0.4)) {
      return;
    }
    const special = SPECIAL[`${sidoCode}:${path.id}`];
    let item = matchItem(path.id, items.filter((row) => !used.has(row.code)));
    if (!item) {
      item = matchItem(path.id, items);
    }
    if (!item && special) {
      item = special;
    }
    if (!item) {
      unmatchedIds.push(`${sidoCode}:${path.id}`);
      return;
    }
    used.add(item.code);
    (item.alias || special?.alias || []).forEach((code) => used.add(code));
    const alias = (item.alias || special?.alias || []).join(",");
    const aliasAttr = alias ? ` data-alias="${alias}"` : "";
    landPaths.push(
      `<path class="sido-land" data-code="${item.code}" data-sido="${item.sidoCode || sidoCode}" data-name="${item.label}"${aliasAttr} d="${transformD(path.d, mapX, mapY)}"/>`
    );
  });
}

const missing = catalog.filter((item) => !used.has(item.code)).map((item) => `${item.code}:${item.label}`);

const svg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="800" height="759" viewBox="0 0 800 759" stroke-linecap="round" stroke-linejoin="round">
<g id="시군구_경계">
${landPaths.join("\n")}
</g>
</svg>
`;

writeFileSync(OUT_SVG, svg);
process.stdout.write(`wrote ${OUT_SVG}\n`);
process.stdout.write(`matched ${used.size}/${catalog.length}\n`);
if (unmatchedIds.length) {
  process.stdout.write(`unmatched ids ${unmatchedIds.join(", ")}\n`);
}
if (missing.length) {
  process.stdout.write(`missing codes ${missing.join(", ")}\n`);
}
