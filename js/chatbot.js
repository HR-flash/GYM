/* HR GYM · Asistente de dudas e inscripción
   Chat por reglas (sin servidor). Lee los planes, servicios, sedes y preguntas
   frecuentes directamente de la página, así que sus respuestas siguen lo que
   escribas en index.html y js/app.js. Para inscribirse, reúne los datos y abre el
   formulario de "Crear cuenta" con el plan y los datos ya puestos. */
(function () {
  "use strict";

  var DUDAS_KEY = "hrgym.demo.dudas";

  /* ---------- Utilidades ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
  function txt(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }

  /* ---------- Datos leídos de la página ---------- */
  function planes() {
    return $$("#planList .plan-card").map(function (b) {
      return { key: b.getAttribute("data-plan"), name: txt($(".pn", b)), price: txt($(".price", b)), tag: txt($(".tagline", b)), perks: $$("li", b).map(txt) };
    });
  }
  function servicios() {
    return $$("#svcList li").map(function (li) { return { name: txt($("h3", li)), desc: txt($("p", li)), tag: txt($(".tag", li)) }; });
  }
  function sedes() {
    return $$("#sedeList .sede").map(function (s) {
      var dt = $$("dt", s), dd = $$("dd", s), h = [];
      dt.forEach(function (t, i) { h.push(txt(t) + " " + txt(dd[i])); });
      return { name: txt($("h3", s)).replace(/^HR GYM\s*/i, ""), addr: txt($(".addr", s)), hours: h, svc: $$(".chips span", s).map(txt) };
    });
  }
  function faqs() {
    return $$(".faq details").map(function (d) { return { q: txt($("summary", d)), a: txt($("p", d)) }; });
  }

  /* ---------- Interfaz ---------- */
  var root = document.createElement("div");
  root.className = "cb";
  root.innerHTML =
    '<button class="cb-fab" type="button" aria-expanded="false" aria-controls="cb-panel">¿Dudas?</button>' +
    '<section class="cb-panel" id="cb-panel" role="dialog" aria-label="Asistente de HR GYM" hidden>' +
    '<header class="cb-head"><b>Asistente HR GYM</b><button class="cb-x" type="button" aria-label="Cerrar asistente">×</button></header>' +
    '<div class="cb-log" id="cb-log" role="log" aria-live="polite"></div>' +
    '<div class="cb-chips" id="cb-chips"></div>' +
    '<form class="cb-form" id="cb-form" autocomplete="off"><input id="cb-in" type="text" placeholder="Escribe tu pregunta" aria-label="Tu mensaje" maxlength="300"><button class="btn solid sm" type="submit">Enviar</button></form>' +
    "</section>";
  document.body.appendChild(root);
  var fab = $(".cb-fab", root), panel = $("#cb-panel", root), log = $("#cb-log", root), chipBox = $("#cb-chips", root), form = $("#cb-form", root), input = $("#cb-in", root);
  var greeted = false, flow = null;

  function scrollLog() { log.scrollTop = log.scrollHeight; }
  function bot(html) { var d = document.createElement("div"); d.className = "cb-msg bot"; d.innerHTML = html; log.appendChild(d); scrollLog(); }
  function me(t) { var d = document.createElement("div"); d.className = "cb-msg me"; d.textContent = t; log.appendChild(d); scrollLog(); }
  function chips(list) {
    chipBox.innerHTML = list.map(function (c) { return '<button type="button" class="cb-chip">' + esc(c) + "</button>"; }).join("");
    scrollLog();
  }
  var MENU = ["Ver planes", "Sedes y horarios", "Servicios", "Inscribirme", "Enviar una duda al equipo"];

  function open() {
    panel.hidden = false; fab.hidden = true; fab.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      bot("Hola, soy el asistente de HR GYM. Resuelvo dudas sobre planes, sedes y servicios, y te ayudo a inscribirte.");
      chips(MENU);
    }
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { panel.hidden = true; fab.hidden = false; fab.setAttribute("aria-expanded", "false"); fab.focus(); }
  fab.addEventListener("click", open);
  $(".cb-x", root).addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  chipBox.addEventListener("click", function (e) { var b = e.target.closest(".cb-chip"); if (b) send(b.textContent); });
  form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ""; send(v); });

  function send(text) { me(text); chips([]); setTimeout(function () { reply(text); }, 220); }

  /* ---------- Respuestas ---------- */
  function planLine(p) { return "<b>" + esc(p.name) + "</b> · " + esc(p.price) + "<br>" + p.perks.map(esc).join(" · "); }
  function ansPlanes(n) {
    var ps = planes(), one = ps.filter(function (p) { return n.indexOf(norm(p.name)) > -1 || (p.key === "grey" && /\bgris\b/.test(n)); });
    if (one.length === 1) {
      bot(planLine(one[0]) + "<br>" + esc(one[0].tag) + ".");
      chips(["Inscribirme", "Ver planes", "Sedes y horarios"]);
    } else {
      bot("Tenemos tres planes, todos con pago mensual:<br><br>" + ps.map(planLine).join("<br><br>"));
      chips(["Inscribirme"].concat(ps.map(function (p) { return "Plan " + p.name; })));
    }
  }
  function ansSedes(n) {
    var ss = sedes(), one = ss.filter(function (s) { return n.indexOf(norm(s.name)) > -1; })[0];
    if (one) {
      bot("<b>HR GYM " + esc(one.name) + "</b><br>" + esc(one.addr) + "<br>Horario: " + esc(one.hours.join(" · ")) + "<br>Cuenta con: " + esc(one.svc.join(", ")) + ".<br><span class=\"cb-note\">Direcciones y horarios de ejemplo.</span>");
      chips(["Inscribirme", "Ver planes", "Sedes y horarios"]);
    } else {
      bot("Tenemos " + ss.length + " sedes. Elige una para ver su dirección, horario y servicios.");
      chips(ss.map(function (s) { return s.name; }));
    }
  }
  function ansHorario(n) {
    var ss = sedes(), one = ss.filter(function (s) { return n.indexOf(norm(s.name)) > -1; });
    var list = one.length ? one : ss;
    bot(list.map(function (s) { return "<b>" + esc(s.name) + "</b>: " + esc(s.hours.join(" · ")); }).join("<br>") + '<br><span class="cb-note">Horarios de ejemplo.</span>');
    chips(["Sedes y horarios", "Ver planes", "Inscribirme"]);
  }
  function ansServicios() {
    var sv = servicios();
    bot("En cada sede encuentras: " + sv.map(function (s) { return esc(s.name); }).join(", ") + ". Pregúntame por cualquiera para ver su detalle y qué planes lo incluyen.");
    chips(["Ver planes", "Sedes y horarios", "Inscribirme"]);
  }
  function findServicio(n) {
    var sv = servicios();
    for (var i = 0; i < sv.length; i++) {
      var words = norm(sv[i].name).split(" ").filter(function (w) { return w.length > 2 && ["los", "las", "del", "con"].indexOf(w) < 0 && w !== "libre"; });
      for (var j = 0; j < words.length; j++) {
        var w = words[j], stem = w.length > 4 ? w.slice(0, 4) : w;
        if (new RegExp("\\b" + stem).test(n)) return sv[i];
      }
    }
    return null;
  }
  function ansServicio(s) {
    bot("<b>" + esc(s.name) + "</b>: " + esc(s.desc) + "<br>Disponible en: " + esc(s.tag) + ".");
    chips(["Ver planes", "Servicios", "Inscribirme"]);
  }

  var FIJAS = [
    [/(pago|pagar|tarjeta|cobr|factura|efectivo)/, "El pago es mensual con tarjeta. Al inscribirte pagas el primer mes en el mismo formulario, y después puedes cambiar tu tarjeta desde tu cuenta, en la pestaña Mi cuenta (o en el kiosko, en Método de pago)."],
    [/(cancel|baja|dar de baja|dejar el gym|terminar mi plan)/, "Puedes cancelar tu plan desde tu cuenta, en Mi cuenta, o en el kiosko, en Cancelación de plan. Conservas el acceso hasta la fecha en que vence tu mes."],
    [/(invitad|amigo|acompan)/, "Los invitados son un beneficio del plan Black: puedes registrar hasta 5 y recepción les entrega su credencial cuando llegan."],
    [/(reserv|apartar|instructor)/, "Los socios reservan salones e instructores desde su portal, en la pestaña Extras y reservas. Eliges salón, fecha, hora e instructor, y ves tus reservas ahí mismo."],
    [/(kiosko|pantalla|modulo)/, "El kiosko es la pantalla táctil de la sucursal. Ahí puedes ver los planes, inscribirte, e iniciar sesión para ver tus invitados Black, cambiar tu tarjeta o cancelar tu plan."],
    [/(contrasena|olvide|clave|password|no puedo entrar)/, "Para entrar usas tu número de socio y la contraseña que elegiste al inscribirte. Si no los recuerdas, pasa a recepción para que te ayuden."]
  ];

  function ansFaq(n) {
    var words = n.split(" ").filter(function (w) { return w.length > 3; }), best = null, bs = 0;
    faqs().forEach(function (f) {
      var h = norm(f.q + " " + f.a), sc = 0;
      words.forEach(function (w) { if (h.indexOf(w) > -1) sc++; });
      if (sc > bs) { bs = sc; best = f; }
    });
    if (best && bs >= 2) { bot("<b>" + esc(best.q) + "</b><br>" + esc(best.a)); chips(["Ver planes", "Inscribirme", "Enviar una duda al equipo"]); return true; }
    return false;
  }

  function reply(text) {
    var n = norm(text);
    if (flow) { if (stepFlow(text, n)) return; }
    if (/(inscrib|registr|afili|unirme|hacerme socio|quiero (un )?plan|crear cuenta|darme de alta|apuntar)/.test(n)) return startEnroll();
    if (/(duda al equipo|enviar una duda|dejar (un )?mensaje|hablar con|persona|humano|asesor|queja|sugerenc|contactar|contacto)/.test(n)) return startMsg();
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)\b/.test(n)) { bot("¡Hola! ¿En qué te puedo ayudar?"); chips(MENU); return; }
    if (/(gracias|muchas gracias|ok gracias)/.test(n)) { bot("Con gusto. Si necesitas algo más, aquí estoy."); chips(MENU); return; }
    if (/^sedes y horarios?$/.test(n)) return ansSedes(n);
    if (/(horario|abren|abre|cierran|cierra|a que hora)/.test(n)) return ansHorario(n);
    if (/(precio|cuesta|costo|cuanto|mensualidad|diferencia)/.test(n)) return ansPlanes(n);
    for (var i = 0; i < FIJAS.length; i++) if (FIJAS[i][0].test(n)) { bot(FIJAS[i][1]); chips(["Ver planes", "Inscribirme", "Enviar una duda al equipo"]); return; }
    var sv = findServicio(n);
    if (sv) return ansServicio(sv);
    if (/(sede|sucursal|ubicacion|donde|direccion|polanco|coyoacan|satelite|santa fe)/.test(n)) return ansSedes(n);
    if (/(plan|planes|white|grey|gris|black)/.test(n)) return ansPlanes(n);
    if (/(servicio|que incluye|que tienen|que hay)/.test(n)) return ansServicios();
    if (ansFaq(n)) return;
    bot("No tengo una respuesta segura para eso. Puedes ver los planes, las sedes o dejar tu duda para que el equipo te responda.");
    chips(["Ver planes", "Sedes y horarios", "Enviar una duda al equipo"]);
  }

  /* ---------- Flujos con pasos ---------- */
  function startEnroll() {
    flow = { t: "enroll", step: "plan", d: {} };
    bot("Con gusto. ¿Qué plan quieres?");
    chips(planes().map(function (p) { return p.name + " · " + p.price.replace(/\s*al mes/, "/mes"); }).concat(["Cancelar"]));
  }
  function startMsg() {
    flow = { t: "msg", step: "nombre", d: {} };
    bot("Claro, dejo tu duda para el equipo. ¿Cómo te llamas?");
    chips(["Cancelar"]);
  }
  function stepFlow(text, n) {
    if (/^(cancelar|salir|mejor no|no gracias)$/.test(n)) { flow = null; bot("Listo, lo dejamos aquí."); chips(MENU); return true; }
    var f = flow, d = f.d;
    if (f.t === "enroll") {
      if (f.step === "plan") {
        var p = planes().filter(function (x) { return n.indexOf(norm(x.name)) > -1 || (x.key === "grey" && /\bgris\b/.test(n)); })[0];
        if (!p) { bot("Elige uno de los planes: White, Grey o Black."); chips(planes().map(function (x) { return x.name; }).concat(["Cancelar"])); return true; }
        d.plan = p; f.step = "nombre"; bot("Plan " + esc(p.name) + ", " + esc(p.price) + ". ¿Cuál es tu nombre completo?"); chips(["Cancelar"]); return true;
      }
      if (f.step === "nombre") {
        if (text.trim().length < 3) { bot("Escribe tu nombre completo, por favor."); return true; }
        d.nombre = text.trim(); f.step = "correo"; bot("Gracias, " + esc(d.nombre.split(" ")[0]) + ". ¿A qué correo te enviamos tu número de socio?"); chips(["Cancelar"]); return true;
      }
      if (f.step === "correo") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) { bot("Ese correo no parece válido. Escríbelo de nuevo, por ejemplo nombre@correo.com."); return true; }
        d.correo = text.trim(); f.step = "tel"; bot("¿Y tu teléfono?"); chips(["Cancelar"]); return true;
      }
      if (f.step === "tel") {
        if (text.replace(/\D/g, "").length < 10) { bot("El teléfono debe tener al menos 10 dígitos."); return true; }
        d.tel = text.trim(); f.step = "ok";
        bot("Revisa tus datos:<br><b>Plan:</b> " + esc(d.plan.name) + " (" + esc(d.plan.price) + ")<br><b>Nombre:</b> " + esc(d.nombre) + "<br><b>Correo:</b> " + esc(d.correo) + "<br><b>Teléfono:</b> " + esc(d.tel) + "<br><br>Con esto abro el formulario de inscripción. Ahí eliges tu sede y tu contraseña, y pagas con tarjeta.");
        chips(["Continuar al formulario", "Cancelar"]); return true;
      }
      if (f.step === "ok") {
        if (/(continu|si|formulario|pago|listo|dale|ok)/.test(n)) { handoff(d); flow = null; return true; }
        bot("Toca “Continuar al formulario” para seguir, o “Cancelar”."); chips(["Continuar al formulario", "Cancelar"]); return true;
      }
    }
    if (f.t === "msg") {
      if (f.step === "nombre") { if (text.trim().length < 2) { bot("Escribe tu nombre, por favor."); return true; } d.nombre = text.trim(); f.step = "correo"; bot("¿A qué correo te respondemos?"); chips(["Cancelar"]); return true; }
      if (f.step === "correo") { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())) { bot("Ese correo no parece válido. Escríbelo de nuevo."); return true; } d.correo = text.trim(); f.step = "texto"; bot("Escribe tu duda y la dejo registrada."); chips(["Cancelar"]); return true; }
      if (f.step === "texto") {
        if (text.trim().length < 5) { bot("Cuéntame un poco más sobre tu duda."); return true; }
        d.texto = text.trim(); guardarDuda(d); flow = null;
        bot("Listo, " + esc(d.nombre.split(" ")[0]) + ". Tu duda quedó registrada con el correo " + esc(d.correo) + '.<br><span class="cb-note">Demostración: la duda se guarda en este navegador y no se envía ningún correo real.</span>');
        chips(MENU); return true;
      }
    }
    return false;
  }
  function guardarDuda(d) {
    try {
      var l = JSON.parse(localStorage.getItem(DUDAS_KEY) || "[]");
      l.push({ fecha: new Date().toISOString(), nombre: d.nombre, correo: d.correo, texto: d.texto });
      localStorage.setItem(DUDAS_KEY, JSON.stringify(l));
    } catch (e) {}
  }

  /* Abre "Crear cuenta" con el plan elegido y los datos ya escritos */
  function handoff(d) {
    var b = $('#planList [data-plan="' + d.plan.key + '"]');
    if (!b) { bot("No pude abrir el formulario. Usa el botón “Crear cuenta” de la parte de arriba."); return; }
    b.click();
    [["c-n", d.nombre], ["c-e", d.correo], ["c-t", d.tel]].forEach(function (p) { var el = document.getElementById(p[0]); if (el) el.value = p[1]; });
    bot("Listo, abrí el formulario con tus datos y el plan " + esc(d.plan.name) + ". Completa tu fecha de nacimiento, sede y contraseña para seguir al pago.");
    chips(MENU);
    close();
  }
})();
