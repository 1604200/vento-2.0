const STO_STORAGE_KEY = "ahm-sto-data-v4";
const STO_SIDEBAR_KEY = "ahm-sto-sidebar-hidden-v4";
const STOCK_STORAGE_KEY = "ahm-stock-items-v5";

const CATEGORY_ORDER = ["ALL", "PWES1", "PWES2", "PWES3", "PWES4", "PWES6"];

const FALLBACK_PART_IMAGE = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 280'>
  <rect width='280' height='280' rx='24' fill='%23111111'/>
  <path d='M35 208L92 146L128 182L171 116L242 208Z' fill='white'/>
</svg>`;

const stoApp = document.getElementById("stoApp");
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
const filterPic = document.getElementById("filterPic");
const filterStockSesuai = document.getElementById("filterStockSesuai");
const filterWaktu = document.getElementById("filterWaktu");
const filterTanggal = document.getElementById("filterTanggal");
const resetFilterBtn = document.getElementById("resetFilterBtn");

const stoContent = document.getElementById("stoContent");
const detailPanel = document.getElementById("detailPanel");
const closeDetailBtn = document.getElementById("closeDetailBtn");

const detailImage = document.getElementById("detailImage");
const detailStatus = document.getElementById("detailStatus");
const detailPartNumber = document.getElementById("detailPartNumber");
const detailDescription = document.getElementById("detailDescription");
const detailStockAkhir = document.getElementById("detailStockAkhir");
const detailSeksi = document.getElementById("detailSeksi");
const detailRak = document.getElementById("detailRak");
const detailStockSesuai = document.getElementById("detailStockSesuai");
const detailWaktu = document.getElementById("detailWaktu");
const detailPic = document.getElementById("detailPic");
const detailPwes = document.getElementById("detailPwes");

const openCreateBtn = document.getElementById("openCreateBtn");
const backToIndexBtn = document.getElementById("backToIndexBtn");
const formModal = document.getElementById("formModal");
const formModalBackdrop = document.getElementById("formModalBackdrop");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const formTitle = document.getElementById("formTitle");
const stoForm = document.getElementById("stoForm");

const editIdInput = document.getElementById("editId");
const statusInput = document.getElementById("statusInput");
const pwesInput = document.getElementById("pwesInput");
const partNumberInput = document.getElementById("partNumberInput");
const descriptionInput = document.getElementById("descriptionInput");
const stockAkhirInput = document.getElementById("stockAkhirInput");
const seksiInput = document.getElementById("seksiInput");
const rakInput = document.getElementById("rakInput");
const picInput = document.getElementById("picInput");
const waktuInput = document.getElementById("waktuInput");
const stockSesuaiInput = document.getElementById("stockSesuaiInput");
const chooseYesBtn = document.getElementById("chooseYesBtn");
const chooseNoBtn = document.getElementById("chooseNoBtn");

let stoItems = loadStoItems();
let activeCategory = "ALL";
let searchTerm = "";
let filters = {
  partNumber: "",
  description: "",
  seksi: "",
  pic: "",
  stockSesuai: "",
  waktu: "",
  tanggal: ""
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
  return "sto-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function createDefaultSto(payload) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    status: payload.status,
    pwes: payload.pwes,
    partNumber: payload.partNumber,
    description: payload.description,
    stockAkhir: payload.stockAkhir,
    seksi: payload.seksi,
    rak: payload.rak,
    stockSesuai: payload.stockSesuai,
    waktu: payload.waktu || now,
    pic: payload.pic,
    createdAt: now,
    updatedAt: now
  };
}

function getDefaultStoItems() {
  return [
    createDefaultSto({
      status: "STO",
      pwes: "PWES4",
      partNumber: "CM-MTL-00261",
      description: "RING M10 LOKAL",
      stockAkhir: 0,
      seksi: "PWES4",
      rak: "R.3 3-2A",
      stockSesuai: "IYA",
      waktu: "2025-07-24T18:37",
      pic: "Imam R. R"
    }),
    createDefaultSto({
      status: "STO",
      pwes: "PWES1",
      partNumber: "CM-MTL-00261",
      description: "RING M10 LOKAL",
      stockAkhir: 14,
      seksi: "PWES1",
      rak: "R.3 3-2A",
      stockSesuai: "TIDAK",
      waktu: "2025-07-25T08:20",
      pic: "Imam R. R"
    }),
    createDefaultSto({
      status: "STO",
      pwes: "PWES2",
      partNumber: "CM-MTL-00261",
      description: "RING M10 LOKAL",
      stockAkhir: 7,
      seksi: "PWES2",
      rak: "R.3 3-2A",
      stockSesuai: "IYA",
      waktu: "2025-07-26T10:15",
      pic: "Rina A"
    })
  ];
}

function loadStoItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STO_STORAGE_KEY));
    return Array.isArray(saved) && saved.length ? saved : getDefaultStoItems();
  } catch {
    return getDefaultStoItems();
  }
}

function saveStoItems() {
  localStorage.setItem(STO_STORAGE_KEY, JSON.stringify(stoItems));
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

function getLinkedImage(partNumber, description) {
  const stock = getLinkedStock(partNumber, description);
  return stock?.imageBase64 || stock?.image || FALLBACK_PART_IMAGE;
}

function getCategoryCounts() {
  const counts = {};
  CATEGORY_ORDER.forEach((category) => {
    counts[category] = 0;
  });

  stoItems.forEach((item) => {
    const category = (item.pwes || "").toUpperCase();
    if (!counts[category]) counts[category] = 0;
    counts[category] += 1;
  });

  counts.ALL = stoItems.length;
  return counts;
}

function getAllCategories() {
  const categories = new Set(CATEGORY_ORDER);
  stoItems.forEach((item) => {
    categories.add(String(item.pwes || "").toUpperCase());
  });
  return Array.from(categories).filter(Boolean);
}

function getUniqueValues(fieldName) {
  return [...new Set(
    stoItems.map((item) => String(item[fieldName] || "").trim()).filter(Boolean)
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
  fillSelect(filterPic, "PIC", getUniqueValues("pic"), filters.pic);
  filterStockSesuai.value = filters.stockSesuai;
  filterWaktu.value = filters.waktu;
  filterTanggal.value = filters.tanggal;
}

function renderCategories() {
  const counts = getCategoryCounts();
  const categories = getAllCategories();
  categoryList.innerHTML = "";

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `sto-category-btn ${activeCategory === category ? "active" : ""}`;
    btn.innerHTML = `
      <span>${escapeHtml(category)}</span>
      <span class="sto-category-count">${counts[category] || 0}</span>
    `;

    btn.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderTopRecordChips();
      renderTable();
    });

    categoryList.appendChild(btn);
  });
}

function renderTopRecordChips() {
  const counts = getCategoryCounts();
  topRecordChips.innerHTML = "";

  CATEGORY_ORDER.forEach((category) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `sto-record-chip ${activeCategory === category ? "active" : ""}`;
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

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return value;
  }
}

function isWithinDays(dateValue, days) {
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return false;

  const now = new Date();
  const diff = now.getTime() - target.getTime();
  const max = days * 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= max;
}

function isToday(dateValue) {
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return false;

  const now = new Date();
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
}

function matchesDate(dateValue, yyyyMmDd) {
  if (!dateValue || !yyyyMmDd) return true;
  try {
    return new Date(dateValue).toISOString().slice(0, 10) === yyyyMmDd;
  } catch {
    return false;
  }
}

function getFilteredItems() {
  return stoItems.filter((item) => {
    const matchCategory =
      activeCategory === "ALL" ||
      (item.pwes || "").toUpperCase() === activeCategory;

    const q = searchTerm.toLowerCase();
    const matchSearch =
      !q ||
      String(item.status || "").toLowerCase().includes(q) ||
      String(item.partNumber || "").toLowerCase().includes(q) ||
      String(item.description || "").toLowerCase().includes(q) ||
      String(item.seksi || "").toLowerCase().includes(q) ||
      String(item.rak || "").toLowerCase().includes(q) ||
      String(item.pic || "").toLowerCase().includes(q) ||
      String(item.pwes || "").toLowerCase().includes(q);

    const matchPartNumber = !filters.partNumber || item.partNumber === filters.partNumber;
    const matchDescription = !filters.description || item.description === filters.description;
    const matchSeksi = !filters.seksi || item.seksi === filters.seksi;
    const matchPic = !filters.pic || item.pic === filters.pic;
    const matchStockSesuai = !filters.stockSesuai || item.stockSesuai === filters.stockSesuai;

    let matchWaktu = true;
    if (filters.waktu === "today") matchWaktu = isToday(item.waktu);
    if (filters.waktu === "7days") matchWaktu = isWithinDays(item.waktu, 7);
    if (filters.waktu === "30days") matchWaktu = isWithinDays(item.waktu, 30);

    const matchTanggal = !filters.tanggal || matchesDate(item.waktu, filters.tanggal);

    return (
      matchCategory &&
      matchSearch &&
      matchPartNumber &&
      matchDescription &&
      matchSeksi &&
      matchPic &&
      matchStockSesuai &&
      matchWaktu &&
      matchTanggal
    );
  });
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
    const row = fragment.querySelector(".sto-row");

    fragment.querySelector(".col-status").innerHTML = `
      <span class="status-symbol">${item.stockSesuai === "IYA" ? "✔" : "✖"}</span>
      <span>${escapeHtml(item.status)}</span>
    `;

    fragment.querySelector(".col-part-number").textContent = item.partNumber;
    fragment.querySelector(".col-description").textContent = item.description;
    fragment.querySelector(".col-stock-akhir").textContent = item.stockAkhir;
    fragment.querySelector(".col-seksi").textContent = item.seksi;
    fragment.querySelector(".col-rak").textContent = item.rak;

    fragment.querySelector(".col-stock-sesuai").innerHTML = item.stockSesuai === "IYA"
      ? `<span class="stock-icon stock-icon--yes">✔</span>`
      : `<span class="stock-icon stock-icon--no">✖</span>`;

    fragment.querySelector(".col-waktu").textContent = formatDateTime(item.waktu);
    fragment.querySelector(".col-pic").textContent = item.pic;

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

function openDetail(id) {
  const item = stoItems.find((entry) => entry.id === id);
  if (!item) return;

  detailImage.src = getLinkedImage(item.partNumber, item.description);
  detailStatus.textContent = item.status || "-";
  detailPartNumber.textContent = item.partNumber || "-";
  detailDescription.textContent = item.description || "-";
  detailStockAkhir.textContent = item.stockAkhir ?? "-";
  detailSeksi.textContent = item.seksi || "-";
  detailRak.textContent = item.rak || "-";
  detailStockSesuai.textContent = item.stockSesuai || "-";
  detailWaktu.textContent = formatDateTime(item.waktu);
  detailPic.textContent = item.pic || "-";
  detailPwes.textContent = item.pwes || "-";

  stoContent.classList.add("hidden");
  detailPanel.classList.remove("hidden");
}

function closeDetail() {
  detailPanel.classList.add("hidden");
  stoContent.classList.remove("hidden");
}

function updateBinaryButtons() {
  const value = stockSesuaiInput.value;
  chooseYesBtn.classList.toggle("active", value === "IYA");
  chooseNoBtn.classList.toggle("active", value === "TIDAK");
}

function setBinaryValue(value) {
  stockSesuaiInput.value = value;
  updateBinaryButtons();
}

function openCreateForm() {
  formTitle.textContent = "Tambah Data STO";
  editIdInput.value = "";
  stoForm.reset();
  stockSesuaiInput.value = "";
  updateBinaryButtons();

  const now = new Date();
  const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  waktuInput.value = isoLocal;

  formModal.classList.remove("hidden");
}

function openEditForm(id) {
  const item = stoItems.find((entry) => entry.id === id);
  if (!item) return;

  formTitle.textContent = "Edit Data STO";
  editIdInput.value = item.id;
  statusInput.value = item.status || "STO";
  pwesInput.value = item.pwes || "";
  partNumberInput.value = item.partNumber || "";
  descriptionInput.value = item.description || "";
  stockAkhirInput.value = item.stockAkhir ?? 0;
  seksiInput.value = item.seksi || "";
  rakInput.value = item.rak || "";
  picInput.value = item.pic || "";
  waktuInput.value = item.waktu ? String(item.waktu).slice(0, 16) : "";
  stockSesuaiInput.value = item.stockSesuai || "";
  updateBinaryButtons();

  formModal.classList.remove("hidden");
}

function closeForm() {
  formModal.classList.add("hidden");
  stoForm.reset();
  editIdInput.value = "";
  stockSesuaiInput.value = "";
  updateBinaryButtons();
}

function submitForm(event) {
  event.preventDefault();

  const payload = {
    status: statusInput.value.trim(),
    pwes: pwesInput.value.trim().toUpperCase(),
    partNumber: partNumberInput.value.trim(),
    description: descriptionInput.value.trim(),
    stockAkhir: Number(stockAkhirInput.value || 0),
    seksi: seksiInput.value.trim(),
    rak: rakInput.value.trim(),
    stockSesuai: stockSesuaiInput.value.trim(),
    waktu: waktuInput.value,
    pic: picInput.value.trim()
  };

  if (!payload.stockSesuai) {
    showToast("Pilih IYA atau TIDAK untuk Stock Sesuai.", "error");
    return;
  }

  if (!payload.partNumber || !payload.description || !payload.pwes) {
    showToast("Lengkapi data STO terlebih dahulu.", "error");
    return;
  }

  const editId = editIdInput.value;
  const now = new Date().toISOString();

  if (!editId) {
    stoItems.unshift({
      id: generateId(),
      ...payload,
      createdAt: now,
      updatedAt: now
    });
    showToast("Data STO berhasil ditambahkan.", "success");
  } else {
    stoItems = stoItems.map((item) => {
      if (item.id !== editId) return item;
      return {
        ...item,
        ...payload,
        updatedAt: now
      };
    });
    showToast("Data STO berhasil diperbarui.", "success");
  }

  saveStoItems();
  populateFilterOptions();
  renderCategories();
  renderTopRecordChips();
  renderTable();
  closeForm();
}

function loadSidebarState() {
  const hidden = localStorage.getItem(STO_SIDEBAR_KEY) === "true";
  stoApp.classList.toggle("sidebar-hidden", hidden);
  updateSidebarSymbol();
}

function updateSidebarSymbol() {
  const hidden = stoApp.classList.contains("sidebar-hidden");
  toggleSidebarSymbol.textContent = hidden ? ">" : "<";
}

function toggleSidebar() {
  const hidden = stoApp.classList.toggle("sidebar-hidden");
  localStorage.setItem(STO_SIDEBAR_KEY, String(hidden));
  updateSidebarSymbol();
}

function resetFilters() {
  filters = {
    partNumber: "",
    description: "",
    seksi: "",
    pic: "",
    stockSesuai: "",
    waktu: "",
    tanggal: ""
  };
  populateFilterOptions();
  renderTable();
  showToast("Filter direset.", "info");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

filterPic.addEventListener("change", (e) => {
  filters.pic = e.target.value;
  renderTable();
});

filterStockSesuai.addEventListener("change", (e) => {
  filters.stockSesuai = e.target.value;
  renderTable();
});

filterWaktu.addEventListener("change", (e) => {
  filters.waktu = e.target.value;
  renderTable();
});

filterTanggal.addEventListener("change", (e) => {
  filters.tanggal = e.target.value;
  renderTable();
});

resetFilterBtn.addEventListener("click", resetFilters);

toggleSidebarBtn.addEventListener("click", toggleSidebar);
openCreateBtn.addEventListener("click", openCreateForm);
closeFormBtn.addEventListener("click", closeForm);
cancelFormBtn.addEventListener("click", closeForm);
formModalBackdrop.addEventListener("click", closeForm);
stoForm.addEventListener("submit", submitForm);

chooseYesBtn.addEventListener("click", () => setBinaryValue("IYA"));
chooseNoBtn.addEventListener("click", () => setBinaryValue("TIDAK"));

closeDetailBtn.addEventListener("click", closeDetail);

backToIndexBtn.addEventListener("click", () => {
  window.location.href = "index.html";
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