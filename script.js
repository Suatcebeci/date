/* ==========================================================================
   GİZEM İÇİN ROMANTİK BULUŞMA TEKLİFİ - JAVASCRIPT
   Vanilla JS, Canvas animasyonları, kaçan Hayır butonu, konfeti ve WhatsApp entegrasyonu
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. YAPILANDIRMA (İletişim & Mesaj Ayarları)
// --------------------------------------------------------------------------
// Buraya kendi telefon numaranızı ülke koduyla birlikte yazın (örn: "905XXXXXXXXX")
const WHATSAPP_NUMBER = "905419169910";

// Hayır butonunun her kaçışta alacağı metinler
const NO_BUTTON_TEXTS = [
  "Hayır",
  "Emin misin? 🤨",
  "Bi daha düşün… 🤔",
  "Yapma ya 🥺",
  "Kalbimi kırıyorsun 💔",
  "Lütfen ama 🥹",
  "Son şansın bak! ⏳",
  "Kaçamazsın 😏",
  "Hala mı deniyorsun? 😂",
  "Pes et bence 💖"
];

// Sayacın altında çıkacak esprili tepkiler
const FUNNY_REACTIONS = [
  "Kaçamazsın, şansını zorlama! 😉",
  "Çok yaklaştın ama olmadı 😄",
  "Hızlısın ama ben daha hızlıyım! 🏃‍♂️💨",
  "Bence parmağın Evet'e basmak istiyor... 🥰",
  "Naz yapma Gizem, biliyorum sen de istiyorsun ✨",
  "Bak buton küçülüyor, yakında yok olacak! 🤏",
  "Evet butonu dev gibi oldu, kaderine razı ol 🌟",
  "Son çırpınışlar bunlar! 😜",
  "Ve puf! Hayır seçeneği evrenden silindi 🕊️"
];

// Daktilo metni
const INTRO_TEXT = "Son bir kere daha şansımı deneyeyim… 💌";

// --------------------------------------------------------------------------
// 2. DOM ELEMANLARI
// --------------------------------------------------------------------------
const questionScreen = document.getElementById("question-screen");
const celebrationScreen = document.getElementById("celebration-screen");
const typewriterElement = document.getElementById("typewriter-text");
const typingCursor = document.querySelector(".typing-cursor");
const mainQuestionBox = document.getElementById("main-question-box");

const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const btnNoText = document.getElementById("btn-no-text");
const noDisappearedMsg = document.getElementById("no-disappeared-msg");

const counterBanner = document.getElementById("counter-banner");
const counterText = document.getElementById("counter-text");
const counterReaction = document.getElementById("counter-reaction");

const musicToggle = document.getElementById("music-toggle");
const bgMusic = document.getElementById("bg-music");

const activityChips = document.querySelectorAll("#activity-chips .chip");
const chipWarning = document.getElementById("chip-warning");
const meetupDatetime = document.getElementById("meetup-datetime");
const meetupNote = document.getElementById("meetup-note");
const btnSendWhatsapp = document.getElementById("btn-send-whatsapp");
const waHint = document.querySelector(".wa-hint");

// Durum değişkenleri
let escapeCount = 0;
const MAX_ESCAPES = 8; // 8 denemeden sonra tamamen kaybolur
let selectedActivities = ["Kahve & Tatlı"]; // Çoklu aktivite listesi (maksimum 2)
let isMusicPlaying = false;
let warningTimeout = null;

// --------------------------------------------------------------------------
// 3. CANVAS ARKA PLAN ANİMASYONU (Yıldızlar & Süzülen Kalpler)
// --------------------------------------------------------------------------
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let stars = [];
let floatingHearts = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Parçacık üreticileri
function initParticles() {
  stars = [];
  const starCount = Math.floor((window.innerWidth * window.innerHeight) / 9000);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005,
      increasing: Math.random() > 0.5
    });
  }

  floatingHearts = [];
  const heartCount = Math.min(20, Math.floor(window.innerWidth / 40));
  for (let i = 0; i < heartCount; i++) {
    floatingHearts.push(createHeart(true));
  }
}

function createHeart(randomY = false) {
  return {
    x: Math.random() * canvas.width,
    y: randomY ? Math.random() * canvas.height : canvas.height + 25,
    size: Math.random() * 14 + 10,
    speedY: Math.random() * 0.7 + 0.3,
    speedX: Math.sin(Math.random() * Math.PI) * 0.5 - 0.25,
    alpha: Math.random() * 0.45 + 0.15,
    rotation: (Math.random() - 0.5) * 0.5,
    oscillationSpeed: Math.random() * 0.03 + 0.01,
    oscillationOffset: Math.random() * Math.PI * 2
  };
}

function drawHeartShape(context, x, y, size, alpha, rotation) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(size / 20, size / 20);
  context.beginPath();
  context.fillStyle = `rgba(255, 117, 140, ${alpha})`;
  context.shadowColor = "rgba(255, 75, 114, 0.4)";
  context.shadowBlur = 8;

  // Kalp çizimi (Bézier eğrileri)
  context.moveTo(0, 0);
  context.bezierCurveTo(-10, -10, -18, 5, 0, 18);
  context.bezierCurveTo(18, 5, 10, -10, 0, 0);
  context.fill();
  context.restore();
}

function renderScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Yıldızları çiz
  for (let s of stars) {
    if (s.increasing) {
      s.alpha += s.speed;
      if (s.alpha >= 0.9) s.increasing = false;
    } else {
      s.alpha -= s.speed;
      if (s.alpha <= 0.15) s.increasing = true;
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.shadowBlur = 4;
    ctx.fill();
  }

  // Kalpleri çiz ve yükselt
  for (let i = 0; i < floatingHearts.length; i++) {
    const h = floatingHearts[i];
    h.y -= h.speedY;
    h.x += Math.sin(h.oscillationOffset) * 0.6;
    h.oscillationOffset += h.oscillationSpeed;

    drawHeartShape(ctx, h.x, h.y, h.size, h.alpha, h.rotation);

    if (h.y < -30) {
      floatingHearts[i] = createHeart(false);
    }
  }

  requestAnimationFrame(renderScene);
}

initParticles();
requestAnimationFrame(renderScene);

// --------------------------------------------------------------------------
// 4. DAKTİLO EFEKTİ (GİRİŞ YAZISI)
// --------------------------------------------------------------------------
function startTypewriterEffect() {
  let charIndex = 0;
  typewriterElement.textContent = "";

  const interval = setInterval(() => {
    if (charIndex < INTRO_TEXT.length) {
      typewriterElement.textContent += INTRO_TEXT.charAt(charIndex);
      charIndex++;
    } else {
      clearInterval(interval);
      // Daktilo bittiğinde asıl soruyu ve butonları yumuşakça aç
      setTimeout(() => {
        typingCursor.classList.add("hide");
        mainQuestionBox.classList.remove("hidden-opacity");
        mainQuestionBox.classList.add("revealed");
      }, 400);
    }
  }, 48);
}

// Sayfa yüklendiğinde başlat
window.addEventListener("DOMContentLoaded", () => {
  // Varsayılan tarihi yarın akşam 19:30 olarak ayarla
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 30, 0, 0);

  // YYYY-MM-DDTHH:MM formatına dönüştür
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  const hours = String(tomorrow.getHours()).padStart(2, "0");
  const minutes = String(tomorrow.getMinutes()).padStart(2, "0");
  meetupDatetime.value = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Daktiloyu başlat
  setTimeout(startTypewriterEffect, 500);
});

// --------------------------------------------------------------------------
// 5. HAYIR BUTONU KAÇIŞ MEKANİZMASI (ASLA TIKLANAMAZ!)
// --------------------------------------------------------------------------
function moveNoButton(event) {
  if (event) {
    // Mobilde tıklama veya dokunma tetiklenmesini kesin olarak engelle
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
  }

  if (escapeCount >= MAX_ESCAPES) {
    disappearNoButton();
    return;
  }

  escapeCount++;

  // 1. Sayaç ve esprili mesajı güncelle
  counterBanner.classList.remove("hidden");
  counterText.textContent = `Hayır'a basma denemesi: ${escapeCount}`;
  const reactionIndex = Math.min(escapeCount - 1, FUNNY_REACTIONS.length - 1);
  counterReaction.textContent = FUNNY_REACTIONS[reactionIndex];

  // 2. Buton metnini değiştir
  const textIndex = Math.min(escapeCount, NO_BUTTON_TEXTS.length - 1);
  btnNoText.textContent = NO_BUTTON_TEXTS[textIndex];

  // 3. Butonu biraz küçült (her seferinde %10-12)
  const noScale = Math.max(0.3, 1 - (escapeCount * 0.11));
  const noOpacity = Math.max(0.35, 1 - (escapeCount * 0.08));

  // 4. "Evet" butonunu biraz büyüt ve daha parlak yap
  const yesScale = 1 + (escapeCount * 0.11);
  btnYes.style.transform = `scale(${yesScale})`;
  btnYes.style.boxShadow = `0 ${8 + escapeCount * 3}px ${25 + escapeCount * 5}px rgba(255, 75, 114, ${0.45 + escapeCount * 0.05})`;

  // 5. Butonu body'ye taşıyarak glass-card'ın backdrop-filter / transform
  // özelliğinin fixed konumlandırmayı bozmasını (containing block issue) kesin olarak engelle
  if (btnNo.parentElement !== document.body) {
    document.body.appendChild(btnNo);
  }

  // 6. Ekran sınırları içinde GÜVENLİ yeni konum hesapla
  const btnRect = btnNo.getBoundingClientRect();
  const btnWidth = Math.max(btnRect.width, 100);
  const btnHeight = Math.max(btnRect.height, 44);

  const padding = 16;
  const topSafeOffset = 80; // Üstteki sayaç ve müzik butonuna çarpmaması için
  const bottomSafeOffset = 60;

  const maxX = Math.max(padding, window.innerWidth - btnWidth - padding);
  const minX = padding;
  const maxY = Math.max(topSafeOffset, window.innerHeight - btnHeight - bottomSafeOffset);
  const minY = topSafeOffset;

  let randomX = Math.floor(Math.random() * (maxX - minX)) + minX;
  let randomY = Math.floor(Math.random() * (maxY - minY)) + minY;

  // Fare veya dokunma noktasına çok yakınsa biraz uzağa fırlat
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  if (event) {
    if (event.touches && event.touches.length > 0) {
      pointerX = event.touches[0].clientX;
      pointerY = event.touches[0].clientY;
    } else if (event.clientX && event.clientY) {
      pointerX = event.clientX;
      pointerY = event.clientY;
    }

    if (Math.hypot(randomX - pointerX, randomY - pointerY) < 130) {
      randomX = (randomX + 160) % (maxX - minX) + minX;
      randomY = (randomY + 120) % (maxY - minY) + minY;
    }
  }

  // Butonu ekran genelinde serbest gezebilmesi için fixed yap ve taşı
  btnNo.classList.add("is-escaping");
  btnNo.style.position = "fixed";
  btnNo.style.left = `${randomX}px`;
  btnNo.style.top = `${randomY}px`;
  btnNo.style.transform = `scale(${noScale})`;
  btnNo.style.opacity = noOpacity;

  // Sayfada yatay kayma olmasını tamamen önle
  window.scrollTo({ left: 0 });

  // Eğer son sınıra ulaştıysa kaybolma aşamasını başlat
  if (escapeCount >= MAX_ESCAPES) {
    setTimeout(disappearNoButton, 450);
  }
}

// Hayır butonunu tamamen yok etme
function disappearNoButton() {
  btnNo.classList.add("disappearing");
  btnNo.style.pointerEvents = "none";
  btnNo.setAttribute("aria-hidden", "true");
  btnNo.setAttribute("tabindex", "-1");

  setTimeout(() => {
    btnNo.style.display = "none";
    noDisappearedMsg.classList.remove("hidden");
    counterReaction.textContent = "🕊️ Hayır butonu bu hayatta bulunamadı...";
  }, 280);
}

// Çoklu olay dinleyicileri (Masaüstü, Mobil, Klavye)
btnNo.addEventListener("mouseenter", moveNoButton);
btnNo.addEventListener("mouseover", moveNoButton);
btnNo.addEventListener("touchstart", moveNoButton, { passive: false });
btnNo.addEventListener("pointerdown", moveNoButton);
btnNo.addEventListener("focus", moveNoButton);
// Olur da bir şekilde tıklanırsa bile engelle
btnNo.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  moveNoButton(e);
});

// --------------------------------------------------------------------------
// 6. EVET BUTONU VE BÜYÜK KUTLAMA EFEKTLERİ
// --------------------------------------------------------------------------
function triggerCelebrationSounds() {
  // Web Audio API ile melodik tatlı bir kutlama akoru çal (harici ses dosyası olmasa bile çalışır)
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Neşeli majör akor)
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.1);
        gain.gain.setValueAtTime(0.22, audioCtx.currentTime + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + index * 0.1 + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.1);
        osc.stop(audioCtx.currentTime + index * 0.1 + 0.85);
      });
    }
  } catch (err) {
    // Ses desteği yoksa sessizce devam et
  }
}

function launchGrandConfetti() {
  if (typeof confetti !== "function") return;

  const duration = 4.5 * 1000;
  const animationEnd = Date.now() + duration;

  // Dalga 1: Merkezden devasa patlama
  confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#ff4b72", "#ff758c", "#9b51e0", "#ffc048", "#ffffff"]
  });

  // Dalga 2: Sağ ve sol köşelerden havai fişek yağmuru
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);

    // Sol köşe
    confetti({
      particleCount: Math.floor(particleCount * 0.6),
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ["#ff4b72", "#ff758c", "#ffc048"]
    });

    // Sağ köşe
    confetti({
      particleCount: Math.floor(particleCount * 0.6),
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ["#9b51e0", "#ff758c", "#ffffff"]
    });
  }, 300);
}

function handleYesClick() {
  // 1. Hayır butonunu tamamen temizle
  if (btnNo && btnNo.parentElement) {
    btnNo.remove();
  }
  counterBanner.classList.add("hidden");

  // 2. Ses ve Konfeti
  triggerCelebrationSounds();
  launchGrandConfetti();

  // 3. Arka plan parlama efekti (Glow flash)
  document.body.style.transition = "background-color 0.4s ease";
  document.body.style.backgroundColor = "#240a38";
  setTimeout(() => {
    document.body.style.backgroundColor = "";
  }, 700);

  // 4. Soru ekranını kapat ve Kutlama/Planlama ekranını aç
  questionScreen.style.opacity = "0";
  questionScreen.style.transform = "scale(0.92)";

  setTimeout(() => {
    questionScreen.classList.add("hidden");
    celebrationScreen.classList.remove("hidden");
    celebrationScreen.style.opacity = "1";
    celebrationScreen.style.transform = "scale(1)";

    // Ekstra konfeti fırlat
    setTimeout(() => {
      if (typeof confetti === "function") {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
          colors: ["#ff4b72", "#ffc048", "#25d366"]
        });
      }
    }, 400);
  }, 350);
}

btnYes.addEventListener("click", handleYesClick);

// --------------------------------------------------------------------------
// 7. BULUŞMA PLANI & WHATSAPP ENTEGRASYONU (ÇOKLU SEÇİM, MAKS. 2)
// --------------------------------------------------------------------------
function updateButtonAndHint() {
  if (selectedActivities.length === 0) {
    btnSendWhatsapp.disabled = true;
    if (waHint) {
      waHint.textContent = "Lütfen en az 1 aktivite seç 👆";
      waHint.classList.add("hint-disabled");
    }
  } else {
    btnSendWhatsapp.disabled = false;
    if (waHint) {
      waHint.textContent = "Butona basınca WhatsApp'tan hazır mesajla iletebilirsin!";
      waHint.classList.remove("hint-disabled");
    }
  }
}

function showChipWarning() {
  if (chipWarning) {
    chipWarning.classList.remove("hidden");
    clearTimeout(warningTimeout);
    warningTimeout = setTimeout(() => {
      chipWarning.classList.add("hidden");
    }, 2800);
  }
}

// Çip seçimi (Çoklu seçim, en fazla 2)
activityChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const actName = chip.getAttribute("data-activity") || chip.innerText.trim();
    const index = selectedActivities.indexOf(actName);

    if (index > -1) {
      // Zaten seçiliyse seçimi kaldır (toggle off)
      selectedActivities.splice(index, 1);
      chip.classList.remove("active");
      if (chipWarning) chipWarning.classList.add("hidden");
    } else {
      // Henüz seçili değilse, en fazla 2 sınırı kontrol et
      if (selectedActivities.length >= 2) {
        showChipWarning();
        return;
      }
      selectedActivities.push(actName);
      chip.classList.add("active");
      if (chipWarning) chipWarning.classList.add("hidden");
    }

    updateButtonAndHint();
  });
});

// Sayfa ilk yüklendiğinde buton durumunu kontrol et
updateButtonAndHint();

// WhatsApp mesajını oluştur ve gönder
btnSendWhatsapp.addEventListener("click", () => {
  if (selectedActivities.length === 0) return;

  const rawDateTime = meetupDatetime.value;
  let formattedDateTime = "Belirlenmedi (birlikte karar verelim)";

  if (rawDateTime) {
    try {
      const d = new Date(rawDateTime);
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
      };
      formattedDateTime = d.toLocaleDateString("tr-TR", options);
    } catch (e) {
      formattedDateTime = rawDateTime;
    }
  }

  const userNote = meetupNote.value.trim();
  // Seçilen aktiviteleri ' + ' ile birleştir (tek ise tek kalır)
  const activityText = selectedActivities.join(" + ");

  // Emojileri kod noktasıyla güvenli üret (karakter seti bozulmalarını kesin olarak önler)
  const EMOJI_PARTY = String.fromCodePoint(0x1F389); // 🎉
  const EMOJI_HEART = String.fromCodePoint(0x1F496); // 💖

  // WhatsApp mesajı şablonu
  let message = `Evet dedim! ${EMOJI_PARTY} Buluşma planı: ${activityText}, ${formattedDateTime}`;
  if (userNote) {
    message += `\n\nNot: ${userNote}`;
  }
  message += `\n\nSeninle buluşmak için sabırsızlanıyorum! ${EMOJI_HEART}`;

  // Mesajı panoya da otomatik kopyala (kullanıcıya ek kolaylık ve yedek)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  // Cihaz türüne göre doğrudan hedef belirleme:
  // - Masaüstünde doğrudan web.whatsapp.com açılır (Meta'nın ara sayfasındaki gri kutu atlanır)
  // - Mobilde api.whatsapp.com Universal Link doğrudan WhatsApp uygulamasını açar
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const whatsappUrl = isMobile
    ? `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`
    : `https://web.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

  // Yeni sekmede aç
  window.open(whatsappUrl, "_blank");
});

// --------------------------------------------------------------------------
// 8. ARKA PLAN MÜZİK KONTROLÜ (OPSİYONEL MP3)
// --------------------------------------------------------------------------
musicToggle.addEventListener("click", () => {
  if (!isMusicPlaying) {
    // Müzik çalmayı dene
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          musicToggle.classList.add("playing");
          document.getElementById("music-icon").textContent = "🔊";
        })
        .catch(() => {
          // Dosya henüz eklenmemişse kullanıcıyı bilgilendir
          alert("Müzik dosyası (assets/music.mp3) henüz yüklenmemiş. Şarkını assets klasörüne ekleyip dinleyebilirsin! 🎶");
        });
    }
  } else {
    bgMusic.pause();
    isMusicPlaying = false;
    musicToggle.classList.remove("playing");
    document.getElementById("music-icon").textContent = "🎵";
  }
});
