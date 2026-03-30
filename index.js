const layout = document.getElementById("layout");
const collapseBtn = document.getElementById("collapseBtn");
const collapseIcon = document.getElementById("collapseIcon");
const menuButtons = document.querySelectorAll(".menu-btn");
const globalSearch = document.getElementById("globalSearch");
const randomizeBtn = document.getElementById("randomizeBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loggedUserName = document.getElementById("loggedUserName");
const loggedUserId = document.getElementById("loggedUserId");
const userAvatar = document.getElementById("userAvatar");

const bellNotifBtn = document.getElementById("bellNotifBtn");
const bellNotifCount = document.getElementById("bellNotifCount");

const openScannerBtn = document.getElementById("openScannerBtn");
const scannerModal = document.getElementById("scannerModal");
const scannerBackdrop = document.getElementById("scannerBackdrop");
const closeScannerBtn = document.getElementById("closeScannerBtn");
const stopScannerBtn = document.getElementById("stopScannerBtn");
const captureScannerBtn = document.getElementById("captureScannerBtn");
const scannerVideo = document.getElementById("scannerVideo");
const scannerCanvas = document.getElementById("scannerCanvas");
const scannerStatus = document.getElementById("scannerStatus");
const scannerManualInput = document.getElementById("scannerManualInput");
const manualSearchBtn = document.getElementById("manualSearchBtn");

const totalStockCard = document.getElementById("totalStockCard");
const stockAmanCard = document.getElementById("stockAmanCard");
const perluCekCard = document.getElementById("perluCekCard");

const totalMasukInfo = document.getElementById("totalMasukInfo");
const totalKeluarInfo = document.getElementById("totalKeluarInfo");
const mingguMasukTertinggi = document.getElementById("mingguMasukTertinggi");
const mingguKeluarTertinggi = document.getElementById("mingguKeluarTertinggi");

const stockTableBody = document.getElementById("stockTableBody");
const stockEmptyState = document.getElementById("stockEmptyState");

const CS_STORAGE_KEY = "ahm-cs-data-v6";
const STOCK_IN_STORAGE_KEY = "stockInData";
const STOCK_OUT_STORAGE_KEY = "stockOutData";
const JUMLAH_STOCK_STORAGE_KEY = "ahm-stock-items-v6";
const STOCK_SCAN_TARGET_KEY = "ahm-stock-scan-target-v1";

const panels = {
  stock: document.getElementById("stockPanel"),
  check: document.getElementById("checkPanel"),
  mp: document.getElementById("mpPanel"),
  seksi: document.getElementById("seksiPanel"),
};

let clickableBars = [];
let chartData = [];
let hoveredBar = null;
let scannerStream = null;
let scannerActive = false;
let scannerBusy = false;

const FALLBACK_STOCK_IMAGE = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='16' fill='%23f4f1ff'/>
  <path d='M20 68L40 46L55 58L72 36L86 68Z' fill='%23917cff'/>
  <circle cx='34' cy='30' r='8' fill='%23d9d1ff'/>
</svg>`;

function activateSection(sectionName) {
  menuButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionName);
  });

  Object.keys(panels).forEach((key) => {
    if (panels[key]) {
      panels[key].classList.toggle("active", key === sectionName);
    }
  });
}

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateSection(button.dataset.section);

    if (window.innerWidth <= 860) {
      layout.classList.remove("mobile-open");
      layout.classList.add("collapsed");
      collapseIcon.innerHTML = "&gt;";
    }
  });
});

function loadVerifiedUser() {
  const name = localStorage.getItem("verifiedName") || "Nama User";
  const id = localStorage.getItem("verifiedId") || "No ID";

  if (loggedUserName) loggedUserName.textContent = name;
  if (loggedUserId) loggedUserId.textContent = id.startsWith("ID:") ? id : `ID: ${id}`;
  if (userAvatar) userAvatar.textContent = name.charAt(0).toUpperCase();
}

function setCollapsedState(isCollapsed) {
  if (window.innerWidth <= 860) {
    if (isCollapsed) {
      layout.classList.remove("mobile-open");
      collapseIcon.innerHTML = "&gt;";
    } else {
      layout.classList.add("mobile-open");
      collapseIcon.innerHTML = "&lt;";
    }
    return;
  }

  layout.classList.toggle("collapsed", isCollapsed);
  collapseIcon.innerHTML = isCollapsed ? "&gt;" : "&lt;";
}

collapseBtn?.addEventListener("click", () => {
  if (window.innerWidth <= 860) {
    const isOpen = layout.classList.contains("mobile-open");
    setCollapsedState(isOpen);
    return;
  }

  const isCollapsed = layout.classList.contains("collapsed");
  setCollapsedState(!isCollapsed);
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 860) {
    layout.classList.remove("mobile-open");
    collapseIcon.innerHTML = layout.classList.contains("collapsed") ? "&gt;" : "&lt;";
  } else {
    layout.classList.add("collapsed");
    layout.classList.remove("mobile-open");
    collapseIcon.innerHTML = "&gt;";
  }

  resizeCanvas();
  drawChart();
});

if (globalSearch) {
  globalSearch.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();
    const activePanel = document.querySelector(".data-panel.active");
    if (!activePanel) return;

    const rows = activePanel.querySelectorAll("tbody tr, .list-item");
    rows.forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(keyword) ? "" : "none";
    });
  });
}

logoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("verifiedName");
  localStorage.removeItem("verifiedId");
  localStorage.removeItem("verifiedRole");
  window.location.href = "login.html";
});

function loadJsonStorage(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function normalizeCategory(value) {
  const raw = String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/PEWS/g, "PWE")
    .replace(/PWE5/g, "PWE6");

  const match = raw.match(/PWE[0-9]/);
  return match ? match[0] : raw;
}

function normalizeStockItem(item) {
  const qty = Number(item.stock ?? item.qty ?? item.quantity ?? item.currentStock ?? 0);

  return {
    id: item.id || "",
    name: item.name || item.partName || item.namaBarang || "",
    partName: item.partName || "",
    category: normalizeCategory(item.category || item.kategori || ""),
    stock: Number.isFinite(qty) ? qty : 0,
    location: normalizeCategory(item.location || item.lokasi || ""),
    lemari: item.lemari || item.cabinet || item.rack || "",
    barcodeText: item.barcodeText || item.barcode || item.code || item.partCode || "",
    code: item.code || "",
    partCode: item.partCode || "",
    imageBase64: item.imageBase64 || "",
    updatedAt: item.updatedAt || "",
    createdAt: item.createdAt || ""
  };
}

function sortStockByQty(list) {
  return [...list].sort((a, b) => {
    const qtyA = Number(a?.stock || 0);
    const qtyB = Number(b?.stock || 0);

    if (qtyB !== qtyA) return qtyB - qtyA;

    const updatedA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    const updatedB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();

    if (updatedB !== updatedA) return updatedB - updatedA;

    return String(a?.name || "").localeCompare(String(b?.name || ""), "id", {
      sensitivity: "base"
    });
  });
}

function loadCheckStockItems() {
  return loadJsonStorage(CS_STORAGE_KEY);
}

function loadStockInItems() {
  return loadJsonStorage(STOCK_IN_STORAGE_KEY);
}

function loadStockOutItems() {
  return loadJsonStorage(STOCK_OUT_STORAGE_KEY);
}

function loadJumlahStockItems() {
  return sortStockByQty(loadJsonStorage(JUMLAH_STOCK_STORAGE_KEY).map(normalizeStockItem));
}

function getStockImage(item) {
  return item.imageBase64 || FALLBACK_STOCK_IMAGE;
}

function getStockName(item) {
  return item.name || item.partName || "-";
}

function getStockCategory(item) {
  return item.category || "-";
}

function getStockQty(item) {
  return Number(item.stock ?? item.qty ?? item.quantity ?? item.currentStock ?? 0);
}

function getStockLocation(item) {
  return item.location || item.lokasi || item.category || "-";
}

function getTotalAllStockQty() {
  const stockItems = loadJumlahStockItems();
  return stockItems.reduce((sum, item) => sum + getStockQty(item), 0);
}

function renderJumlahStockTable() {
  if (!stockTableBody || !stockEmptyState) return;

  const items = loadJumlahStockItems();
  stockTableBody.innerHTML = "";

  if (!items.length) {
    stockEmptyState.classList.remove("hidden");
    return;
  }

  stockEmptyState.classList.add("hidden");

  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.className = "stock-row-link";

    tr.innerHTML = `
      <td>
        <img class="stock-thumb" src="${escapeHtmlAttr(getStockImage(item))}" alt="Foto Produk" />
      </td>
      <td>${escapeHtml(getStockName(item))}</td>
      <td>${escapeHtml(getStockCategory(item))}</td>
      <td>${getStockQty(item).toLocaleString("id-ID")}</td>
      <td>${escapeHtml(getStockLocation(item))}</td>
    `;

    tr.addEventListener("click", () => {
      setStockScanTarget(item, item.name || item.barcodeText || "");
      window.location.href = `Stock.html?stockId=${encodeURIComponent(item.id || "")}&scan=1`;
    });

    stockTableBody.appendChild(tr);
  });
}

function updateBellNotification() {
  if (!bellNotifBtn || !bellNotifCount) return;

  const csItems = loadCheckStockItems();
  const needStockItems = csItems.filter((item) => Number(item.stockAkhir || 0) < 10);

  if (needStockItems.length > 0) {
    bellNotifBtn.classList.remove("hidden");
    bellNotifCount.textContent = needStockItems.length > 99 ? "99+" : needStockItems.length;
  } else {
    bellNotifBtn.classList.add("hidden");
    bellNotifCount.textContent = "0";
  }
}

if (bellNotifBtn) {
  bellNotifBtn.addEventListener("click", () => {
    window.location.href = "pc.html";
  });
}

window.addEventListener("storage", (event) => {
  if (
    event.key === CS_STORAGE_KEY ||
    event.key === STOCK_IN_STORAGE_KEY ||
    event.key === STOCK_OUT_STORAGE_KEY ||
    event.key === JUMLAH_STOCK_STORAGE_KEY
  ) {
    refreshDashboardData();
  }
});

function updateDashboardCards() {
  const csItems = loadCheckStockItems();
  const stockInItems = loadStockInItems();
  const stockOutItems = loadStockOutItems();

  const totalStockAll = getTotalAllStockQty();
  const amanCount = csItems.filter((item) => Number(item.stockAkhir || 0) >= 10).length;
  const perluCekCount = csItems.filter((item) => Number(item.stockAkhir || 0) < 10).length;

  if (totalStockCard) totalStockCard.textContent = totalStockAll.toLocaleString("id-ID");
  if (stockAmanCard) stockAmanCard.textContent = amanCount.toLocaleString("id-ID");
  if (perluCekCard) perluCekCard.textContent = perluCekCount.toLocaleString("id-ID");

  const totalMasuk = stockInItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalKeluar = stockOutItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (totalMasukInfo) totalMasukInfo.textContent = `${totalMasuk.toLocaleString("id-ID")} item`;
  if (totalKeluarInfo) totalKeluarInfo.textContent = `${totalKeluar.toLocaleString("id-ID")} item`;
}

function getWeekRangeLabel(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = `${String(monday.getDate()).padStart(2, "0")}/${String(monday.getMonth() + 1).padStart(2, "0")}`;
  const end = `${String(sunday.getDate()).padStart(2, "0")}/${String(sunday.getMonth() + 1).padStart(2, "0")}`;
  return `${start}-${end}`;
}

function getWeekKey(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + diffToMonday);

  return monday.toISOString().slice(0, 10);
}

function buildWeeklyChartData() {
  const stockInItems = loadStockInItems();
  const stockOutItems = loadStockOutItems();
  const map = new Map();

  stockInItems.forEach((item) => {
    const key = getWeekKey(item.date);
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, { key, label: getWeekRangeLabel(item.date), inQty: 0, outQty: 0 });
    }

    map.get(key).inQty += Number(item.quantity || 0);
  });

  stockOutItems.forEach((item) => {
    const key = getWeekKey(item.date);
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, { key, label: getWeekRangeLabel(item.date), inQty: 0, outQty: 0 });
    }

    map.get(key).outQty += Number(item.quantity || 0);
  });

  const result = Array.from(map.values());

  result.sort((a, b) => {
    if (b.inQty !== a.inQty) return b.inQty - a.inQty;
    return a.outQty - b.outQty;
  });

  chartData = result.slice(0, 6);

  if (mingguMasukTertinggi) {
    const maxIn = [...chartData].sort((a, b) => b.inQty - a.inQty)[0];
    mingguMasukTertinggi.textContent = maxIn ? `${maxIn.label} (${maxIn.inQty})` : "-";
  }

  if (mingguKeluarTertinggi) {
    const maxOut = [...chartData].sort((a, b) => b.outQty - a.outQty)[0];
    mingguKeluarTertinggi.textContent = maxOut ? `${maxOut.label} (${maxOut.outQty})` : "-";
  }
}

const canvas = document.getElementById("stockChart");
const ctx = canvas ? canvas.getContext("2d") : null;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

resizeCanvas();

function roundRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawRoundedBar(x, y, w, h, r, fill, shadowColor = null) {
  ctx.save();
  if (shadowColor) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
  }
  ctx.fillStyle = fill;
  roundRectPath(x, y, w, h, r);
  ctx.fill();
  ctx.restore();
}

function drawGrid(width, height, padding, chartHeight) {
  ctx.save();
  ctx.strokeStyle = "rgba(125, 117, 145, 0.10)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawYAxis(padding, chartHeight, maxValue) {
  ctx.save();
  ctx.fillStyle = "#8f88a4";
  ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "right";

  for (let i = 0; i <= 4; i++) {
    const value = Math.round(maxValue - (maxValue / 4) * i);
    const y = padding.top + (chartHeight / 4) * i + 3;
    ctx.fillText(String(value), padding.left - 8, y);
  }
  ctx.restore();
}

function drawChart() {
  if (!canvas || !ctx) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  ctx.clearRect(0, 0, width, height);
  clickableBars = [];

  if (!chartData.length) {
    ctx.fillStyle = "#7d7591";
    ctx.font = "600 14px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Belum ada data Stock In / Stock Out", width / 2, height / 2);
    return;
  }

  const padding = { top: 26, right: 18, bottom: 52, left: 46 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  drawGrid(width, height, padding, chartHeight);

  const maxValue = Math.max(...chartData.map((item) => Math.max(item.inQty, item.outQty)), 10);
  drawYAxis(padding, chartHeight, maxValue);

  const groupWidth = chartWidth / chartData.length;
  const barWidth = Math.min(32, Math.max(18, groupWidth * 0.22));

  chartData.forEach((item, index) => {
    const centerX = padding.left + index * groupWidth + groupWidth / 2;
    const inHeight = (item.inQty / maxValue) * chartHeight;
    const outHeight = (item.outQty / maxValue) * chartHeight;
    const inX = centerX - barWidth - 6;
    const outX = centerX + 6;
    const inY = padding.top + chartHeight - inHeight;
    const outY = padding.top + chartHeight - outHeight;

    const isHoveredIn = hoveredBar && hoveredBar.type === "in" && hoveredBar.index === index;
    const isHoveredOut = hoveredBar && hoveredBar.type === "out" && hoveredBar.index === index;

    const inGradient = ctx.createLinearGradient(0, inY, 0, inY + inHeight);
    inGradient.addColorStop(0, isHoveredIn ? "#6f5dff" : "#7d6cff");
    inGradient.addColorStop(1, isHoveredIn ? "#b6abff" : "#ddd8ff");

    const outGradient = ctx.createLinearGradient(0, outY, 0, outY + outHeight);
    outGradient.addColorStop(0, isHoveredOut ? "#ff5fa8" : "#ff78b6");
    outGradient.addColorStop(1, isHoveredOut ? "#ffc4de" : "#ffe4ef");

    drawRoundedBar(inX, inY, barWidth, inHeight, 12, inGradient, isHoveredIn ? "rgba(125,108,255,0.24)" : "rgba(125,108,255,0.14)");
    drawRoundedBar(outX, outY, barWidth, outHeight, 12, outGradient, isHoveredOut ? "rgba(255,120,182,0.24)" : "rgba(255,120,182,0.14)");

    ctx.save();
    ctx.fillStyle = "#2b2444";
    ctx.font = "700 10px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(item.inQty), inX + barWidth / 2, inY - 8);
    ctx.fillText(String(item.outQty), outX + barWidth / 2, outY - 8);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#766f8d";
    ctx.font = "700 10px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(item.label, centerX, height - 16);
    ctx.restore();

    clickableBars.push({ x: inX, y: inY, w: barWidth, h: inHeight, url: "si.html", type: "in", index });
    clickableBars.push({ x: outX, y: outY, w: barWidth, h: outHeight, url: "so.html", type: "out", index });
  });
}

if (canvas) {
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const hovered = clickableBars.find((bar) => x >= bar.x && x <= bar.x + bar.w && y >= bar.y && y <= bar.y + bar.h);
    hoveredBar = hovered || null;
    canvas.style.cursor = hovered ? "pointer" : "default";
    drawChart();
  });

  canvas.addEventListener("mouseleave", () => {
    hoveredBar = null;
    canvas.style.cursor = "default";
    drawChart();
  });

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clicked = clickableBars.find((bar) => x >= bar.x && x <= bar.x + bar.w && y >= bar.y && y <= bar.y + bar.h);
    if (clicked) window.location.href = clicked.url;
  });
}

function normalizeText(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\t/g, " ")
    .replace(/[_\-./\\|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLooseText(value) {
  return normalizeText(value).replace(/[^A-Z0-9]/g, "");
}

function buildAliases(item) {
  return [
    item.barcodeText,
    item.barcode,
    item.name,
    item.partName,
    item.id,
    item.code,
    item.partCode,
    item.lemari,
    item.location
  ].filter(Boolean);
}

function findBestStockMatch(rawInput) {
  const items = loadJumlahStockItems();
  const normalizedText = normalizeText(rawInput);
  const compactInput = normalizeLooseText(rawInput);

  if (!normalizedText && !compactInput) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of items) {
    const aliases = buildAliases(item);

    for (const alias of aliases) {
      const aliasText = normalizeText(alias);
      const aliasCompact = normalizeLooseText(alias);
      if (!aliasText && !aliasCompact) continue;

      let score = 0;

      if (compactInput && aliasCompact && compactInput === aliasCompact) score = 1000;
      if (normalizedText && aliasText && normalizedText === aliasText) score = Math.max(score, 970);

      if (compactInput && aliasCompact && aliasCompact.includes(compactInput) && compactInput.length >= 3) {
        score = Math.max(score, 830 + compactInput.length);
      }

      if (compactInput && aliasCompact && compactInput.includes(aliasCompact) && aliasCompact.length >= 3) {
        score = Math.max(score, 790 + aliasCompact.length);
      }

      if (normalizedText && aliasText && aliasText.includes(normalizedText) && normalizedText.length >= 3) {
        score = Math.max(score, 760 + normalizedText.length);
      }

      if (normalizedText && aliasText && normalizedText.includes(aliasText) && aliasText.length >= 3) {
        score = Math.max(score, 730 + aliasText.length);
      }

      const aliasWords = aliasText.split(" ").filter((word) => word.length >= 3);
      const inputWords = normalizedText.split(" ").filter((word) => word.length >= 3);

      let hitWords = 0;
      inputWords.forEach((word) => {
        if (aliasWords.includes(word) || aliasText.includes(word)) hitWords++;
      });

      if (hitWords >= 2) {
        score = Math.max(score, 650 + hitWords * 55 + aliasText.length);
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  return bestScore >= 650 ? bestMatch : null;
}

function setStockScanTarget(item, sourceValue) {
  try {
    localStorage.setItem(
      STOCK_SCAN_TARGET_KEY,
      JSON.stringify({
        stockId: item.id || "",
        source: sourceValue || "",
        timestamp: Date.now(),
        highlight: true,
        from: "index-scan"
      })
    );
  } catch {}
}

function redirectToStock(item, foundBy, rawValue) {
  if (scannerStatus) scannerStatus.textContent = `${foundBy}: ${rawValue}`;
  setStockScanTarget(item, rawValue);
  stopScanner();

  setTimeout(() => {
    window.location.href = `Stock.html?stockId=${encodeURIComponent(item.id || "")}&scan=1`;
  }, 450);
}

function isSecureCameraContext() {
  return window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function stopScanner(hideModal = true) {
  scannerActive = false;
  scannerBusy = false;

  if (scannerVideo) {
    try {
      scannerVideo.pause();
    } catch {}
    scannerVideo.srcObject = null;
  }

  if (scannerStream) {
    scannerStream.getTracks().forEach((track) => track.stop());
    scannerStream = null;
  }

  if (hideModal && scannerModal) scannerModal.classList.add("hidden");
  if (scannerStatus) scannerStatus.textContent = "Menyiapkan kamera...";
  if (scannerManualInput) scannerManualInput.value = "";
  document.body.style.overflow = "";
}

async function startScanner() {
  if (!scannerModal || !scannerVideo || !scannerStatus) return;

  stopScanner(false);
  scannerModal.classList.remove("hidden");
  scannerStatus.textContent = "Membuka kamera...";
  document.body.style.overflow = "hidden";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scannerStatus.textContent = "Browser ini tidak mendukung akses kamera.";
    return;
  }

  if (!isSecureCameraContext()) {
    scannerStatus.textContent = "Kamera butuh localhost atau HTTPS. Jangan buka lewat file:/// langsung.";
    return;
  }

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    scannerVideo.srcObject = scannerStream;

    await new Promise((resolve) => {
      scannerVideo.onloadedmetadata = () => resolve();
    });

    await scannerVideo.play();
    scannerActive = true;
    scannerStatus.textContent = "Kamera aktif. Arahkan barcode / nama part lalu klik Capture Scan.";
  } catch (error) {
    console.error(error);
    scannerStatus.textContent = "Kamera tidak bisa dibuka. Pastikan izin kamera aktif.";
  }
}

function captureFrame() {
  if (!scannerCanvas || !scannerVideo) return null;
  if (!scannerVideo.videoWidth || !scannerVideo.videoHeight) return null;

  const ctx2d = scannerCanvas.getContext("2d");
  scannerCanvas.width = scannerVideo.videoWidth;
  scannerCanvas.height = scannerVideo.videoHeight;
  ctx2d.drawImage(scannerVideo, 0, 0, scannerCanvas.width, scannerCanvas.height);

  return scannerCanvas.toDataURL("image/png");
}

async function decodeBarcodeFromImage(imageDataUrl) {
  if (!window.Quagga || !imageDataUrl) return "";

  try {
    const result = await window.Quagga.decodeSinglePromise({
      src: imageDataUrl,
      numOfWorkers: 0,
      locate: true,
      decoder: {
        readers: [
          "code_128_reader",
          "code_39_reader",
          "code_93_reader",
          "codabar_reader",
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      }
    });

    return result?.codeResult?.code || "";
  } catch (error) {
    console.error(error);
    return "";
  }
}



function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlAttr(value) {
  return escapeHtml(value);
}

function refreshDashboardData() {
  updateBellNotification();
  updateDashboardCards();
  buildWeeklyChartData();
  renderJumlahStockTable();
  drawChart();
}

function randomizeData() {
  refreshDashboardData();
}

if (randomizeBtn) randomizeBtn.addEventListener("click", randomizeData);

if (window.innerWidth <= 860) {
  layout.classList.add("collapsed");
  collapseIcon.innerHTML = "&gt;";
}

activateSection("stock");
loadVerifiedUser();
refreshDashboardData();