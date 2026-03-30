const seksiMaster = ["PEWE0", "PEWS1", "PEWS2", "PEWS3", "PEWS4", "PEWS6"];

const rackData = [
  {
    seksi: "PEWE0",
    kodeRak: "A.2 B",
    lemari: "A",
    ruangan: "INVENTORY",
    keterangan: "-",
    kodeRakSeksi: "A.2 B/PEWE0"
  },
  {
    seksi: "PEWS1",
    kodeRak: "A.3 A",
    lemari: "A",
    ruangan: "INVENTORY",
    keterangan: "",
    kodeRakSeksi: "A.3 A/PEWS1"
  },
  {
    seksi: "PEWS2",
    kodeRak: "B.1 A",
    lemari: "B",
    ruangan: "INVENTORY",
    keterangan: "Rak aktif",
    kodeRakSeksi: "B.1 A/PEWS2"
  },
  {
    seksi: "PEWS3",
    kodeRak: "B.2 C",
    lemari: "B",
    ruangan: "WAREHOUSE",
    keterangan: "",
    kodeRakSeksi: "B.2 C/PEWS3"
  },
  {
    seksi: "PEWS4",
    kodeRak: "C.1 A",
    lemari: "C",
    ruangan: "INVENTORY",
    keterangan: "Spare",
    kodeRakSeksi: "C.1 A/PEWS4"
  },
  {
    seksi: "PEWS6",
    kodeRak: "C.3 B",
    lemari: "C",
    ruangan: "STORAGE",
    keterangan: "-",
    kodeRakSeksi: "C.3 B/PEWS6"
  }
];

const tableContent = document.getElementById("tableContent");
const sidebarRackList = document.getElementById("sidebarRackList");

const filterKodeRak = document.getElementById("filterKodeRak");
const filterRuangan = document.getElementById("filterRuangan");

const addBtn = document.getElementById("addBtn");
const modalOverlay = document.getElementById("modalOverlay");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const rackForm = document.getElementById("rackForm");
const modalTitle = document.getElementById("modalTitle");
const editIndexInput = document.getElementById("editIndex");

const seksiInput = document.getElementById("seksi");
const kodeRakInput = document.getElementById("kodeRak");
const lemariInput = document.getElementById("lemari");
const ruanganInput = document.getElementById("ruangan");
const keteranganInput = document.getElementById("keterangan");
const kodeRakSeksiInput = document.getElementById("kodeRakSeksi");

let activeSeksi = "SEMUA";

function openModal(editMode = false, index = null) {
  modalOverlay.classList.remove("hidden");

  if (editMode && index !== null) {
    const item = rackData[index];
    modalTitle.textContent = "Edit Data Rak";
    editIndexInput.value = index;

    seksiInput.value = item.seksi;
    kodeRakInput.value = item.kodeRak;
    lemariInput.value = item.lemari;
    ruanganInput.value = item.ruangan;
    keteranganInput.value = item.keterangan;
    kodeRakSeksiInput.value = item.kodeRakSeksi;
  } else {
    modalTitle.textContent = "Tambah Data Rak";
    rackForm.reset();
    editIndexInput.value = "";
  }
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  rackForm.reset();
  editIndexInput.value = "";
}

function getFilteredData() {
  const kodeRakKeyword = filterKodeRak.value.trim().toLowerCase();
  const ruanganKeyword = filterRuangan.value.trim().toLowerCase();

  return rackData.filter((item) => {
    const matchKodeRak = item.kodeRak.toLowerCase().includes(kodeRakKeyword);
    const matchRuangan = item.ruangan.toLowerCase().includes(ruanganKeyword);
    const matchSeksi =
      activeSeksi === "SEMUA" ? true : item.seksi.toUpperCase() === activeSeksi;

    return matchKodeRak && matchRuangan && matchSeksi;
  });
}

function groupByLemari(data) {
  const grouped = {};

  data.forEach((item) => {
    const key = item.lemari.toUpperCase().trim();

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push({
      ...item,
      originalIndex: rackData.indexOf(item)
    });
  });

  return grouped;
}

function renderSidebar() {
  sidebarRackList.innerHTML = "";

  const allButton = document.createElement("button");
  allButton.className = `rack-item all-btn ${activeSeksi === "SEMUA" ? "active" : ""}`;
  allButton.textContent = "Semua";
  allButton.addEventListener("click", () => {
    activeSeksi = "SEMUA";
    renderSidebar();
    renderTable();
  });
  sidebarRackList.appendChild(allButton);

  seksiMaster.forEach((seksi) => {
    const btn = document.createElement("button");
    btn.className = `rack-item ${activeSeksi === seksi ? "active" : ""}`;
    btn.textContent = seksi;

    btn.addEventListener("click", () => {
      activeSeksi = seksi;
      renderSidebar();
      renderTable();
    });

    sidebarRackList.appendChild(btn);
  });
}

function renderTable() {
  const filteredData = getFilteredData();
  const grouped = groupByLemari(filteredData);
  const lemariKeys = Object.keys(grouped).sort();

  tableContent.innerHTML = "";

  if (filteredData.length === 0) {
    tableContent.innerHTML = `
      <div class="empty-state">
        Data tidak ditemukan.
      </div>
    `;
    return;
  }

  lemariKeys.forEach((lemari) => {
    const section = document.createElement("div");
    section.className = "group-section";

    const title = document.createElement("div");
    title.className = "group-title";
    title.textContent = lemari;
    section.appendChild(title);

    grouped[lemari].forEach((item) => {
      const row = document.createElement("div");
      row.className = "data-row";

      row.innerHTML = `
        <div class="data-cell">${item.seksi}</div>
        <div class="data-cell">${item.kodeRak}</div>
        <div class="data-cell">${item.lemari}</div>
        <div class="data-cell">${item.ruangan}</div>
        <div class="data-cell">${item.keterangan || "-"}</div>
        <div class="data-cell">${item.kodeRakSeksi}</div>
        <div class="data-cell action-box">
          <button class="btn-edit" onclick="handleEdit(${item.originalIndex})">Edit</button>
          <button class="btn-delete" onclick="handleDelete(${item.originalIndex})">Hapus</button>
        </div>
      `;

      section.appendChild(row);
    });

    tableContent.appendChild(section);
  });
}

function handleEdit(index) {
  openModal(true, index);
}

function handleDelete(index) {
  const confirmDelete = confirm("Yakin ingin menghapus data ini?");
  if (!confirmDelete) return;

  rackData.splice(index, 1);
  renderSidebar();
  renderTable();
}

function autoGenerateKodeRakSeksi() {
  const kodeRak = kodeRakInput.value.trim();
  const seksi = seksiInput.value.trim().toUpperCase();

  if (kodeRak && seksi) {
    kodeRakSeksiInput.value = `${kodeRak}/${seksi}`;
  }
}

addBtn.addEventListener("click", () => openModal(false));
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

filterKodeRak.addEventListener("input", renderTable);
filterRuangan.addEventListener("input", renderTable);

kodeRakInput.addEventListener("input", autoGenerateKodeRakSeksi);
seksiInput.addEventListener("input", autoGenerateKodeRakSeksi);

rackForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    seksi: seksiInput.value.trim().toUpperCase(),
    kodeRak: kodeRakInput.value.trim(),
    lemari: lemariInput.value.trim().toUpperCase(),
    ruangan: ruanganInput.value.trim().toUpperCase(),
    keterangan: keteranganInput.value.trim(),
    kodeRakSeksi: kodeRakSeksiInput.value.trim()
  };

  const editIndex = editIndexInput.value;

  if (editIndex !== "") {
    rackData[Number(editIndex)] = formData;
  } else {
    rackData.push(formData);
  }

  closeModal();
  renderSidebar();
  renderTable();
});

window.handleEdit = handleEdit;
window.handleDelete = handleDelete;

renderSidebar();
renderTable();