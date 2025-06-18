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
})
.catch((err) => {
  console.error("Gagal memuat data tempat:", err);
});

// PETA & RUTE
function setupMap(data) {
  const map = L.map("map").setView(data.koordinat, 15);
  map.zoomControl.setPosition("bottomleft");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
      

      control = L.Routing.control({
        waypoints: [
          L.latLng(coordinates[0], coordinates[1]),
          L.latLng(data.koordinat[0], data.koordinat[1]),
        ],
        draggableWaypoints: true, //agar titik point dapat dipindahkan scr interaktif
        addWaypoints: false, //agar pengguna tidak dapat menambahkan titik perantara baru ke rute
        showAlternatives: true, // menampilkan atau menyarankan rute alternatif lainnya
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
  if (data.length > 0) { //memeriksan apakah ada hasil yang ditemukan, dari beberapa tempat yang tersedia
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  alert("Tempat tidak ditemukan!");
  return null;
}

window.onload = function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBK1vKLs1KdsAfgex8uue77T8BH98p6tRY",
    authDomain: "percobaanrating.firebaseapp.com",
    databaseURL: "https://percobaanrating-default-rtdb.firebaseio.com",
    projectId: "percobaanrating",
    storageBucket: "percobaanrating.appspot.com",
    messagingSenderId: "904226782106",
    appId: "1:904226782106:web:0190958c1a93ed677f9823"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const database = firebase.database();
  const namaWisata = tempatId;
  let nilaiTerpilih = 0;
  let penggunaSaatIni = null;

  function tandaiBintang(nilai) {
    document.querySelectorAll(".bintang").forEach(el => {
      el.classList.toggle("hovered", parseInt(el.dataset.nilai) <= nilai);
      el.classList.toggle("aktif", parseInt(el.dataset.nilai) <= nilai);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  document.getElementById("btnRegister").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!isValidEmail(email)) return alert("Email tidak valid!");
    auth.createUserWithEmailAndPassword(email, password)
      .catch(err => alert("Registrasi gagal:"));
  });

  document.getElementById("btnLogin").addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
      .then(() => alert("Login berhasil!"))
      .catch(err => alert("Login gagal"));
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    auth.signOut().then(() => alert("Logout berhasil!"));
  });

  auth.onAuthStateChanged(user => {
    penggunaSaatIni = user;
    const statusLogin = document.getElementById("statusLogin");
    const btnLogout = document.getElementById("btnLogout");

    if (user) {
      statusLogin.innerText = `Login sebagai: ${user.email}`;
      btnLogout.classList.remove("d-none");
      tampilkanKomentar();
    } else {
      statusLogin.innerText = "Silakan login untuk memberi komentar dan rating.";
      btnLogout.classList.add("d-none");
    }
  });

  if (namaWisata) {
    const db = database.ref("tempat_wisata/" + namaWisata);

    document.querySelectorAll(".bintang").forEach(b => {
      b.addEventListener("click", () => {
        const user = penggunaSaatIni;
        if (!user) {
          alert("Silakan login untuk memberi rating.");
          return;
        }

        const uid = user.uid;
        const nilai = parseInt(b.dataset.nilai);
        nilaiTerpilih = nilai;

        db.child("ratings").child(uid).once("value", snapshot => {
          if (snapshot.exists()) {
            alert("Anda sudah memberi rating untuk tempat ini.");
            return;
          }

          db.once("value").then(snapshot => {
            const data = snapshot.val() || {};
            const totalNilai = (data.totalNilai || 0) + nilai;
            const jumlahPenilai = (data.jumlahPenilai || 0) + 1;

            db.update({
              totalNilai: totalNilai,
              jumlahPenilai: jumlahPenilai
            });

            db.child("ratings").child(uid).set(nilai);
            document.getElementById("info").innerText = `Terima kasih! Rating Anda: ${nilai}`;
            tandaiBintang(nilai);
          });
        });
      });

      b.addEventListener("mouseover", () => {
        tandaiBintang(parseInt(b.dataset.nilai));
      });

      b.addEventListener("mouseout", () => {
        tandaiBintang(nilaiTerpilih);
      });
    });

    db.once("value").then(snapshot => {
      const data = snapshot.val() || {};
      const rata2 = data.jumlahPenilai === 0 ? 0 : (data.totalNilai / data.jumlahPenilai);
      document.getElementById("info").innerText = `Rating: ${rata2.toFixed(2)} dari ${data.jumlahPenilai || 0} penilai`;
      tandaiBintang(Math.floor(rata2));
    });


    //KOMENTAR
    const daftarKomentar = document.getElementById("daftarKomentar");
    const komentarInput = document.getElementById("komentar");

    document.getElementById("kirimKomentar").addEventListener("click", () => {
      const user = penggunaSaatIni;
      const komentar = komentarInput.value.trim();

      if (!user) return alert("Anda harus login untuk mengirim komentar.");
      if (!komentar) return alert("Komentar tidak boleh kosong.");

      const komentarRef = db.child("komentar").push();
      komentarRef.set({
        email: user.email,
        isi: komentar,
        waktu: new Date().toISOString()
      }).then(() => {
        komentarInput.value = "";
        tampilkanKomentar();
      }).catch(err => {
        alert("Gagal mengirim komentar");
      });
    });

    function tampilkanKomentar() {
      db.child("komentar").once("value").then(snapshot => {
        const data = snapshot.val();
        if (!data) {
          daftarKomentar.innerHTML = "Belum ada komentar.";
          return;
        }

        const komentarHTML = Object.values(data).reverse().map(item => `
          <p><strong>${item.email}</strong><br>${item.isi}</p>
        `).join("");

        daftarKomentar.innerHTML = komentarHTML;
      });
    }

    tampilkanKomentar();
  }
};
