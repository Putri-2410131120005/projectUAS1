// script.js
// FUNGSI: Menampilkan daftar Tour Guide dalam bentuk carousel dan menangani navigasi serta tombol detail.

let guides = []; // Array untuk menyimpan data tour guide
let cards = [];  // Array referensi ke semua elemen kartu
let currentIndex = 1; // Indeks kartu aktif saat ini (ditampilkan besar)

// Ambil data tour guide dari file JSON
fetch('data.json')
  .then(res => res.json())         // Konversi respon ke JSON
  .then(data => {
    guides = data;                 // Simpan data guide ke variabel
    renderCarousel();              // Panggil fungsi untuk render kartu
  })
  .catch(err => console.error('Gagal memuat data:', err)); // Jika gagal, tampilkan pesan error

// Membuat elemen kartu HTML berdasarkan data guide
function createCard(guide) {
  const card = document.createElement('div'); // Buat elemen div baru
  card.className = 'card'; // Tambahkan kelas CSS
  card.innerHTML = `
    <div class="card-header"></div>
    <img src="${guide.image}" alt="Profile"/>
    <div class="stars">${'★'.repeat(guide.rating)}${'☆'.repeat(5 - guide.rating)}</div>
    <p class="name">${guide.name}</p>
    <p><i class="fas fa-phone"></i> ${guide.phone}</p>
    <button class="detail-btn" onclick="goToDetail('${guide.id}')">
      Lihat detail <i class="fas fa-caret-right"></i>
    </button>
  `;
  return card; // Kembalikan elemen kartu
}

// Fungsi untuk menampilkan semua kartu guide dalam carousel
function renderCarousel() {
  const carousel = document.getElementById('carousel');
  guides.forEach(guide => {
    const card = createCard(guide); // Buat kartu untuk setiap guide
    carousel.appendChild(card);     // Tambahkan ke elemen carousel
  });

  updateCardRefs(); // Ambil referensi DOM semua kartu
  updateCarousel(); // Perbarui posisi carousel (tampilkan kartu aktif)
}

// Simpan ulang semua referensi elemen kartu setelah di-render
function updateCardRefs() {
  cards = document.querySelectorAll('.card');
}

// Geser carousel ke kartu yang aktif
function updateCarousel() {
  cards.forEach((card, index) => {
    card.classList.remove('active');
    if (index === currentIndex) {
      card.classList.add('active'); // Hanya kartu aktif yang diperbesar
    }
  });

  const cardWidth = cards[0].offsetWidth + 20; // Ambil lebar kartu + gap
  const offset = (currentIndex - 1) * cardWidth; // Hitung posisi geser
  document.getElementById('carousel').style.transform = `translateX(${-offset}px)`;
}

// Fungsi untuk tombol navigasi geser kiri/kanan
function moveCarousel(direction) {
  const maxIndex = cards.length - 1; // Index maksimal
  currentIndex += direction;         // Tambah atau kurangi index
  if (currentIndex < 0) currentIndex = 0; // Batasi ke kiri
  if (currentIndex > maxIndex) currentIndex = maxIndex; // Batasi ke kanan

  updateCarousel(); // Perbarui tampilan carousel
}

// Fungsi untuk membuka halaman detail saat tombol diklik
function goToDetail(id) {
  window.location.href = `detail.html?guide=${id}`; // Redirect ke halaman detail dengan ID sebagai parameter
}

// Menangani dropdown pada menu responsive (jika digunakan manual tanpa JS Bootstrap)
document.addEventListener('DOMContentLoaded', () => {
  const dropdownTrigger = document.querySelector('.dropdown > a');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      dropdownMenu.classList.toggle('show'); // Toggle tampilkan menu
    });

    document.addEventListener('click', function (e) {
      if (!dropdownMenu.contains(e.target) && !dropdownTrigger.contains(e.target)) {
        dropdownMenu.classList.remove('show'); // Sembunyikan menu jika klik di luar
      }
    });
  }
});
