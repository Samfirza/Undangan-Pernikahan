// Interaksi: personalisasi, scroll animations, musik (best-effort autoplay), RSVP
(function(){
  // Configuration
  const MP3_SRC = 'assets/gending.mp3'; // ganti jika Anda upload MP3 langsung
  const YOUTUBE_ID = 'PDfueuBcbvs'; // fallback jika mp3 tidak tersedia
  const MAPS_SHORT_URL = 'https://maps.app.goo.gl/3Hc9dDbza1BiZxBn7'; // dari Anda

  // Personalize guest name from query ?name=
  const params = new URLSearchParams(__cpLocation.search);
  const guest = params.get('name');
  const guestEl = document.getElementById('guestName');
  if (guest && guestEl) guestEl.textContent = decodeURIComponent(guest);

  // Maps button
  const mapsBtn = document.getElementById('mapsBtn');
  const mapsOpen = document.getElementById('mapsOpen');
  if (mapsBtn) mapsBtn.href = MAPS_SHORT_URL;
  if (mapsOpen) mapsOpen.href = MAPS_SHORT_URL;

  // Scroll animations: IntersectionObserver
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
      }
    });
  }, {threshold: 0.12});

  document.querySelectorAll('.section-animate').forEach(s=>{
    observer.observe(s);
    // add stagger classes to children with data-animate
    const items = s.querySelectorAll('[data-animate]');
    items.forEach((it, i)=>{
      it.classList.add(`stagger-${(i%3)+1}`);
    });
  });

  // RSVP form
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpMsg = document.getElementById('rsvpMsg');
  if (rsvpForm){
    rsvpForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const attend = document.getElementById('rsvpAttend').value;
      if (!name){ rsvpMsg.textContent = 'Tolong isi nama.'; return; }
      rsvpMsg.textContent = `Terima kasih ${name}. Konfirmasi: ${attend}. (Silakan simpan daftar ini secara manual)`;
      rsvpForm.reset();
    });
  }

  // MUSIC: try autoplay mp3; if blocked, fallback to YouTube muted autoplay and show toggle
  const musicToggle = document.getElementById('musicToggle');
  const musicToast = document.getElementById('musicToast');
  let audio = null;
  let usingYouTube = false;
  let ytPlayer = null;

  function showToast(text){
    musicToast.textContent = text;
    musicToast.style.opacity = '1';
    musicToast.style.transform = 'translateY(0)';
    setTimeout(()=>{ musicToast.style.opacity = '0'; musicToast.style.transform = 'translateY(8px)'; }, 1800);
  }

  async function tryPlayAudio(){
    // create audio if not exists
    if (!audio){
      audio = new Audio(MP3_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.playsInline = true;
    }
    try {
      await audio.play();
      // success
      usingYouTube = false;
      musicToggle.textContent = '♪';
      showToast('Musik otomatis diputar');
      return true;
    } catch (err) {
      // blocked: fallback to YouTube muted autoplay (will be silent but at least 'playing' state)
      return false;
    }
  }

  function createYouTubeMutedAutoplay(){
    if (ytPlayer) return;
    // create iframe with autoplay=1&mute=1
    const div = document.getElementById('youtube-player');
    if (!div) return;
    const iframe = document.createElement('iframe');
    iframe.width = '0';
    iframe.height = '0';
    iframe.style.opacity = '0';
    iframe.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_ID}&controls=0&modestbranding=1`;
    iframe.allow = 'autoplay; encrypted-media';
    div.appendChild(iframe);
    usingYouTube = true;
    musicToggle.textContent = '♪';
    showToast('Musik latar disiapkan (dikarenakan autoplay dibatasi, silakan tekan tombol untuk mendengarkan)');
  }

  // initial attempt after small delay to allow page load
  window.addEventListener('load', async ()=>{
    const ok = await tryPlayAudio();
    if (!ok){
      // create YT muted autoplay fallback
      createYouTubeMutedAutoplay();
    }
  });

  // music toggle: if using mp3, toggle play/pause; if using YT muted, try to unmute via opening real player via API only after interaction
  musicToggle.addEventListener('click', async ()=>{
    // if we successfully loaded audio element
    if (audio && !usingYouTube){
      if (audio.paused){
        try{
          await audio.play();
          musicToggle.textContent = '▮▮';
          showToast('Musik diputar');
        }catch(e){
          showToast('Gagal memutar; coba izinkan suara di browser.');
        }
      } else {
        audio.pause();
        musicToggle.textContent = '♪';
        showToast('Musik dihentikan');
      }
      return;
    }

    // if not using mp3, try to create an audible audio by creating audio from YouTube via WebAudio (NOT reliable),
    // simpler: try to load iframe player and ask user to allow sound via first click -> open a small player window
    if (usingYouTube){
      // Attempt to open YouTube video in new tab where user can press play (UX compromise).
      const open = confirm('Autoplay browser membatasi suara. Buka pemutar untuk menyalakan musik? (akan buka YouTube di tab baru)');
      if (open){
        window.open(`https://www.youtube.com/watch?v=${YOUTUBE_ID}`, '_blank', 'noopener');
      }
      return;
    }

    // last fallback: try to create audio and play
    const ok = await tryPlayAudio();
    if (!ok){
      createYouTubeMutedAutoplay();
    }
  });

  // small UX: hide musicToggle on keyboard-only users? keep visible.

})();
