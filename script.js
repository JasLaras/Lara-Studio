// Edit this block. Everything on the page that you will want to change lives here.
const SITE = {
  name: 'Lara Studio',          // shows in the header, footer and browser tab
  city: 'Davis | Los Angeles',
  song: 'Indigo Puff, Sundara Karma ',    // shown until the live lookup below works
  email: 'jasminesaldano@gmail.com',

  // Live "Now playing" from Last.fm. Pick ONE way to set it up:
  //
  // 1) Keeps your key out of this repo (recommended): deploy worker.js to
  //    Cloudflare, store the key there, and paste the worker's URL as proxyUrl.
  //    Leave user and apiKey empty.
  //
  // 2) Quick and simple: fill in user and apiKey. The key then sits in this
  //    file and in the page code anyone can view. Leave proxyUrl empty.
  //
  // Leave everything empty to keep the song text above.
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
  },

  // Add photos by putting files in an "images" folder next to index.html,
  // then listing them here in order. Up to 4 replace the gray tiles.
  // Example: { src: 'images/desk.jpg', alt: 'My desk setup' }
  photos: [
    // { src: 'images/photo-1.jpg', alt: 'Describe the photo' },
  ],
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
