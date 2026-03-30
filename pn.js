const pnData = [
  {
    materialDescription: "BAG SEALLER YELLOW",
    materialNumber: "02-01-00001",
    plant: "1100",
    poText: "BAG SEALLER YELLOW",
    materialTypes: "ZCON",
    materialGroup: "CN001",
    uom: "ROL",
    orderUnit: "-",
    unitOfIssue: "-",
    flagDeletion: "-",
    createBy: "CONVERSION10"
  },
  {
    materialDescription: "LABEL STICKER WHITE",
    materialNumber: "02-01-00002",
    plant: "1200",
    poText: "LABEL STICKER",
    materialTypes: "ZLAB",
    materialGroup: "CN002",
    uom: "PCS",
    orderUnit: "PCS",
    unitOfIssue: "PCS",
    flagDeletion: "-",
    createBy: "ADMIN01"
  },
  {
    materialDescription: "PLASTIC WRAP CLEAR",
    materialNumber: "02-01-00003",
    plant: "1300",
    poText: "PLASTIC WRAP",
    materialTypes: "ZPAC",
    materialGroup: "CN003",
    uom: "ROL",
    orderUnit: "ROL",
    unitOfIssue: "ROL",
    flagDeletion: "-",
    createBy: "USER02"
  },
  {
    materialDescription: "CABLE TIES BLACK",
    materialNumber: "02-01-00004",
    plant: "1100",
    poText: "CABLE TIES",
    materialTypes: "ZCON",
    materialGroup: "CN001",
    uom: "PCS",
    orderUnit: "PCS",
    unitOfIssue: "PCS",
    flagDeletion: "-",
    createBy: "ADMIN02"
  }
];

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const filterPlant = document.getElementById("filterPlant");
const filterMaterialGroup = document.getElementById("filterMaterialGroup");
const filterUom = document.getElementById("filterUom");
const resetFilterBtn = document.getElementById("resetFilterBtn");
const addBtn = document.getElementById("addBtn");
const backBtn = document.getElementById("backBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const pnForm = document.getElementById("pnForm");
const editIndexInput = document.getElementById("editIndex");

const materialDescriptionInput = document.getElementById("materialDescription");
const materialNumberInput = document.getElementById("materialNumber");
const plantInput = document.getElementById("plant");
const poTextInput = document.getElementById("poText");
const materialTypesInput = document.getElementById("materialTypes");
const materialGroupInput = document.getElementById("materialGroup");
const uomInput = document.getElementById("uom");
const orderUnitInput = document.getElementById("orderUnit");
const unitOfIssueInput = document.getElementById("unitOfIssue");
const flagDeletionInput = document.getElementById("flagDeletion");
const createByInput = document.getElementById("createBy");

function normalizeText(value) {
  return String(value ?? "").toLowerCase().trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openModal(editMode = false, index = null) {
  modalOverlay.classList.remove("hidden");

  if (editMode && index !== null) {
    const item = pnData[index];
    modalTitle.textContent = "Edit Data PN/FIE";
    editIndexInput.value = index;

    materialDescriptionInput.value = item.materialDescription;
    materialNumberInput.value = item.materialNumber;
    plantInput.value = item.plant;
    poTextInput.value = item.poText;
    materialTypesInput.value = item.materialTypes;
    materialGroupInput.value = item.materialGroup;
    uomInput.value = item.uom;
    orderUnitInput.value = item.orderUnit;
    unitOfIssueInput.value = item.unitOfIssue;
    flagDeletionInput.value = item.flagDeletion;
    createByInput.value = item.createBy;
  } else {
    modalTitle.textContent = "Tambah Data PN/FIE";
    pnForm.reset();
    editIndexInput.value = "";
  }
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  pnForm.reset();
  editIndexInput.value = "";
}

function populateFilterOptions() {
  const plants = [...new Set(pnData.map((item) => item.plant).filter(Boolean))].sort();
  const materialGroups = [...new Set(pnData.map((item) => item.materialGroup).filter(Boolean))].sort();
  const uoms = [...new Set(pnData.map((item) => item.uom).filter(Boolean))].sort();

  const currentPlant = filterPlant.value;
  const currentMaterialGroup = filterMaterialGroup.value;
  const currentUom = filterUom.value;

  filterPlant.innerHTML = `<option value="">Semua</option>`;
  filterMaterialGroup.innerHTML = `<option value="">Semua</option>`;
  filterUom.innerHTML = `<option value="">Semua</option>`;

  plants.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    filterPlant.appendChild(option);
  });

  materialGroups.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    filterMaterialGroup.appendChild(option);
  });

  uoms.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    filterUom.appendChild(option);
  });

  filterPlant.value = plants.includes(currentPlant) ? currentPlant : "";
  filterMaterialGroup.value = materialGroups.includes(currentMaterialGroup) ? currentMaterialGroup : "";
  filterUom.value = uoms.includes(currentUom) ? currentUom : "";
}

function getFilteredData() {
  const keyword = normalizeText(searchInput.value);
  const selectedPlant = normalizeText(filterPlant.value);
  const selectedMaterialGroup = normalizeText(filterMaterialGroup.value);
  const selectedUom = normalizeText(filterUom.value);

  return pnData.filter((item) => {
    const matchesKeyword =
      keyword === "" ||
      [
        item.materialDescription,
        item.materialNumber,
        item.plant,
        item.poText,
        item.materialTypes,
        item.materialGroup,
        item.uom,
        item.orderUnit,
        item.unitOfIssue,
        item.flagDeletion,
        item.createBy
      ].some((field) => normalizeText(field).includes(keyword));

    const matchesPlant =
      selectedPlant === "" || normalizeText(item.plant) === selectedPlant;

    const matchesMaterialGroup =
      selectedMaterialGroup === "" ||
      normalizeText(item.materialGroup) === selectedMaterialGroup;

    const matchesUom =
      selectedUom === "" || normalizeText(item.uom) === selectedUom;

    return matchesKeyword && matchesPlant && matchesMaterialGroup && matchesUom;
  });
}

function renderTable() {
  const filtered = getFilteredData();
  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <div class="empty-state">Data tidak ditemukan.</div>
    `;
    return;
  }

  filtered.forEach((item) => {
    const originalIndex = pnData.findIndex((data) => data === item);
    const row = document.createElement("div");
    row.className = "data-row";

    row.innerHTML = `
      <div class="data-cell left cell-description">${escapeHtml(item.materialDescription)}</div>
      <div class="data-cell cell-red">${escapeHtml(item.materialNumber)}</div>
      <div class="data-cell cell-pink">${escapeHtml(item.plant)}</div>
      <div class="data-cell">${escapeHtml(item.poText)}</div>
      <div class="data-cell cell-purple">${escapeHtml(item.materialTypes)}</div>
      <div class="data-cell cell-cyan">${escapeHtml(item.materialGroup)}</div>
      <div class="data-cell cell-orange">${escapeHtml(item.uom)}</div>
      <div class="data-cell cell-strong">${escapeHtml(item.orderUnit)}</div>
      <div class="data-cell cell-strong">${escapeHtml(item.unitOfIssue)}</div>
      <div class="data-cell cell-strong">${escapeHtml(item.flagDeletion)}</div>
      <div class="data-cell cell-blue">${escapeHtml(item.createBy)}</div>
      <div class="data-cell action-box">
        <button class="btn-edit" type="button" onclick="handleEdit(${originalIndex})">Edit</button>
        <button class="btn-delete" type="button" onclick="handleDelete(${originalIndex})">Hapus</button>
      </div>
    `;

    tableBody.appendChild(row);
  });
}

function refreshUI() {
  populateFilterOptions();
  renderTable();
}

function handleEdit(index) {
  openModal(true, index);
}

function handleDelete(index) {
  const confirmDelete = confirm("Yakin ingin menghapus data ini?");
  if (!confirmDelete) return;

  pnData.splice(index, 1);
  refreshUI();
}

pnForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    materialDescription: materialDescriptionInput.value.trim().toUpperCase(),
    materialNumber: materialNumberInput.value.trim(),
    plant: plantInput.value.trim().toUpperCase(),
    poText: poTextInput.value.trim().toUpperCase(),
    materialTypes: materialTypesInput.value.trim().toUpperCase(),
    materialGroup: materialGroupInput.value.trim().toUpperCase(),
    uom: uomInput.value.trim().toUpperCase(),
    orderUnit: orderUnitInput.value.trim().toUpperCase() || "-",
    unitOfIssue: unitOfIssueInput.value.trim().toUpperCase() || "-",
    flagDeletion: flagDeletionInput.value.trim().toUpperCase() || "-",
    createBy: createByInput.value.trim().toUpperCase()
  };

  const editIndex = editIndexInput.value;

  if (editIndex !== "") {
    pnData[Number(editIndex)] = formData;
  } else {
    pnData.push(formData);
  }

  closeModal();
  refreshUI();
});

addBtn.addEventListener("click", () => openModal(false));
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

searchInput.addEventListener("input", renderTable);
searchBtn.addEventListener("click", renderTable);

filterPlant.addEventListener("change", renderTable);
filterMaterialGroup.addEventListener("change", renderTable);
filterUom.addEventListener("change", renderTable);

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterPlant.value = "";
  filterMaterialGroup.value = "";
  filterUom.value = "";
  renderTable();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    renderTable();
  }
});

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

window.handleEdit = handleEdit;
window.handleDelete = handleDelete;

refreshUI();