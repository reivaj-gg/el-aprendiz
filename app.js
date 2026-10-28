// ====================================================
// EL APRENDIZ — LOGICA INTERACTIVA DEL PROTOTIPO
// ====================================================

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initTimer();
});

// 1. Navegación entre Vistas (Tabs)
function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));

  const activeBtn = document.getElementById('tab-' + tabId);
  const activePanel = document.getElementById('view-' + tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) activePanel.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Carrusel Horizontal de Mentores con Enfoque Central
let currentCardIndex = 0;

function initCarousel() {
  const container = document.getElementById('carousel-container');
  if (!container) return;

  container.addEventListener('scroll', () => {
    updateActiveDot();
  });
}

function scrollCarousel(direction) {
  const container = document.getElementById('carousel-container');
  const cards = document.querySelectorAll('.carousel-card');
  if (!container || cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth + 28; // ancho + gap
  container.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}

function goToCarouselSlide(index) {
  const container = document.getElementById('carousel-container');
  const cards = document.querySelectorAll('.carousel-card');
  if (!container || !cards[index]) return;

  cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  currentCardIndex = index;
  updateDots(index);
}

function updateActiveDot() {
  const container = document.getElementById('carousel-container');
  const cards = document.querySelectorAll('.carousel-card');
  if (!container || cards.length === 0) return;

  const center = container.scrollLeft + container.offsetWidth / 2;
  let closestIndex = 0;
  let closestDist = Infinity;

  cards.forEach((card, idx) => {
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const dist = Math.abs(center - cardCenter);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = idx;
    }
  });

  cards.forEach((card, idx) => {
    if (idx === closestIndex) {
      card.classList.add('active-focus');
    } else {
      card.classList.remove('active-focus');
    }
  });

  updateDots(closestIndex);
}

function updateDots(activeIndex) {
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, idx) => {
    if (idx === activeIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function scrollToMentors() {
  const section = document.getElementById('mentors-carousel-section');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// 3. Filtros y Buscador Asistido con IA
function filterTrade(type, btn) {
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('.carousel-card');
  const matchBox = document.getElementById('match-box');
  const matchTitle = document.getElementById('match-title');
  const matchDesc = document.getElementById('match-desc');

  if (type === 'todos') {
    cards.forEach(card => card.style.display = 'flex');
    if (matchBox) matchBox.style.display = 'none';
    goToCarouselSlide(0);
    return;
  }

  let targetCard = null;
  cards.forEach((card, idx) => {
    if (card.getAttribute('data-trade') === type) {
      card.style.display = 'flex';
      if (!targetCard) targetCard = idx;
    } else {
      card.style.display = 'none';
    }
  });

  if (targetCard !== null) {
    goToCarouselSlide(targetCard);
  }

  if (matchBox) {
    matchBox.style.display = 'flex';
    if (type === 'textil') {
      matchTitle.textContent = "Taller Recomendado: Confección y Tejido en Tocachi (Pichincha)";
      matchDesc.textContent = "La Maestra Rosa Quilumba (70 años, tejedora de Tocachi) ofrece un curso de 10 clases prácticas en su taller. Aprenderás corte de telas, tensión de puntada y remate invisible. El 50% del valor va directo a su familia.";
    } else if (type === 'telar') {
      matchTitle.textContent = "Taller Recomendado: Tintura Natural con Nogal y Telar en Otavalo";
      matchDesc.textContent = "El Maestro José Lema (68 años, Peguche) enseña extracción botánica de pigmentos y armado de telar tradicional indígena. Cupos disponibles con 50% de apoyo directo a su familia.";
    } else if (type === 'madera') {
      matchTitle.textContent = "Taller Recomendado: Escultura y Tallado en Madera en San Antonio de Ibarra";
      matchDesc.textContent = "El Maestro Carlos Morales (65 años) enseña a afilar gubias a la piedra, leer la veta del cedro y tallar figuras sin astillar la madera.";
    }
  }
}

function searchTrade() {
  const input = document.getElementById('trade-search-input');
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  if (!q) {
    filterTrade('todos', document.querySelector('.filter-pill'));
    return;
  }

  const matchBox = document.getElementById('match-box');
  const matchTitle = document.getElementById('match-title');
  const matchDesc = document.getElementById('match-desc');
  const cards = document.querySelectorAll('.carousel-card');

  let found = 0;
  let firstFoundIndex = null;

  cards.forEach((card, idx) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(q)) {
      card.style.display = 'flex';
      found++;
      if (firstFoundIndex === null) firstFoundIndex = idx;
    } else {
      card.style.display = 'none';
    }
  });

  if (matchBox) {
    matchBox.style.display = 'flex';
    matchTitle.textContent = `Talleres encontrados para: "${input.value}"`;
    if (found > 0) {
      matchDesc.textContent = `Encontramos ${found} taller(es) relacionado(s). Revisa las tarjetas a continuación para ver horarios, ubicación y solicitar tu cupo.`;
      if (firstFoundIndex !== null) goToCarouselSlide(firstFoundIndex);
    } else {
      matchDesc.textContent = `No encontramos un taller abierto con ese nombre exacto, pero puedes contactarnos para proponernos a un maestro artesano de tu comunidad.`;
    }
  }

  scrollToMentors();
}

// 4. Modo Taller Offline: Cronómetro y Marcado de Hitos
let timerSeconds = 1458; // 24m 18s inicial
let timerInterval = null;

function initTimer() {
  const timerElem = document.getElementById('timer');
  if (!timerElem) return;

  timerInterval = setInterval(() => {
    timerSeconds++;
    const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const secs = String(timerSeconds % 60).padStart(2, '0');
    timerElem.textContent = `${mins}:${secs}`;
  }, 1000);
}

function markMoment() {
  const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
  const secs = String(timerSeconds % 60).padStart(2, '0');
  const timestamp = `${mins}:${secs}`;

  alert(`⭐ ¡Secreto de la Maestra Guardado (Minuto ${timestamp})!\nRegistrado en la memoria de tu teléfono: "Consejo de la Maestra Rosa sobre cómo sentir la tensión antes de que se arrugue la tela".`);
}

// 5. Chat con el Mentor Virtual 24/7 (RAG Estricto)
function sendChatMessage() {
  const input = document.getElementById('chat-user-input');
  const text = input.value.trim();
  if (!text) return;

  const container = document.getElementById('chat-messages');

  // Mensaje del Aprendiz
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble bubble-user';
  userBubble.textContent = text;
  container.appendChild(userBubble);
  input.value = '';

  // Respuesta Simulada de RAG Estricto con citas de la Maestra Rosa
  setTimeout(() => {
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble bubble-bot';
    
    let quote = "«En ese punto crítico, no apures el remate. Da dos pasadas con hilo encerado y asegura el nudo por dentro. Si el material es bayeta, deja 3 milímetros de margen para evitar que se deshile al doblar.»";
    let ref = "Criterio de Maestra Rosa · Sesión 3 (Minuto 18:45)";

    if (text.toLowerCase().includes('tela') || text.toLowerCase().includes('corte') || text.toLowerCase().includes('fibra')) {
      quote = "«Antes de pasar la tijera, acaricia la tela en ambas direcciones con la palma seca. Si sientes resistencia áspera, esa es la trama; si corre suave, es la urdimbre. Siempre corta a favor de la trama para que las costuras del bolso no se tuerzan con los años.»";
      ref = "Criterio de Maestra Rosa · Sesión 1 (Minuto 08:30)";
    } else if (text.toLowerCase().includes('error') || text.toLowerCase().includes('lavar') || text.toLowerCase().includes('encoger')) {
      quote = "«El error más costoso que cometí fue a los 20 años: entregué un poncho sin haber remojado la fibra en agua de lluvia fría. Al primer lavado se encogió y arrugó los bordes. Por eso, aprendiz, toda tela artesanal se mide y corta húmeda.»";
      ref = "Criterio de Maestra Rosa · Sesión 2 (Minuto 21:10)";
    }

    botBubble.innerHTML = `
      <div class="quote-badge">
        <svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ${ref}
      </div>
      <p>${quote}</p>
      <div class="ref-image-box">
        <img src="assets/maestra_rosa.jpg" alt="Referencia taller" class="ref-img">
        <div class="ref-caption">Fotografía de referencia en taller Tocachi: Demostración técnica aprobada.</div>
      </div>
    `;
    container.appendChild(botBubble);
    container.scrollTop = container.scrollHeight;
  }, 650);

  container.scrollTop = container.scrollHeight;
}

// 6. Selección de Modelo de Negocio (Privado vs Ganar-Ganar)
let selectedBusinessModel = 'vender'; // default: Ganar-Ganar

function selectBusinessOption(model) {
  selectedBusinessModel = model;
  const optPersonal = document.getElementById('opt-personal');
  const optVender = document.getElementById('opt-vender');

  if (model === 'personal') {
    if (optPersonal) optPersonal.classList.add('selected');
    if (optVender) optVender.classList.remove('selected');
  } else {
    if (optVender) optVender.classList.add('selected');
    if (optPersonal) optPersonal.classList.remove('selected');
  }
}

// 7. Simulación de Procesamiento IA para Estructurar el Programa
function processSessionWithAI() {
  const indicator = document.getElementById('processing-box');
  const statusText = document.getElementById('process-status-text');
  const bar = document.getElementById('process-bar');

  if (!indicator) {
    switchTab('synthesis');
    return;
  }

  indicator.style.display = 'block';
  indicator.scrollIntoView({ behavior: 'smooth' });

  // Paso 1
  bar.style.width = '35%';
  statusText.textContent = 'Paso 1/3: Analizando y transcribiendo 24 min de audio grabados en Tocachi...';

  setTimeout(() => {
    // Paso 2
    bar.style.width = '75%';
    statusText.textContent = 'Paso 2/3: Extrayendo secretos de corte y tensión de la Maestra Rosa + etiquetando 8 fotos de taller...';
  }, 700);

  setTimeout(() => {
    // Paso 3
    bar.style.width = '100%';
    statusText.textContent = 'Paso 3/3: ¡Programa de estudio estructurado y tutor virtual actualizado con éxito!';
  }, 1400);

  setTimeout(() => {
    indicator.style.display = 'none';
    switchTab('synthesis');
  }, 2000);
}
