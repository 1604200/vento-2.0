const STORAGE_KEY = "ahm-stock-items-v6";
const SIDEBAR_KEY = "ahm-stock-sidebar-hidden-v6";

const CATEGORY_ORDER = ["ALL", "PEWS1", "PEWS2", "PEWS3", "PEWS4", "PEWS6", "PWE0", "PWE1", "PWE2", "PWE3", "PWE4", "PWE6"];

const FALLBACK_IMAGE = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 140'>
  <rect width='180' height='140' rx='18' fill='%23ffffff'/>
  <path d='M20 104L58 62L80 84L108 42L160 104Z' fill='%23111111'/>
</svg>`;

const FALLBACK_BARCODE = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'>
  <rect width='160' height='160' fill='white'/>
  <rect x='10' y='12' width='10' height='136' fill='black'/>
  <rect x='27' y='12' width='6' height='136' fill='black'/>
  <rect x='40' y='12' width='14' height='136' fill='black'/>
  <rect x='60' y='12' width='8' height='136' fill='black'/>
  <rect x='74' y='12' width='16' height='136' fill='black'/>
  <rect x='97' y='12' width='7' height='136' fill='black'/>
  <rect x='111' y='12' width='12' height='136' fill='black'/>
  <rect x='129' y='12' width='18' height='136' fill='black'/>
</svg>`;

function generateId() {
  return "stock-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function createDefaultStock(name, category, lemari, stock, location, barcodeText) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    category,
    lemari,
    stock,
    location,
    barcodeText,
    imageBase64: "",
    barcodeBase64: "",
    createdAt: now,
    updatedAt: now
  };
}

const DEFAULT_STOCKS = [
  createDefaultStock("Brake Pad AHM", "PWE0", "A.1", 1, "PWE0", "BP-AHM-001"),
  createDefaultStock("Oil Filter Supra", "PWE1", "A.2", 1, "PWE1", "OFS-PWE1-001"),
  createDefaultStock("Spark Plug Honda", "PWE2", "A.3", 1, "PWE2", "SPH-PWE2-001"),
  createDefaultStock("Air Filter Vario", "PWE3", "A.4", 3, "PWE3", "AFV-PWE3-001"),
  createDefaultStock("Front Disc Kit", "PWE4", "A.5", 1, "PWE4", "FDK-PWE4-001"),
  createDefaultStock("Drive Belt Set", "PWE6", "A.6", 1, "PWE6", "DBS-PWE6-001"),
  createDefaultStock("PHOTOELECTRIC SENSOR", "PWE0", "B.1", 2, "PWE0", "PHS-001")
];

const app = document.getElementById("app");
const cardsGrid = document.getElementById("cardsGrid");
const categoryList = document.getElementById("categoryList");
const topStockChips = document.getElementById("topStockChips");
const totalItems = document.getElementById("totalItems");
const activeCategoryLabel = document.getElementById("activeCategoryLabel");
const searchInfo = document.getElementById("searchInfo");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const addBtn = document.getElementById("addBtn");
const backBtn = document.getElementById("backBtn");
const openScannerBtn = document.getElementById("openScannerBtn");
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const toggleSymbol = document.getElementById("toggleSymbol");

const stockModal = document.getElementById("stockModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const stockForm = document.getElementById("stockForm");
const modalTitle = document.getElementById("modalTitle");

const editIdInput = document.getElementById("editId");
const stockNameInput = document.getElementById("stockName");
const stockCategoryInput = document.getElementById("stockCategory");
const stockLemariInput = document.getElementById("stockLemari");
const stockQtyInput = document.getElementById("stockQty");
const stockLocationInput = document.getElementById("stockLocation");
const barcodeTextInput = document.getElementById("barcodeText");
const stockImageInput = document.getElementById("stockImage");
const stockBarcodeInput = document.getElementById("stockBarcode");
const partPreview = document.getElementById("partPreview");
const barcodePreview = document.getElementById("barcodePreview");
const barcodePreviewTrigger = document.getElementById("barcodePreviewTrigger");

const barcodeZoomModal = document.getElementById("barcodeZoomModal");
const barcodeZoomBackdrop = document.getElementById("barcodeZoomBackdrop");
const barcodeZoomCloseBtn = document.getElementById("barcodeZoomCloseBtn");
const barcodeZoomImage = document.getElementById("barcodeZoomImage");
const barcodeZoomTitle = document.getElementById("barcodeZoomTitle");
const barcodeZoomText = document.getElementById("barcodeZoomText");

const scannerModal = document.getElementById("scannerModal");
const scannerBackdrop = document.getElementById("scannerBackdrop");
const closeScannerBtn = document.getElementById("closeScannerBtn");
const startScannerBtn = document.getElementById("startScannerBtn");
const stopScannerBtn = document.getElementById("stopScannerBtn");
const scannerStatus = document.getElementById("scannerStatus");
const scannerResult = document.getElementById("scannerResult");

const cardTemplate = document.getElementById("cardTemplate");

let stockItems = loadStocks();
let activeCategory = "ALL";
let searchTerm = "";
let currentImageBase64 = "";
let currentBarcodeBase64 = "";
let highlightedId = "";

let scannerVideo = null;
let scannerCanvas = null;
let scannerStream = null;
let scannerActive = false;
let scannerBusy = false;

function normalizeLegacyItem(item) {
  const qty = Number(item.stock ?? item.qty ?? item.quantity ?? item.currentStock ?? 1);

  return {
    id: item.id || generateId(),
    name: item.name || item.partName || item.namaBarang || "Nama Stock",
    category: String(item.category || item.kategori || item.location || "PWE0").toUpperCase(),
    lemari: item.lemari || item.cabinet || item.rack || "A.1",
    stock: Number.isFinite(qty) ? qty : 0,
    location: item.location || item.lokasi || item.category || "PWE0",
    barcodeText: item.barcodeText || item.barcode || item.code || item.partCode || item.id || "",
    imageBase64: item.imageBase64 || "",
    barcodeBase64: item.barcodeBase64 || "",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
  };
}

function sortStockByQty(list) {
  return [...list].sort((a, b) => {
    const stockA = Number(a?.stock || 0);
    const stockB = Number(b?.stock || 0);

    if (stockB !== stockA) {
      return stockB - stockA;
    }

    const updatedA = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
    const updatedB = new Date(b?.updatedAt || b?.createdAt || 0).getTime();

    if (updatedB !== updatedA) {
      return updatedB - updatedA;
    }

    return String(a?.name || "").localeCompare(String(b?.name || ""), "id", {
      sensitivity: "base"
    });
  });
}

function loadStocks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return sortStockByQty(saved.map(normalizeLegacyItem));
    }
    return sortStockByQty(DEFAULT_STOCKS);
  } catch {
    return sortStockByQty(DEFAULT_STOCKS);
  }
}

function saveStocks() {
  stockItems = sortStockByQty(stockItems);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stockItems));
}

function loadSidebarState() {
  const hidden = localStorage.getItem(SIDEBAR_KEY) === "true";
  app.classList.toggle("sidebar-hidden", hidden);
  updateToggleSymbol();
}

function updateToggleSymbol() {
  const hidden = app.classList.contains("sidebar-hidden");
  toggleSymbol.textContent = hidden ? ">" : "<";
}

function toggleSidebar() {
  const hidden = app.classList.toggle("sidebar-hidden");
  localStorage.setItem(SIDEBAR_KEY, String(hidden));
  updateToggleSymbol();
}

function getStockQty(item) {
  return Number(item.stock ?? 0);
}

function getCategoryCounts() {
  const counts = {};
  CATEGORY_ORDER.forEach((category) => {
    counts[category] = 0;
  });

  stockItems.forEach((item) => {
    const category = String(item.category || "").toUpperCase();
    if (!counts[category]) counts[category] = 0;
    counts[category] += getStockQty(item);
  });

  counts.ALL = stockItems.reduce((sum, item) => sum + getStockQty(item), 0);
  return counts;
}

function getCategories() {
  const counts = getCategoryCounts();
  const categories = new Set(CATEGORY_ORDER);
  Object.keys(counts).forEach((key) => categories.add(key));
  return Array.from(categories);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCategories() {
  const categories = getCategories();
  const counts = getCategoryCounts();
  categoryList.innerHTML = "";

  categories.forEach((category) => {
    const total = counts[category] || 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `category-item ${activeCategory === category ? "active" : ""}`;
    button.innerHTML = `
      <span class="category-item__left">
        <span class="category-item__name">${escapeHtml(category)}</span>
      </span>
      <span class="category-pill">${total} stock</span>
    `;

    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderTopChips();
      renderAll();
    });

    categoryList.appendChild(button);
  });
}

function renderTopChips() {
  const counts = getCategoryCounts();
  const chipCategories = CATEGORY_ORDER.filter((item) => item !== "ALL");
  topStockChips.innerHTML = "";

  chipCategories.forEach((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `stock-chip ${activeCategory === category ? "active" : ""}`;
    chip.textContent = `${category} : ${counts[category] || 0}`;

    chip.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderTopChips();
      renderAll();
    });

    topStockChips.appendChild(chip);
  });
}

function normalizeScanText(text) {
  return String(text || "").trim().toLowerCase();
}

function cleanText(text) {
  return String(text || "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFilteredStocks() {
  const sortedItems = sortStockByQty(stockItems);

  return sortedItems.filter((item) => {
    const matchCategory =
      activeCategory === "ALL" ||
      String(item.category || "").toUpperCase() === activeCategory;

    const keyword = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      String(item.name || "").toLowerCase().includes(keyword) ||
      String(item.barcodeText || "").toLowerCase().includes(keyword) ||
      String(item.lemari || "").toLowerCase().includes(keyword) ||
      String(item.location || "").toLowerCase().includes(keyword);

    return matchCategory && matchSearch;
  });
}

function showStockDetail(item, sourceText = "") {
  const updatedText = item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : "-";
  const infoSource = sourceText ? `\nHasil Scan: ${sourceText}\n` : "\n";

  alert(
    `Detail Stock${infoSource}\n` +
    `Nama Part: ${item.name || "-"}\n` +
    `Kategori: ${item.category || "-"}\n` +
    `Lemari: ${item.lemari || "-"}\n` +
    `Stock: ${getStockQty(item)}\n` +
    `Lokasi: ${item.location || "-"}\n` +
    `Barcode Text: ${item.barcodeText || "-"}\n` +
    `Terakhir Update: ${updatedText}`
  );
}

function openBarcodeZoom(imageSrc, barcodeTextValue, title = "Preview Barcode") {
  barcodeZoomImage.src = imageSrc || FALLBACK_BARCODE;
  barcodeZoomTitle.textContent = title;
  barcodeZoomText.textContent = barcodeTextValue || "-";
  barcodeZoomModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeBarcodeZoom() {
  barcodeZoomModal.classList.add("hidden");
  barcodeZoomImage.src = "";
  document.body.style.overflow =
    stockModal.classList.contains("hidden") && scannerModal.classList.contains("hidden")
      ? ""
      : "hidden";
}

function attachZoomTrigger(element, imageSrcOrFn, barcodeTextOrFn, titleOrFn) {
  if (!element) return;

  const openHandler = () => {
    const imageSrc = typeof imageSrcOrFn === "function" ? imageSrcOrFn() : imageSrcOrFn;
    const barcodeTextValue = typeof barcodeTextOrFn === "function" ? barcodeTextOrFn() : barcodeTextOrFn;
    const title = typeof titleOrFn === "function" ? titleOrFn() : titleOrFn;
    openBarcodeZoom(imageSrc, barcodeTextValue, title || "Preview Barcode");
  };

  element.addEventListener("click", openHandler);
  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openHandler();
    }
  });
}

function renderCards() {
  stockItems = sortStockByQty(stockItems);

  const filtered = getFilteredStocks();
  cardsGrid.innerHTML = "";

  if (!filtered.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filtered.forEach((item) => {
    const fragment = cardTemplate.content.cloneNode(true);

    const article = fragment.querySelector(".stock-card");
    const barcodeTrigger = fragment.querySelector(".barcode-zoom-trigger");
    const barcodeImg = fragment.querySelector(".barcode-img");
    const partImg = fragment.querySelector(".part-img");
    const stockBadge = fragment.querySelector(".stock-badge");
    const stockName = fragment.querySelector(".stock-name");
    const stockLemari = fragment.querySelector(".stock-lemari");
    const stockQty = fragment.querySelector(".stock-qty");
    const stockLocation = fragment.querySelector(".stock-location");
    const stockBarcodeText = fragment.querySelector(".stock-barcode-text");
    const detailBtn = fragment.querySelector(".detail-btn");
    const editBtn = fragment.querySelector(".edit-btn");
    const deleteBtn = fragment.querySelector(".delete-btn");

    const barcodeImageSrc = item.barcodeBase64 || FALLBACK_BARCODE;

    article.dataset.id = item.id;
    if (highlightedId === item.id) {
      article.classList.add("highlighted");
      article.style.boxShadow = "0 0 10px #00ffe1, 0 0 20px #00ffe1, 0 0 40px rgba(0,255,225,0.65)";
      article.style.border = "2px solid #00ffe1";
      article.style.transform = "translateY(-4px)";
      article.style.transition = "all 0.3s ease";
    } else {
      article.style.boxShadow = "";
      article.style.border = "";
      article.style.transform = "";
      article.style.transition = "";
    }

    barcodeImg.src = barcodeImageSrc;
    partImg.src = item.imageBase64 || FALLBACK_IMAGE;
    stockBadge.textContent = String(item.category || "NO CATEGORY").toUpperCase();
    stockName.textContent = item.name || "Nama Stock";
    stockLemari.textContent = item.lemari ? `Lemari ${item.lemari}` : "Lemari -";
    stockQty.textContent = `${getStockQty(item)} item`;
    stockLocation.textContent = item.location || "-";
    stockBarcodeText.textContent = item.barcodeText || "-";

    attachZoomTrigger(
      barcodeTrigger,
      () => barcodeImageSrc,
      () => item.barcodeText,
      () => item.name || "Preview Barcode"
    );

    detailBtn.addEventListener("click", () => showStockDetail(item));
    editBtn.addEventListener("click", () => openEditModal(item.id));
    deleteBtn.addEventListener("click", () => deleteStock(item.id));

    cardsGrid.appendChild(fragment);
  });
}

function renderSummary() {
  const filtered = getFilteredStocks();
  const total = filtered.reduce((sum, item) => sum + getStockQty(item), 0);
  totalItems.textContent = total;
  activeCategoryLabel.textContent = activeCategory;
  searchInfo.textContent = searchTerm ? `"${searchTerm}"` : "Semua";
}

function renderAll() {
  renderCards();
  renderSummary();
}

function resetPreviews() {
  partPreview.src = FALLBACK_IMAGE;
  barcodePreview.src = FALLBACK_BARCODE;
}

function openAddModal() {
  modalTitle.textContent = "Tambah Stock";
  editIdInput.value = "";
  stockForm.reset();
  stockCategoryInput.value = "";
  currentImageBase64 = "";
  currentBarcodeBase64 = "";
  resetPreviews();
  stockModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function openEditModal(id) {
  const item = stockItems.find((stock) => stock.id === id);
  if (!item) return;

  modalTitle.textContent = "Edit Stock";
  editIdInput.value = item.id;
  stockForm.reset();

  stockNameInput.value = item.name || "";
  stockCategoryInput.value = item.category || "";
  stockLemariInput.value = item.lemari || "";
  stockQtyInput.value = getStockQty(item);
  stockLocationInput.value = item.location || "";
  barcodeTextInput.value = item.barcodeText || "";

  currentImageBase64 = item.imageBase64 || "";
  currentBarcodeBase64 = item.barcodeBase64 || "";

  partPreview.src = currentImageBase64 || FALLBACK_IMAGE;
  barcodePreview.src = currentBarcodeBase64 || FALLBACK_BARCODE;

  stockModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  stockModal.classList.add("hidden");
  stockForm.reset();
  editIdInput.value = "";
  stockCategoryInput.value = "";
  currentImageBase64 = "";
  currentBarcodeBase64 = "";
  resetPreviews();
  document.body.style.overflow =
    barcodeZoomModal.classList.contains("hidden") && scannerModal.classList.contains("hidden")
      ? ""
      : "hidden";
}

function deleteStock(id) {
  const item = stockItems.find((stock) => stock.id === id);
  if (!item) return;

  const yes = confirm(`Hapus stock "${item.name}"?`);
  if (!yes) return;

  stockItems = sortStockByQty(stockItems.filter((stock) => stock.id !== id));
  saveStocks();
  renderCategories();
  renderTopChips();
  renderAll();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

async function handleImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentImageBase64 = await fileToBase64(file);
  partPreview.src = currentImageBase64 || FALLBACK_IMAGE;
}

async function handleBarcodeChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  currentBarcodeBase64 = await fileToBase64(file);
  barcodePreview.src = currentBarcodeBase64 || FALLBACK_BARCODE;
}

async function submitStockForm(event) {
  event.preventDefault();

  const name = stockNameInput.value.trim();
  const category = stockCategoryInput.value.trim().toUpperCase();
  const lemari = stockLemariInput.value.trim();
  const qty = Number(stockQtyInput.value || 0);
  const location = stockLocationInput.value.trim();
  const barcodeText = barcodeTextInput.value.trim();

  if (!name || !category || !lemari || !location || !barcodeText) return;

  const editId = editIdInput.value;
  const now = new Date().toISOString();

  if (!editId) {
    stockItems.unshift({
      id: generateId(),
      name,
      category,
      lemari,
      stock: Number.isFinite(qty) ? qty : 0,
      location,
      barcodeText,
      imageBase64: currentImageBase64,
      barcodeBase64: currentBarcodeBase64,
      createdAt: now,
      updatedAt: now
    });
  } else {
    stockItems = stockItems.map((item) => {
      if (item.id !== editId) return item;
      return {
        ...item,
        name,
        category,
        lemari,
        stock: Number.isFinite(qty) ? qty : 0,
        location,
        barcodeText,
        imageBase64: currentImageBase64 || item.imageBase64 || "",
        barcodeBase64: currentBarcodeBase64 || item.barcodeBase64 || "",
        updatedAt: now
      };
    });
  }

  stockItems = sortStockByQty(stockItems);
  saveStocks();
  renderCategories();
  renderTopChips();
  renderAll();
  closeModal();
}

function handleBack() {
  if (window.history.length > 1) {
    history.back();
  } else {
    window.location.href = "index.html";
  }
}

function findStockByScan(input) {
  const cleanInput = cleanText(input);

  if (!cleanInput) return null;

  let best = null;
  let bestScore = 0;

  stockItems.forEach((item) => {
    const name = cleanText(item.name);
    const barcode = cleanText(item.barcodeText);

    let score = 0;

    if (cleanInput === barcode) score = 1000;
    if (cleanInput === name) score = Math.max(score, 950);

    if (barcode.includes(cleanInput) && cleanInput.length >= 3) score = Math.max(score, 800);
    if (name.includes(cleanInput) && cleanInput.length >= 3) score = Math.max(score, 780);

    if (cleanInput.includes(barcode) && barcode.length >= 3) score = Math.max(score, 760);
    if (cleanInput.includes(name) && name.length >= 3) score = Math.max(score, 740);

    const words = cleanInput.split(" ");
    let hit = 0;
    words.forEach((w) => {
      if (w.length > 3 && name.includes(w)) hit++;
      if (w.length > 3 && barcode.includes(w)) hit++;
    });

    if (hit >= 2) score = Math.max(score, 600 + hit * 50);

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  return bestScore >= 600 ? best : null;
}

function highlightItem(item, text) {
  highlightedId = item.id;
  activeCategory = item.category || "ALL";
  searchTerm = item.name || item.barcodeText || text || "";
  searchInput.value = searchTerm;

  renderCategories();
  renderTopChips();
  renderAll();

  setTimeout(() => {
    const el = document.querySelector(`[data-id="${item.id}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    el.style.boxShadow = "0 0 20px #00ffcc, 0 0 40px #00ffcc, 0 0 60px rgba(0,255,204,0.6)";
    el.style.border = "2px solid #00ffcc";
    el.style.transform = "translateY(-4px)";
    el.style.transition = "all 0.3s ease";

    setTimeout(() => {
      el.style.boxShadow = "";
      el.style.border = "";
      el.style.transform = "";
    }, 5000);

    showStockDetail(item, text);
  }, 200);
}

function showScanNotFound(scannedText) {
  highlightedId = "";
  searchTerm = scannedText || "";
  searchInput.value = searchTerm;
  activeCategory = "ALL";
  renderCategories();
  renderTopChips();
  renderAll();

  scannerResult.textContent = `Hasil scan: ${scannedText} (data stock tidak ditemukan)`;
  alert(`Teks / barcode terdeteksi:\n${scannedText}\n\nTapi data part belum ada di stock.`);
}

function isSecureCameraContext() {
  return window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function ensureScannerVideo() {
  if (scannerVideo) return scannerVideo;

  const reader = document.getElementById("reader");
  scannerVideo = document.createElement("video");
  scannerVideo.id = "scannerVideo";
  scannerVideo.setAttribute("autoplay", "");
  scannerVideo.setAttribute("muted", "");
  scannerVideo.setAttribute("playsinline", "");
  scannerVideo.style.width = "100%";
  scannerVideo.style.height = "100%";
  scannerVideo.style.objectFit = "cover";
  scannerVideo.style.borderRadius = "inherit";

  if (reader) {
    reader.innerHTML = "";
    reader.appendChild(scannerVideo);
  }

  return scannerVideo;
}

function ensureScannerCanvas() {
  if (scannerCanvas) return scannerCanvas;

  scannerCanvas = document.createElement("canvas");
  scannerCanvas.id = "scannerCanvas";
  scannerCanvas.style.display = "none";
  document.body.appendChild(scannerCanvas);
  return scannerCanvas;
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

  if (hideModal) {
    scannerModal.classList.add("hidden");
  }

  scannerStatus.textContent = "Menunggu kamera aktif...";
  document.body.style.overflow =
    stockModal.classList.contains("hidden") && barcodeZoomModal.classList.contains("hidden")
      ? ""
      : "hidden";
}

async function startScanner() {
  stopScanner(false);
  scannerModal.classList.remove("hidden");
  scannerStatus.textContent = "Membuka kamera...";
  scannerResult.textContent = "Belum ada hasil scan.";
  document.body.style.overflow = "hidden";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scannerStatus.textContent = "Browser ini tidak mendukung akses kamera.";
    return;
  }

  if (!isSecureCameraContext()) {
    scannerStatus.textContent = "Kamera butuh localhost atau HTTPS. File:/// tidak didukung browser.";
    return;
  }

  try {
    const video = ensureScannerVideo();
    ensureScannerCanvas();

    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    video.srcObject = scannerStream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    await video.play();

    scannerActive = true;
    scannerStatus.textContent = "Kamera aktif. Arahkan barcode / nama part lalu tekan Stop Scan.";
  } catch (error) {
    console.error(error);

    if (error?.name === "NotAllowedError") {
      scannerStatus.textContent = "Izin kamera ditolak.";
      return;
    }

    if (error?.name === "NotFoundError") {
      scannerStatus.textContent = "Kamera tidak ditemukan.";
      return;
    }

    scannerStatus.textContent = "Kamera tidak bisa dibuka.";
  }
}

function captureFrame() {
  if (!scannerVideo || !scannerCanvas) return null;
  if (!scannerVideo.videoWidth || !scannerVideo.videoHeight) return null;

  const ctx = scannerCanvas.getContext("2d");
  scannerCanvas.width = scannerVideo.videoWidth;
  scannerCanvas.height = scannerVideo.videoHeight;
  ctx.drawImage(scannerVideo, 0, 0, scannerCanvas.width, scannerCanvas.height);

  return scannerCanvas.toDataURL("image/png");
}

async function captureAndRead() {
  if (!scannerActive) {
    scannerStatus.innerText = "Scanner belum aktif.";
    return;
  }

  if (scannerBusy) {
    scannerStatus.innerText = "Sedang memproses scan...";
    return;
  }

  const imageData = captureFrame();
  if (!imageData) {
    scannerStatus.innerText = "Video belum siap.";
    return;
  }

  scannerBusy = true;

  try {
    scannerStatus.innerText = "Membaca barcode...";

    let barcode = "";
    let cleaned = "";

    try {
      const result = await Quagga.decodeSinglePromise({
        src: imageData,
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
            "upc_e_reader"
          ]
        }
      });

      barcode = result?.codeResult?.code || "";
    } catch {}

    if (barcode) {
      const found = findStockByScan(barcode);

      if (found) {
        scannerResult.innerText = barcode;
        scannerStatus.innerText = "Barcode ditemukan ✔";
        stopScanner(true);
        highlightItem(found, barcode);
        return;
      }
    }

    scannerStatus.innerText = "Membaca teks nama part...";

    const result = await Tesseract.recognize(imageData, "eng");
    const rawText = result?.data?.text || "";
    cleaned = cleanText(rawText);

    if (cleaned) {
      const found = findStockByScan(cleaned);

      if (found) {
        scannerResult.innerText = cleaned;
        scannerStatus.innerText = "Nama part ditemukan ✔";
        stopScanner(true);
        highlightItem(found, cleaned);
        return;
      }
    }

    scannerStatus.innerText = "Tidak ditemukan ❌";
    scannerResult.innerText = cleaned || barcode || "Tidak ada hasil yang cocok.";
  } catch (err) {
    console.error(err);
    scannerStatus.innerText = "Scan error ❌";
  } finally {
    scannerBusy = false;
  }
}

function openScannerModal() {
  startScanner();
}

async function closeScannerModal() {
  stopScanner(true);
}

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  highlightedId = "";
  renderAll();
});

addBtn.addEventListener("click", openAddModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
stockForm.addEventListener("submit", submitStockForm);

stockImageInput.addEventListener("change", handleImageChange);
stockBarcodeInput.addEventListener("change", handleBarcodeChange);

attachZoomTrigger(
  barcodePreviewTrigger,
  () => barcodePreview.src,
  () => barcodeTextInput.value.trim(),
  () => "Preview Barcode"
);

toggleSidebarBtn.addEventListener("click", toggleSidebar);
backBtn.addEventListener("click", handleBack);

openScannerBtn.addEventListener("click", openScannerModal);
closeScannerBtn.addEventListener("click", closeScannerModal);
scannerBackdrop.addEventListener("click", closeScannerModal);
startScannerBtn.addEventListener("click", startScanner);
stopScannerBtn.addEventListener("click", captureAndRead);

barcodeZoomCloseBtn.addEventListener("click", closeBarcodeZoom);
barcodeZoomBackdrop.addEventListener("click", closeBarcodeZoom);

document.addEventListener("keydown", async (e) => {
  if (e.key === "Escape") {
    if (!barcodeZoomModal.classList.contains("hidden")) {
      closeBarcodeZoom();
      return;
    }

    if (!scannerModal.classList.contains("hidden")) {
      await closeScannerModal();
      return;
    }

    if (!stockModal.classList.contains("hidden")) {
      closeModal();
    }
  }
});

loadSidebarState();
resetPreviews();
saveStocks();
renderCategories();
renderTopChips();
renderAll();