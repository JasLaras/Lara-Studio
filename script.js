// Edit this block. Everything on the page that you will want to change lives here.
const SITE = {
  name: 'Lara Studio',          // shows in the header, footer and browser tab
  city: 'Davis | Los Angeles',
  song: 'Indigo Puff, Sundara Karma',    // shown until the live lookup below works
  email: 'jasminesaldano@gmail.com',

  // Live "Now playing" from Last.fm, through your Cloudflare Worker.
  lastfm: {
    proxyUrl: 'https://now-playing.jazsaldano.workers.dev',
    user: '',
    apiKey: '',
  },

  // Paste your real profile URLs. Leave a link as '' to hide it.
  links: {
    // pinterest: 'https://www.pinterest.com/',
    // tiktok: 'https://www.tiktok.com/',
    // amazon: 'https://www.amazon.com/',
    // linktree: 'https://linktr.ee/laramuse',
    github: 'https://github.com/JasLaras',
    linkedin: 'https://www.linkedin.com/in/jaslaras'
  },

  // Photos go in an "images" folder next to index.html.
  // The first 3 replace the gray tiles at the top.
  photos: [
    { src: 'images/foto1.png', caption: 'Laguna Beach, California' },
    { src: 'images/foto2.png', caption: 'Calzedonia, flats, and rain' },
    { src: 'images/foto3.png', caption: "Grandmother's figs, Izmir" },
  ],

  // The photo in the Info section.
  infoPhoto: { src: 'images/foto4.png', alt: 'Portrait behind a fan' },
};

// ---- Nothing below needs editing ----

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((el) => { el.textContent = value; });
}

document.title = SITE.name;
setText('[data-site-name]', SITE.name);
setText('[data-city]', SITE.city);
setText('[data-song]', SITE.song);
setText('[data-year]', String(new Date().getFullYear()));

document.querySelectorAll('[data-email]').forEach((el) => {
  el.textContent = SITE.email;
  el.href = 'mailto:' + SITE.email;
});

document.querySelectorAll('[data-link]').forEach((el) => {
  const url = SITE.links[el.dataset.link];
  if (url) {
    el.href = url;
  } else {
    el.hidden = true;
  }
});

const songLink = document.querySelector('[data-song-link]');
const spotifySearch = (query) =>
  'https://open.spotify.com/search/' + encodeURIComponent(query);

// Until the live lookup answers, link the typed song
if (songLink) songLink.href = spotifySearch(SITE.song);

async function loadNowPlaying() {
  const { proxyUrl, user, apiKey } = SITE.lastfm;
  let url = proxyUrl;
  if (!url && user && apiKey) {
    url = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&limit=1&format=json'
      + '&user=' + encodeURIComponent(user)
      + '&api_key=' + encodeURIComponent(apiKey);
  }
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Last.fm returned ' + res.status);
    const data = await res.json();
    let track = data.recenttracks && data.recenttracks.track;
    if (Array.isArray(track)) track = track[0];
    if (!track) return;
    const playing = Boolean(track['@attr'] && track['@attr'].nowplaying === 'true');
    setText('[data-song-label]', playing ? 'Now playing:' : 'Last played:');
    setText('[data-song]', track.name + ' - ' + track.artist['#text']);
    if (songLink) songLink.href = spotifySearch(track.name + ' ' + track.artist['#text']);
  } catch (err) {
    // Keep the fallback text from SITE.song.
  }
}
loadNowPlaying();
setInterval(loadNowPlaying, 60000);

document.querySelectorAll('[data-photo]').forEach((tile, i) => {
  const photo = SITE.photos[i];
  if (!photo) return;
  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = photo.alt || '';
  img.loading = 'lazy';
  tile.replaceChildren(img);
  tile.classList.add('has-photo');
});

const infoSlot = document.querySelector('[data-info-photo]');
if (infoSlot && SITE.infoPhoto) {
  const img = document.createElement('img');
  img.src = SITE.infoPhoto.src;
  img.alt = SITE.infoPhoto.alt || '';
  img.loading = 'lazy';
  infoSlot.replaceChildren(img);
  infoSlot.classList.add('has-photo');
}

// Fade in on load and on scroll
const revealEls = document.querySelectorAll(
  '.tile, .statement > *, .block > :not(.rows):not(.contact), .row, .contact > *'
);

// Stagger siblings so they arrive one after another
const seen = new Map();
revealEls.forEach((el) => {
  el.classList.add('reveal');
  const parent = el.parentElement;
  const n = seen.get(parent) || 0;
  el.style.setProperty('--delay', Math.min(n * 0.12, 0.4) + 's');
  seen.set(parent, n + 1);
});

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}