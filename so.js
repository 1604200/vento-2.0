const STORAGE_KEY = "stockOutData";

const initialData = [
  {
    id: generateId(),
    section: "PEWS2",
    date: "2026-03-25",
    partNumber: "08-03-00408",
    quantity: 2,
    unit: "PC",
    description: "DRILL HSS Ø 13 D1101 130 YG",
    location: "E - 4.4",
    srs: "SRS-1021",
    currentStock: 10,
    pic: "Ismanto",
    purpose: "Perbaikan project line",
    woNumber: "WO-2301",
    assetNumber: "JO-7788",
    receiverSection: "PEWS1",
    note: "Dipakai produksi",
    type: "ZCTT"
  },
  {
    id: generateId(),
    section: "PEWS1",
    date: "2026-03-24",
    partNumber: "11-22-10301",
    quantity: 1,
    unit: "PC",
    description: "CUTTING TOOL INSERT",
    location: "A - 1.1",
    srs: "SRS-1009",
    currentStock: 4,
    pic: "Andi",
    purpose: "Penggantian insert",
    woNumber: "WO-2298",
    assetNumber: "AST-9912",
    receiverSection: "PEWS3",
    note: "Urgent",
    type: "TOOL"
  }
];

let stockData = [];
let currentSection = "ALL";

const dataContainer = document.getElementById("dataContainer");
const emptyState = document.getElementById("emptyState");

const formModal = document.getElementById("formModal");
const stockForm = document.getElementById("stockForm");
const modalTitle = document.getElementById("modalTitle");

const addDataBtn = document.getElementById("addDataBtn");
const downloadBtn = document.getElementById("downloadExcel");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const sectionButtons = document.querySelectorAll(".section-btn");

const toggleFilter = document.getElementById("toggleFilter");
const filterPanel = document.getElementById("filterPanel");
const filterUser = document.getElementById("filterUser");
const searchInput = document.getElementById("searchInput");
const resetFilter = document.getElementById("resetFilter");

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  bindEvents();
  populateUserFilter();
  renderData();
});

function bindEvents() {
  addDataBtn.addEventListener("click", openAddModal);
  downloadBtn.addEventListener("click", exportToExcel);
  closeModal.addEventListener("click", hideModal);
  cancelBtn.addEventListener("click", hideModal);

  formModal.addEventListener("click", (e) => {
    if (e.target === formModal) hideModal();
  });

  stockForm.addEventListener("submit", handleFormSubmit);

  sectionButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sectionButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSection = btn.dataset.section;
      renderData();
    });
  });

  toggleFilter.addEventListener("click", () => {
    filterPanel.classList.toggle("hidden");
  });

  filterUser.addEventListener("change", renderData);
  searchInput.addEventListener("input", renderData);

  resetFilter.addEventListener("click", () => {
    filterUser.value = "ALL";
    searchInput.value = "";
    currentSection = "ALL";

    sectionButtons.forEach((b) => b.classList.remove("active"));
    document.querySelector('.section-btn[data-section="ALL"]').classList.add("active");

    renderData();
  });
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    stockData = JSON.parse(saved);
  } else {
    stockData = initialData;
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stockData));
}

function populateUserFilter() {
  const users = [...new Set(stockData.map((item) => item.pic).filter(Boolean))].sort();
  filterUser.innerHTML = `<option value="ALL">Semua User</option>`;

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = user;
    filterUser.appendChild(option);
  });
}

function getFilteredData() {
  const selectedUser = filterUser.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return stockData.filter((item) => {
    const matchSection = currentSection === "ALL" ? true : item.section === currentSection;
    const matchUser = selectedUser === "ALL" ? true : item.pic === selectedUser;

    const searchTarget = `
      ${item.section}
      ${item.partNumber}
      ${item.description}
      ${item.location}
      ${item.srs}
      ${item.pic}
      ${item.purpose}
      ${item.woNumber}
      ${item.assetNumber}
      ${item.receiverSection}
      ${item.note}
      ${item.type}
    `.toLowerCase();

    const matchKeyword = keyword ? searchTarget.includes(keyword) : true;

    return matchSection && matchUser && matchKeyword;
  });
}

function renderData() {
  const filtered = getFilteredData();
  dataContainer.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "data-row";

    row.innerHTML = `
      <div class="cell section-name">${escapeHtml(item.section)}</div>
      <div class="cell date">${formatDisplayDate(item.date)}</div>
      <div class="cell part-number">${escapeHtml(item.partNumber)}</div>
      <div class="cell center">${escapeHtml(String(item.quantity))}</div>
      <div class="cell center">${escapeHtml(item.unit)}</div>
      <div class="cell">${escapeHtml(item.description)}</div>
      <div class="cell location">${escapeHtml(item.location || "-")}</div>
      <div class="cell">${escapeHtml(item.srs || "-")}</div>
      <div class="cell center">${escapeHtml(String(item.currentStock ?? 0))}</div>
      <div class="cell pic">${escapeHtml(item.pic)}</div>
      <div class="cell">${escapeHtml(item.purpose || "-")}</div>
      <div class="cell">${escapeHtml(item.woNumber || "-")}</div>
      <div class="cell">${escapeHtml(item.assetNumber || "-")}</div>
      <div class="cell">${escapeHtml(item.receiverSection || "-")}</div>
      <div class="cell">${escapeHtml(item.note || "-")}</div>
      <div class="cell">${escapeHtml(item.type || "-")}</div>
      <div class="cell">
        <div class="row-actions">
          <button class="btn-edit" data-id="${item.id}">Edit</button>
          <button class="btn-delete" data-id="${item.id}" title="Hapus">🗑</button>
        </div>
      </div>
    `;

    dataContainer.appendChild(row);
  });

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => editData(btn.dataset.id));
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteData(btn.dataset.id));
  });
}

function openAddModal() {
  modalTitle.textContent = "Tambah Data Stock Out";
  stockForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("date").value = getTodayDate();
  showModal();
}

function editData(id) {
  const item = stockData.find((data) => data.id === id);
  if (!item) return;

  modalTitle.textContent = "Edit Data Stock Out";

  document.getElementById("editId").value = item.id;
  document.getElementById("section").value = item.section;
  document.getElementById("date").value = item.date;
  document.getElementById("partNumber").value = item.partNumber;
  document.getElementById("quantity").value = item.quantity;
  document.getElementById("unit").value = item.unit;
  document.getElementById("description").value = item.description;
  document.getElementById("location").value = item.location || "";
  document.getElementById("srs").value = item.srs || "";
  document.getElementById("currentStock").value = item.currentStock ?? 0;
  document.getElementById("pic").value = item.pic;
  document.getElementById("purpose").value = item.purpose || "";
  document.getElementById("woNumber").value = item.woNumber || "";
  document.getElementById("assetNumber").value = item.assetNumber || "";
  document.getElementById("receiverSection").value = item.receiverSection || "";
  document.getElementById("note").value = item.note || "";
  document.getElementById("type").value = item.type || "";

  showModal();
}

function deleteData(id) {
  const target = stockData.find((item) => item.id === id);
  if (!target) return;

  const confirmDelete = confirm(`Yakin ingin menghapus data part number "${target.partNumber}"?`);
  if (!confirmDelete) return;

  stockData = stockData.filter((item) => item.id !== id);
  saveData();
  populateUserFilter();
  renderData();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById("editId").value;

  const formData = {
    id: editId || generateId(),
    section: document.getElementById("section").value,
    date: document.getElementById("date").value,
    partNumber: document.getElementById("partNumber").value.trim(),
    quantity: Number(document.getElementById("quantity").value),
    unit: document.getElementById("unit").value.trim(),
    description: document.getElementById("description").value.trim(),
    location: document.getElementById("location").value.trim(),
    srs: document.getElementById("srs").value.trim(),
    currentStock: Number(document.getElementById("currentStock").value),
    pic: document.getElementById("pic").value.trim(),
    purpose: document.getElementById("purpose").value.trim(),
    woNumber: document.getElementById("woNumber").value.trim(),
    assetNumber: document.getElementById("assetNumber").value.trim(),
    receiverSection: document.getElementById("receiverSection").value.trim(),
    note: document.getElementById("note").value.trim(),
    type: document.getElementById("type").value.trim()
  };

  if (editId) {
    stockData = stockData.map((item) => (item.id === editId ? formData : item));
  } else {
    stockData.unshift(formData);
  }

  saveData();
  populateUserFilter();
  renderData();
  hideModal();
}

function exportToExcel() {
  const data = getFilteredData();

  if (data.length === 0) {
    alert("Tidak ada data untuk didownload.");
    return;
  }

  const exportData = data.map((item, index) => ({
    No: index + 1,
    Seksi: item.section,
    Tanggal: formatDisplayDate(item.date),
    "Part Number": item.partNumber,
    Jumlah: item.quantity,
    Satuan: item.unit,
    Deskripsi: item.description,
    Lokasi: item.location || "-",
    SRS: item.srs || "-",
    "Current Stock": item.currentStock ?? 0,
    PIC: item.pic,
    "Tujuan Penggunaan": item.purpose || "-",
    "Nomor WO": item.woNumber || "-",
    "Nomor Aset / JO": item.assetNumber || "-",
    "Seksi Penerima": item.receiverSection || "-",
    Keterangan: item.note || "-",
    Type: item.type || "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const colWidths = [
    { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 10 },
    { wch: 10 }, { wch: 35 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 18 }, { wch: 24 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 14 }
  ];
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Out");
  XLSX.writeFile(workbook, "Stock_Out.xlsx");
}

function showModal() {
  formModal.classList.remove("hidden");
}

function hideModal() {
  formModal.classList.add("hidden");
}

function formatDisplayDate(dateString) {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return "-";
  return `${day}/${month}/${year}`;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateId() {
  return "SO-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}