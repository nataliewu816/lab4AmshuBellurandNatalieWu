/**
 * @fileoverview NYT Popular Articles – main application logic
 * Fetches and displays the top 5 most popular NYT articles,
 * filtered by popularity criteria and time period via radio buttons.
 */

const API_KEY = 'om62aY1SvQJuusPijaFVqMBxPJIr1xhFIuG2Q9s3QWQNVYnq';
const BASE_URL = 'https://api.nytimes.com/svc/mostpopular/v2';
const NUM_ARTICLES = 5;

/**
 * Builds the NYT Most Popular API URL.
 * @param {string} criteria - 'viewed' | 'shared' | 'emailed'
 * @param {string|number} period - 1, 7, or 30
 * @returns {string} Full API endpoint URL
 */
function buildUrl(criteria, period) {
  return `${BASE_URL}/${criteria}/${period}.json?api-key=${API_KEY}`;
}

/**
 * Formats an ISO date string into YYYY-MM-DD display format.
 * @param {string} dateStr - e.g. "2024-04-01"
 * @returns {string} e.g. "2024-04-01"
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

/**
 * Extracts the best available thumbnail image URL from an article.
 * @param {Object} article - NYT article object
 * @returns {string} Image URL or empty string
 */
function getImageUrl(article) {
  const mediaList = article.media;
  if (!mediaList || mediaList.length === 0) return '';
  const media = mediaList[0];
  if (!media || !media['media-metadata']) return '';
  const metadata = media['media-metadata'];
  // Prefer 'Standard Thumbnail' (smallest), fall back to first
  const thumb = metadata.find(m => m.format === 'Standard Thumbnail') || metadata[0];
  return thumb ? thumb.url : '';
}

/**
 * Gets the currently selected value of a named radio button group.
 * @param {string} name - The name attribute of the radio group
 * @returns {string} The value of the checked radio input
 */
function getRadioValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

/**
 * Creates a DOM element for a single article card.
 * @param {Object} article - NYT article object
 * @param {number} rank - 1-based display rank
 * @returns {HTMLAnchorElement} The rendered article card element
 */
function createArticleCard(article, rank) {
  const imgUrl = getImageUrl(article);

  const card = document.createElement('a');
  card.className = 'article-card';
  card.href = article.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';

  card.innerHTML = `
    <div class="article-top">
      <h2 class="article-title">${rank}) ${article.title}</h2>
      <span class="article-date">${formatDate(article.published_date)}</span>
    </div>
    <div class="article-bottom">
      ${imgUrl ? `<img class="article-img" src="${imgUrl}" alt="${article.title}" />` : ''}
      <p class="article-abstract">${article.abstract}</p>
    </div>
  `;

  return card;
}

/**
 * Renders up to NUM_ARTICLES valid article cards into the #articles container.
 * Skips articles that are missing required fields or an image, loading
 * the next available one in its place (try/catch per article).
 * @param {Object[]} articles - Array of up to 20 NYT article objects
 */
function renderArticles(articles) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  let rendered = 0;

  for (let i = 0; i < articles.length && rendered < NUM_ARTICLES; i++) {
    try {
      const article = articles[i];
      if (!article.title) throw new Error('Missing title');
      if (!article.abstract) throw new Error('Missing abstract');
      if (!article.url) throw new Error('Missing URL');
      const imgUrl = getImageUrl(article);
      if (!imgUrl) throw new Error('No image');

      const card = createArticleCard(article, rendered + 1);
      container.appendChild(card);
      rendered++;
    } catch (err) {
      console.warn(`Skipping article ${i}:`, err.message);
    }
  }

  if (rendered === 0) {
    container.innerHTML = '<p class="error-msg">No articles could be loaded. Please try again.</p>';
  }
}

/**
 * Fetches articles from the NYT API and renders them.
 * Shows a loading spinner while fetching; shows an error message on failure.
 */
async function fetchAndRender() {
  const criteria = getRadioValue('criteria');
  const period = getRadioValue('period');
  const container = document.getElementById('articles');

  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading articles…</p>
    </div>
  `;

  try {
    const res = await fetch(buildUrl(criteria, period));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error('No results');
    renderArticles(data.results);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="error-msg">Failed to load articles: ${err.message}</p>`;
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRender();
  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', fetchAndRender);
  });
});