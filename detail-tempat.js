// Ambil ID dari URL
const urlParams = new URLSearchParams(window.location.search);
const tempatId = urlParams.get("id");

// Gabungkan semua file JSON
Promise.all([
  fetch("tempat-alam.json").then(res => res.json()),
  fetch("tempat-religi.json").then(res => res.json()),
  fetch("tempat-edukasi.json").then(res => res.json()),
  fetch("tempat-buatan.json").then(res => res.json()),
  fetch("tempat-budayaSejarah.json").then(res => res.json()),
  fetch("tempat-kuliner.json").then(res => res.json()),
  fetch("tempat-pertualangan.json").then(res => res.json())
])
.then(([alam, religi, edukasi, buatan, budayaSejarah, kuliner, pertualangan]) => {
  const semuaTempat = { ...alam, ...religi, ...edukasi, ...buatan, ...budayaSejarah, ...kuliner, ...pertualangan };

  const data = semuaTempat[tempatId];
  if (!data) {
    alert("Tempat tidak ditemukan!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nama-tempat").textContent = data.nama;
  document.getElementById("lokasi-tempat").innerHTML =
    "<strong>Location:</strong><br>" + data.lokasi;

  setupMap(data);
  initKomentar(tempatId);
})
.catch((err) => {
  console.error("Gagal memuat data tempat:", err);
});

// PETA & RUTE
function setupMap(data) {
  const map = L.map("map").setView(data.koordinat, 13);
  map.zoomControl.setPosition("bottomright");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  L.marker(data.koordinat)
    .addTo(map)
    .bindPopup(`<b>${data.nama}</b><br>${data.lokasi}`)
    .openPopup();

  let control;

  window.updateRoute = async function () {
    const startInput = document.getElementById("startPoint").value;
    const coordinates = await getCoordinates(startInput);

    if (coordinates) {
      if (control) map.removeControl(control);

      control = L.Routing.control({
        waypoints: [
          L.latLng(coordinates[0], coordinates[1]),
          L.latLng(data.koordinat[0], data.koordinat[1]),
        ],
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        showAlternatives: false,
        createMarker: () => null,
      }).addTo(map);

      control.on("routesfound", function (e) {
        const route = e.routes[0];
        document.getElementById("distance").textContent = `Jarak Tempuh: ${(
          route.summary.totalDistance / 1000
        ).toFixed(2)} km | Waktu Tempuh: ${formatTime(route.summary.totalTime)}`;
      });
    }
  };
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} jam ${minutes} menit` : `${minutes} menit`;
}

async function getCoordinates(place) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
  );
  const data = await response.json();
  if (data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  alert("Tempat tidak ditemukan!");
  return null;
}

// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzwYLQ-_EI7LxDvAcgZfRHScZ1cn9dKss",
  authDomain: "komentar-proyekakhir.firebaseapp.com",
  projectId: "komentar-proyekakhir",
  storageBucket: "komentar-proyekakhir.appspot.com",
  messagingSenderId: "599737755520",
  appId: "1:599737755520:web:c1456857fbb23609dd4365",
  measurementId: "G-S6PF3RXN1J",
  databaseURL: "https://komentar-proyekakhir-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

function initKomentar(id) {
  const komentarInput = document.getElementById("komentar");
  const daftarKomentar = document.getElementById("daftarKomentar");
  const kirimBtn = document.getElementById("kirimKomentar");
  const status = document.getElementById("statusLogin");

  const komentarRef = ref(database, "komentar/" + id);
  daftarKomentar.innerHTML = "<p>Belum ada komentar.</p>";

  onAuthStateChanged(auth, (user) => {
    if (user) {
      status.textContent = "Login sebagai: " + (user.email || user.uid);

      kirimBtn.disabled = false;
      kirimBtn.onclick = () => {
        const isiKomentar = komentarInput.value.trim();
        if (isiKomentar !== "") {
          push(komentarRef, {
            isi: isiKomentar,
            uid: user.uid,
            email: user.email || "Tidak diketahui",
            timestamp: Date.now(),
          }).catch((error) => {
            console.error("Gagal menulis ke Firebase:", error);
          });

          komentarInput.value = "";
        } else {
          alert("Komentar tidak boleh kosong!");
        }
      };
    } else {
      status.textContent = "Silakan login untuk memberi komentar.";
      kirimBtn.disabled = true;
    }
  });

  onValue(komentarRef, (snapshot) => {
    const data = snapshot.val();
    daftarKomentar.innerHTML = "";

    if (data) {
      Object.values(data).forEach((item) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${item.email || "Anonim"}:</strong> ${item.isi}`;
        daftarKomentar.appendChild(p);
      });
    } else {
      daftarKomentar.innerHTML = "<p>Belum ada komentar.</p>";
    }
  });
}

// Login/Register/Logout
document.getElementById("btnLogin").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Login berhasil"))
    .catch((err) => alert("Gagal login: " + err.message));
};

document.getElementById("btnRegister").onclick = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Pendaftaran berhasil"))
    .catch((err) => alert("Gagal daftar: " + err.message));
};

document.getElementById("btnLogout").onclick = () => {
  signOut(auth).then(() => alert("Logout berhasil"));
};
