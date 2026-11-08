/* ===== CONFIGURACIÓN (editar solo acá) ===== */
const CONFIG = {
  fecha: "December 13, 2026 21:00:00",        // HORA PROVISORIA (21:00): confirmar con Isabella
  youtubeId: "j3ObHjm1fAE",                               // código del video de YouTube de la canción. Vacío = no aparece el reproductor
  inicio: 30,                                  // segundo desde el que suena la canción (30 = salta los primeros 30 s de intro)
  whatsapp: "5491165286830",                   // 54 + 9 + número (confirmar que sea el WhatsApp)
  mapsUrl: "https://maps.app.goo.gl/y8uJtqJ5FoqePBLZ6",                                 // link de Google Maps del salón. Vacío = no aparece el botón
  alias: "isabella",                                   // alias o CBU. Vacío = no aparece la sección de regalos
  albumUrl: "https://photos.app.goo.gl/WpPPTVfGd7tURbah6",   // álbum compartido de Isabella (QR y botón)
  playlistUrl: "https://open.spotify.com/playlist/5Sf5nsXzMx0s9bSrUkwPwW?si=f115921d2ada4890&pt=f36ebe1e791f43576a4096c71f848620",   // playlist de Isabella
  confirmarAntes: "Confirmar antes del 1 de diciembre",                          // por ejemplo "Confirmar antes del 1 de diciembre". Vacío = no aparece
  mensajeWa: "Hola! Confirmo mi asistencia a los XV de Isabella"
};

const $ = id => document.getElementById(id);

/* ===== Secciones opcionales: aparecen solo si hay dato en CONFIG ===== */
const show = (...ids) => ids.forEach(i => $(i).classList.remove('hidden'));
$('wa-btn').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensajeWa)}`;
if (CONFIG.mapsUrl) { $('maps-btn').href = CONFIG.mapsUrl; show('maps-btn'); }
if (CONFIG.alias) { $('alias').textContent = CONFIG.alias; show('gift-section', 'gift-respiro'); }
if (CONFIG.confirmarAntes) { $('confirm-note').textContent = CONFIG.confirmarAntes; show('confirm-note'); }
if (CONFIG.playlistUrl) { $('playlist-link').href = CONFIG.playlistUrl; show('playlist-section', 'playlist-respiro'); }
if (CONFIG.albumUrl) {
  $('album-link').href = CONFIG.albumUrl;
  show('album-section', 'album-respiro');
  try {                                              // el QR se genera en el propio celular
    const qr = qrcode(0, 'M'); qr.addData(CONFIG.albumUrl); qr.make();
    $('qr').src = qr.createDataURL(8, 0); $('qr').style.imageRendering = 'pixelated';
  } catch (err) {
    $('qr').src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=' + encodeURIComponent(CONFIG.albumUrl);
  }
}
if (!CONFIG.youtubeId) $('player').classList.add('hidden');   // sin canción no hay reproductor

/* ===== Música (YouTube oculto + reproductor propio) ===== */
let yt, ticker, ready = false, wantPlay = false;
const playBtn = $('btn-play'), bar = $('progress');

if (CONFIG.youtubeId) {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('yt-player', {
    height: '1', width: '1', videoId: CONFIG.youtubeId,
    playerVars: { playsinline: 1, controls: 0, start: CONFIG.inicio },
    events: {
      onReady: () => { ready = true; if (wantPlay) yt.playVideo(); },
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED && $('btn-repeat').classList.contains('on')) { yt.seekTo(CONFIG.inicio, true); yt.playVideo(); return; }   // al terminar, vuelve a empezar sin la intro
        const playing = e.data === YT.PlayerState.PLAYING;
        playBtn.classList.toggle('playing', playing);
        clearInterval(ticker);
        if (playing) ticker = setInterval(() => {
          bar.value = Math.max(0, (yt.getCurrentTime() - CONFIG.inicio) / span() * 100) || 0;
        }, 500);
      }
    }
  });
};
const isPlaying = () => ready && yt.getPlayerState() === 1;
/* La barra muestra solo la parte que suena: empieza vacía en el segundo 'inicio' y se llena hasta el final de la canción */
const span = () => Math.max(1, yt.getDuration() - CONFIG.inicio);
let userPaused = false, needResume = false;     // userPaused: pausó a propósito
playBtn.onclick = () => { if (!ready) return; if (isPlaying()) { userPaused = true; yt.pauseVideo(); } else { userPaused = false; yt.playVideo(); } };
bar.oninput = () => ready && yt.seekTo(CONFIG.inicio + span() * bar.value / 100, true);
$('btn-prev').onclick = $('btn-next').onclick = () => { if (!ready) return; userPaused = false; yt.seekTo(CONFIG.inicio, true); yt.playVideo(); };
$('btn-repeat').onclick = e => e.currentTarget.classList.toggle('on');
$('btn-shuffle').onclick = e => e.currentTarget.classList.toggle('on');
$('yt-player').style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px';

/* ===== Abrir sobre: tocar el sello -> se rompe, se abre la solapa, sube la carta, entra la invitación ===== */
$('open-btn').addEventListener('click', function () {
  const env = $('envelope'), screen = $('welcome-screen');
  if (env.classList.contains('open')) return;      // evita doble toque
  env.classList.add('open');
  screen.classList.add('opening');
  wantPlay = true; if (ready) yt.playVideo();      // la música arranca con el toque
  setTimeout(() => {
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.classList.add('hidden');
      $('main-content').classList.remove('hidden');
      fitStory();
      window.scrollTo(0, 0);
    }, 600);
  }, 2900);                                         // tiempo que dura la animación del sobre
});

/* ===== Cuenta regresiva ===== */
const eventDate = new Date(CONFIG.fecha).getTime();
const pad = n => String(n).padStart(2, '0');
const tick = () => {
  const d = eventDate - Date.now();
  if (d < 0) { clearInterval(timer); $('countdown').textContent = '¡Llegó el gran día!'; return; }
  $('days').textContent = pad(Math.floor(d / 864e5));
  $('hours').textContent = pad(Math.floor(d % 864e5 / 36e5));
  $('minutes').textContent = pad(Math.floor(d % 36e5 / 6e4));
  $('seconds').textContent = pad(Math.floor(d % 6e4 / 1e3));
};
const timer = setInterval(tick, 1000);
tick();

/* ===== Copiar alias ===== */
$('copy-alias').onclick = async e => {
  const btn = e.currentTarget, txt = $('alias').textContent.trim();
  try {
    await navigator.clipboard.writeText(txt);
  } catch {
    const t = document.createElement('textarea');
    t.value = txt; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch { }
    t.remove();
  }
  btn.textContent = '¡Copiado!';
  setTimeout(() => btn.textContent = 'Copiar alias', 2000);
};

/* ===== Fotos: busca automáticamente el archivo correcto =====
   Prueba: foto3.png, "foto 3.png", foto_3.png, .jpg, .jpeg, .webp (y mayúsculas).
   Las que tienen data-framed (marco de Canva) reciben la clase "framed". */
const V = '15';
const NAMES = n => [`foto${n}`, `foto ${n}`, `foto_${n}`];
const EXTS = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG'];

function candidates(n) {
  const list = [];
  NAMES(n).forEach(name => EXTS.forEach(ext => list.push(encodeURI(`${name}.${ext}`) + '?v=' + V)));
  return list;
}

function loadPhoto(img) {
  const list = candidates(img.dataset.foto);
  const framed = img.hasAttribute('data-framed');
  let i = 0;
  const next = () => {
    if (i >= list.length) { console.warn('No se encontró la foto', img.dataset.foto); return; }
    const probe = new Image();
    const url = list[i++];
    probe.onload = () => { img.src = url; if (framed) img.classList.add('framed'); };
    probe.onerror = next;
    probe.src = url;
  };
  next();
}

document.querySelectorAll('img[data-foto]').forEach(loadPhoto);


/* ===== Texto de la historia: mismo alto que las dos fotos =====
   Ajusta el tamaño de letra hasta que el texto empiece a la altura de la 1ª foto
   y termine a la altura de la 2ª (en cualquier celular). */
function fitStory() {
  const t = document.querySelector('.story-text');
  const box = document.querySelector('.story-photos');
  if (!t || !box || !box.offsetHeight) return;      // todavía oculto o sin cargar
  const target = box.offsetHeight * 0.90;           // 0.90 = descuenta el borde transparente de los marcos
  let lo = 11, hi = 24;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    t.style.fontSize = mid + 'px';
    if (t.scrollHeight > target) hi = mid; else lo = mid;
  }
  t.style.fontSize = lo + 'px';
}
document.querySelectorAll('.story-photos img').forEach(i => i.addEventListener('load', fitStory));
window.addEventListener('resize', fitStory);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStory);


/* ===== Al volver de Google Maps u otra app, la música sigue sola ===== */
function resumeMusic() {
  if (!ready || !wantPlay || userPaused || isPlaying()) return;
  yt.playVideo(); needResume = true;              // si el celular lo bloquea, se reanuda con el próximo toque
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(resumeMusic, 300); });
window.addEventListener('pageshow', () => setTimeout(resumeMusic, 300));
document.addEventListener('touchend', e => {
  if (!needResume || e.target.closest('.controls')) return;
  needResume = false;
  if (!userPaused && !isPlaying()) yt.playVideo();
}, { passive: true });

/* ===== El ícono del calendario se anima una sola vez: se reinicia al llegar a verlo ===== */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.target.getAttribute('src')) { const im = e.target; im.src = im.src.split('?')[0] + '?t=' + Date.now(); }
  }), { threshold: 0.6 });
  document.querySelectorAll('img[data-replay]').forEach(i => io.observe(i));
}

/* ===== Íconos animados: busca el archivo con o sin "_1" en el nombre (icono-camara_1.gif o icono-camara.gif) ===== */
document.querySelectorAll('img[data-icon]').forEach(img => {
  const n = img.dataset.icon, list = [`${n}_1.gif`, `${n}.gif`, `${n}_1.GIF`, `${n}.GIF`];
  let i = 0;
  const next = () => {
    if (i >= list.length) { console.warn('No se encontró el ícono', n); return; }
    const p = new Image(), u = list[i++] + '?v=1';
    p.onload = () => { img.src = u; };
    p.onerror = next;
    p.src = u;
  };
  next();
});
