import axios from 'axios';
import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';

const API_KEY = '55192474-4ac14a3eef79a9c3a5b4b0580';
const BASE_URL = 'https://pixabay.com/api/';

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-bar');
const gallery = document.querySelector('#gallery');

let lightbox;

form.addEventListener('submit', async event => {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    iziToast.warning({
      title: 'Увага',
      message: 'Введіть запит',
      position: 'topRight',
    });
    return;
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 12,
        page: 1,
      },
    });

    const { hits } = response.data;

    if (!hits.length) {
      gallery.innerHTML = '';
      iziToast.error({
        title: 'Помилка',
        message: 'Нічого не знайдено',
        position: 'topRight',
      });
      return;
    }

    gallery.innerHTML = hits
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
              <img class="photo-img" src="${webformatURL}" alt="${tags}" />
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

    if (lightbox) {
      lightbox.destroy();
    }

    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });

    lightbox.refresh();
  } catch (error) {
    iziToast.error({
      title: 'Помилка',
      message: 'Помилка запиту до сервера',
      position: 'topRight',
    });
    console.error(error);
  }
});