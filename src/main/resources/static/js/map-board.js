(() => {
  const VIEW = { w: 800, h: 759 };
  const MAP_ZOOM_MAX = 4;
  const CENTER_FIX = { 11: [252, 154], 28: [200, 152], 41: [248, 172] };
  const SIDO_NAME = {
    "11": "서울", "26": "부산", "27": "대구", "28": "인천", "29": "광주",
    "30": "대전", "31": "울산", "36": "세종", "41": "경기", "42": "강원",
    "43": "충북", "44": "충남", "45": "전북", "46": "전남", "47": "경북",
    "48": "경남", "50": "제주"
  };
  const SIGUNGU_XY = {
    11110: [0.02, -0.08], 11140: [0.04, 0.02], 11170: [-0.02, 0.18],
    11200: [0.18, 0.08], 11215: [0.32, 0.12], 11230: [0.18, -0.08],
    11260: [0.32, -0.18], 11290: [0.08, -0.22], 11305: [0.05, -0.38],
    11320: [0.08, -0.48], 11350: [0.28, -0.38], 11380: [-0.28, -0.28],
    11410: [-0.14, -0.08], 11440: [-0.22, 0.08], 11470: [-0.38, 0.18],
    11500: [-0.48, 0.02], 11530: [-0.38, 0.32], 11545: [-0.28, 0.42],
    11560: [-0.22, 0.22], 11590: [-0.08, 0.32], 11620: [-0.08, 0.45],
    11650: [0.08, 0.38], 11680: [0.22, 0.42], 11710: [0.38, 0.32],
    11740: [0.48, 0.18],
    26110: [-0.05, 0.18], 26140: [-0.22, 0.12], 26170: [0.12, 0.08],
    26200: [0.02, 0.42], 26230: [0.02, 0.08], 26260: [0.18, -0.08],
    26290: [0.18, 0.28], 26320: [-0.08, -0.18], 26350: [0.42, 0.08],
    26380: [-0.32, 0.28], 26410: [0.22, -0.22], 26440: [-0.48, 0.05],
    26470: [0.12, 0.02], 26500: [0.32, 0.18], 26530: [-0.18, 0.08],
    26710: [0.55, -0.12],
    27110: [0.02, 0.02], 27140: [0.32, -0.08], 27170: [-0.28, 0.05],
    27200: [0.05, 0.32], 27230: [-0.02, -0.38], 27260: [0.38, 0.28],
    27290: [-0.32, 0.28], 27710: [-0.48, 0.48], 27720: [0.12, -0.72],
    28110: [0.18, 0.12], 28140: [0.32, 0.02], 28177: [0.12, 0.22],
    28185: [0.18, 0.42], 28200: [0.38, 0.22], 28237: [0.08, -0.08],
    28245: [0.34, -0.12], 28260: [-0.08, 0.08], 28710: [-0.55, -0.55],
    28720: [-0.35, 0.55],
    29110: [0.28, 0.02], 29140: [-0.12, 0.08], 29155: [0.08, 0.32],
    29170: [0.05, -0.32], 29200: [-0.38, 0.08],
    30110: [0.32, 0.08], 30140: [0.05, 0.08], 30170: [-0.18, 0.12],
    30200: [-0.32, -0.08], 30230: [0.18, -0.28],
    31110: [-0.08, 0.08], 31140: [0.02, 0.32], 31170: [0.28, 0.05],
    31200: [0.08, -0.28], 31710: [-0.22, 0.18],
    36110: [0, 0],
    41111: [248, 192], 41113: [246, 200], 41115: [248, 196],
    41117: [255, 198], 41131: [272, 168], 41133: [276, 172],
    41135: [278, 180], 41150: [260, 124], 41171: [240, 176],
    41173: [246, 175], 41192: [220, 154], 41194: [222, 160],
    41196: [218, 148], 41210: [230, 166], 41220: [242, 230],
    41250: [255, 92], 41271: [222, 188], 41273: [214, 190],
    41281: [238, 138], 41285: [224, 136], 41287: [216, 136],
    41290: [254, 168], 41310: [278, 146], 41360: [292, 138],
    41370: [248, 210], 41390: [218, 180], 41410: [240, 184],
    41430: [248, 182], 41450: [286, 156], 41461: [282, 200],
    41463: [268, 192], 41465: [262, 186], 41480: [220, 112],
    41500: [318, 186], 41550: [268, 222], 41570: [208, 142],
    41590: [232, 212], 41610: [300, 172], 41630: [248, 108],
    41650: [288, 95],     41670: [338, 186], 41800: [248, 62],
    41820: [328, 112], 41830: [332, 158],
    42110: [-0.32, -0.06], 42130: [-0.22, 0.34], 42150: [0.34, 0.02],
    42170: [0.40, 0.20], 42190: [0.14, 0.44], 42210: [0.30, -0.34],
    42230: [0.38, 0.30], 42720: [-0.10, 0.04], 42730: [-0.14, 0.24],
    42750: [0.02, 0.40], 42760: [0.14, 0.20], 42770: [0.24, 0.24],
    42780: [-0.34, -0.44], 42790: [-0.24, -0.30], 42800: [-0.08, -0.34],
    42810: [0.08, -0.22], 42820: [0.24, -0.44], 42830: [0.34, -0.18],
    43111: [-0.12, 0.30], 43112: [-0.20, 0.32], 43113: [-0.26, 0.28],
    43114: [-0.08, 0.22], 43130: [0.02, -0.18], 43150: [0.22, -0.28],
    43720: [0.06, 0.18], 43730: [0.10, 0.34], 43740: [0.18, 0.44],
    43745: [-0.18, 0.08], 43750: [-0.28, 0.04], 43760: [0.08, 0.02],
    43770: [-0.10, -0.04], 43800: [0.28, -0.18],
    44131: [0.22, -0.18], 44133: [0.14, -0.22], 44150: [0.08, 0.08],
    44180: [-0.28, 0.22], 44200: [0.18, -0.08], 44210: [-0.32, -0.08],
    44230: [0.12, 0.28], 44250: [0.20, 0.16], 44270: [-0.18, -0.18],
    44710: [0.28, 0.32], 44760: [-0.08, 0.24], 44770: [-0.16, 0.36],
    44790: [0.02, 0.18], 44800: [-0.12, 0.06], 44810: [0.06, -0.02],
    44825: [-0.42, 0.02],
    45111: [0.08, 0.18], 45113: [0.08, 0.04], 45130: [-0.32, -0.18],
    45140: [-0.12, -0.12], 45180: [-0.18, 0.28], 45190: [0.18, 0.40],
    45210: [-0.22, 0.12], 45710: [0.16, 0.08], 45720: [0.28, 0.02],
    45730: [0.34, -0.12], 45740: [0.30, 0.18], 45750: [0.18, 0.22],
    45770: [0.08, 0.34], 45790: [-0.28, 0.38], 45800: [-0.34, 0.22],
    46110: [-0.38, 0.12], 46130: [0.42, 0.18], 46150: [0.22, 0.02],
    46170: [-0.12, 0.06], 46230: [0.32, -0.04], 46710: [0.02, -0.18],
    46720: [0.16, -0.08], 46730: [0.28, -0.16], 46770: [0.18, 0.32],
    46780: [0.12, 0.18], 46790: [0.04, 0.02], 46800: [0.02, 0.22],
    46810: [-0.08, 0.28], 46820: [-0.22, 0.36], 46830: [-0.18, 0.16],
    46840: [-0.28, 0.08], 46860: [-0.30, -0.02], 46870: [-0.32, -0.18],
    46880: [-0.08, -0.12], 46890: [0.08, 0.44], 46900: [-0.38, 0.40],
    46910: [-0.48, 0.18],
    47111: [0.38, 0.06], 47113: [0.36, -0.08], 47130: [0.26, 0.28],
    47150: [-0.42, 0.04], 47170: [0.02, -0.22], 47190: [-0.30, 0.10],
    47210: [-0.06, -0.40], 47230: [0.08, 0.22], 47250: [-0.36, -0.14],
    47280: [-0.32, -0.30], 47290: [-0.12, 0.36],
    47730: [0.00, -0.06], 47750: [0.18, -0.18], 47760: [0.16, -0.36],
    47770: [0.40, -0.20], 47820: [-0.02, 0.44], 47830: [-0.26, 0.36],
    47840: [-0.36, 0.26], 47850: [-0.22, 0.20], 47900: [-0.14, -0.26],
    47920: [0.04, -0.46], 47930: [0.34, -0.46], 47940: [0.48, -0.08],
    48121: [0.18, 0.04], 48123: [0.22, 0.10], 48125: [0.10, 0.12],
    48127: [0.12, 0.02], 48129: [0.28, 0.18], 48170: [-0.18, 0.16],
    48220: [0.08, 0.42], 48240: [-0.04, 0.34], 48250: [0.32, 0.08],
    48270: [0.08, -0.08], 48310: [0.18, 0.36], 48330: [0.38, -0.02],
    48720: [-0.08, 0.06], 48730: [0.04, 0.12], 48740: [0.02, -0.04],
    48820: [0.00, 0.28], 48840: [-0.12, 0.46], 48850: [-0.28, 0.30],
    48860: [-0.24, 0.14], 48870: [-0.32, 0.04], 48880: [-0.28, -0.12],
    48890: [-0.16, 0.02],
    50110: [-0.12, -0.18], 50130: [0.12, 0.28]
  };

  let svgCache = "";
  let landCache = new Map();
  let activeFilter = "";
  let clusterState = [];
  let onDeletePerson = null;
  let hostName = "";

  async function paint(options) {
    const wrap = document.getElementById(options.wrapId || "korea-wrap");
    if (!wrap) {
      return;
    }
    onDeletePerson = options.onDeletePerson || null;
    hostName = options.host.name;
    if (!svgCache) {
      svgCache = await fetch("/img/korea-map.svg").then((res) => res.text());
    }
    const canvas = document.createElement("div");
    canvas.className = "korea-canvas";
    canvas.innerHTML = svgCache;
    const svg = canvas.querySelector("svg");
    if (!svg) {
      return;
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("role", "img");
    svg.setAttribute("overflow", "visible");
    svg.classList.add("korea-map");
    svg.querySelectorAll("path.sido-land").forEach((path) => {
      path.setAttribute("fill", "#f7e2b8");
      path.style.fill = "";
      path.style.stroke = "";
    });
    wrap.replaceChildren(canvas);
    landCache = new Map();

    const people = options.people || [];
    const hostPoint = pinPoint(svg, options.host.sidoCode, options.host.sigunguCode);
    clusterState = buildClusters(svg, people, options.extras || []);
    separateClusters(svg, clusterState, hostPoint);
    colorRegions(svg, options.host.sigunguCode, clusterState);
    const nameLayer = document.createElement("div");
    nameLayer.className = "pin-name-layer";
    const layer = document.createElement("div");
    layer.className = "cluster-layer";
    addSparkles(layer);
    clusterState.forEach((cluster, index) => {
      layer.appendChild(createClusterPin(cluster, index));
      addClusterNames(nameLayer, cluster);
    });
    const hostPin = createHostPin(hostPoint, options.host.name);
    layer.appendChild(hostPin);
    nameLayer.appendChild(createPinName(
      hostPoint[0],
      hostPoint[1],
      clipNick(options.host.name) || "나",
      "is-host",
      null,
      "host",
      16,
      0
    ));
    if (addChiFlow(layer, clusterState, hostPoint)) {
      hostPin.classList.add("is-receiving");
    }
    canvas.appendChild(nameLayer);
    canvas.appendChild(layer);
    bindMapZoom(wrap);
    resetZoom(wrap, false);
    requestAnimationFrame(() => canvas.classList.add("is-ready"));
    applyFilter();
  }

  function sidoBox(svg, code) {
    const path = sidoPath(svg, code);
    if (!path || typeof path.getBBox !== "function") {
      return null;
    }
    const box = path.getBBox();
    return (box.width || box.height) ? box : null;
  }

  function sidoPath(svg, code) {
    const key = String(code || "");
    if (!key) {
      return null;
    }
    const direct = svg.querySelector(`path.sido-land[data-code="${key}"]`);
    if (direct) {
      return direct;
    }
    return [...svg.querySelectorAll("path.sido-land[data-alias]")].find((path) =>
      (path.getAttribute("data-alias") || "").split(",").includes(key)
    ) || null;
  }

  function landCodeOf(svg, code) {
    const path = sidoPath(svg, code);
    return path ? String(path.getAttribute("data-code") || "") : String(code || "");
  }

  function pointInLand(svg, code, x, y) {
    const path = sidoPath(svg, code);
    if (!path || typeof path.isPointInFill !== "function") {
      return true;
    }
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    try {
      return path.isPointInFill(point);
    } catch (error) {
      return true;
    }
  }

  function landSamples(svg, code) {
    if (landCache.has(code)) {
      return landCache.get(code);
    }
    const box = sidoBox(svg, code);
    const samples = [];
    if (box) {
      const step = Math.max(2.4, Math.min(box.width, box.height) / 10);
      for (let x = box.x + step / 2; x < box.x + box.width; x += step) {
        for (let y = box.y + step / 2; y < box.y + box.height; y += step) {
          if (pointInLand(svg, code, x, y)) {
            samples.push([x, y]);
          }
        }
      }
    }
    landCache.set(code, samples);
    return samples;
  }

  function landCenter(svg, code) {
    if (CENTER_FIX[code]) {
      return CENTER_FIX[code].slice();
    }
    const samples = landSamples(svg, code);
    if (samples.length) {
      return [
        samples.reduce((sum, point) => sum + point[0], 0) / samples.length,
        samples.reduce((sum, point) => sum + point[1], 0) / samples.length
      ];
    }
    const box = sidoBox(svg, code);
    if (box) {
      return [box.x + box.width / 2, box.y + box.height / 2];
    }
    return [400, 380];
  }

  function landSpan(svg, code) {
    const samples = landSamples(svg, code);
    if (samples.length > 1) {
      const xs = samples.map((point) => point[0]);
      const ys = samples.map((point) => point[1]);
      return [
        Math.max(24, Math.max(...xs) - Math.min(...xs)),
        Math.max(24, Math.max(...ys) - Math.min(...ys))
      ];
    }
    const box = sidoBox(svg, code);
    return [box ? box.width : 24, box ? box.height : 24];
  }

  function clampToLand(svg, code, x, y) {
    if (pointInLand(svg, code, x, y)) {
      return [x, y];
    }
    const samples = landSamples(svg, code);
    if (!samples.length) {
      return landCenter(svg, code);
    }
    let best = samples[0];
    let bestDist = Infinity;
    samples.forEach((point) => {
      const dist = (point[0] - x) ** 2 + (point[1] - y) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        best = point;
      }
    });
    return best.slice();
  }

  function hashOffset(code) {
    let hash = 2166136261;
    const text = String(code || "");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const nx = ((hash >>> 0) % 1000) / 1000 - 0.5;
    const ny = ((hash >>> 11) % 1000) / 1000 - 0.5;
    return [nx * 0.55, ny * 0.55];
  }

  function pinPoint(svg, sidoCode, sigunguCode) {
    const land = String(sigunguCode || sidoCode || "");
    if (land && sidoPath(svg, land)) {
      return landCenter(svg, land);
    }
    const known = SIGUNGU_XY[Number(sigunguCode)];
    if (known && (Math.abs(known[0]) > 1.5 || Math.abs(known[1]) > 1.5)) {
      return clampToLand(svg, sidoCode, known[0], known[1]);
    }
    const center = landCenter(svg, sidoCode);
    const [spanW, spanH] = landSpan(svg, sidoCode);
    const [nx, ny] = known || hashOffset(sigunguCode || sidoCode);
    return clampToLand(
      svg,
      sidoCode,
      center[0] + nx * spanW * 0.36,
      center[1] + ny * spanH * 0.36
    );
  }

  function shortPinLabel(full, sidoCode) {
    let text = String(full || "").trim();
    const sido = SIDO_NAME[sidoCode] || "";
    if (sido && text.startsWith(sido)) {
      text = text.slice(sido.length).replace(/^[\s/]+/, "");
    }
    text = text.replace(/(\S+)\s+(\S+)구$/g, "$1 $2").replace(/(\S+)\s+(\S+)군$/g, "$1 $2");
    const trimmed = text.replace(/[구군시]$/g, "").trim();
    if (trimmed.length >= 2) {
      text = trimmed;
    }
    return text || sido || "지역";
  }

  function separateClusters(svg, clusters, hostPoint) {
    const min = 26;
    for (let pass = 0; pass < 3; pass += 1) {
      for (let i = 0; i < clusters.length; i += 1) {
        for (let j = i + 1; j < clusters.length; j += 1) {
          const dx = clusters[j].x - clusters[i].x;
          const dy = clusters[j].y - clusters[i].y;
          const dist = Math.hypot(dx, dy) || 0.01;
          if (dist >= min) {
            continue;
          }
          const push = (min - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          clusters[i].x -= ux * push;
          clusters[i].y -= uy * push;
          clusters[j].x += ux * push;
          clusters[j].y += uy * push;
        }
      }
    }
    clusters.forEach((cluster) => {
      const land = clusterLand(cluster);
      if (!land) {
        return;
      }
      const clamped = clampToLand(svg, land, cluster.x, cluster.y);
      cluster.x = clamped[0];
      cluster.y = clamped[1];
    });
    if (hostPoint && clusters.length) {
      clusters.forEach((cluster) => {
        const dx = cluster.x - hostPoint[0];
        const dy = cluster.y - hostPoint[1];
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist >= 22) {
          return;
        }
        const push = (22 - dist);
        cluster.x += (dx / dist) * push;
        cluster.y += (dy / dist) * push;
        const land = clusterLand(cluster);
        if (land) {
          const clamped = clampToLand(svg, land, cluster.x, cluster.y);
          cluster.x = clamped[0];
          cluster.y = clamped[1];
        }
      });
    }
  }

  function rankScore(person) {
    return Math.max(person.score || 0, person.reverseScore || 0);
  }

  function rankLabelOf(person) {
    return MapApp.rankMeta(person).label;
  }

  function rankColorOf(person) {
    return MapApp.rankMeta(person).color;
  }

  function buildClusters(svg, people, extras) {
    const all = people.map((person) => ({ ...person, named: true })).concat(extras);
    const byKey = new Map();
    all.forEach((person) => {
      const key = person.sigunguCode || person.sidoCode;
      if (!key) {
        return;
      }
      if (!byKey.has(key)) {
        byKey.set(key, []);
      }
      byKey.get(key).push(person);
    });
    return [...byKey.entries()].map(([key, grouped]) => {
      grouped = MapApp.sortPeople(grouped);
      const best = grouped[0];
      const point = pinPoint(svg, best.sidoCode, best.sigunguCode);
      return {
        id: key,
        name: best.sido || SIDO_NAME[best.sidoCode] || key,
        shortName: shortPinLabel(best.sido, best.sidoCode),
        x: point[0],
        y: point[1],
        count: grouped.length,
        people: grouped,
        labels: [...new Set(grouped.map(rankLabelOf).filter(Boolean))],
        bestScore: rankScore(best),
        color: rankColorOf(best)
      };
    }).filter((cluster) => cluster.count > 0);
  }

  function mixHex(from, to, t) {
    const hex = (value) => [
      parseInt(value.slice(1, 3), 16),
      parseInt(value.slice(3, 5), 16),
      parseInt(value.slice(5, 7), 16)
    ];
    const a = hex(from);
    const b = hex(to);
    const n = Math.max(0, Math.min(1, t));
    return `#${[0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * n).toString(16).padStart(2, "0")).join("")}`;
  }

  function clusterLand(cluster) {
    return String(cluster.people[0]?.sigunguCode || cluster.people[0]?.sidoCode || "");
  }

  function dominantMateColor(people) {
    const rank = { "부랄짝꿍": 5, "찐 짝꿍": 4, "비즈니스짝꿍": 3, "어색 짝꿍": 2, "위험 짝꿍": 1 };
    const tally = new Map();
    people.forEach((person) => {
      const meta = MapApp.rankMeta(person);
      const key = meta.label || "";
      const current = tally.get(key) || { n: 0, color: meta.color, score: 0, rank: rank[key] || 0 };
      current.n += 1;
      current.score = Math.max(current.score, rankScore(person));
      current.color = meta.color || current.color;
      tally.set(key, current);
    });
    const best = [...tally.values()].sort((a, b) => b.n - a.n || b.rank - a.rank || b.score - a.score)[0];
    return best?.color || "#ff7048";
  }

  function colorRegions(svg, hostSigungu, clusters) {
    const byLand = {};
    clusters.forEach((cluster) => {
      const code = landCodeOf(svg, clusterLand(cluster));
      if (!code) {
        return;
      }
      byLand[code] = (byLand[code] || []).concat(cluster.people);
    });
    const host = landCodeOf(svg, hostSigungu);
    svg.querySelectorAll("path.sido-land").forEach((path) => {
      const code = String(path.getAttribute("data-code") || "");
      const people = byLand[code] || [];
      const home = !!host && code === host;
      path.classList.toggle("is-home", home);
      path.classList.toggle("is-filled", people.length > 0 && !home);
      if (home) {
        path.style.fill = "#ffc44a";
        path.style.stroke = "#c48910";
        return;
      }
      if (people.length) {
        const color = dominantMateColor(people);
        path.style.fill = color;
        path.style.stroke = mixHex(color, "#3a2416", 0.28);
        return;
      }
      path.style.fill = "";
      path.style.stroke = "";
      path.setAttribute("fill", "#f7e2b8");
      path.setAttribute("stroke", "rgba(196, 148, 82, 0.22)");
    });
  }

  function clipNick(name) {
    const text = String(name || "").replace(/\s+/g, "").trim();
    if (!text) {
      return "";
    }
    return text.slice(-2);
  }

  function nameOffset(index, count) {
    if (count <= 1) {
      return [15, 0];
    }
    if (count === 2) {
      return index === 0 ? [-18, 0] : [18, 0];
    }
    const [ox, oy] = grapeOffset(index, count);
    return [ox * 2.35, oy * 2.35];
  }

  function addClusterNames(nameLayer, cluster) {
    const named = cluster.people.filter((item) => item.named && item.name);
    const layout = cluster.count > 1 ? Math.min(cluster.count, 9) : 1;
    named.slice(0, 9).forEach((person, index) => {
      const caption = clipNick(person.name);
      if (!caption) {
        return;
      }
      const [nx, ny] = nameOffset(index, layout);
      nameLayer.appendChild(createPinName(
        cluster.x,
        cluster.y,
        caption,
        "",
        cluster.labels,
        cluster.id,
        nx,
        ny
      ));
    });
  }

  function createPinName(x, y, text, extraClass, labels, clusterId, nx, ny) {
    const el = document.createElement("span");
    el.className = extraClass ? `pin-name ${extraClass}` : "pin-name";
    el.style.left = `${(x / VIEW.w) * 100}%`;
    el.style.top = `${(y / VIEW.h) * 100}%`;
    el.style.setProperty("--nx", `${nx || 0}px`);
    el.style.setProperty("--ny", `${ny || 0}px`);
    el.textContent = text;
    if (labels && labels.length) {
      el.dataset.labels = labels.join(",");
    }
    if (clusterId != null && clusterId !== "") {
      el.dataset.clusterId = String(clusterId);
    }
    return el;
  }

  function createClusterPin(cluster, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = cluster.count > 1 ? "cluster-pin is-many" : "cluster-pin";
    button.dataset.labels = cluster.labels.join(",");
    button.dataset.clusterId = String(cluster.id);
    button.style.left = `${(cluster.x / VIEW.w) * 100}%`;
    button.style.top = `${(cluster.y / VIEW.h) * 100}%`;
    button.style.setProperty("--pin", cluster.color);
    button.style.setProperty("--delay", `${0.12 + index * 0.08}s`);
    const named = cluster.people.filter((item) => item.named && item.name).map((item) => item.name);
    button.setAttribute("aria-label", named.length
      ? `${named.map(clipNick).join(", ")} ${cluster.count}명`
      : `${cluster.name} ${cluster.count}명`);
    const shown = Math.min(cluster.count, 9);
    const dots = Array.from({ length: shown }, (_, i) => {
      const [ox, oy] = grapeOffset(i, shown);
      const delay = 0.12 + index * 0.08 + i * 0.1;
      return `<span class="cluster-dot" style="--ox:${ox}px; --oy:${oy}px; --delay:${delay}s"></span>`;
    }).join("");
    button.innerHTML = `<span class="cluster-glow"></span>${dots}`;
    button.addEventListener("click", () => openSheet(cluster));
    return button;
  }

  function grapeOffset(index, count) {
    if (count <= 1) {
      return [0, 0];
    }
    if (count === 2) {
      return index === 0 ? [-7, 2] : [7, -2];
    }
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const radius = 6 + Math.min(count, 8) * 1.15;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  }

  function createHostPin(point, name) {
    const host = document.createElement("div");
    host.className = "host-pin";
    host.style.left = `${(point[0] / VIEW.w) * 100}%`;
    host.style.top = `${(point[1] / VIEW.h) * 100}%`;
    host.setAttribute("aria-label", `${name}의 거주지역`);
    host.innerHTML = `
      <span class="host-ring"></span>
      <span class="host-ring is-late"></span>
      <span class="host-dot"></span>
    `;
    return host;
  }

  function addChiFlow(layer, clusters, hostPoint) {
    if (!hostPoint || !clusters.length || prefersReducedMotion()) {
      return false;
    }
    const toX = (hostPoint[0] / VIEW.w) * 100;
    const toY = (hostPoint[1] / VIEW.h) * 100;
    let sparkIndex = 0;
    clusters.forEach((cluster, index) => {
      const fromX = (cluster.x / VIEW.w) * 100;
      const fromY = (cluster.y / VIEW.h) * 100;
      if (Math.hypot(toX - fromX, toY - fromY) < 4) {
        return;
      }
      const sparks = Math.min(3, Math.max(1, cluster.count));
      for (let i = 0; i < sparks && sparkIndex < 12; i += 1) {
        const spark = document.createElement("span");
        spark.className = "chi-spark";
        spark.style.setProperty("--from-x", `${fromX}%`);
        spark.style.setProperty("--from-y", `${fromY}%`);
        spark.style.setProperty("--to-x", `${toX}%`);
        spark.style.setProperty("--to-y", `${toY}%`);
        spark.style.setProperty("--delay", `${0.35 + index * 0.12 + i * 0.35}s`);
        spark.style.setProperty("--pin", cluster.color);
        layer.appendChild(spark);
        sparkIndex += 1;
      }
    });
    return sparkIndex > 0;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function zoomState(wrap) {
    if (!wrap._mapZoom) {
      wrap._mapZoom = {
        scale: 1,
        x: 0,
        y: 0,
        pointers: new Map(),
        pinch: null,
        lastTap: 0,
        suppressClick: false
      };
    }
    return wrap._mapZoom;
  }

  function mapCanvas(wrap) {
    return wrap.querySelector(".korea-canvas");
  }

  function clampZoom(wrap) {
    const z = zoomState(wrap);
    z.scale = Math.min(MAP_ZOOM_MAX, Math.max(1, z.scale));
    if (z.scale <= 1) {
      z.scale = 1;
      z.x = 0;
      z.y = 0;
      return;
    }
    const canvas = mapCanvas(wrap);
    if (!canvas) {
      return;
    }
    const minX = Math.min(0, wrap.clientWidth - canvas.offsetWidth * z.scale);
    const minY = Math.min(0, wrap.clientHeight - canvas.offsetHeight * z.scale);
    z.x = Math.min(0, Math.max(minX, z.x));
    z.y = Math.min(0, Math.max(minY, z.y));
  }

  function applyZoom(wrap, animate) {
    const canvas = mapCanvas(wrap);
    const z = zoomState(wrap);
    if (!canvas) {
      return;
    }
    if (z.scale <= 1.02) {
      z.scale = 1;
      z.x = 0;
      z.y = 0;
    }
    wrap.classList.toggle("is-zoomed", z.scale > 1);
    if (z.scale === 1) {
      if (animate && !prefersReducedMotion()) {
        canvas.classList.add("is-zoom-reset");
        canvas.style.transform = "translate(0px, 0px) scale(1)";
        window.setTimeout(() => {
          canvas.classList.remove("is-zoom-reset");
          if (zoomState(wrap).scale === 1) {
            canvas.style.transform = "";
          }
        }, 280);
      } else {
        canvas.classList.remove("is-zoom-reset");
        canvas.style.transform = "";
      }
      return;
    }
    canvas.classList.remove("is-zoom-reset");
    canvas.style.transform = `translate(${z.x}px, ${z.y}px) scale(${z.scale})`;
  }

  function resetZoom(wrap, animate) {
    const z = zoomState(wrap);
    z.scale = 1;
    z.x = 0;
    z.y = 0;
    z.pinch = null;
    applyZoom(wrap, animate);
  }

  function zoomAround(wrap, nextScale, cx, cy) {
    const z = zoomState(wrap);
    const prev = z.scale || 1;
    const next = Math.min(MAP_ZOOM_MAX, Math.max(1, nextScale));
    if (next === 1) {
      resetZoom(wrap, false);
      return;
    }
    const ratio = next / prev;
    z.x = cx - (cx - z.x) * ratio;
    z.y = cy - (cy - z.y) * ratio;
    z.scale = next;
    clampZoom(wrap);
    applyZoom(wrap, false);
  }

  function wrapPoint(wrap, clientX, clientY) {
    const rect = wrap.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function pointerDistance(points) {
    const [a, b] = points;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function pointerMid(wrap, points) {
    const [a, b] = points;
    return wrapPoint(wrap, (a.x + b.x) / 2, (a.y + b.y) / 2);
  }

  function bindMapZoom(wrap) {
    if (!wrap || wrap.dataset.zoomBound) {
      return;
    }
    wrap.dataset.zoomBound = "true";
    const z = zoomState(wrap);

    wrap.addEventListener("pointerdown", (event) => {
      z.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (z.pointers.size === 2) {
        const points = [...z.pointers.values()];
        const mid = pointerMid(wrap, points);
        z.pinch = {
          dist: pointerDistance(points) || 1,
          scale: z.scale,
          x: z.x,
          y: z.y,
          cx: mid.x,
          cy: mid.y
        };
        z.suppressClick = true;
        event.preventDefault();
      } else if (z.scale > 1 && event.pointerType === "touch") {
        event.preventDefault();
      }
      if (
        event.pointerType === "touch"
        && z.pointers.size === 1
        && z.scale > 1
        && !event.target.closest(".cluster-pin")
      ) {
        const now = Date.now();
        if (now - z.lastTap < 280) {
          resetZoom(wrap, true);
          z.lastTap = 0;
          z.suppressClick = true;
          event.preventDefault();
        } else {
          z.lastTap = now;
        }
      }
    }, { passive: false });

    wrap.addEventListener("pointermove", (event) => {
      if (!z.pointers.has(event.pointerId)) {
        return;
      }
      if (z.scale === 1 && z.pointers.size < 2) {
        z.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        return;
      }
      const prev = z.pointers.get(event.pointerId);
      z.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (z.pointers.size === 2 && z.pinch && z.pinch.dist) {
        event.preventDefault();
        const points = [...z.pointers.values()];
        const dist = pointerDistance(points);
        const mid = pointerMid(wrap, points);
        zoomAround(wrap, z.pinch.scale * (dist / z.pinch.dist), mid.x, mid.y);
        z.suppressClick = true;
        return;
      }
      if (z.pointers.size === 1 && z.scale > 1) {
        event.preventDefault();
        z.x += event.clientX - prev.x;
        z.y += event.clientY - prev.y;
        clampZoom(wrap);
        applyZoom(wrap, false);
        if (Math.hypot(event.clientX - prev.x, event.clientY - prev.y) > 2) {
          z.suppressClick = true;
        }
      }
    }, { passive: false });

    const endPointer = (event) => {
      z.pointers.delete(event.pointerId);
      if (z.pointers.size < 2) {
        z.pinch = null;
      }
      if (!z.pointers.size && z.scale < 1.08) {
        resetZoom(wrap, z.scale !== 1);
      }
    };
    wrap.addEventListener("pointerup", endPointer);
    wrap.addEventListener("pointercancel", endPointer);

    wrap.addEventListener("touchstart", (event) => {
      if (event.touches.length < 2) {
        return;
      }
      event.preventDefault();
      wrap.classList.add("is-pinching");
      const first = event.touches[0];
      const second = event.touches[1];
      z.pinch = {
        dist: Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY) || 1,
        scale: z.scale
      };
      z.suppressClick = true;
    }, { passive: false });

    wrap.addEventListener("touchmove", (event) => {
      if (event.touches.length < 2 || !z.pinch) {
        return;
      }
      event.preventDefault();
      const first = event.touches[0];
      const second = event.touches[1];
      const dist = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY) || 1;
      const mid = wrapPoint(wrap, (first.clientX + second.clientX) / 2, (first.clientY + second.clientY) / 2);
      zoomAround(wrap, z.pinch.scale * (dist / z.pinch.dist), mid.x, mid.y);
      z.suppressClick = true;
    }, { passive: false });

    wrap.addEventListener("touchend", (event) => {
      if (event.touches.length < 2) {
        z.pinch = null;
        wrap.classList.remove("is-pinching");
      }
      if (!event.touches.length && z.scale < 1.08) {
        resetZoom(wrap, z.scale !== 1);
      }
    }, { passive: false });
    wrap.addEventListener("touchcancel", (event) => {
      wrap.classList.remove("is-pinching");
      z.pinch = null;
      if (!event.touches.length && z.scale < 1.08) {
        resetZoom(wrap, z.scale !== 1);
      }
    }, { passive: false });

    ["gesturestart", "gesturechange", "gestureend"].forEach((name) => {
      wrap.addEventListener(name, (event) => event.preventDefault(), { passive: false });
    });

    wrap.addEventListener("click", (event) => {
      if (!z.suppressClick) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      z.suppressClick = false;
    }, true);
  }

  function addSparkles(layer) {
    const spots = [
      [18, 12], [72, 10], [88, 28], [12, 42], [64, 36],
      [40, 58], [82, 62], [22, 74], [54, 80], [76, 88],
      [34, 22], [8, 66]
    ];
    spots.forEach(([x, y], index) => {
      const spark = document.createElement("span");
      spark.className = "map-spark";
      spark.style.left = `${x}%`;
      spark.style.top = `${y}%`;
      spark.style.setProperty("--delay", `${index * 0.28}s`);
      layer.appendChild(spark);
    });
  }

  function bindUi() {
    const stats = document.getElementById("map-stats");
    if (stats && !stats.dataset.bound) {
      stats.dataset.bound = "true";
      stats.addEventListener("click", (event) => {
        const button = event.target.closest(".map-stat");
        if (!button || !stats.contains(button)) {
          return;
        }
        const key = button.dataset.filter || "";
        activeFilter = activeFilter === key ? "" : key;
        applyFilter();
      });
    }
    const sheet = document.getElementById("map-sheet");
    if (!sheet || sheet.dataset.bound) {
      return;
    }
    sheet.dataset.bound = "true";
    document.getElementById("map-sheet-close").addEventListener("click", closeSheet);
    document.getElementById("map-sheet-backdrop").addEventListener("click", closeSheet);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSheet();
      }
    });
  }

  function applyFilter() {
    document.querySelectorAll("#map-stats .map-stat").forEach((button) => {
      button.classList.toggle("is-on", !!activeFilter && button.dataset.filter === activeFilter);
    });
    document.querySelectorAll(".korea-canvas").forEach((canvas) => {
      canvas.classList.toggle("is-filtered", !!activeFilter);
    });
    document.querySelectorAll(".cluster-pin").forEach((pin) => {
      const labels = (pin.dataset.labels || "").split(",").filter(Boolean);
      const on = !activeFilter || labels.includes(activeFilter);
      pin.classList.toggle("is-dim", !on);
      pin.classList.toggle("is-hot", !!activeFilter && on);
    });
    document.querySelectorAll(".pin-name[data-labels]").forEach((el) => {
      const labels = (el.dataset.labels || "").split(",").filter(Boolean);
      const on = !activeFilter || labels.includes(activeFilter);
      el.classList.toggle("is-dim", !on);
    });
    document.querySelectorAll("#map-rank li").forEach((item) => {
      item.hidden = !!activeFilter && item.dataset.label !== activeFilter;
    });
  }

  function openSheet(cluster) {
    clearOpenCluster();
    if (cluster.count > 1) {
      document.querySelectorAll(`[data-cluster-id="${cluster.id}"]`).forEach((el) => {
        el.classList.add("is-open");
      });
    }
    const sheet = document.getElementById("map-sheet");
    const list = document.getElementById("map-sheet-list");
    const visible = activeFilter
      ? cluster.people.filter((person) => rankLabelOf(person) === activeFilter)
      : cluster.people;
    const named = visible.filter((person) => person.named);
    const extra = visible.length - named.length;
    document.getElementById("map-sheet-title").textContent = cluster.name;
    document.getElementById("map-sheet-count").textContent = `${visible.length}명`;
    list.innerHTML = named.map((person) => MapApp.sheetRowHtml(person, hostName, !!onDeletePerson)).join("")
      + (extra > 0 ? `<li class="is-extra"><span>그 외 ${extra}명</span></li>` : "");
    list.querySelectorAll(".map-sheet-remove").forEach((button) => {
      button.addEventListener("click", () => onDeletePerson(Number(button.dataset.id)));
    });
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("is-open"));
    document.body.classList.add("is-sheet-open");
  }

  function closeSheet() {
    clearOpenCluster();
    const sheet = document.getElementById("map-sheet");
    if (!sheet) {
      return;
    }
    sheet.classList.remove("is-open");
    document.body.classList.remove("is-sheet-open");
    window.setTimeout(() => {
      if (!sheet.classList.contains("is-open")) {
        sheet.hidden = true;
      }
    }, 280);
  }

  function clearOpenCluster() {
    document.querySelectorAll(".cluster-pin.is-open, .pin-name.is-open").forEach((el) => {
      el.classList.remove("is-open");
    });
  }

  function escapeHtml(value) {
    return MapApp.escapeHtml(value);
  }

  window.MapBoard = { paint, bindUi, closeSheet, escapeHtml };
})();
