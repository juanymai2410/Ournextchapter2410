/* =============================================================
   ournextchapter24.10 — comportamiento del sitio
   ============================================================= */

/* --- Config del RSVP: elegí dónde llegan las confirmaciones -----------------
   provider: "google"   -> manda las respuestas a un Formulario de Google (Sheets). ACTIVO.
   provider: "netlify"  -> usa Netlify Forms.
   provider: "formspree"-> pegá tu ID de Formspree en formspreeId.
--------------------------------------------------------------------------- */
var RSVP_CONFIG = {
  provider: "google",
  formspreeId: "TU_ID_DE_FORMSPREE"
};

/* Mapeo de campos del sitio -> "entry.NNN" de cada Formulario de Google.
   Los valores de las opciones múltiples tienen que coincidir EXACTO con las del Form. */
var GFORM = {
  rsvp: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSd6JwX6CZ2YGOctxNQLZRqUmHjnWI9DNUzXQ_R7LGXws7VD8g/formResponse",
    map: {
      nombre:                  { entry: "entry.1571085819" },
      asiste:                  { entry: "entry.1639188789", values: { "Sí": "Confirmo asistencia", "No": "No asistiré" } },
      restriccion_alimentaria: { entry: "entry.1053175909" },
      transporte:              { entry: "entry.1535647948", values: { "Sí": "SI", "No": "No" } },
      telefono:                { entry: "entry.553841696" },
      mensaje:                 { entry: "entry.859049078" }
    }
  },
  cancion: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSc7qqApZC4yqiguK0O37PrNkHUQ89cMlrjMvM9om0ZfTHQCfg/formResponse",
    map: {
      cancion: { entry: "entry.1299035906" },
      artista: { entry: "entry.841241203" },
      de:      { entry: "entry.473729982" }
    }
  }
};

(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Envía un FormData a un Formulario de Google (modo no-cors: la respuesta es
     opaca, no se puede leer el status, así que "resuelve" = enviado). */
  function postToGoogleForm(cfg, fd) {
    var params = new URLSearchParams();
    Object.keys(cfg.map).forEach(function (field) {
      if (!fd.has(field)) return;
      var raw = (fd.get(field) || "").toString().trim();
      if (!raw) return;
      var m = cfg.map[field];
      var value = (m.values && m.values[raw] != null) ? m.values[raw] : raw;
      params.append(m.entry, value);
    });
    params.append("fvv", "1");
    params.append("pageHistory", "0");
    return fetch(cfg.action, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
  }

  // Escalonado del hero al cargar
  function revealHero() {
    document.querySelectorAll(".hero .reveal").forEach(function (el) {
      var delay = parseInt(el.dataset.revealDelay || "0", 10) * 160;
      setTimeout(function () { el.classList.add("is-visible"); }, 200 + delay);
    });
  }

  // Revela los hijos .reveal de un contenedor, uno detrás de otro
  function revealStagger(container) {
    var kids = container.querySelectorAll(".reveal");
    Array.prototype.forEach.call(kids, function (el, i) {
      el.style.setProperty("--reveal-delay", (i * 110) + "ms");
      el.classList.add("is-visible");
    });
  }

  // Secciones: aparecen al entrar en viewport
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var t = entry.target;
        if (t.hasAttribute("data-stagger")) revealStagger(t);
        else t.classList.add("is-visible");
        io.unobserve(t);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll("[data-stagger]").forEach(function (c) { io.observe(c); });
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.closest(".hero")) return;
      if (el.closest("[data-stagger]")) return; // lo maneja el contenedor
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Portal de entrada: ¿entrar con música? ---- */
  var intro = document.getElementById("intro");
  var heroRevealed = false;
  function fireHeroReveal() {
    if (heroRevealed) return;
    heroRevealed = true;
    revealHero();
  }

  if (intro) {
    var enterSite = function (withMusic) {
      intro.classList.add("is-hidden");
      document.body.classList.remove("intro-open");
      window.setTimeout(function () { if (intro && intro.parentNode) intro.remove(); }, 800);
      fireHeroReveal();
      if (withMusic) {
        var au = document.getElementById("bg-music");
        var mb = document.querySelector(".music-toggle");
        if (au) {
          au.play().then(function () {
            if (mb) { mb.classList.add("is-on"); mb.setAttribute("aria-pressed", "true"); }
          }).catch(function () { /* el navegador bloqueó el autoplay */ });
        }
      }
    };
    intro.querySelector('[data-intro="yes"]').addEventListener("click", function () { enterSite(true); });
    intro.querySelector('[data-intro="no"]').addEventListener("click", function () { enterSite(false); });
  } else {
    if (document.readyState !== "loading") fireHeroReveal();
    else document.addEventListener("DOMContentLoaded", fireHeroReveal);
  }

  /* ---- Parallax suave al hacer scroll ---- */
  if (!prefersReduced) {
    var parEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (parEls.length) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var vh = window.innerHeight;
          parEls.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            var center = rect.top + rect.height / 2;
            var rate = parseFloat(el.getAttribute("data-parallax")) || 0;
            el.style.setProperty("--py", ((center - vh / 2) * rate).toFixed(1) + "px");
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    }
  }

  /* ---- Música de fondo (opcional) ---- */
  var musicBtn = document.querySelector(".music-toggle");
  var audio = document.getElementById("bg-music");
  if (musicBtn && audio) {
    musicBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () {
          musicBtn.classList.add("is-on");
          musicBtn.setAttribute("aria-pressed", "true");
        }).catch(function () { /* sin archivo de audio todavía */ });
      } else {
        audio.pause();
        musicBtn.classList.remove("is-on");
        musicBtn.setAttribute("aria-pressed", "false");
      }
    });
  }

  /* ---- Cuenta regresiva ---- */
  var cdGrid = document.querySelector(".countdown__grid");
  if (cdGrid) {
    var target = new Date(cdGrid.dataset.target).getTime();
    var out = {
      days: cdGrid.querySelector('[data-cd="days"]'),
      hours: cdGrid.querySelector('[data-cd="hours"]'),
      mins: cdGrid.querySelector('[data-cd="mins"]'),
      secs: cdGrid.querySelector('[data-cd="secs"]')
    };
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var tick = function () {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      var s = Math.floor(diff / 1000);
      out.days.textContent = Math.floor(s / 86400);
      out.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      out.mins.textContent = pad(Math.floor((s % 3600) / 60));
      out.secs.textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---- Modales (formato reutilizable) ---- */

  // Adornos comunes a todos los modales: un marco dorado fino concéntrico con la
  // tarjeta (siempre centrado) + ramos en las esquinas
  var DECO =
    '<div class="modal__deco" aria-hidden="true">' +
      '<div class="modal__frame"></div>' +
      '<svg class="modal__floral modal__floral--tl" viewBox="0 0 340 340"><use href="#floral-cluster"/></svg>' +
      '<svg class="modal__floral modal__floral--br" viewBox="0 0 340 340"><use href="#floral-cluster"/></svg>' +
    '</div>';
  document.querySelectorAll(".modal__dialog").forEach(function (d) {
    if (!d.querySelector(".modal__deco")) d.insertAdjacentHTML("afterbegin", DECO);
  });

  var lastFocus = null;
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add("modal-open");
    var focusable = m.querySelector(".modal__close, button, a[href], input, textarea, select");
    if (focusable) focusable.focus();
  }
  function closeModal(m) {
    m.hidden = true;
    if (!document.querySelector(".modal:not([hidden])")) {
      document.body.classList.remove("modal-open");
    }
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-modal]");
    if (trigger) { openModal(trigger.dataset.modal); return; }
    var closer = e.target.closest("[data-close]");
    if (closer) { closeModal(closer.closest(".modal")); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = document.querySelector(".modal:not([hidden])");
      if (open) closeModal(open);
    }
  });

  /* ---- Galería (carrusel polaroid, con loop infinito) ---- */
  var track = document.querySelector(".gallery__track");
  if (track) {
    var originals = Array.prototype.slice.call(track.querySelectorAll(".polaroid"));
    var N = originals.length;
    var START = 2; // foto que queda anclada al abrir (0 = la 1ra, 2 = la 3ra)
    var dotsWrap = document.querySelector(".gallery__dots");
    var navPrev = document.querySelector(".gallery__nav--prev");
    var navNext = document.querySelector(".gallery__nav--next");

    // Clonamos el set completo a cada lado -> nunca hay un lado "vacío"
    if (N > 1) {
      var pre = document.createDocumentFragment();
      var post = document.createDocumentFragment();
      originals.forEach(function (s) {
        var a = s.cloneNode(true); a.setAttribute("aria-hidden", "true"); a.dataset.clone = "1"; pre.appendChild(a);
        var b = s.cloneNode(true); b.setAttribute("aria-hidden", "true"); b.dataset.clone = "1"; post.appendChild(b);
      });
      track.appendChild(post);
      track.insertBefore(pre, track.firstChild);
    }
    var all = Array.prototype.slice.call(track.querySelectorAll(".polaroid"));

    // Si una foto no existe todavía, ocultamos la imagen rota y queda el placeholder
    track.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () { img.style.visibility = "hidden"; });
    });

    // Puntos: uno por foto original
    for (var k = 0; k < N; k++) {
      (function (j) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Ir a la foto " + (j + 1));
        b.addEventListener("click", function () {
          var here = nearest();
          goTo(here - (((here % N) + N) % N) + j, true);
        });
        dotsWrap.appendChild(b);
      })(k);
    }
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function centerX(el) { var r = el.getBoundingClientRect(); return r.left + r.width / 2; }
    function nearest() {
      var mid = track.getBoundingClientRect().left + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      all.forEach(function (s, i) {
        var d = Math.abs(centerX(s) - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function setWidth() {
      return (N > 1) ? (all[N].offsetLeft - all[0].offsetLeft) : 0;
    }
    function goTo(i, smooth) {
      var s = all[Math.max(0, Math.min(all.length - 1, i))];
      if (!s) return;
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2,
        behavior: smooth ? "smooth" : "auto"
      });
    }
    function refresh() {
      var idx = nearest();
      all.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
      var active = ((idx % N) + N) % N;
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === active); });

      // Si nos fuimos a un set clonado, saltamos (sin animación) al set del medio
      if (N > 1) {
        var w = setWidth();
        if (idx < N) { track.scrollLeft += w; }
        else if (idx >= 2 * N) { track.scrollLeft -= w; }
      }
    }
    var raf;
    track.addEventListener("scroll", function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(refresh);
    });
    if (navPrev) navPrev.addEventListener("click", function () { goTo(nearest() - 1, true); });
    if (navNext) navNext.addEventListener("click", function () { goTo(nearest() + 1, true); });

    // Arranque: anclar la foto START del set del medio
    requestAnimationFrame(function () {
      goTo(N > 1 ? N + (START % N) : 0, false);
      refresh();
    });
  }

  /* ---- Copiar al portapapeles ---- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-btn]");
    if (!btn) return;
    var row = btn.closest(".gift__row");
    var value = row ? (row.querySelector("[data-copy]") || {}).textContent : "";
    if (!value) return;
    value = value.trim();
    var done = function () {
      var original = btn.textContent;
      btn.textContent = "¡Copiado!";
      btn.classList.add("is-copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("is-copied");
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(function () { fallbackCopy(value, done); });
    } else {
      fallbackCopy(value, done);
    }
  });
  function fallbackCopy(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (err) { /* noop */ }
    document.body.removeChild(ta);
  }

  /* ---- RSVP: asistente por pasos + envío ---- */
  var rsvpForm = document.querySelector("form.rsvp");
  if (rsvpForm) {
    var steps = {};
    rsvpForm.querySelectorAll("[data-step]").forEach(function (s) { steps[s.dataset.step] = s; });
    var errEl = rsvpForm.querySelector(".rsvp__error");
    var doneEl = rsvpForm.parentElement.querySelector(".rsvp__done");
    var btnPrev = rsvpForm.querySelector("[data-prev]");
    var btnNext = rsvpForm.querySelector("[data-next]");
    var btnSend = rsvpForm.querySelector("[data-send]");
    var nameInput = rsvpForm.querySelector('[name="nombre"]');
    var transpNote = steps.transporte.querySelector("[data-transp-note]");
    var msgQ = steps.mensaje.querySelector("[data-msg-q]");
    var msgHelp = steps.mensaje.querySelector("[data-msg-help]");

    var FLOW_SI = ["nombre", "asiste", "restriccion", "transporte", "telefono", "mensaje"];
    var FLOW_NO = ["nombre", "asiste", "mensaje"];
    var idx = 0;

    function flow() {
      var a = rsvpForm.querySelector('[name="asiste"]:checked');
      return (a && a.value === "No") ? FLOW_NO : FLOW_SI;
    }

    function render() {
      var f = flow();
      if (idx > f.length - 1) idx = f.length - 1;
      var current = f[idx];
      Object.keys(steps).forEach(function (k) { steps[k].hidden = (k !== current); });
      btnPrev.disabled = (idx === 0);
      var last = (idx === f.length - 1);
      btnNext.hidden = last;
      btnSend.hidden = !last;
      errEl.hidden = true;

      if (current === "mensaje") {
        var isNo = (f === FLOW_NO);
        msgQ.textContent = isNo ? "Lamentamos mucho que no puedas acompañarnos" : "Mensaje para los novios";
        msgHelp.textContent = isNo ? "Si querés, dejanos un mensaje." : "Podés dejar un mensaje de cariño a los novios.";
      }
      if (current === "transporte") {
        var t = rsvpForm.querySelector('[name="transporte"]:checked');
        transpNote.hidden = !(t && t.value === "Sí");
      }
    }

    function validate(step) {
      if (step === "nombre" && !nameInput.value.trim()) {
        return "Necesitamos tu nombre y apellido.";
      }
      if (step === "asiste" && !rsvpForm.querySelector('[name="asiste"]:checked')) {
        return "Elegí una opción para continuar.";
      }
      if (step === "transporte" && !rsvpForm.querySelector('[name="transporte"]:checked')) {
        return "Elegí Sí o No para continuar.";
      }
      if (step === "telefono") {
        var tel = rsvpForm.querySelector('[name="telefono"]').value.replace(/[^\d]/g, "");
        if (tel.length < 6) return "Dejanos un teléfono de contacto.";
      }
      return null;
    }

    btnNext.addEventListener("click", function () {
      var f = flow();
      var err = validate(f[idx]);
      if (err) { errEl.textContent = err; errEl.hidden = false; return; }
      if (idx < f.length - 1) { idx++; render(); }
    });
    btnPrev.addEventListener("click", function () {
      if (idx > 0) { idx--; render(); }
    });

    rsvpForm.addEventListener("change", function (e) {
      if (e.target.name === "transporte") {
        transpNote.hidden = (e.target.value !== "Sí");
      }
      if (e.target.name === "asiste") {
        errEl.hidden = true;
      }
    });

    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = flow();
      var err = validate("nombre");
      if (err) { errEl.textContent = err; errEl.hidden = false; return; }

      btnSend.disabled = true;
      btnSend.textContent = "Enviando…";

      var fd = new FormData(rsvpForm);
      if (f === FLOW_NO) {
        fd.delete("restriccion_alimentaria");
        fd.delete("transporte");
        fd.delete("telefono");
      }

      if (RSVP_CONFIG.provider === "google") {
        postToGoogleForm(GFORM.rsvp, fd).then(function () {
          rsvpForm.hidden = true;
          doneEl.hidden = false;
        }).catch(function () {
          errEl.textContent = "No pudimos registrar tu confirmación. Probá de nuevo en un ratito.";
          errEl.hidden = false;
          btnSend.disabled = false;
          btnSend.textContent = "Enviar";
        });
        return;
      }

      var url, opts;
      if (RSVP_CONFIG.provider === "formspree") {
        url = "https://formspree.io/f/" + RSVP_CONFIG.formspreeId;
        opts = { method: "POST", body: fd, headers: { "Accept": "application/json" } };
      } else {
        url = "/";
        opts = {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(fd).toString()
        };
      }

      fetch(url, opts).then(function (r) {
        if (!r.ok) throw new Error("bad status " + r.status);
        rsvpForm.hidden = true;
        doneEl.hidden = false;
      }).catch(function () {
        errEl.textContent = "No pudimos registrar tu confirmación. Probá de nuevo en un ratito.";
        errEl.hidden = false;
        btnSend.disabled = false;
        btnSend.textContent = "Enviar";
      });
    });

    doneEl.querySelector("[data-again]").addEventListener("click", function () {
      rsvpForm.reset();
      idx = 0;
      transpNote.hidden = true;
      btnSend.disabled = false;
      btnSend.textContent = "Enviar";
      doneEl.hidden = true;
      rsvpForm.hidden = false;
      render();
    });

    render();
  }

  /* ---- Sugerir canción (modal música) ---- */
  var songForm = document.querySelector("form.song");
  if (songForm) {
    var songErr = songForm.querySelector(".rsvp__error");
    var songDone = songForm.parentElement.querySelector(".song__done");
    var songBtn = songForm.querySelector(".song__send");
    var songName = songForm.querySelector('[name="cancion"]');

    songForm.addEventListener("submit", function (e) {
      e.preventDefault();
      songErr.hidden = true;
      if (!songName.value.trim()) {
        songErr.textContent = "Decinos al menos el nombre de la canción.";
        songErr.hidden = false;
        return;
      }
      songBtn.disabled = true;
      songBtn.textContent = "Enviando…";

      var fd = new FormData(songForm);

      if (RSVP_CONFIG.provider === "google") {
        postToGoogleForm(GFORM.cancion, fd).then(function () {
          songForm.hidden = true;
          songDone.hidden = false;
        }).catch(function () {
          songErr.textContent = "No pudimos enviar la sugerencia. Probá de nuevo en un ratito.";
          songErr.hidden = false;
          songBtn.disabled = false;
          songBtn.textContent = "Enviar sugerencia";
        });
        return;
      }

      var url, opts;
      if (RSVP_CONFIG.provider === "formspree") {
        url = "https://formspree.io/f/" + RSVP_CONFIG.formspreeId;
        opts = { method: "POST", body: fd, headers: { "Accept": "application/json" } };
      } else {
        url = "/";
        opts = {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(fd).toString()
        };
      }

      fetch(url, opts).then(function (r) {
        if (!r.ok) throw new Error("bad status " + r.status);
        songForm.hidden = true;
        songDone.hidden = false;
      }).catch(function () {
        songErr.textContent = "No pudimos enviar la sugerencia. Probá de nuevo en un ratito.";
        songErr.hidden = false;
        songBtn.disabled = false;
        songBtn.textContent = "Enviar sugerencia";
      });
    });

    songDone.querySelector("[data-song-again]").addEventListener("click", function () {
      songForm.reset();
      songBtn.disabled = false;
      songBtn.textContent = "Enviar sugerencia";
      songDone.hidden = true;
      songForm.hidden = false;
    });
  }
})();
