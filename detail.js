const params = new URLSearchParams(window.location.search);
const guideId = params.get('guide');

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const guide = data.find(g => g.id === guideId);

    if (guide) {
      document.getElementById('profile-img').src = guide.image || '';
      document.getElementById('name').textContent = guide.name || '-';
      document.getElementById('phone').textContent = guide.phone || '-';
      document.getElementById('email').textContent = guide.email || '-';
      document.getElementById('languages').textContent = guide.bahasa || '-';
      document.getElementById('tour-area').textContent = guide["wilayah tour"] || '-';
      document.getElementById('info-detail').textContent = guide["info detail"] || '-';
      document.getElementById('stars').innerHTML = 
        '★'.repeat(guide.rating) + '☆'.repeat(5 - guide.rating);

      // Placeholder ulasan - kamu bisa ganti dengan ulasan sebenarnya nanti
      document.getElementById('ulasan').textContent = "";
    } else {
      document.body.innerHTML = "<h2>Data tidak ditemukan.</h2>";
    }
  })
  .catch(err => {
    console.error(err);
    document.body.innerHTML = "<h2>Gagal memuat data.</h2>";
  });
let selectedRating = 0;
let reviews = [];

function submitReview() {
  const comment = document.getElementById('user-comment').value.trim();
  const rating = selectedRating;

  if (!comment || rating === 0) {
    alert('Silakan isi komentar dan pilih rating.');
    return;
  }

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

  if (reviews.length === 0) {
    container.innerHTML = '<p>Belum ada ulasan.</p>';
    return;
  }

  reviews.forEach((rev, idx) => {
    const div = document.createElement('div');
    div.className = 'single-review';
    div.innerHTML = `
      <div class="review-rating">Rating: ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
      <div class="review-comment">${rev.comment}</div>
    `;
    container.appendChild(div);
  });
}

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

function updateStarDisplay() {
  const stars = document.querySelectorAll('#user-stars .star');
  stars.forEach(star => {
    const val = parseInt(star.dataset.value);
    star.style.color = val <= selectedRating ? '#f4c150' : '#ccc';
  });
}

setupStars(); // jalankan saat halaman siap
