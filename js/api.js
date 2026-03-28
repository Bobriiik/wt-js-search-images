import axios from 'axios';
import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';
import { getPaginationRange } from './pagination.js';

const API_KEY = 'ТУТ_СВІЙ_PIXABAY_KEY';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-bar');
const gallery = document.querySelector('#gallery');
const paginationContainer = document.querySelector('#pagination-container');
const paginationNumbers = document.querySelector('#pagination-numbers');
const prevButton = document.querySelector('#prev-button');
const nextButton = document.querySelector('#next-button');

let lightbox = null;
let currentQuery = '';
let currentPage = 1;
let totalPages = 1;
const perPage = 12;

form.addEventListener('submit', onFormSubmit);
prevButton.addEventListener('click', onPrevClick);
nextButton.addEventListener('click', onNextClick);

async function onFormSubmit(event) {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    showWarning('Введіть запит для пошуку');
    return;
  }

  currentQuery = query;
  currentPage = 1;

  await fetchImages();
}

async function onPrevClick() {
  if (currentPage > 1) {
    currentPage -= 1;
    await fetchImages();
    scrollToTop();
  }
}

async function onNextClick() {
  if (currentPage < totalPages) {
    currentPage += 1;
    await fetchImages();
    scrollToTop();
  }
}

async function fetchImages() {
  try {
    showLoader();

    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: currentQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });

    const { hits, totalHits } = response.data;

    if (!hits || hits.length === 0) {
      gallery.innerHTML = '';
      hidePagination();
      showError('За вашим запитом нічого не знайдено');
      return;
    }

    totalPages = Math.ceil(totalHits / perPage);
    renderGallery(hits);
    renderPagination(totalPages, currentPage);
    initLightbox();
  } catch (error) {
    console.error(error);
    showError('Сталася помилка під час завантаження зображень');
  }
}

function renderGallery(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
          <a class="photo-link" href="${largeImageURL}">
            <img
              class="photo-img"
              src="${webformatURL}"
              alt="${tags}"
              loading="lazy"
            />
          </a>
          <div class="info">
            <p class="info-item">Likes<span class="info__span">${likes}</span></p>
            <p class="info-item">Views<span class="info__span">${views}</span></p>
            <p class="info-item">Comments<span class="info__span">${comments}</span></p>
            <p class="info-item">Downloads<span class="info__span">${downloads}</span></p>
          </div>
        </div>
      `
    )
    .join('');

  gallery.innerHTML = markup;
}

function renderPagination(total, page) {
  if (total <= 1) {
    hidePagination();
    return;
  }

  paginationContainer.classList.remove('is-hidden');
  paginationNumbers.innerHTML = '';

  const pages = getPaginationRange(total, page);

  pages.forEach(pageNumber => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pagination-number';
    button.textContent = pageNumber;

    if (pageNumber === page) {
      button.classList.add('active');
    }

    button.addEventListener('click', async () => {
      currentPage = pageNumber;
      await fetchImages();
      scrollToTop();
    });

    paginationNumbers.appendChild(button);
  });

  prevButton.classList.toggle('disabled', page === 1);
  nextButton.classList.toggle('disabled', page === total);
  prevButton.disabled = page === 1;
  nextButton.disabled = page === total;
}

function hidePagination() {
  paginationContainer.classList.add('is-hidden');
}

function initLightbox() {
  if (lightbox) {
    lightbox.destroy();
  }

  lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });

  lightbox.refresh();
}

function showLoader() {
  gallery.innerHTML = '<p class="loader">Завантаження...</p>';
}

function showWarning(message) {
  iziToast.warning({
    title: 'Увага',
    message,
    position: 'topRight',
  });
}

function showError(message) {
  iziToast.error({
    title: 'Помилка',
    message,
    position: 'topRight',
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}