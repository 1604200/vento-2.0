const STORAGE_KEY = "stockInData";

const initialData = [
  {
    id: generateId(),
    section: "PEWS2",
    partNumber: "08-03-00408",
    quantity: 5,
    unit: "PC",
    description: "DRILL HSS Ø 13 D1101 130 YG",
    date: "2025-12-08",
    pic: "Ismanto",
    triggerOrdering: "Project",
    currentStock: 12,
    levelStock: "Safe",
    transactionType: "GR",
    reference: "stock lama",
    planningDate: "2025-07-28",
    note: "ZCTT",
    location: "E - 4.4",
    type: "ZCTT"
  },
  {
    id: generateId(),
    section: "PEWS1",
    partNumber: "11-22-10301",
    quantity: 3,
    unit: "PC",
    description: "CUTTING TOOL INSERT",
    date: "2026-03-10",
    pic: "Andi",
    triggerOrdering: "Min Stock",
    currentStock: 4,
    levelStock: "Low",
    transactionType: "GR",
    reference: "PR-0102",
    planningDate: "2026-03-15",
    note: "Urgent",
    location: "A - 1.1",
    type: "TOOL"
  },
  {
    id: generateId(),
    section: "PEWS3",
    partNumber: "44-88-22019",
    quantity: 10,
    unit: "BOX",
    description: "SAFETY GLOVES INDUSTRIAL",
    date: "2026-03-19",
    pic: "Rudi",
    triggerOrdering: "Routine",
    currentStock: 30,
    levelStock: "Normal",
    transactionType: "Return",
    reference: "SPB-112",
    planningDate: "2026-03-25",
    note: "Good",
    location: "B - 2.3",
    type: "PPE"
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
const filterTransaction = document.getElementById("filterTransaction");
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
  filterTransaction.addEventListener("change", renderData);
  searchInput.addEventListener("input", renderData);

  resetFilter.addEventListener("click", () => {
    filterUser.value = "ALL";
    filterTransaction.value = "ALL";
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
  const selectedTransaction = filterTransaction.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return stockData.filter((item) => {
    const matchSection = currentSection === "ALL" ? true : item.section === currentSection;
    const matchUser = selectedUser === "ALL" ? true : item.pic === selectedUser;
    const matchTransaction = selectedTransaction === "ALL" ? true : item.transactionType === selectedTransaction;

    const searchTarget = `
      ${item.partNumber}
      ${item.description}
      ${item.location}
      ${item.note}
      ${item.reference}
      ${item.type}
      ${item.pic}
      ${item.section}
      ${item.triggerOrdering}
    `.toLowerCase();

    const matchKeyword = keyword ? searchTarget.includes(keyword) : true;

    return matchSection && matchUser && matchTransaction && matchKeyword;
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
      <div class="cell part-number">${escapeHtml(item.partNumber)}</div>
      <div class="cell center">${escapeHtml(String(item.quantity))}</div>
      <div class="cell center">${escapeHtml(item.unit)}</div>
      <div class="cell">${escapeHtml(item.description)}</div>
      <div class="cell date">${formatDisplayDate(item.date)}</div>
      <div class="cell pic">${escapeHtml(item.pic)}</div>
      <div class="cell">${escapeHtml(item.triggerOrdering || "-")}</div>
      <div class="cell center">${escapeHtml(String(item.currentStock ?? 0))}</div>
      <div class="cell center">${escapeHtml(item.levelStock || "-")}</div>
      <div class="cell transaction">${escapeHtml(item.transactionType)}</div>
      <div class="cell">${escapeHtml(item.reference || "-")}</div>
      <div class="cell planning">${formatDisplayDate(item.planningDate)}</div>
      <div class="cell">${escapeHtml(item.note || "-")}</div>
      <div class="cell location">${escapeHtml(item.location || "-")}</div>
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
  modalTitle.textContent = "Tambah Data Stock In";
  stockForm.reset();
  document.getElementById("editId").value = "";
  document.getElementById("date").value = getTodayDate();
  document.getElementById("planningDate").value = getTodayDate();
  showModal();
}

function editData(id) {
  const item = stockData.find((data) => data.id === id);
  if (!item) return;

  modalTitle.textContent = "Edit Data Stock In";

  document.getElementById("editId").value = item.id;
  document.getElementById("section").value = item.section;
  document.getElementById("partNumber").value = item.partNumber;
  document.getElementById("quantity").value = item.quantity;
  document.getElementById("unit").value = item.unit;
  document.getElementById("description").value = item.description;
  document.getElementById("date").value = item.date;
  document.getElementById("pic").value = item.pic;
  document.getElementById("triggerOrdering").value = item.triggerOrdering || "";
  document.getElementById("currentStock").value = item.currentStock ?? 0;
  document.getElementById("levelStock").value = item.levelStock || "";
  document.getElementById("transactionType").value = item.transactionType;
  document.getElementById("reference").value = item.reference || "";
  document.getElementById("planningDate").value = item.planningDate || "";
  document.getElementById("note").value = item.note || "";
  document.getElementById("location").value = item.location || "";
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
    partNumber: document.getElementById("partNumber").value.trim(),
    quantity: Number(document.getElementById("quantity").value),
    unit: document.getElementById("unit").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("date").value,
    pic: document.getElementById("pic").value.trim(),
    triggerOrdering: document.getElementById("triggerOrdering").value.trim(),
    currentStock: Number(document.getElementById("currentStock").value),
    levelStock: document.getElementById("levelStock").value.trim(),
    transactionType: document.getElementById("transactionType").value,
    reference: document.getElementById("reference").value.trim(),
    planningDate: document.getElementById("planningDate").value,
    note: document.getElementById("note").value.trim(),
    location: document.getElementById("location").value.trim(),
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
    "Part Number": item.partNumber,
    Jumlah: item.quantity,
    Satuan: item.unit,
    Deskripsi: item.description,
    Tanggal: formatDisplayDate(item.date),
    PIC: item.pic,
    "Trigger Ordering": item.triggerOrdering || "-",
    "Current Stock": item.currentStock ?? 0,
    "Level Stock": item.levelStock || "-",
    "Jenis Transaksi": item.transactionType,
    "No PR / SPB / Seksi Pembeli": item.reference || "-",
    "Tanggal Planning / Penanganan": formatDisplayDate(item.planningDate),
    Keterangan: item.note || "-",
    Lokasi: item.location || "-",
    Type: item.type || "-"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();

  const colWidths = [
    { wch: 6 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 10 },
    { wch: 35 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 14 },
    { wch: 14 }, { wch: 16 }, { wch: 24 }, { wch: 24 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }
  ];
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Stock In");
  XLSX.writeFile(workbook, "Stock_In.xlsx");
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
  return "SI-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
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