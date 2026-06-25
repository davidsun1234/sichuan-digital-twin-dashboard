const cities = [
  { name: "成都市", x: 104.06, y: 30.67, baseLoad: 91, load: 91, level: "hot", phase: 0.2 },
  { name: "绵阳市", x: 104.73, y: 31.47, baseLoad: 82, load: 82, level: "warn", phase: 1.1 },
  { name: "宜宾市", x: 104.64, y: 28.75, baseLoad: 71, load: 71, level: "normal", phase: 2.4 },
  { name: "泸州市", x: 105.44, y: 28.87, baseLoad: 68, load: 68, level: "normal", phase: 3.2 },
  { name: "南充市", x: 106.08, y: 30.80, baseLoad: 77, load: 77, level: "warn", phase: 4.1 },
  { name: "达州市", x: 107.50, y: 31.22, baseLoad: 73, load: 73, level: "normal", phase: 5.4 },
  { name: "雅安市", x: 103.00, y: 29.98, baseLoad: 61, load: 61, level: "normal", phase: 6.0 },
  { name: "攀枝花市", x: 101.72, y: 26.58, baseLoad: 58, load: 58, level: "normal", phase: 7.1 },
  { name: "乐山市", x: 103.77, y: 29.56, baseLoad: 66, load: 66, level: "normal", phase: 8.2 }
];

const eventPool = [
  { city: "成都市", text: "城市算力池完成弹性扩容", level: "normal", status: "已闭环" },
  { city: "绵阳市", text: "制造园区能耗峰值预警", level: "warn", status: "调度中" },
  { city: "南充市", text: "嘉陵江水文站触发联动巡检", level: "warn", status: "核验中" },
  { city: "宜宾市", text: "港区物流通道恢复常态", level: "normal", status: "已恢复" },
  { city: "达州市", text: "东向干线出现短时拥塞", level: "hot", status: "处置中" },
  { city: "雅安市", text: "山区通信基站完成备电切换", level: "normal", status: "已切换" },
  { city: "乐山市", text: "文旅核心区人流密度升高", level: "warn", status: "观察中" },
  { city: "泸州市", text: "长江航运监测点完成复测", level: "normal", status: "已确认" }
];

const timelinePool = [
  "交通流量预测刷新",
  "清洁能源调度下发",
  "水文风险复核完成",
  "应急物资路径优化",
  "重点园区负载回落",
  "跨市联动预案演练",
  "低空巡检航线更新",
  "通信保障资源重排",
  "港区作业窗口校准"
];

const state = {
  features: [],
  featureHitPaths: [],
  regionLabels: [],
  bounds: null,
  hovered: null,
  tick: 0,
  dpr: 1,
  points: [],
  eventIndex: 0,
  timelineIndex: 0,
  energy: 82.6,
  windPower: 6.42,
  storageResponse: 91,
  lastPointer: null
};

const mapCanvas = document.querySelector("#mapCanvas");
const ctx = mapCanvas.getContext("2d");
const tooltip = document.querySelector("#tooltip");
const focusCity = document.querySelector("#focusCity");
const energyPercent = document.querySelector("#energyPercent");
const windPowerEl = document.querySelector("#windPower");
const storageResponseEl = document.querySelector("#storageResponse");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(date) {
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function setCityLevel(city) {
  if (city.load >= 88) city.level = "hot";
  else if (city.load >= 76) city.level = "warn";
  else city.level = "normal";
}

function setupDynamicLists() {
  updateLoadData();
  updateEventList();
  updateTimeline();
  updateEnergyData();
}

function updateLoadData() {
  const time = Date.now() / 5000;
  for (const city of cities) {
    const wave = Math.sin(time + city.phase) * 5 + Math.cos(time * 0.55 + city.phase) * 2.5;
    city.load = clamp(Math.round(city.baseLoad + wave), 46, 97);
    setCityLevel(city);
  }

  document.querySelector("#loadBars").innerHTML = cities
    .slice()
    .sort((a, b) => b.load - a.load)
    .slice(0, 5)
    .map(city => `
      <div class="load-row ${city.level}" style="--value:${city.load}%">
        <span>${city.name}</span><div class="track"><div class="fill"></div></div><strong>${city.load}%</strong>
      </div>
    `).join("");
}

function updateEventList() {
  const visible = [];
  for (let i = 0; i < 3; i += 1) {
    visible.push(eventPool[(state.eventIndex + i) % eventPool.length]);
  }

  const now = new Date();
  document.querySelector("#eventList").innerHTML = visible.map((event, index) => {
    const time = new Date(now.getTime() - index * 4 * 60000);
    return `
      <article class="event-card ${event.level}">
        <div><strong>${event.city}</strong><time>${formatTime(time)}</time></div>
        <span>${event.text}</span>
        <em>${event.status}</em>
      </article>
    `;
  }).join("");

  const closedRate = 94 + ((state.eventIndex * 3) % 5);
  document.querySelector("#eventHealth").textContent = `闭环率 ${closedRate}%`;
  state.eventIndex = (state.eventIndex + 1) % eventPool.length;
}

function updateTimeline() {
  const now = new Date();
  const items = Array.from({ length: 6 }, (_, index) => {
    const poolIndex = (state.timelineIndex + index) % timelinePool.length;
    const time = new Date(now.getTime() + (index - 1) * 8 * 60000);
    return { time: formatTime(time), text: timelinePool[poolIndex], active: index === 1 };
  });

  document.querySelector("#timeline").innerHTML = items.map(item => `
    <article class="step ${item.active ? "active" : ""}">
      <time>${item.time}</time><strong>${item.text}</strong>
    </article>
  `).join("");
  document.querySelector("#timelineState").textContent = `正在执行：${items[1].text}`;
  state.timelineIndex = (state.timelineIndex + 1) % timelinePool.length;
}

function updateEnergyData() {
  const time = Date.now() / 4200;
  state.energy = clamp(80.5 + Math.sin(time) * 3.2 + Math.cos(time * 0.5) * 1.4, 74, 91);
  state.windPower = clamp(6.2 + Math.sin(time * 0.8 + 1.2) * 0.42, 5.4, 7.1);
  state.storageResponse = Math.round(clamp(88 + Math.cos(time * 1.2) * 8, 72, 104));

  energyPercent.textContent = `${state.energy.toFixed(1)}%`;
  windPowerEl.textContent = `${state.windPower.toFixed(2)}GW`;
  storageResponseEl.textContent = `${state.storageResponse}ms`;
  drawGauge(state.energy / 100);
}

function updateClock() {
  const now = new Date();
  document.querySelector("#clock").textContent = now.toLocaleTimeString("zh-CN", { hour12: false });
}

function resizeCanvas() {
  const rect = mapCanvas.getBoundingClientRect();
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  mapCanvas.width = Math.floor(rect.width * state.dpr);
  mapCanvas.height = Math.floor(rect.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  rebuildHitPaths();
  render();
}

function computeBounds(geojson) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const feature of geojson.features) {
    walkCoordinates(feature.geometry.coordinates, ([x, y]) => {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    });
  }
  return { minX, minY, maxX, maxY };
}

function walkCoordinates(coords, visit) {
  if (typeof coords[0] === "number") {
    visit(coords);
    return;
  }
  for (const item of coords) walkCoordinates(item, visit);
}

function project([x, y]) {
  const rect = mapCanvas.getBoundingClientRect();
  const pad = Math.min(rect.width, rect.height) * 0.11;
  const width = rect.width - pad * 2;
  const height = rect.height - pad * 2;
  const b = state.bounds;
  const scale = Math.min(width / (b.maxX - b.minX), height / (b.maxY - b.minY));
  const mapW = (b.maxX - b.minX) * scale;
  const mapH = (b.maxY - b.minY) * scale;
  const px = (rect.width - mapW) / 2 + (x - b.minX) * scale;
  const py = (rect.height + mapH) / 2 - (y - b.minY) * scale;
  return [px, py];
}

function buildPath(rings, offsetX = 0, offsetY = 0) {
  const path = new Path2D();
  for (const ring of rings) {
    ring.forEach((coord, index) => {
      const [x, y] = project(coord);
      if (index === 0) path.moveTo(x + offsetX, y + offsetY);
      else path.lineTo(x + offsetX, y + offsetY);
    });
    path.closePath();
  }
  return path;
}

function featureRings(feature) {
  const type = feature.geometry.type;
  const coords = feature.geometry.coordinates;
  if (type === "Polygon") return coords;
  if (type === "MultiPolygon") return coords.flat();
  return [];
}

function getFallbackCentroid(feature) {
  let sx = 0, sy = 0, count = 0;
  walkCoordinates(feature.geometry.coordinates, ([x, y]) => {
    sx += x;
    sy += y;
    count += 1;
  });
  return count ? [sx / count, sy / count] : [104, 30];
}

function buildRegionLabels() {
  state.regionLabels = state.features.map(feature => {
    const props = feature.properties || {};
    const point = props.centroid || props.center || getFallbackCentroid(feature);
    return {
      name: props.name,
      fullName: props.name,
      screen: project(point)
    };
  });
}

function rebuildHitPaths() {
  if (!state.bounds || !state.features.length) return;
  state.featureHitPaths = state.features.map(feature => ({
    feature,
    path: buildPath(featureRings(feature))
  }));
  buildRegionLabels();
}

function drawBackground(rect) {
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.save();
  ctx.translate(rect.width / 2, rect.height / 2 + 24);
  ctx.rotate(-0.14);
  ctx.scale(1, 0.46);
  for (let r = 80; r < Math.max(rect.width, rect.height); r += 58) {
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(112,231,178,${Math.max(0.02, 0.18 - r / 5200)})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();
}

function drawMap(rect) {
  const lift = 18;
  for (const feature of state.features) {
    const rings = featureRings(feature);
    const bottom = buildPath(rings, -18, lift);
    ctx.fillStyle = "rgba(37, 52, 36, 0.78)";
    ctx.fill(bottom);
  }

  for (const feature of state.features) {
    const rings = featureRings(feature);
    const path = buildPath(rings);
    const hot = state.hovered === feature;
    const grad = ctx.createLinearGradient(0, rect.height * 0.15, rect.width, rect.height * 0.9);
    grad.addColorStop(0, hot ? "rgba(242,196,102,0.88)" : "rgba(48,118,93,0.86)");
    grad.addColorStop(0.52, hot ? "rgba(112,231,178,0.9)" : "rgba(26,83,76,0.78)");
    grad.addColorStop(1, "rgba(9,39,45,0.9)");
    ctx.fillStyle = grad;
    ctx.strokeStyle = hot ? "rgba(255,232,165,0.95)" : "rgba(132,224,190,0.58)";
    ctx.lineWidth = hot ? 1.7 : 0.8;
    ctx.shadowColor = hot ? "rgba(242,196,102,0.45)" : "rgba(112,231,178,0.24)";
    ctx.shadowBlur = hot ? 18 : 8;
    ctx.fill(path);
    ctx.stroke(path);
    ctx.shadowBlur = 0;
  }
}

function drawRoutes() {
  const hub = project([104.06, 30.67]);
  state.points = cities.map(city => ({ ...city, screen: project([city.x, city.y]) }));
  ctx.save();
  for (const city of state.points) {
    if (city.name === "成都市") continue;
    const [x, y] = city.screen;
    const pulse = (Math.sin(state.tick * 0.035 + city.load) + 1) / 2;
    ctx.beginPath();
    ctx.moveTo(hub[0], hub[1]);
    const cx = (hub[0] + x) / 2 + (y - hub[1]) * 0.08;
    const cy = (hub[1] + y) / 2 - 38;
    ctx.quadraticCurveTo(cx, cy, x, y);
    ctx.strokeStyle = `rgba(127,199,255,${0.22 + pulse * 0.42})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  for (const city of state.points) {
    const [x, y] = city.screen;
    const radius = 4 + city.load / 22 + Math.sin(state.tick * 0.045 + city.load) * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = city.level === "hot" ? "rgba(239,125,106,0.95)" : city.level === "warn" ? "rgba(242,196,102,0.92)" : "rgba(112,231,178,0.88)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.9, 0, Math.PI * 2);
    ctx.strokeStyle = city.level === "hot" ? "rgba(239,125,106,0.22)" : "rgba(112,231,178,0.18)";
    ctx.stroke();
  }
  ctx.restore();
}

function drawRegionLabels() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "12px Microsoft YaHei";
  for (const label of state.regionLabels) {
    const [x, y] = label.screen;
    const metrics = ctx.measureText(label.name);
    const width = metrics.width + 12;
    ctx.fillStyle = "rgba(6, 18, 17, 0.52)";
    ctx.strokeStyle = "rgba(112,231,178,0.26)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - 10, width, 20, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(239,247,242,0.92)";
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 4;
    ctx.fillText(label.name, x, y);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

function render() {
  const rect = mapCanvas.getBoundingClientRect();
  if (!state.bounds) return;
  drawBackground(rect);
  drawMap(rect);
  drawRegionLabels();
  drawRoutes();
}

function animate() {
  state.tick += 1;
  render();
  if (state.tick % 180 === 0 && !state.lastPointer) {
    const city = cities[(state.tick / 180) % cities.length | 0];
    focusCity.textContent = `${city.name}运行圈`;
    document.querySelector("#siteCount").textContent = (1280 + Math.round(Math.random() * 22)).toLocaleString("zh-CN");
    document.querySelector("#ticketCount").textContent = (460 + Math.round(Math.random() * 28)).toLocaleString("zh-CN");
  }
  requestAnimationFrame(animate);
}

function getFeatureAtPoint(x, y) {
  const previousTransform = ctx.getTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  let matched = null;
  for (const item of state.featureHitPaths) {
    if (ctx.isPointInPath(item.path, x, y)) {
      matched = item.feature;
      break;
    }
  }
  ctx.setTransform(previousTransform);
  return matched;
}

function positionTooltip(event) {
  const padding = 16;
  const rect = tooltip.getBoundingClientRect();
  const left = clamp(event.clientX + 14, padding, window.innerWidth - rect.width - padding);
  const top = clamp(event.clientY + 14, padding, window.innerHeight - rect.height - padding);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hitTest(event) {
  const rect = mapCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  state.lastPointer = { x, y };
  state.hovered = getFeatureAtPoint(x, y);

  const point = state.points.find(city => Math.hypot(city.screen[0] - x, city.screen[1] - y) < 16);
  const targetName = point?.name || state.hovered?.properties?.name;
  if (targetName) {
    const load = point?.load || Math.round(55 + Math.random() * 32);
    tooltip.hidden = false;
    tooltip.innerHTML = `<strong>${targetName}</strong>综合负载 ${load}%<br>联动状态：在线`;
    positionTooltip(event);
    focusCity.textContent = `${targetName}运行圈`;
  } else {
    tooltip.hidden = true;
    if (state.tick % 180 !== 0) focusCity.textContent = "全域运行圈";
  }
}

function drawGauge(progress = 0.826) {
  const canvas = document.querySelector("#energyGauge");
  const c = canvas.getContext("2d");
  const w = canvas.width;
  const center = w / 2;
  c.clearRect(0, 0, w, w);
  for (let i = 0; i < 44; i += 1) {
    const angle = -Math.PI * 0.75 + i * (Math.PI * 1.5 / 43);
    const active = i / 43 < progress;
    c.beginPath();
    c.moveTo(center + Math.cos(angle) * 78, center + Math.sin(angle) * 78);
    c.lineTo(center + Math.cos(angle) * 94, center + Math.sin(angle) * 94);
    c.strokeStyle = active ? (i / 43 > 0.78 ? "#f2c466" : "#70e7b2") : "rgba(255,255,255,0.12)";
    c.lineWidth = 4;
    c.stroke();
  }
  c.beginPath();
  c.arc(center, center, 62, 0, Math.PI * 2);
  c.strokeStyle = "rgba(127,199,255,0.22)";
  c.lineWidth = 1;
  c.stroke();
}

async function boot() {
  setupDynamicLists();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateEnergyData, 2200);
  setInterval(updateLoadData, 2600);
  setInterval(updateEventList, 3200);
  setInterval(updateTimeline, 4200);

  const response = await fetch("./assets/sichuan.geojson");
  const geojson = await response.json();
  state.features = geojson.features;
  state.bounds = computeBounds(geojson);
  resizeCanvas();
  animate();
}

window.addEventListener("resize", resizeCanvas);
mapCanvas.addEventListener("mousemove", hitTest);
mapCanvas.addEventListener("mouseleave", () => {
  state.hovered = null;
  state.lastPointer = null;
  tooltip.hidden = true;
});
boot().catch(error => {
  console.error(error);
  document.querySelector(".map-stage").insertAdjacentHTML("beforeend", "<div class='map-hud top-left'><strong>地图数据加载失败</strong></div>");
});
