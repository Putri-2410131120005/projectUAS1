let guides = [];
let cards = [];
let currentIndex = 1;

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    guides = data;
    renderCarousel();
  })
  .catch(err => console.error('Gagal memuat data:', err));

function createCard(guide) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-header"></div>
    <img src="${guide.image}" alt="Profile"/>
    <div class="stars">${'★'.repeat(guide.rating)}${'☆'.repeat(5 - guide.rating)}</div>
    <p class="name">${guide.name}</p>
    <p><i class="fas fa-phone"></i> ${guide.phone}</p>
    <p><i class="fas fa-envelope"></i> ${guide.email}</p>
    <button class="detail-btn" onclick="goToDetail('${guide.id}')">
      Lihat detail <i class="fas fa-caret-right"></i>
    </button>
  `;
  return card;
}

function renderCarousel() {
  const carousel = document.getElementById('carousel');
  guides.forEach(guide => {
    const card = createCard(guide);
    carousel.appendChild(card);
  });

  updateCardRefs();
  updateCarousel();
}

function updateCardRefs() {
  cards = document.querySelectorAll('.card');
}

function updateCarousel() {
  cards.forEach((card, index) => {
    card.classList.remove('active');
    if (index === currentIndex) {
      card.classList.add('active');
    }
  });

  const cardWidth = cards[0].offsetWidth + 20;
  const offset = (currentIndex - 1) * cardWidth;
  document.getElementById('carousel').style.transform = `translateX(${-offset}px)`;
}

function moveCarousel(direction) {
  const maxIndex = cards.length - 1;
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > maxIndex) currentIndex = maxIndex;

  updateCarousel();
}

function goToDetail(id) {
  window.location.href = `detail.html?guide=${id}`;
}
