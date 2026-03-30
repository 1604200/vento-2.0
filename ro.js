const STORAGE_KEY = "ro-data-v2";

const initialData = [
  {
    id: crypto.randomUUID(),
    seksi: "PEWS1",
    partNumber: "EL-SEN-04408",
    description: "PHOTOELECTRIC SENSOR E3Z-LS61 2M OMRON",
    satuan: "SET",
    harga: 123000,
    lokasi: "A.5",
    stockAkhir: 4,
    levelStock: 4,
    stockMinus: 4,
    type: "Electrical",
    kategoriPn: "Sensor",
    foto: "",
    srs: "N"
  },
  {
    id: crypto.randomUUID(),
    seksi: "PEWS2",
    partNumber: "MC-BLT-00021",
    description: "V-BELT UNIT CONVEYOR",
    satuan: "PCS",
    harga: 85000,
    lokasi: "B.2",
    stockAkhir: 2,
    levelStock: 5,
    stockMinus: 3,
    type: "Mechanical",
    kategoriPn: "Belt",
    foto: "",
    srs: "Y"
  },
  {
    id: crypto.randomUUID(),
    seksi: "PEWS3",
    partNumber: "EL-CBL-11300",
    description: "CONTROL CABLE 3M",
    satuan: "PCS",
    harga: 45000,
    lokasi: "C.1",
    stockAkhir: 8,
    levelStock: 10,
    stockMinus: 2,
    type: "Electrical",
    kategoriPn: "Cable",
    foto: "",
    srs: "N"
  },
  {
    id: crypto.randomUUID(),
    seksi: "PEWS4",
    partNumber: "PNM-VAL-77810",
    description: "PNEUMATIC VALVE 5/2",
    satuan: "PCS",
    harga: 215000,
    lokasi: "D.4",
    stockAkhir: 1,
    levelStock: 3,
    stockMinus: 2,
    type: "Pneumatic",
    kategoriPn: "Valve",
    foto: "",
    srs: "Y"
  },
  {
    id: crypto.randomUUID(),
    seksi: "PEWS6",
    partNumber: "HYD-PMP-90011",
    description: "HYDRAULIC MINI PUMP",
    satuan: "UNIT",
    harga: 340000,
    lokasi: "E.7",
    stockAkhir: 0,
    levelStock: 1,
    stockMinus: 1,
    type: "Hydraulic",
    kategoriPn: "Pump",
    foto: "",
    srs: "N"
  }
];

let rows = loadRows();
let editId = null;
let currentPhotoBase64 = "";

const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const sectionTotals = document.getElementById("sectionTotals");

const searchInput = document.getElementById("searchInput");
const filterSeksi = document.getElementById("filterSeksi");
const filterSrs = document.getElementById("filterSrs");
const filterType = document.getElementById("filterType");
const filterKategori = document.getElementById("filterKategori");
const btnResetFilter = document.getElementById("btnResetFilter");

const btnAdd = document.getElementById("btnAdd");
const rowDialog = document.getElementById("rowDialog");
const rowForm = document.getElementById("rowForm");
const dialogTitle = document.getElementById("dialogTitle");
const closeDialog = document.getElementById("closeDialog");
const cancelDialog = document.getElementById("cancelDialog");

const fotoFileInput = document.getElementById("fotoFile");
const photoPreview = document.getElementById("photoPreview");
const btnRemovePhoto = document.getElementById("btnRemovePhoto");

function loadRows() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Gagal parse localStorage:", error);
    }
  }
  return initialData;
}

function saveRows() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calculateBudgetOrder(row) {
  const stockMinus = Number(row.stockMinus) || 0;
  const harga = Number(row.harga) || 0;
  return stockMinus * harga;
}

function getSectionTotals(data) {
  const totals = {};
  data.forEach((row) => {
    const key = row.seksi || "Tanpa Seksi";
    totals[key] = (totals[key] || 0) + calculateBudgetOrder(row);
  });

  return Object.entries(totals)
    .sort((a, b) => a[0].localeCompare(b[0], "id"))
    .map(([seksi, total]) => ({ seksi, total }));
}

function getUniqueValues(key) {
  return [...new Set(rows.map((row) => String(row[key] || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "id"));
}

function fillSelect(select, values, placeholder) {
  const currentValue = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  if (values.includes(currentValue)) {
    select.value = currentValue;
  }
}

function populateFilterOptions() {
  fillSelect(filterSeksi, getUniqueValues("seksi"), "Semua");
  fillSelect(filterType, getUniqueValues("type"), "Semua");
  fillSelect(filterKategori, getUniqueValues("kategoriPn"), "Semua");
}

function getFilteredRows() {
  const keyword = searchInput.value.trim().toLowerCase();
  const seksi = filterSeksi.value;
  const srs = filterSrs.value;
  const type = filterType.value;
  const kategori = filterKategori.value;

  return rows.filter((row) => {
    const pn = (row.partNumber || "").toLowerCase();
    const desc = (row.description || "").toLowerCase();
    const seksiText = (row.seksi || "").toLowerCase();

    const matchesKeyword =
      !keyword ||
      pn.includes(keyword) ||
      desc.includes(keyword) ||
      seksiText.includes(keyword);

    const matchesSeksi = !seksi || row.seksi === seksi;
    const matchesSrs = !srs || row.srs === srs;
    const matchesType = !type || row.type === type;
    const matchesKategori = !kategori || row.kategoriPn === kategori;

    return matchesKeyword && matchesSeksi && matchesSrs && matchesType && matchesKategori;
  });
}

function renderSectionTotals() {
  const totals = getSectionTotals(rows);

  if (!totals.length) {
    sectionTotals.innerHTML = `
      <div class="section-pill">
        <span>Belum ada data</span>
        <span class="amount">${formatRupiah(0)}</span>
      </div>
    `;
    return;
  }

  sectionTotals.innerHTML = totals
    .map(
      (item) => `
        <div class="section-pill">
          <span>${escapeHtml(item.seksi)}</span>
          <span class="amount">${formatRupiah(item.total)}</span>
        </div>
      `
    )
    .join("");
}

function renderTable() {
  const filtered = getFilteredRows();

  if (!filtered.length) {
    tableBody.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  tableBody.innerHTML = filtered
    .map((row) => {
      const budgetOrder = calculateBudgetOrder(row);
      const isWarning = Number(row.stockMinus) > 0;

      const fotoHtml = row.foto
        ? `<img src="${row.foto}" alt="${escapeHtml(row.partNumber)}" />`
        : `<div class="photo-fallback">🖼️</div>`;

      return `
        <tr>
          <td>${escapeHtml(row.partNumber)}</td>
          <td>${escapeHtml(row.description)}</td>
          <td>${escapeHtml(row.satuan)}</td>
          <td class="money">${formatRupiah(row.harga)}</td>
          <td><strong>${escapeHtml(row.lokasi || "-")}</strong></td>
          <td>${Number(row.stockAkhir) || 0}</td>
          <td>${Number(row.levelStock) || 0}</td>
          <td>
            <span class="badge ${isWarning ? "warn" : "good"}">${Number(row.stockMinus) || 0}</span>
          </td>
          <td class="money">${formatRupiah(budgetOrder)}</td>
          <td>${escapeHtml(row.type || "-")}</td>
          <td>${escapeHtml(row.kategoriPn || "-")}</td>
          <td class="photo-cell">${fotoHtml}</td>
          <td><span class="badge">${escapeHtml(row.srs)}</span></td>
          <td>
            <div class="action-wrap">
              <button class="icon-btn edit" type="button" title="Edit" onclick="editRow('${row.id}')">✏️</button>
              <button class="icon-btn delete" type="button" title="Hapus" onclick="deleteRow('${row.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderAll() {
  populateFilterOptions();
  renderSectionTotals();
  renderTable();
  saveRows();
}

function setPreviewImage(base64) {
  if (base64) {
    photoPreview.innerHTML = `<img src="${base64}" alt="Preview Foto">`;
  } else {
    photoPreview.innerHTML = `Belum ada foto`;
  }
}

function resetPhotoInput() {
  fotoFileInput.value = "";
}

function openDialog(mode = "add", row = null) {
  editId = row ? row.id : null;
  dialogTitle.textContent = mode === "edit" ? "Edit Data" : "Tambah Data";
  rowForm.reset();
  currentPhotoBase64 = "";

  if (row) {
    rowForm.seksi.value = row.seksi || "";
    rowForm.partNumber.value = row.partNumber || "";
    rowForm.description.value = row.description || "";
    rowForm.satuan.value = row.satuan || "SET";
    rowForm.harga.value = row.harga || 0;
    rowForm.lokasi.value = row.lokasi || "";
    rowForm.stockAkhir.value = row.stockAkhir || 0;
    rowForm.levelStock.value = row.levelStock || 0;
    rowForm.stockMinus.value = row.stockMinus || 0;
    rowForm.type.value = row.type || "";
    rowForm.kategoriPn.value = row.kategoriPn || "";
    rowForm.srs.value = row.srs || "N";
    currentPhotoBase64 = row.foto || "";
  } else {
    rowForm.satuan.value = "SET";
    rowForm.srs.value = "N";
  }

  resetPhotoInput();
  setPreviewImage(currentPhotoBase64);
  rowDialog.showModal();
}

function closeFormDialog() {
  rowDialog.close();
  rowForm.reset();
  editId = null;
  currentPhotoBase64 = "";
  resetPhotoInput();
  setPreviewImage("");
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

async function handlePhotoChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar.");
    resetPhotoInput();
    return;
  }

  try {
    const base64 = await readFileAsBase64(file);
    currentPhotoBase64 = base64;
    setPreviewImage(currentPhotoBase64);
  } catch (error) {
    console.error(error);
    alert("Gagal upload foto.");
  }
}

function getFormData() {
  return {
    id: editId || crypto.randomUUID(),
    seksi: rowForm.seksi.value.trim(),
    partNumber: rowForm.partNumber.value.trim(),
    description: rowForm.description.value.trim(),
    satuan: rowForm.satuan.value.trim(),
    harga: Number(rowForm.harga.value) || 0,
    lokasi: rowForm.lokasi.value.trim(),
    stockAkhir: Number(rowForm.stockAkhir.value) || 0,
    levelStock: Number(rowForm.levelStock.value) || 0,
    stockMinus: Number(rowForm.stockMinus.value) || 0,
    type: rowForm.type.value.trim(),
    kategoriPn: rowForm.kategoriPn.value.trim(),
    srs: rowForm.srs.value,
    foto: currentPhotoBase64
  };
}

rowForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = getFormData();

  if (editId) {
    rows = rows.map((row) => (row.id === editId ? data : row));
  } else {
    rows.unshift(data);
  }

  renderAll();
  closeFormDialog();
});

btnAdd.addEventListener("click", () => openDialog("add"));
closeDialog.addEventListener("click", closeFormDialog);
cancelDialog.addEventListener("click", closeFormDialog);

fotoFileInput.addEventListener("change", handlePhotoChange);

btnRemovePhoto.addEventListener("click", () => {
  currentPhotoBase64 = "";
  resetPhotoInput();
  setPreviewImage("");
});

rowDialog.addEventListener("click", (event) => {
  const rect = rowDialog.getBoundingClientRect();
  const isOutside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (isOutside) {
    closeFormDialog();
  }
});

[searchInput, filterSeksi, filterSrs, filterType, filterKategori].forEach((element) => {
  element.addEventListener("input", renderTable);
  element.addEventListener("change", renderTable);
});

btnResetFilter.addEventListener("click", () => {
  searchInput.value = "";
  filterSeksi.value = "";
  filterSrs.value = "";
  filterType.value = "";
  filterKategori.value = "";
  renderTable();
});

window.editRow = function (id) {
  const row = rows.find((item) => item.id === id);
  if (!row) return;
  openDialog("edit", row);
};

window.deleteRow = function (id) {
  const row = rows.find((item) => item.id === id);
  if (!row) return;

  const ok = confirm(`Hapus data ${row.partNumber}?`);
  if (!ok) return;

  rows = rows.filter((item) => item.id !== id);
  renderAll();
};

setPreviewImage("");
renderAll();