const SEKSI_STORAGE_KEY = "ds_master_data_json";
const STOCK_STORAGE_KEY = "master_stock_data";
const MP_STORAGE_KEY = "master_mp_data";
const SERVER_STORAGE_KEY = "master_server_activity";
const ACTIVITY_STORAGE_KEY = "master_other_activity";

const defaultSeksiData = [
  {
    kode: "PEWS1",
    dept: "PEC",
    plant: "Sunter",
    keterangan: "Workshop Plant Sunter",
    warna: "#67bdf0",
    deptColor: "#e36f5d"
  },
  {
    kode: "PEWS2",
    dept: "PEC",
    plant: "Pegangsaan",
    keterangan: "Workshop Plant Pegangsaan",
    warna: "#8fcf82",
    deptColor: "#e3b742"
  },
  {
    kode: "PEWS3",
    dept: "PEC",
    plant: "Cikarang",
    keterangan: "Workshop Plant Cikarang",
    warna: "#edd37b",
    deptColor: "#bccb86"
  },
  {
    kode: "PEWS4",
    dept: "PEC",
    plant: "Karawang",
    keterangan: "Workshop Plant Karawang",
    warna: "#f1a198",
    deptColor: "#cad7a0"
  },
  {
    kode: "PEWS6",
    dept: "PEC",
    plant: "Deltamas",
    keterangan: "Workshop Plant Deltamas",
    warna: "#edd690",
    deptColor: "#efb391"
  },
  {
    kode: "PEWE0",
    dept: "PEC",
    plant: "Plant 3A",
    keterangan: "Workshop Plant 3A",
    warna: "#f49f93",
    deptColor: "#b9ca80"
  },
  {
    kode: "PEWE2",
    dept: "PEC",
    plant: "Plant 2A",
    keterangan: "Workshop Plant 2A",
    warna: "#8dca8c",
    deptColor: "#e46b57"
  }
];

const defaultStockData = [
  { id: 1, plant: "Sunter", seksi: "PEWS1", item: "Bearing", qty: 120, status: "Ready" },
  { id: 2, plant: "Sunter", seksi: "PEWS1", item: "Bolt M8", qty: 340, status: "Low" },
  { id: 3, plant: "Pegangsaan", seksi: "PEWS2", item: "Grease", qty: 90, status: "Ready" },
  { id: 4, plant: "Cikarang", seksi: "PEWS3", item: "Sensor", qty: 22, status: "Critical" },
  { id: 5, plant: "Karawang", seksi: "PEWS4", item: "Valve", qty: 54, status: "Ready" },
  { id: 6, plant: "Deltamas", seksi: "PEWS6", item: "Bracket", qty: 76, status: "Ready" },
  { id: 7, plant: "Plant 2A", seksi: "PEWE2", item: "Seal Kit", qty: 45, status: "Low" }
];

const defaultMPData = [
  { id: 1, nama: "Randy", nrp: "1123", plant: "Sunter", seksi: "PEWS1", kj: "KJ9", status: "AKTIF" },
  { id: 2, nama: "Dimas", nrp: "1324", plant: "Sunter", seksi: "PEWS1", kj: "KJ8", status: "AKTIF" },
  { id: 3, nama: "Bagas", nrp: "1456", plant: "Pegangsaan", seksi: "PEWS2", kj: "KJ9", status: "AKTIF" },
  { id: 4, nama: "Ari", nrp: "1678", plant: "Cikarang", seksi: "PEWS3", kj: "KJ7", status: "TIDAK AKTIF" },
  { id: 5, nama: "Fajar", nrp: "1789", plant: "Plant 2A", seksi: "PEWE2", kj: "KJ8", status: "AKTIF" }
];

const defaultServerActivity = [
  { id: 1, plant: "Sunter", seksi: "PEWS1", server: "SVR-AHM-01", aktivitas: "Sync stock", tanggal: "2026-03-11", status: "Success" },
  { id: 2, plant: "Sunter", seksi: "PEWS1", server: "SVR-AHM-02", aktivitas: "Backup MP", tanggal: "2026-03-10", status: "Success" },
  { id: 3, plant: "Pegangsaan", seksi: "PEWS2", server: "SVR-AHM-03", aktivitas: "Update transaksi", tanggal: "2026-03-11", status: "Warning" },
  { id: 4, plant: "Karawang", seksi: "PEWS4", server: "SVR-AHM-04", aktivitas: "Stock recalc", tanggal: "2026-03-09", status: "Success" },
  { id: 5, plant: "Plant 2A", seksi: "PEWE2", server: "SVR-AHM-05", aktivitas: "Generate report", tanggal: "2026-03-11", status: "Success" }
];

const defaultOtherActivity = [
  { id: 1, plant: "Sunter", seksi: "PEWS1", kategori: "Stock", aktivitas: "Opname bulanan", PIC: "Randy", status: "Done" },
  { id: 2, plant: "Sunter", seksi: "PEWS1", kategori: "Maintenance", aktivitas: "Pengecekan line", PIC: "Dimas", status: "Progress" },
  { id: 3, plant: "Cikarang", seksi: "PEWS3", kategori: "Audit", aktivitas: "Validasi stok", PIC: "Ari", status: "Done" },
  { id: 4, plant: "Plant 2A", seksi: "PEWE2", kategori: "Report", aktivitas: "Rekap transaksi", PIC: "Fajar", status: "Done" }
];

const seksiList = document.getElementById("seksiList");
const deptList = document.getElementById("deptList");
const keteranganList = document.getElementById("keteranganList");

const detailPanel = document.getElementById("detailPanel");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");

const summarySeksi = document.getElementById("summarySeksi");
const summaryPlant = document.getElementById("summaryPlant");
const summaryStock = document.getElementById("summaryStock");
const summaryMP = document.getElementById("summaryMP");
const summaryServer = document.getElementById("summaryServer");
const summaryActivity = document.getElementById("summaryActivity");

const stockContainer = document.getElementById("stockContainer");
const mpContainer = document.getElementById("mpContainer");
const serverContainer = document.getElementById("serverContainer");
const activityContainer = document.getElementById("activityContainer");

let seksiData = [];
let stockData = [];
let mpData = [];
let serverData = [];
let activityData = [];
let activeKode = null;

function seedStorage() {
  if (!localStorage.getItem(SEKSI_STORAGE_KEY)) {
    localStorage.setItem(SEKSI_STORAGE_KEY, JSON.stringify(defaultSeksiData, null, 2));
  }
  if (!localStorage.getItem(STOCK_STORAGE_KEY)) {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(defaultStockData, null, 2));
  }
  if (!localStorage.getItem(MP_STORAGE_KEY)) {
    localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(defaultMPData, null, 2));
  }
  if (!localStorage.getItem(SERVER_STORAGE_KEY)) {
    localStorage.setItem(SERVER_STORAGE_KEY, JSON.stringify(defaultServerActivity, null, 2));
  }
  if (!localStorage.getItem(ACTIVITY_STORAGE_KEY)) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(defaultOtherActivity, null, 2));
  }
}

function loadStorageData() {
  seksiData = JSON.parse(localStorage.getItem(SEKSI_STORAGE_KEY)) || [];
  stockData = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY)) || [];
  mpData = JSON.parse(localStorage.getItem(MP_STORAGE_KEY)) || [];
  serverData = JSON.parse(localStorage.getItem(SERVER_STORAGE_KEY)) || [];
  activityData = JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY)) || [];
}

function renderMasterLayout() {
  seksiList.innerHTML = seksiData.map((item) => `
    <div class="seksi-item ${activeKode === item.kode ? "active" : ""}" data-kode="${item.kode}">
      <div class="seksi-dot" style="background:${item.warna}"></div>
      <div class="seksi-bar" style="background:${item.warna}99">${item.kode}</div>
    </div>
  `).join("");

  deptList.innerHTML = seksiData.map((item) => `
    <div class="dept-item" style="border-color:${item.deptColor}">${item.dept}</div>
  `).join("");

  keteranganList.innerHTML = seksiData.map((item) => `
    <div class="ket-item">
      <span class="blue">Workshop Plant</span>
      <span class="green"> ${item.plant}</span>
    </div>
  `).join("");

  document.querySelectorAll(".seksi-item").forEach((el) => {
    el.addEventListener("click", () => {
      const kode = el.dataset.kode;
      openDetailByKode(kode);
    });
  });
}

function openDetailByKode(kode) {
  activeKode = kode;
  renderMasterLayout();

  const selected = seksiData.find((item) => item.kode === kode);
  if (!selected) return;

  const filteredStock = stockData.filter((item) => item.seksi === selected.kode && item.plant === selected.plant);
  const filteredMP = mpData.filter((item) => item.seksi === selected.kode && item.plant === selected.plant);
  const filteredServer = serverData.filter((item) => item.seksi === selected.kode && item.plant === selected.plant);
  const filteredActivity = activityData.filter((item) => item.seksi === selected.kode && item.plant === selected.plant);

  detailTitle.textContent = `Detail Seksi ${selected.kode}`;
  detailSubtitle.textContent = `Filter data terhubung untuk plant ${selected.plant}.`;

  summarySeksi.textContent = selected.kode;
  summaryPlant.textContent = selected.plant;
  summaryStock.textContent = filteredStock.length;
  summaryMP.textContent = filteredMP.length;
  summaryServer.textContent = filteredServer.length;
  summaryActivity.textContent = filteredActivity.length;

  stockContainer.innerHTML = createTable(
    ["Item", "Qty", "Status"],
    filteredStock.map((item) => [item.item, item.qty, item.status])
  );

  mpContainer.innerHTML = createTable(
    ["Nama", "NRP", "KJ", "Status"],
    filteredMP.map((item) => [item.nama, item.nrp, item.kj, item.status])
  );

  serverContainer.innerHTML = createTable(
    ["Server", "Aktivitas", "Tanggal", "Status"],
    filteredServer.map((item) => [item.server, item.aktivitas, item.tanggal, item.status])
  );

  activityContainer.innerHTML = createTable(
    ["Kategori", "Aktivitas", "PIC", "Status"],
    filteredActivity.map((item) => [item.kategori, item.aktivitas, item.PIC, item.status])
  );

  detailPanel.classList.remove("hidden");
  detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createTable(headers, rows) {
  if (!rows.length) {
    return `<div class="empty-box">Belum ada data yang cocok.</div>`;
  }

  const thead = `
    <thead>
      <tr>
        ${headers.map((header) => `<th>${header}</th>`).join("")}
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody>
      ${rows.map((row) => `
        <tr>
          ${row.map((cell) => `<td>${cell}</td>`).join("")}
        </tr>
      `).join("")}
    </tbody>
  `;

  return `<table class="data-table">${thead}${tbody}</table>`;
}

closeDetailBtn.addEventListener("click", () => {
  detailPanel.classList.add("hidden");
  activeKode = null;
  renderMasterLayout();
});

seedStorage();
loadStorageData();
renderMasterLayout();