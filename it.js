const issueData = [
  {
    tanggal: "3/11/2026",
    bagian: "Database",
    deskripsi:
      "semua user bisa akses edit data di seksi lain, mohon bisa dibatasi agar semua bisa cek stok, namun untuk edit data in out, maupun wo hanya dari log in seksi terkait",
    lampiran: "-",
    user: {
      nama: "arimark",
      email: "arimark@ahm.co.id",
      id: "USR-001"
    },
    status: "OPEN",
    note: "-"
  },
  {
    tanggal: "3/11/2026",
    bagian: "Dashboard",
    deskripsi:
      "Mohon bisa dibuatkan dashboard (tampilan awal) yang bisa menunjukan grafik total sparepart, presentase sparepart tidak ada stock, % penggunaan sparepart IO, project maintenance",
    lampiran: "-",
    user: {
      nama: "Suparmo",
      email: "suparmo@ahm.co.id",
      id: "USR-002"
    },
    status: "CLOSE",
    note:
      "satuan nya ikut satuan order, perihal di line bisa dibuatkan SOP transaksi IN / OUT, misal satuan nya Pack, berarti harus ngambil per Pack"
  }
];

const tableBody = document.getElementById("tableBody");
const addBtn = document.getElementById("addBtn");
const backBtn = document.getElementById("backBtn");

const searchInput = document.getElementById("searchInput");
const filterBagian = document.getElementById("filterBagian");
const filterStatus = document.getElementById("filterStatus");
const filterTanggal = document.getElementById("filterTanggal");
const resetFilterBtn = document.getElementById("resetFilterBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const issueForm = document.getElementById("issueForm");
const editIndexInput = document.getElementById("editIndex");

const tanggalInput = document.getElementById("tanggal");
const bagianInput = document.getElementById("bagian");
const deskripsiInput = document.getElementById("deskripsi");
const lampiranInput = document.getElementById("lampiran");
const userNameInput = document.getElementById("userName");
const userEmailInput = document.getElementById("userEmail");
const userIdInput = document.getElementById("userId");
const statusInput = document.getElementById("status");
const noteInput = document.getElementById("note");

const userModalOverlay = document.getElementById("userModalOverlay");
const closeUserModalBtn = document.getElementById("closeUserModalBtn");
const detailUserName = document.getElementById("detailUserName");
const detailUserEmail = document.getElementById("detailUserEmail");
const detailUserId = document.getElementById("detailUserId");

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
    const item = issueData[index];
    modalTitle.textContent = "Edit Issue";
    editIndexInput.value = index;

    tanggalInput.value = item.tanggal;
    bagianInput.value = item.bagian;
    deskripsiInput.value = item.deskripsi;
    lampiranInput.value = item.lampiran;
    userNameInput.value = item.user.nama;
    userEmailInput.value = item.user.email;
    userIdInput.value = item.user.id;
    statusInput.value = item.status;
    noteInput.value = item.note;
  } else {
    modalTitle.textContent = "Tambah Issue";
    issueForm.reset();
    editIndexInput.value = "";
    statusInput.value = "OPEN";
  }
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  issueForm.reset();
  editIndexInput.value = "";
}

function openUserModal(user) {
  detailUserName.textContent = user.nama || "-";
  detailUserEmail.textContent = user.email || "-";
  detailUserId.textContent = user.id || "-";
  userModalOverlay.classList.remove("hidden");
}

function closeUserModal() {
  userModalOverlay.classList.add("hidden");
}

function populateBagianFilter() {
  const bagianList = [...new Set(issueData.map((item) => item.bagian).filter(Boolean))].sort();
  const current = filterBagian.value;

  filterBagian.innerHTML = `<option value="">Semua</option>`;

  bagianList.forEach((bagian) => {
    const option = document.createElement("option");
    option.value = bagian;
    option.textContent = bagian;
    filterBagian.appendChild(option);
  });

  filterBagian.value = bagianList.includes(current) ? current : "";
}

function getFilteredData() {
  const keyword = normalizeText(searchInput.value);
  const bagian = normalizeText(filterBagian.value);
  const status = normalizeText(filterStatus.value);
  const tanggal = normalizeText(filterTanggal.value);

  return issueData.filter((item) => {
    const matchKeyword =
      keyword === "" ||
      [
        item.tanggal,
        item.bagian,
        item.deskripsi,
        item.lampiran,
        item.user.nama,
        item.user.email,
        item.user.id,
        item.status,
        item.note
      ].some((field) => normalizeText(field).includes(keyword));

    const matchBagian =
      bagian === "" || normalizeText(item.bagian) === bagian;

    const matchStatus =
      status === "" || normalizeText(item.status) === status;

    const matchTanggal =
      tanggal === "" || normalizeText(item.tanggal).includes(tanggal);

    return matchKeyword && matchBagian && matchStatus && matchTanggal;
  });
}

function renderTable() {
  const filtered = getFilteredData();
  tableBody.innerHTML = "";

  if (filtered.length === 0) {
    tableBody.innerHTML = `<div class="empty-state">Data tidak ditemukan.</div>`;
    return;
  }

  filtered.forEach((item) => {
    const originalIndex = issueData.findIndex((data) => data === item);
    const row = document.createElement("div");
    row.className = `issue-row ${item.status === "CLOSE" ? "closed" : ""}`;

    const statusClass = item.status === "CLOSE" ? "status-close" : "status-open";
    const statusIcon = item.status === "CLOSE" ? "✔" : "⚠";

    row.innerHTML = `
      <div class="issue-cell large">${escapeHtml(item.tanggal)}</div>
      <div class="issue-cell large">${escapeHtml(item.bagian)}</div>
      <div class="issue-cell desc">${escapeHtml(item.deskripsi)}</div>
      <div class="issue-cell large">${escapeHtml(item.lampiran || "-")}</div>
      <div class="issue-cell">
        <button type="button" class="user-button" onclick="showUserDetail(${originalIndex})">
          <span class="user-icon">👤</span>
          <span>${escapeHtml(item.user.nama)}</span>
        </button>
      </div>
      <div class="issue-cell">
        <div class="status-box ${statusClass}">
          <span class="status-icon">${statusIcon}</span>
          <span>${escapeHtml(item.status === "CLOSE" ? "Close" : "Open")}</span>
        </div>
      </div>
      <div class="issue-cell note">${escapeHtml(item.note || "-")}</div>
      <div class="issue-cell">
        <div class="action-box">
          <button type="button" class="btn-edit" onclick="handleEdit(${originalIndex})">Edit</button>
          <button type="button" class="btn-delete" onclick="handleDelete(${originalIndex})">Hapus</button>
        </div>
      </div>
    `;

    tableBody.appendChild(row);
  });
}

function refreshUI() {
  populateBagianFilter();
  renderTable();
}

function handleEdit(index) {
  openModal(true, index);
}

function handleDelete(index) {
  const confirmDelete = confirm("Yakin ingin menghapus issue ini?");
  if (!confirmDelete) return;

  issueData.splice(index, 1);
  refreshUI();
}

function showUserDetail(index) {
  const item = issueData[index];
  openUserModal(item.user);
}

issueForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = {
    tanggal: tanggalInput.value.trim(),
    bagian: bagianInput.value.trim(),
    deskripsi: deskripsiInput.value.trim(),
    lampiran: lampiranInput.value.trim() || "-",
    user: {
      nama: userNameInput.value.trim(),
      email: userEmailInput.value.trim(),
      id: userIdInput.value.trim()
    },
    status: statusInput.value.trim().toUpperCase(),
    note: noteInput.value.trim() || "-"
  };

  const editIndex = editIndexInput.value;

  if (editIndex !== "") {
    issueData[Number(editIndex)] = formData;
  } else {
    issueData.push(formData);
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

closeUserModalBtn.addEventListener("click", closeUserModal);
userModalOverlay.addEventListener("click", (e) => {
  if (e.target === userModalOverlay) {
    closeUserModal();
  }
});

searchInput.addEventListener("input", renderTable);
filterBagian.addEventListener("change", renderTable);
filterStatus.addEventListener("change", renderTable);
filterTanggal.addEventListener("input", renderTable);

resetFilterBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterBagian.value = "";
  filterStatus.value = "";
  filterTanggal.value = "";
  renderTable();
});

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.showUserDetail = showUserDetail;

refreshUI();