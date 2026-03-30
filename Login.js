const users = [
  { role: "ADMIN", nama: "SUTRISNO", id: "16663" },
  { role: "ADMIN", nama: "MOH SOFYAN", id: "59549" },
  { role: "ADMIN", nama: "JONI HARIYONO", id: "17019" },
  { role: "ADMIN", nama: "ARIMARK TV", id: "47994" },
  { role: "ADMIN", nama: "SUKIRNO", id: "17221" },
  { role: "ADMIN", nama: "AAT SOLIHAT", id: "17341" },
  { role: "ADMIN", nama: "GUNAWAN", id: "17192" },
  { role: "ADMIN", nama: "SYAIFUL BAHRI", id: "19679" },
  { role: "ADMIN", nama: "AGUS SANTOSO", id: "36235" },
  { role: "ADMIN", nama: "AKHMAD SOBIR", id: "37031" },
  { role: "ADMIN", nama: "VIRGINIA REGITA SARI", id: "PKL 25" }
];

const scanBtn = document.getElementById("scanBtn");
const nextBtn = document.getElementById("nextBtn");
const cameraModal = document.getElementById("cameraModal");
const closeCamera = document.getElementById("closeCamera");
const captureBtn = document.getElementById("captureBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusText = document.getElementById("status");
const cameraStatus = document.getElementById("cameraStatus");
const idInput = document.getElementById("idInput");

let stream = null;

function setStatus(message, type = "default") {
  statusText.innerText = message;

  if (type === "success") {
    statusText.style.color = "#12a150";
  } else if (type === "error") {
    statusText.style.color = "#d23b63";
  } else {
    statusText.style.color = "#7d7591";
  }
}

function saveUserSession(user) {
  localStorage.setItem("verifiedName", user.nama);
  localStorage.setItem("verifiedId", user.id);
  localStorage.setItem("verifiedRole", user.role || "USER");
  localStorage.setItem("verifiedLoginAt", new Date().toISOString());
}

function finishLogin(user) {
  saveUserSession(user);
  AppData.loginAudit();
  setStatus("Login Berhasil ✔", "success");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}

scanBtn?.addEventListener("click", async () => {
  cameraModal.style.display = "flex";
  cameraStatus.innerText = "Membuka kamera...";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      cameraStatus.innerText = "Kamera aktif. Arahkan ID Card lalu tekan CAPTURE.";
    };
  } catch (error) {
    console.error(error);
    cameraStatus.innerText = "Kamera tidak bisa dibuka.";
    alert("Kamera tidak bisa dibuka!");
  }
});

captureBtn?.addEventListener("click", async () => {
  if (!video.videoWidth) {
    cameraStatus.innerText = "Video belum siap...";
    return;
  }

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  cameraStatus.innerText = "Membaca ID dengan OCR...";

  try {
    const { data: { text } } = await Tesseract.recognize(canvas, "eng");

    const cleanedText = (text || "")
      .toUpperCase()
      .replace(/\n/g, " ")
      .replace(/O/g, "0")
      .replace(/I/g, "1")
      .replace(/S/g, "5")
      .replace(/B/g, "8");

    const foundUser = users.find((user) => cleanedText.includes(user.id));

    if (foundUser) {
      cameraStatus.innerText = `User dikenali: ${foundUser.nama}`;
      stopCamera();
      cameraModal.style.display = "none";
      finishLogin(foundUser);
    } else {
      setStatus("ID Tidak Dikenali ❌", "error");
      cameraStatus.innerText = "ID tidak ditemukan dalam daftar user.";
    }
  } catch (error) {
    console.error(error);
    setStatus("OCR gagal ❌", "error");
    cameraStatus.innerText = "Terjadi kesalahan saat membaca ID.";
  }
});

nextBtn?.addEventListener("click", () => {
  const inputID = idInput.value.trim();
  const userFound = users.find((u) => u.id === inputID);

  if (userFound) {
    finishLogin(userFound);
  } else {
    setStatus("ID Tidak Terdaftar ❌", "error");
  }
});

idInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    nextBtn.click();
  }
});

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

closeCamera?.addEventListener("click", () => {
  stopCamera();
  cameraModal.style.display = "none";
  cameraStatus.innerText = "";
});

window.addEventListener("beforeunload", stopCamera);