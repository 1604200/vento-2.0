const CS_STORAGE_KEY = "ahm-cs-data-v6";

const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const rowTemplate = document.getElementById("pcRowTemplate");

const searchInput = document.getElementById("searchInput");
const filterSeksi = document.getElementById("filterSeksi");
const filterStatusPn = document.getElementById("filterStatusPn");
const filterKategoriPn = document.getElementById("filterKategoriPn");
const resetFilterBtn = document.getElementById("resetFilterBtn");

const needCount = document.getElementById("needCount");
const downloadBtn = document.getElementById("downloadBtn");
const backToIndexBtn = document.getElementById("backToIndexBtn");

let pcItems = [];
let searchTerm = "";
let filters = {
  seksi: "ALL",
  statusPn: "ALL",
  kategoriPn: "ALL"
};

function showToast(message, type = "success") {
  const stack = document.getElementById("pcToast");
  if (!stack) return;

  const toast = document.createElement("div");
  toast.className = `pc-toast pc-toast--${type}`;
  toast.textContent = message;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function loadCsItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(CS_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function money(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return value;
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getNeedStockItems() {
  const csItems = loadCsItems();
  return csItems.filter((item) => Number(item.stockAkhir || 0) < 10);
}

function populateFilterOptions() {
  const seksiValues = [...new Set(pcItems.map((item) => String(item.seksi || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const statusPnValues = [...new Set(pcItems.map((item) => String(item.statusPn || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const kategoriValues = [...new Set(pcItems.map((item) => String(item.kategoriPn || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  fillSelect(filterSeksi, "Semua Seksi", seksiValues, filters.seksi);
  fillSelect(filterStatusPn, "Semua Status PN", statusPnValues, filters.statusPn);
  fillSelect(filterKategoriPn, "Semua Kategori PN", kategoriValues, filters.kategoriPn);
}

function fillSelect(selectEl, firstLabel, values, selectedValue) {
  selectEl.innerHTML = "";

  const firstOption = document.createElement("option");
  firstOption.value = "ALL";
  firstOption.textContent = firstLabel;
  selectEl.appendChild(firstOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === selectedValue) option.selected = true;
    selectEl.appendChild(option);
  });

  if (!values.includes(selectedValue)) {
    selectEl.value = "ALL";
  }
}

function getFilteredItems() {
  return pcItems.filter((item) => {
    const q = normalize(searchTerm);

    const matchSearch =
      !q ||
      normalize(item.partNumber).includes(q) ||
      normalize(item.description).includes(q) ||
      normalize(item.seksi).includes(q) ||
      normalize(item.lokasi).includes(q) ||
      normalize(item.statusPn).includes(q) ||
      normalize(item.kategoriPn).includes(q);

    const matchSeksi =
      filters.seksi === "ALL" || String(item.seksi || "") === filters.seksi;

    const matchStatusPn =
      filters.statusPn === "ALL" || String(item.statusPn || "") === filters.statusPn;

    const matchKategoriPn =
      filters.kategoriPn === "ALL" || String(item.kategoriPn || "") === filters.kategoriPn;

    return matchSearch && matchSeksi && matchStatusPn && matchKategoriPn;
  });
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
    const totalHarga = Number(item.harga || 0) * Number(item.stockAkhir || 0);

    fragment.querySelector(".col-partNumber").textContent = item.partNumber || "-";
    fragment.querySelector(".col-sto").textContent = item.sto || "-";
    fragment.querySelector(".col-description").textContent = item.description || "-";
    fragment.querySelector(".col-satuan").textContent = item.satuan || "-";
    fragment.querySelector(".col-harga").textContent = money(item.harga);
    fragment.querySelector(".col-stockAwal").textContent = item.stockAwal ?? 0;
    fragment.querySelector(".col-stockMasuk").textContent = item.stockMasuk ?? 0;
    fragment.querySelector(".col-stockKeluar").textContent = item.stockKeluar ?? 0;
    fragment.querySelector(".col-stockAkhir").textContent = item.stockAkhir ?? 0;
    fragment.querySelector(".col-totalHarga").textContent = money(totalHarga);
    fragment.querySelector(".col-seksi").textContent = item.seksi || "-";
    fragment.querySelector(".col-lokasi").textContent = item.lokasi || "-";
    fragment.querySelector(".col-statusPn").textContent = item.statusPn || "-";
    fragment.querySelector(".col-qrCode").textContent = item.qrCode || item.partNumber || "-";
    fragment.querySelector(".col-grade").textContent = item.grade || "-";
    fragment.querySelector(".col-terakhirSto").textContent = formatDateTime(item.terakhirSto);
    fragment.querySelector(".col-stockSesuai").textContent = item.stockSesuai || "-";
    fragment.querySelector(".col-noteSto").textContent = item.noteSto || "-";
    fragment.querySelector(".col-levelStock").textContent = item.levelStock || "-";
    fragment.querySelector(".col-srd").textContent = item.srd || "-";
    fragment.querySelector(".col-statusStock").textContent = item.statusStock || "-";
    fragment.querySelector(".col-type").textContent = item.type || "-";
    fragment.querySelector(".col-group").textContent = item.group || "-";
    fragment.querySelector(".col-lamaOrder").textContent = item.lamaOrder || "-";
    fragment.querySelector(".col-efekKerusakan").textContent = item.efekKerusakan || "-";
    fragment.querySelector(".col-waktuPengganti").textContent = item.waktuPengganti || "-";
    fragment.querySelector(".col-lemari").textContent = item.lemari || "-";
    fragment.querySelector(".col-kategoriPn").textContent = item.kategoriPn || "-";
    fragment.querySelector(".col-refillStatus").innerHTML = `
      <span class="pc-badge pc-badge--danger">PERLU PEMBELIAN</span>
    `;

    tableBody.appendChild(fragment);
  });
}

function renderSummary() {
  needCount.textContent = pcItems.length;
}

function exportToExcel() {
  const items = getFilteredItems();

  if (!items.length) {
    showToast("Tidak ada data untuk didownload.", "error");
    return;
  }

  const exportData = items.map((item, index) => ({
    No: index + 1,
    "Part Number": item.partNumber || "-",
    STO: item.sto || "-",
    Deskripsi: item.description || "-",
    Satuan: item.satuan || "-",
    Harga: Number(item.harga || 0),
    "Stock Awal": Number(item.stockAwal || 0),
    "Stock Masuk": Number(item.stockMasuk || 0),
    "Stock Keluar": Number(item.stockKeluar || 0),
    "Stock Akhir": Number(item.stockAkhir || 0),
    "Total Harga": Number(item.harga || 0) * Number(item.stockAkhir || 0),
    Seksi: item.seksi || "-",
    Lokasi: item.lokasi || "-",
    "Status PN": item.statusPn || "-",
    "QR Code": item.qrCode || item.partNumber || "-",
    Grade: item.grade || "-",
    "Terakhir STO": formatDateTime(item.terakhirSto),
    "Stock Sesuai": item.stockSesuai || "-",
    "Note STO": item.noteSto || "-",
    "Level Stock": item.levelStock || "-",
    SRD: item.srd || "-",
    "Status Stock": item.statusStock || "-",
    Type: item.type || "-",
    Group: item.group || "-",
    "Lama Order": item.lamaOrder || "-",
    "Efek Kerusakan": item.efekKerusakan || "-",
    "Waktu Pengganti": item.waktuPengganti || "-",
    Lemari: item.lemari || "-",
    "Kategori PN": item.kategoriPn || "-",
    "Status Refill": "PERLU PEMBELIAN"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Perlu Stock");
  XLSX.writeFile(workbook, "Perlu_Stock.xlsx");

  showToast("Excel berhasil didownload.", "success");
}

function resetFilters() {
  searchTerm = "";
  filters = {
    seksi: "ALL",
    statusPn: "ALL",
    kategoriPn: "ALL"
  };

  searchInput.value = "";
  populateFilterOptions();
  renderTable();
  showToast("Filter berhasil direset.", "info");
}

function init() {
  pcItems = getNeedStockItems();
  renderSummary();
  populateFilterOptions();
  renderTable();
}

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
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

filterKategoriPn.addEventListener("change", (e) => {
  filters.kategoriPn = e.target.value;
  renderTable();
});

resetFilterBtn.addEventListener("click", resetFilters);
downloadBtn.addEventListener("click", exportToExcel);

backToIndexBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

init();