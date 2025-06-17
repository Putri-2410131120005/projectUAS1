// detail.js
// FUNGSI UTAMA: Menampilkan informasi detail tour guide berdasarkan ID dari URL

const params = new URLSearchParams(window.location.search); // Ambil parameter dari URL
const guideId = params.get('guide'); // Ambil nilai dari parameter 'guide'

// Mengambil data dari data.json dan menampilkan detail guide
fetch('data.json')
  .then(res => res.json()) // Konversi response menjadi JSON
  .then(data => {
    const guide = data.find(g => g.id === guideId); // Temukan guide dengan ID yang cocok

    if (guide) {
      // Masukkan data ke elemen HTML
      document.getElementById('profile-img').src = guide.image || '';
      document.getElementById('name').textContent = guide.name || '-';
      document.getElementById('phone').textContent = guide.phone || '-';
      document.getElementById('email').textContent = guide.email || '-';
      document.getElementById('languages').textContent = guide.bahasa || '-';
      document.getElementById('tour-area').textContent = guide["wilayah tour"] || '-';
      document.getElementById('info-detail').textContent = guide["info detail"] || '-';

      // Menampilkan rating sebagai bintang
      document.getElementById('stars').innerHTML = 
        '★'.repeat(guide.rating) + '☆'.repeat(5 - guide.rating);

      // Placeholder untuk ulasan
      document.getElementById('ulasan').textContent = "";
    } else {
      document.body.innerHTML = "<h2>Data tidak ditemukan.</h2>";
    }
  })
  .catch(err => {
    console.error(err); // Tampilkan error di konsol
    document.body.innerHTML = "<h2>Gagal memuat data.</h2>";
  });

// Sistem ulasan (rating + komentar)
let selectedRating = 0;
let reviews = [];

function submitReview() {
  const comment = document.getElementById('user-comment').value.trim();
  const rating = selectedRating;

  // Validasi input
  if (!comment || rating === 0) {
    alert('Silakan isi komentar dan pilih rating.');
    return;
  }

  // Tambah review ke array
  reviews.push({ comment, rating });
  renderReviews();

  // Reset form
  document.getElementById('user-comment').value = '';
  selectedRating = 0;
  updateStarDisplay();
}

function renderReviews() {
  const container = document.getElementById('review-list');
  container.innerHTML = '';

  // Tampilkan semua review
  if (reviews.length === 0) {
    container.innerHTML = '<p>Belum ada ulasan.</p>';
    return;
  }

  // Loop dan tampilkan tiap review
  reviews.forEach((rev) => {
    const div = document.createElement('div');
    div.className = 'single-review';
    div.innerHTML = `
      <div class="review-rating">Rating: ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
      <div class="review-comment">${rev.comment}</div>
    `;
    container.appendChild(div);
  });
}

// Fungsi membuat bintang klikable
function setupStars() {
  const starContainer = document.getElementById('user-stars');
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.dataset.value = i;
    star.innerHTML = '&#9733;';
    star.addEventListener('click', () => {
      selectedRating = i;
      updateStarDisplay();
    });
    starContainer.appendChild(star);
  }
}

// Update warna bintang sesuai nilai yang dipilih
function updateStarDisplay() {
  const stars = document.querySelectorAll('#user-stars .star');
  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    star.style.color = val <= selectedRating ? '#f4c150' : '#ccc';
  });
}

setupStars(); // Jalankan fungsi setup saat halaman dimuat
