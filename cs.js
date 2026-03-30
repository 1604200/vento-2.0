const CS_STORAGE_KEY = "ahm-cs-data-v6";
const CS_SIDEBAR_KEY = "ahm-cs-sidebar-hidden-v6";
const STOCK_STORAGE_KEY = "ahm-stock-items-v5";

const CATEGORY_ORDER = ["ALL", "PEWE0", "PEWE1", "PEWE2", "PEWE3", "PEWE4", "PEWE6"];

const FALLBACK_PART_IMAGE = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 280'>
  <rect width='280' height='280' rx='24' fill='%23111111'/>
  <path d='M35 208L92 146L128 182L171 116L242 208Z' fill='white'/>
</svg>`;

const FALLBACK_BARCODE = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 120'>
  <rect width='280' height='120' fill='white'/>
  <rect x='18' y='10' width='8' height='100' fill='black'/>
  <rect x='31' y='10' width='4' height='100' fill='black'/>
  <rect x='40' y='10' width='12' height='100' fill='black'/>
  <rect x='58' y='10' width='6' height='100' fill='black'/>
  <rect x='70' y='10' width='10' height='100' fill='black'/>
  <rect x='88' y='10' width='4' height='100' fill='black'/>
  <rect x='99' y='10' width='14' height='100' fill='black'/>
  <rect x='118' y='10' width='6' height='100' fill='black'/>
  <rect x='130' y='10' width='9' height='100' fill='black'/>
  <rect x='146' y='10' width='4' height='100' fill='black'/>
  <rect x='156' y='10' width='15' height='100' fill='black'/>
  <rect x='178' y='10' width='7' height='100' fill='black'/>
  <rect x='190' y='10' width='12' height='100' fill='black'/>
  <rect x='208' y='10' width='5' height='100' fill='black'/>
  <rect x='219' y='10' width='16' height='100' fill='black'/>
  <rect x='242' y='10' width='9' height='100' fill='black'/>
</svg>`;

const csApp = document.getElementById("csApp");
const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
const toggleSidebarSymbol = document.getElementById("toggleSidebarSymbol");
const categoryList = document.getElementById("categoryList");
const topRecordChips = document.getElementById("topRecordChips");
const searchInput = document.getElementById("searchInput");
const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const rowTemplate = document.getElementById("rowTemplate");

const filterPartNumber = document.getElementById("filterPartNumber");
const filterDescription = document.getElementById("filterDescription");
const filterSeksi = document.getElementById("filterSeksi");
const filterStatusPn = document.getElementById("filterStatusPn");
const filterStockSesuai = document.getElementById("filterStockSesuai");
const filterKategoriPn = document.getElementById("filterKategoriPn");
const resetFilterBtn = document.getElementById("resetFilterBtn");

const csContent = document.getElementById("csContent");
const detailPanel = document.getElementById("detailPanel");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const detailImage = document.getElementById("detailImage");
const detailBarcodeImage = document.getElementById("detailBarcodeImage");
const detailInfo = document.getElementById("detailInfo");

const openCreateBtn = document.getElementById("openCreateBtn");
const backToIndexBtn = document.getElementById("backToIndexBtn");
const formModal = document.getElementById("formModal");
const formModalBackdrop = document.getElementById("formModalBackdrop");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const formTitle = document.getElementById("formTitle");
const csForm = document.getElementById("csForm");

const editIdInput = document.getElementById("editId");
const partNumberInput = document.getElementById("partNumberInput");
const stoInput = document.getElementById("stoInput");
const descriptionInput = document.getElementById("descriptionInput");
const satuanInput = document.getElementById("satuanInput");
const hargaInput = document.getElementById("hargaInput");
const stockAkhirInput = document.getElementById("stockAkhirInput");
const seksiInput = document.getElementById("seksiInput");
const lokasiInput = document.getElementById("lokasiInput");
const statusPnInput = document.getElementById("statusPnInput");
const qrCodeInput = document.getElementById("qrCodeInput");
const fotoInput = document.getElementById("fotoInput");
const barcodeInput = document.getElementById("barcodeInput");
const gradeInput = document.getElementById("gradeInput");
const terakhirStoInput = document.getElementById("terakhirStoInput");
const stockSesuaiInput = document.getElementById("stockSesuaiInput");
const noteStoInput = document.getElementById("noteStoInput");
const levelStockInput = document.getElementById("levelStockInput");
const stockAwalInput = document.getElementById("stockAwalInput");
const srdInput = document.getElementById("srdInput");
const stockMasukInput = document.getElementById("stockMasukInput");
const stockKeluarInput = document.getElementById("stockKeluarInput");
const statusStockInput = document.getElementById("statusStockInput");
const typeInput = document.getElementById("typeInput");
const groupInput = document.getElementById("groupInput");
const lamaOrderInput = document.getElementById("lamaOrderInput");
const efekKerusakanInput = document.getElementById("efekKerusakanInput");
const waktuPenggantiInput = document.getElementById("waktuPenggantiInput");
const lemariInput = document.getElementById("lemariInput");
const kategoriPnInput = document.getElementById("kategoriPnInput");

let csItems = loadCsItems();
let activeCategory = "ALL";
let searchTerm = "";
let filters = {
  partNumber: "",
  description: "",
  seksi: "",
  statusPn: "",
  stockSesuai: "",
  kategoriPn: ""
};

function showToast(message, type = "success") {
  const stack = document.getElementById("globalToast");
  if (!stack) return;
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function generateId() {
  return "cs-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function calculateStockAkhir(stockAwal, stockMasuk, stockKeluar) {
  const result = toNumber(stockAwal) + toNumber(stockMasuk) - toNumber(stockKeluar);
  return result < 0 ? 0 : result;
}

function calculateLevelStock(stockAkhir) {
  const stock = toNumber(stockAkhir);
  if (stock < 10) return "MINIMUM";
  if (stock < 20) return "AMAN";
  return "FULL";
}

function calculateStatusStock(stockAkhir) {
  const stock = toNumber(stockAkhir);
  if (stock < 10) return "PERLU CEK";
  return "NORMAL";
}

function createDefaultItem(payload) {
  const now = new Date().toISOString();
  const stockAwal = toNumber(payload.stockAwal || 0);
  const stockMasuk = toNumber(payload.stockMasuk || 0);
  const stockKeluar = toNumber(payload.stockKeluar || 0);
  const stockAkhir = calculateStockAkhir(stockAwal, stockMasuk, stockKeluar);

  return {
    id: generateId(),
    partNumber: payload.partNumber || "",
    sto: payload.sto || "",
    description: payload.description || "",
    satuan: payload.satuan || "",
    harga: toNumber(payload.harga || 0),
    stockAkhir,
    seksi: payload.seksi || "",
    lokasi: payload.lokasi || "",
    statusPn: payload.statusPn || "",
    qrCode: payload.qrCode || payload.partNumber || "",
    foto: payload.foto || "",
    barcodeFile: payload.barcodeFile || "",
    grade: payload.grade || "",
    terakhirSto: payload.terakhirSto || "",
    stockSesuai: payload.stockSesuai || "",
    noteSto: payload.noteSto || "",
    levelStock: payload.levelStock || calculateLevelStock(stockAkhir),
    stockAwal,
    srd: payload.srd || "",
    stockMasuk,
    stockKeluar,
    statusStock: payload.statusStock || calculateStatusStock(stockAkhir),
    type: payload.type || "",
    group: payload.group || "",
    lamaOrder: payload.lamaOrder || "",
    efekKerusakan: payload.efekKerusakan || "",
    waktuPengganti: payload.waktuPengganti || "",
    lemari: payload.lemari || "",
    kategoriPn: payload.kategoriPn || "",
    createdAt: now,
    updatedAt: now
  };
}

function getDefaultItems() {
  return [
    createDefaultItem({
      partNumber: "CM-MTL-00261",
      sto: "STO",
      description: "RING M10 LOKAL",
      satuan: "PCS",
      harga: 1200,
      seksi: "PEWE1",
      lokasi: "Rak A1",
      statusPn: "AKTIF",
      grade: "A",
      terakhirSto: "2026-03-25T08:00",
      stockSesuai: "IYA",
      noteSto: "-",
      stockAwal: 20,
      srd: "SRD-001",
      stockMasuk: 3,
      stockKeluar: 15,
      type: "LOCAL",
      group: "FASTENER",
      lamaOrder: "3 Hari",
      efekKerusakan: "RENDAH",
      waktuPengganti: "1 Hari",
      lemari: "L1",
      kategoriPn: "MECHANICAL"
    }),
    createDefaultItem({
      partNumber: "CM-MTL-00888",
      sto: "STO",
      description: "BOLT M8",
      satuan: "PCS",
      harga: 5000,
      seksi: "PEWE3",
      lokasi: "Rak B2",
      statusPn: "AKTIF",
      grade: "B",
      terakhirSto: "2026-03-24T09:20",
      stockSesuai: "TIDAK",
      noteSto: "Selisih 2",
      stockAwal: 12,
      srd: "SRD-007",
      stockMasuk: 1,
      stockKeluar: 6,
      type: "IMPORT",
      group: "FASTENER",
      lamaOrder: "14 Hari",
      efekKerusakan: "SEDANG",
      waktuPengganti: "7 Hari",
      lemari: "L3",
      kategoriPn: "HARDWARE"
    })
  ];
}

function normalizeSavedItem(item) {
  if (!item || typeof item !== "object") return null;

  const stockAwal = toNumber(item.stockAwal || 0);
  const stockMasuk = toNumber(item.stockMasuk || 0);
  const stockKeluar = toNumber(item.stockKeluar || 0);
  const stockAkhir = calculateStockAkhir(stockAwal, stockMasuk, stockKeluar);

  return {
    ...item,
    stockAwal,
    stockMasuk,
    stockKeluar,
    stockAkhir,
    harga: toNumber(item.harga || 0),
    levelStock: calculateLevelStock(stockAkhir),
    statusStock: calculateStatusStock(stockAkhir)
  };
}

function loadCsItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(CS_STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved.map(normalizeSavedItem).filter(Boolean);
    }
    return getDefaultItems();
  } catch {
    return getDefaultItems();
  }
}

function saveCsItems() {
  localStorage.setItem(CS_STORAGE_KEY, JSON.stringify(csItems));
}

function loadStockItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getLinkedStock(partNumber, description) {
  const stockItems = loadStockItems();
  const normalizedPart = normalizeText(partNumber);
  const normalizedDesc = normalizeText(description);

  return stockItems.find((item) => {
    const stockPart = normalizeText(item.partNumber || item.partNumberText || item.code || "");
    const stockName = normalizeText(item.name || item.stockName || item.description || "");
    return stockPart === normalizedPart || stockName === normalizedDesc || stockName === normalizedPart;
  });
}

function getLinkedAssets(partNumber, description, manualPhoto = "", manualBarcode = "") {
  const stock = getLinkedStock(partNumber, description);

  return {
    image: manualPhoto || stock?.imageBase64 || stock?.image || FALLBACK_PART_IMAGE,
    barcode: manualBarcode || stock?.barcodeBase64 || stock?.barcodeImage || FALLBACK_BARCODE
  };
}

function loadSidebarState() {
  const hidden = localStorage.getItem(CS_SIDEBAR_KEY) === "true";
  csApp.classList.toggle("sidebar-hidden", hidden);
  updateSidebarSymbol();
}

function updateSidebarSymbol() {
  const hidden = csApp.classList.contains("sidebar-hidden");
  toggleSidebarSymbol.textContent = hidden ? ">" : "<";
}

function toggleSidebar() {
  const hidden = csApp.classList.toggle("sidebar-hidden");
  localStorage.setItem(CS_SIDEBAR_KEY, String(hidden));
  updateSidebarSymbol();
}

function getCategoryCounts() {
  const counts = {};
  CATEGORY_ORDER.forEach((category) => {
    counts[category] = 0;
  });

  csItems.forEach((item) => {
    const category = String(item.seksi || "").toUpperCase();
    if (!counts[category]) counts[category] = 0;
    counts[category] += 1;
  });

  counts.ALL = csItems.length;
  return counts;
}

function renderCategories() {
  const counts = getCategoryCounts();
  categoryList.innerHTML = "";

  CATEGORY_ORDER.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `cs-category-btn ${activeCategory === category ? "active" : ""}`;
    button.innerHTML = `
      <span>${category}</span>
      <span class="cs-category-count">${counts[category] || 0}</span>
    `;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderTopRecordChips();
      renderTable();
    });
    categoryList.appendChild(button);
  });
}

function renderTopRecordChips() {
  const counts = getCategoryCounts();
  topRecordChips.innerHTML = "";

  CATEGORY_ORDER.forEach((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `cs-record-chip ${activeCategory === category ? "active" : ""}`;
    chip.textContent = `${category}: ${counts[category] || 0}`;
    chip.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderTopRecordChips();
      renderTable();
    });
    topRecordChips.appendChild(chip);
  });
}

function getUniqueValues(fieldName) {
  return [...new Set(
    csItems.map((item) => String(item[fieldName] || "").trim()).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function fillSelect(selectEl, firstLabel, values, currentValue) {
  selectEl.innerHTML = "";
  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = firstLabel;
  selectEl.appendChild(firstOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === currentValue) option.selected = true;
    selectEl.appendChild(option);
  });
}

function populateFilterOptions() {
  fillSelect(filterPartNumber, "Part Number", getUniqueValues("partNumber"), filters.partNumber);
  fillSelect(filterDescription, "Deskripsi", getUniqueValues("description"), filters.description);
  fillSelect(filterSeksi, "Seksi", getUniqueValues("seksi"), filters.seksi);
  fillSelect(filterStatusPn, "Status PN", getUniqueValues("statusPn"), filters.statusPn);
  fillSelect(filterKategoriPn, "Kategori PN", getUniqueValues("kategoriPn"), filters.kategoriPn);
  filterStockSesuai.value = filters.stockSesuai;
}

function getFilteredItems() {
  return csItems.filter((item) => {
    const matchCategory =
      activeCategory === "ALL" ||
      String(item.seksi || "").toUpperCase() === activeCategory;

    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      String(item.partNumber || "").toLowerCase().includes(q) ||
      String(item.description || "").toLowerCase().includes(q) ||
      String(item.kategoriPn || "").toLowerCase().includes(q) ||
      String(item.statusPn || "").toLowerCase().includes(q);

    const matchPartNumber = !filters.partNumber || item.partNumber === filters.partNumber;
    const matchDescription = !filters.description || item.description === filters.description;
    const matchSeksi = !filters.seksi || item.seksi === filters.seksi;
    const matchStatusPn = !filters.statusPn || item.statusPn === filters.statusPn;
    const matchStockSesuai = !filters.stockSesuai || item.stockSesuai === filters.stockSesuai;
    const matchKategoriPn = !filters.kategoriPn || item.kategoriPn === filters.kategoriPn;

    return (
      matchCategory &&
      matchSearch &&
      matchPartNumber &&
      matchDescription &&
      matchSeksi &&
      matchStatusPn &&
      matchStockSesuai &&
      matchKategoriPn
    );
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return value;
  }
}

function money(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function createEditIcon() {
  return `
    <button type="button" class="edit-icon-btn" aria-label="Edit">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
      </svg>
    </button>
  `;
}

function renderTable() {
  const items = getFilteredItems();
  tableBody.innerHTML = "";

  if (!items.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  items.forEach((item) => {
    const fragment = rowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".cs-row");
    const assets = getLinkedAssets(item.partNumber, item.description, item.foto, item.barcodeFile);
    const totalHarga = Number(item.harga || 0) * Number(item.stockAkhir || 0);

    fragment.querySelector(".col-partNumber").textContent = item.partNumber || "-";
    fragment.querySelector(".col-sto").textContent = item.sto || "-";
    fragment.querySelector(".col-description").textContent = item.description || "-";
    fragment.querySelector(".col-satuan").textContent = item.satuan || "-";
    fragment.querySelector(".col-harga").textContent = money(item.harga);
    fragment.querySelector(".col-stockAkhir").textContent = item.stockAkhir ?? 0;
    fragment.querySelector(".col-totalHarga").textContent = money(totalHarga);
    fragment.querySelector(".col-seksi").textContent = item.seksi || "-";
    fragment.querySelector(".col-lokasi").textContent = item.lokasi || "-";
    fragment.querySelector(".col-statusPn").textContent = item.statusPn || "-";
    fragment.querySelector(".col-qrCode").textContent = item.qrCode || item.partNumber || "-";
    fragment.querySelector(".col-foto").innerHTML = `<img src="${assets.image}" alt="foto">`;
    fragment.querySelector(".col-grade").textContent = item.grade || "-";
    fragment.querySelector(".col-terakhirSto").textContent = formatDateTime(item.terakhirSto);
    fragment.querySelector(".col-stockSesuai").textContent = item.stockSesuai || "-";
    fragment.querySelector(".col-noteSto").textContent = item.noteSto || "-";
    fragment.querySelector(".col-levelStock").textContent = item.levelStock || "-";
    fragment.querySelector(".col-stockAwal").textContent = item.stockAwal ?? 0;
    fragment.querySelector(".col-srd").textContent = item.srd || "-";
    fragment.querySelector(".col-stockMasuk").textContent = item.stockMasuk ?? 0;
    fragment.querySelector(".col-stockKeluar").textContent = item.stockKeluar ?? 0;
    fragment.querySelector(".col-statusStock").textContent = item.statusStock || "-";
    fragment.querySelector(".col-type").textContent = item.type || "-";
    fragment.querySelector(".col-group").textContent = item.group || "-";
    fragment.querySelector(".col-lamaOrder").textContent = item.lamaOrder || "-";
    fragment.querySelector(".col-efekKerusakan").textContent = item.efekKerusakan || "-";
    fragment.querySelector(".col-waktuPengganti").textContent = item.waktuPengganti || "-";
    fragment.querySelector(".col-lemari").textContent = item.lemari || "-";
    fragment.querySelector(".col-kategoriPn").textContent = item.kategoriPn || "-";

    const editCell = fragment.querySelector(".col-edit");
    editCell.innerHTML = createEditIcon();
    editCell.querySelector(".edit-icon-btn").addEventListener("click", (event) => {
      event.stopPropagation();
      openEditForm(item.id);
    });

    row.addEventListener("click", () => openDetail(item.id));
    tableBody.appendChild(fragment);
  });
}

function detailRow(label, value) {
  return `
    <div class="detail-row">
      <span>${label}</span>
      <strong>${value || "-"}</strong>
    </div>
  `;
}

function openDetail(id) {
  const item = csItems.find((entry) => entry.id === id);
  if (!item) return;

  const assets = getLinkedAssets(item.partNumber, item.description, item.foto, item.barcodeFile);
  detailImage.src = assets.image;
  detailBarcodeImage.src = assets.barcode;

  const totalHarga = Number(item.harga || 0) * Number(item.stockAkhir || 0);

  detailInfo.innerHTML = [
    detailRow("Part Number", item.partNumber),
    detailRow("STO", item.sto),
    detailRow("Deskripsi", item.description),
    detailRow("Satuan", item.satuan),
    detailRow("Harga", money(item.harga)),
    detailRow("Stock Akhir", item.stockAkhir),
    detailRow("Total Harga", money(totalHarga)),
    detailRow("Seksi", item.seksi),
    detailRow("Lokasi", item.lokasi),
    detailRow("Status PN", item.statusPn),
    detailRow("QR Code", item.qrCode || item.partNumber),
    detailRow("Grade", item.grade),
    detailRow("Terakhir STO", formatDateTime(item.terakhirSto)),
    detailRow("Stock Sesuai", item.stockSesuai),
    detailRow("Note STO", item.noteSto),
    detailRow("Level Stock", item.levelStock),
    detailRow("Stock Awal", item.stockAwal),
    detailRow("SRD", item.srd),
    detailRow("Stock Masuk", item.stockMasuk),
    detailRow("Stock Keluar", item.stockKeluar),
    detailRow("Status Stock", item.statusStock),
    detailRow("Type", item.type),
    detailRow("Group", item.group),
    detailRow("Lama Order", item.lamaOrder),
    detailRow("Efek Kerusakan", item.efekKerusakan),
    detailRow("Waktu Pengganti", item.waktuPengganti),
    detailRow("Lemari", item.lemari),
    detailRow("Kategori PN", item.kategoriPn)
  ].join("");

  csContent.classList.add("hidden");
  detailPanel.classList.remove("hidden");
}

function closeDetail() {
  detailPanel.classList.add("hidden");
  csContent.classList.remove("hidden");
}

function openCreateForm() {
  formTitle.textContent = "Tambah Data CHECK STOCK";
  editIdInput.value = "";
  csForm.reset();
  stockAkhirInput.value = 0;
  levelStockInput.value = calculateLevelStock(0);
  statusStockInput.value = calculateStatusStock(0);
  formModal.classList.remove("hidden");
}

function openEditForm(id) {
  const item = csItems.find((entry) => entry.id === id);
  if (!item) return;

  formTitle.textContent = "Edit Data CHECK STOCK";
  editIdInput.value = item.id;
  partNumberInput.value = item.partNumber || "";
  stoInput.value = item.sto || "";
  descriptionInput.value = item.description || "";
  satuanInput.value = item.satuan || "";
  hargaInput.value = item.harga ?? 0;
  stockAkhirInput.value = item.stockAkhir ?? 0;
  seksiInput.value = item.seksi || "";
  lokasiInput.value = item.lokasi || "";
  statusPnInput.value = item.statusPn || "";
  qrCodeInput.value = item.qrCode || "";
  fotoInput.value = item.foto || "";
  barcodeInput.value = item.barcodeFile || "";
  gradeInput.value = item.grade || "";
  terakhirStoInput.value = item.terakhirSto ? String(item.terakhirSto).slice(0, 16) : "";
  stockSesuaiInput.value = item.stockSesuai || "";
  noteStoInput.value = item.noteSto || "";
  levelStockInput.value = item.levelStock || "";
  stockAwalInput.value = item.stockAwal ?? 0;
  srdInput.value = item.srd || "";
  stockMasukInput.value = item.stockMasuk ?? 0;
  stockKeluarInput.value = item.stockKeluar ?? 0;
  statusStockInput.value = item.statusStock || "";
  typeInput.value = item.type || "";
  groupInput.value = item.group || "";
  lamaOrderInput.value = item.lamaOrder || "";
  efekKerusakanInput.value = item.efekKerusakan || "";
  waktuPenggantiInput.value = item.waktuPengganti || "";
  lemariInput.value = item.lemari || "";
  kategoriPnInput.value = item.kategoriPn || "";

  updateCalculatedFields();
  formModal.classList.remove("hidden");
}

function closeForm() {
  formModal.classList.add("hidden");
  csForm.reset();
  editIdInput.value = "";
}

function updateCalculatedFields() {
  const stockAwal = toNumber(stockAwalInput.value || 0);
  const stockMasuk = toNumber(stockMasukInput.value || 0);
  const stockKeluar = toNumber(stockKeluarInput.value || 0);

  const stockAkhir = calculateStockAkhir(stockAwal, stockMasuk, stockKeluar);
  const levelStock = calculateLevelStock(stockAkhir);
  const statusStock = calculateStatusStock(stockAkhir);

  stockAkhirInput.value = stockAkhir;
  levelStockInput.value = levelStock;
  statusStockInput.value = statusStock;
}

function submitForm(event) {
  event.preventDefault();

  const stockAwal = toNumber(stockAwalInput.value || 0);
  const stockMasuk = toNumber(stockMasukInput.value || 0);
  const stockKeluar = toNumber(stockKeluarInput.value || 0);
  const stockAkhir = calculateStockAkhir(stockAwal, stockMasuk, stockKeluar);
  const levelStock = calculateLevelStock(stockAkhir);
  const statusStock = calculateStatusStock(stockAkhir);

  const payload = {
    partNumber: partNumberInput.value.trim(),
    sto: stoInput.value.trim(),
    description: descriptionInput.value.trim(),
    satuan: satuanInput.value.trim(),
    harga: toNumber(hargaInput.value || 0),
    stockAkhir,
    seksi: seksiInput.value.trim().toUpperCase(),
    lokasi: lokasiInput.value.trim(),
    statusPn: statusPnInput.value.trim(),
    qrCode: qrCodeInput.value.trim() || partNumberInput.value.trim(),
    foto: fotoInput.value.trim(),
    barcodeFile: barcodeInput.value.trim(),
    grade: gradeInput.value.trim(),
    terakhirSto: terakhirStoInput.value,
    stockSesuai: stockSesuaiInput.value.trim(),
    noteSto: noteStoInput.value.trim(),
    levelStock,
    stockAwal,
    srd: srdInput.value.trim(),
    stockMasuk,
    stockKeluar,
    statusStock,
    type: typeInput.value.trim(),
    group: groupInput.value.trim(),
    lamaOrder: lamaOrderInput.value.trim(),
    efekKerusakan: efekKerusakanInput.value.trim(),
    waktuPengganti: waktuPenggantiInput.value.trim(),
    lemari: lemariInput.value.trim(),
    kategoriPn: kategoriPnInput.value.trim()
  };

  if (!payload.partNumber || !payload.description || !payload.seksi) {
    showToast("Part Number, Deskripsi, dan Seksi wajib diisi.", "error");
    return;
  }

  const editId = editIdInput.value;
  const now = new Date().toISOString();

  if (!editId) {
    csItems.unshift({
      id: generateId(),
      ...payload,
      createdAt: now,
      updatedAt: now
    });
    showToast("Baris baru berhasil ditambahkan.", "success");
  } else {
    csItems = csItems.map((item) => {
      if (item.id !== editId) return item;
      return {
        ...item,
        ...payload,
        updatedAt: now
      };
    });
    showToast("Data berhasil diupdate.", "success");
  }

  saveCsItems();
  populateFilterOptions();
  renderCategories();
  renderTopRecordChips();
  renderTable();
  closeForm();
}

function resetFilters() {
  filters = {
    partNumber: "",
    description: "",
    seksi: "",
    statusPn: "",
    stockSesuai: "",
    kategoriPn: ""
  };
  populateFilterOptions();
  renderTable();
  showToast("Filter direset.", "info");
}

toggleSidebarBtn.addEventListener("click", toggleSidebar);
openCreateBtn.addEventListener("click", openCreateForm);
closeFormBtn.addEventListener("click", closeForm);
cancelFormBtn.addEventListener("click", closeForm);
formModalBackdrop.addEventListener("click", closeForm);
csForm.addEventListener("submit", submitForm);

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderTable();
});

filterPartNumber.addEventListener("change", (e) => {
  filters.partNumber = e.target.value;
  renderTable();
});

filterDescription.addEventListener("change", (e) => {
  filters.description = e.target.value;
  renderTable();
});

filterSeksi.addEventListener("change", (e) => {
  filters.seksi = e.target.value;
  renderTable();
});

filterStatusPn.addEventListener("change", (e) => {
  filters.statusPn = e.target.value;
  renderTable();
});

filterStockSesuai.addEventListener("change", (e) => {
  filters.stockSesuai = e.target.value;
  renderTable();
});

filterKategoriPn.addEventListener("change", (e) => {
  filters.kategoriPn = e.target.value;
  renderTable();
});

resetFilterBtn.addEventListener("click", resetFilters);

closeDetailBtn.addEventListener("click", closeDetail);
backToIndexBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

[stockAwalInput, stockMasukInput, stockKeluarInput].forEach((input) => {
  input.addEventListener("input", updateCalculatedFields);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!formModal.classList.contains("hidden")) closeForm();
    if (!detailPanel.classList.contains("hidden")) closeDetail();
  }
});

loadSidebarState();
populateFilterOptions();
renderCategories();
renderTopRecordChips();
renderTable();