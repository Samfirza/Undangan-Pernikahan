// Personalisasi nama tamu lewat query string: ?name=Nama%20Tamu
(function(){
  const YOUTUBE_URL = 'https://youtu.be/PDfueuBcbvs';
  const MAPS_SHORT_URL = 'https://maps.app.goo.gl/3Hc9dDbza1BiZxBn7'; // URL yang Anda berikan

  // ambil video id dari url (works for youtu.be and youtube.com/watch)
  function extractYouTubeID(url){
    try{
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    }catch(e){}
    return null;
  }
  const videoId = extractYouTubeID(YOUTUBE_URL);

  const params = new URLSearchParams(location.search);
  const name = params.get('name');
  const guestNameEl = document.getElementById('guestName');
  if (name && guestNameEl) {
    guestNameEl.textContent = decodeURIComponent(name);
  }

  // Buttons & YouTube player
  const playBtn = document.getElementById('playBtn');
  const copyBtn = document.getElementById('copyBtn');
  const mapsOpen = document.getElementById('mapsOpen');

  // Gunakan short maps URL Anda untuk membuka aplikasi/halaman maps
  mapsOpen.href = MAPS_SHORT_URL;

  // YouTube player state
  let player = null;
  let isPlaying = false;
  let apiReady = false;

  function onYouTubeIframeAPIReady(){
    apiReady = true;
    if (!videoId) return;
    player = new YT.Player('youtube-player', {
      height: '0', // hidden video (audio-like experience)
      width: '0',
      videoId: videoId,
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        autoplay: 0,
        loop: 1,
        playlist: videoId,
        fs: 0,
      },
      events: {
        onReady: function() {
          // ready
        },
        onStateChange: function(e){
          if (e.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            playBtn.textContent = 'Hentikan Gending';
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            isPlaying = false;
            playBtn.textContent = 'Putar Gending';
          }
        }
      }
    });
    // keep player container hidden but ensure it exists
    document.getElementById('youtube-player').style.display = 'block';
    document.getElementById('youtube-player').style.width = '1px';
    document.getElementById('youtube-player').style.height = '1px';
    document.getElementById('youtube-player').style.opacity = '0';
  }

  // Attach global function for YouTube API
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

  // Load the API script only when user interacts (lazy)
  function loadYouTubeAPI(){
    if (apiReady || !videoId) return;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  function togglePlay(){
    if (!videoId) {
      alert('Sumber gending tidak tersedia.');
      return;
    }
    if (!apiReady) {
      loadYouTubeAPI();
      // wait briefly for API to load; user gesture already happened so play will be allowed
      const tryPlay = setInterval(()=>{
        if (player && typeof player.playVideo === 'function'){
          player.playVideo();
          clearInterval(tryPlay);
        }
      }, 300);
      return;
    }

    if (!player) return;
    if (!isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }

  playBtn.addEventListener('click', () => {
    togglePlay();
  });

  // Salin link undangan (akan mempertahankan query string nama tamu jika ada)
  copyBtn.addEventListener('click', async () => {
    const url = location.href;
    try {
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = 'Tautan Disalin';
      setTimeout(()=> copyBtn.textContent = 'Salin Link Undangan', 1500);
    } catch (e) {
      prompt('Salin tautan undangan ini:', url);
    }
  });

})();
