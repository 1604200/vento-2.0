const STORAGE_KEY = "mp_data_json";

const defaultMPData = [
  {
    id: 1,
    nama: "Randy S",
    nrp: "1123",
    seksi: "PEC4",
    whatsapp: "0895XXXXXX",
    gmail: "randy@gmail.com",
    astra: "randy@astra-honda.com",
    kj: "KJ9",
    status: "AKTIF"
  },
  {
    id: 2,
    nama: "Nanang T",
    nrp: "1188",
    seksi: "PWES1",
    whatsapp: "0812XXXXXX",
    gmail: "nanang@gmail.com",
    astra: "nanang@astra-honda.com",
    kj: "KJ9",
    status: "TIDAK AKTIF"
  },
  {
    id: 3,
    nama: "Bagas",
    nrp: "1323",
    seksi: "PWES2",
    whatsapp: "0895XXXXXX",
    gmail: "bagas@gmail.com",
    astra: "bagas@astra-honda.com",
    kj: "KJ8",
    status: "AKTIF"
  },
  {
    id: 4,
    nama: "Dimas",
    nrp: "1455",
    seksi: "PWES3",
    whatsapp: "0821XXXXXX",
    gmail: "dimas@gmail.com",
    astra: "dimas@astra-honda.com",
    kj: "KJ8",
    status: "AKTIF"
  },
  {
    id: 5,
    nama: "Fajar",
    nrp: "1542",
    seksi: "PEWE2",
    whatsapp: "0813XXXXXX",
    gmail: "fajar@gmail.com",
    astra: "fajar@astra-honda.com",
    kj: "KJ7",
    status: "AKTIF"
  }
];

let mpData = [];
let activeFilter = "ALL";
let searchKeyword = "";

const groupContainer = document.getElementById("groupContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const filterButtons = document.querySelectorAll(".filter-btn");
const editModal = document.getElementById("editModal");
const closeModal = document.getElementById("closeModal");
const editForm = document.getElementById("editForm");
const resetDataBtn = document.getElementById("resetDataBtn");

function initializeData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      mpData = JSON.parse(saved);

      if (!Array.isArray(mpData)) {
        throw new Error("Format data bukan array");
      }
    } catch (error) {
      console.error("Gagal parse JSON localStorage:", error);
      mpData = [...defaultMPData];
      saveData();
    }
  } else {
    mpData = [...defaultMPData];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mpData, null, 2));
}

function getFilteredData() {
  return mpData.filter((item) => {
    const matchFilter = activeFilter === "ALL" || item.seksi === activeFilter;
    const keyword = searchKeyword.toLowerCase();

    const matchSearch =
      item.nama.toLowerCase().includes(keyword) ||
      item.nrp.toLowerCase().includes(keyword) ||
      item.seksi.toLowerCase().includes(keyword) ||
      item.whatsapp.toLowerCase().includes(keyword) ||
      item.gmail.toLowerCase().includes(keyword) ||
      item.astra.toLowerCase().includes(keyword) ||
      item.kj.toLowerCase().includes(keyword) ||
      item.status.toLowerCase().includes(keyword);

    return matchFilter && matchSearch;
  });
}

function groupByKJ(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.kj]) {
      acc[item.kj] = [];
    }
    acc[item.kj].push(item);
    return acc;
  }, {});
}

function avatarColor(name) {
  const colors = ["#14b8a6", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];
  let total = 0;

  for (let i = 0; i < name.length; i++) {
    total += name.charCodeAt(i);
  }

  return colors[total % colors.length];
}

function renderData() {
  const filtered = getFilteredData();

  if (filtered.length === 0) {
    groupContainer.innerHTML = `
      <div class="empty-state">
        <h3>Data tidak ditemukan</h3>
        <p>Coba ganti filter atau kata kunci pencarian.</p>
      </div>
    `;
    return;
  }

  const grouped = groupByKJ(filtered);
  const sortedGroupKeys = Object.keys(grouped).sort().reverse();

  groupContainer.innerHTML = sortedGroupKeys
    .map((kj) => {
      const rows = grouped[kj]
        .map(
          (item) => `
          <div class="row">
            <div class="name-cell">
              <div class="avatar" style="background:${avatarColor(item.nama)}">
                ${item.nama.charAt(0).toUpperCase()}
              </div>
              <span class="cell-text">${item.nama}</span>
            </div>
            <div class="cell-text">${item.nrp}</div>
            <div class="cell-text">${item.seksi}</div>
            <div class="cell-text">${item.whatsapp}</div>
            <div class="cell-text">${item.gmail}</div>
            <div class="cell-text">${item.astra}</div>
            <div class="cell-text">${item.kj}</div>
            <div>
              <span class="badge-status ${item.status === "AKTIF" ? "aktif" : "nonaktif"}">
                ${item.status}
              </span>
            </div>
            <div>
              <button class="edit-btn" onclick="openEditModal(${item.id})">Edit</button>
            </div>
          </div>
        `
        )
        .join("");

      return `
        <section class="group-card">
          <div class="group-label">${kj}</div>
          <div class="rows">${rows}</div>
        </section>
      `;
    })
    .join("");
}

function openEditModal(id) {
  const item = mpData.find((row) => row.id === id);
  if (!item) return;

  document.getElementById("editId").value = item.id;
  document.getElementById("editNama").value = item.nama;
  document.getElementById("editNrp").value = item.nrp;
  document.getElementById("editSeksi").value = item.seksi;
  document.getElementById("editWhatsapp").value = item.whatsapp;
  document.getElementById("editGmail").value = item.gmail;
  document.getElementById("editAstra").value = item.astra;
  document.getElementById("editKj").value = item.kj;
  document.getElementById("editStatus").value = item.status;

  editModal.classList.remove("hidden");
}

function closeEditModal() {
  editModal.classList.add("hidden");
}

window.openEditModal = openEditModal;

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    renderData();
  });
});

searchInput.addEventListener("input", (event) => {
  searchKeyword = event.target.value.trim();
  renderData();
});

searchButton.addEventListener("click", () => {
  searchKeyword = searchInput.value.trim();
  renderData();
});

closeModal.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

editForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = Number(document.getElementById("editId").value);
  const index = mpData.findIndex((item) => item.id === id);

  if (index === -1) return;

  mpData[index] = {
    ...mpData[index],
    nama: document.getElementById("editNama").value.trim(),
    nrp: document.getElementById("editNrp").value.trim(),
    seksi: document.getElementById("editSeksi").value,
    whatsapp: document.getElementById("editWhatsapp").value.trim(),
    gmail: document.getElementById("editGmail").value.trim(),
    astra: document.getElementById("editAstra").value.trim(),
    kj: document.getElementById("editKj").value,
    status: document.getElementById("editStatus").value
  };

  saveData();
  renderData();
  closeEditModal();

  alert("Data berhasil disimpan ke localStorage dalam format JSON.");
});

resetDataBtn.addEventListener("click", () => {
  const confirmReset = confirm("Reset semua data ke data awal?");
  if (!confirmReset) return;

  mpData = [...defaultMPData];
  saveData();
  renderData();
  closeEditModal();
});

initializeData();
renderData();