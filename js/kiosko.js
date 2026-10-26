/* HR GYM · Kiosko del gimnasio
   Dos apartados: Planes (inscripción con pago simulado) e Iniciar sesión del alumno
   (invitados Black, método de pago y cancelación de plan).

   Comparte la base de datos de demostración con el sitio principal (misma clave de
   localStorage). El bloque "Datos" de abajo es una copia de js/app.js: si cambias
   los planes o los datos de muestra allá, cámbialos también aquí. */
(function () {
  "use strict";

  /* ========== Utilidades ========== */
  var MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return iso(new Date()); }
  function addDays(s, n) { var p = s.split("-"); return iso(new Date(+p[0], +p[1] - 1, +p[2] + n)); }
  function addMonth(s) { var p = s.split("-"); return iso(new Date(+p[0], +p[1], +p[2])); }
  function fmt(s) { var p = s.split("-"); return +p[2] + " " + MES[+p[1] - 1] + " " + p[0]; }
  function money(n) { return "$" + Number(n).toLocaleString("es-MX"); }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function fdata(f) { var o = {}; Array.prototype.forEach.call(f.elements, function (e) { if (!e.name) return; if (e.type === "radio") { if (e.checked) o[e.name] = e.value; } else o[e.name] = e.value; }); return o; }
  var toastT;
  function toast(m) { var t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 3200); }

  /* ========== Datos (copia de js/app.js) ========== */
  var PLANS = {
    white: { n: "White", p: 399, tag: "Lo básico para entrenar", b: ["Máquinas y peso libre", "Regaderas, baños y agua", "Acceso a tu sede", "Horario de 6:00 a 22:00", "Portal web con tu código de barras"] },
    grey: { n: "Grey", p: 649, tag: "Más sedes, más clases", b: ["Todo lo de White", "Acceso a las 4 sedes", "Clases en salones", "Casilleros", "Spa 2 veces por semana", "Horario completo desde 5:30"] },
    black: { n: "Black", p: 999, tag: "La experiencia completa", b: ["Todo lo de Grey", "Spa sin límite", "Hasta 5 invitados registrados", "Toalla incluida", "Reservación prioritaria de salones", "Horario completo desde 5:30"] }
  };

  var KEY = "hrgym.demo.v2";
  var DB;
  function seed() {
    var t = today();
    return {
      seq: 100300,
      members: [
        { id: "HR100231", nombre: "Ana Lucía Ramos", correo: "ana.ramos@example.com", tel: "55 1234 5678", pass: "ana12345", plan: "black", sede: "Polanco", acceso: "permitido", estado: "activa", vence: addDays(t, 24), last4: "4242", titular: "Ana L. Ramos", extras: { dieta: true, encuesta: { peso: 64.2, estatura: 165 }, plan: null }, asist: 18,
          invitados: [{ id: "INV-0001", nombre: "Carlos Ramos", estado: "con credencial" }, { id: "INV-0002", nombre: "Julia Ortiz", estado: "sin credencial" }] },
        { id: "HR100312", nombre: "Mariana Torres", correo: "mariana.t@example.com", tel: "55 2345 6789", pass: "mariana1", plan: "grey", sede: "Coyoacán", acceso: "bloqueado", estado: "vencida", vence: addDays(t, -2), last4: "1881", titular: "Mariana Torres", extras: { dieta: false, encuesta: null, plan: null }, asist: 6, invitados: [] },
        { id: "HR100418", nombre: "Diego Herrera", correo: "diego.h@example.com", tel: "55 3456 7890", pass: "diego123", plan: "white", sede: "Polanco", acceso: "permitido", estado: "activa", vence: addDays(t, 9), last4: "0005", titular: "Diego Herrera", extras: { dieta: false, encuesta: null, plan: null }, asist: 11, invitados: [] }
      ],
      employees: [
        { id: "ADM-001", pass: "admin123", nombre: "Valeria Cordero", puesto: "Administradora de sucursal", rol: "admin", sede: "Polanco", turno: "Matutino", estado: "activa" },
        { id: "EMP-014", pass: "empleado123", nombre: "Sofía Núñez", puesto: "Recepción", rol: "empleado", sede: "Polanco", turno: "Matutino", estado: "activa" },
        { id: "EMP-021", pass: "", nombre: "Paola Vega", puesto: "Instructora de spinning", rol: "empleado", sede: "Polanco", turno: "Matutino", estado: "activa" },
        { id: "EMP-022", pass: "", nombre: "Iván Reyes", puesto: "Coach de funcional y box", rol: "empleado", sede: "Polanco", turno: "Vespertino", estado: "activa" },
        { id: "EMP-030", pass: "", nombre: "Raúl Mendoza", puesto: "Mantenimiento", rol: "empleado", sede: "Polanco", turno: "Fines de semana", estado: "activa" }
      ],
      equipo: [
        { id: 1, n: "Caminadora TM-04", cat: "Cardio", adq: "2024-03-12", costo: 38500, mant: addDays(t, -19), est: "operativa" },
        { id: 2, n: "Rack de sentadilla R-02", cat: "Peso libre", adq: "2023-01-20", costo: 21900, mant: addDays(t, -36), est: "operativa" },
        { id: 3, n: "Bicicleta spinning 09", cat: "Cardio", adq: "2022-06-08", costo: 12400, mant: addDays(t, -23), est: "mantenimiento" },
        { id: 4, n: "Banca plana 03", cat: "Peso libre", adq: "2019-08-02", costo: 4800, mant: addDays(t, -102), est: "baja" },
        { id: 5, n: "Polea doble PD-01", cat: "Fuerza", adq: "2024-09-15", costo: 46200, mant: addDays(t, -40), est: "operativa" }
      ],
      reservas: [
        { id: 1, socio: "HR100231", nombre: "Ana Lucía Ramos", salon: "B", fecha: addDays(t, 1), hora: "07:00", inst: "Paola Vega", estado: "activa" },
        { id: 2, socio: "HR100418", nombre: "Diego Herrera", salon: "C", fecha: addDays(t, 1), hora: "18:00", inst: "Iván Reyes", estado: "activa" }
      ],
      banco: [
        { id: 1, t: "Dieta", n: "Definición 1,800 kcal", o: "Pérdida de grasa", d: "8 semanas" },
        { id: 2, t: "Dieta", n: "Volumen 2,800 kcal", o: "Ganancia muscular", d: "12 semanas" },
        { id: 3, t: "Rutina", n: "Fuerza 5 × 5", o: "Fuerza", d: "12 semanas" },
        { id: 4, t: "Rutina", n: "Cuerpo completo", o: "Adaptación", d: "4 semanas" }
      ],
      libro: [
        { f: addDays(t, -20), c: "Membresías Grey y White", t: "Ingreso", m: 18450 },
        { f: addDays(t, -18), c: "Renta del local", t: "Egreso", m: 22000 },
        { f: addDays(t, -12), c: "Mantenimiento de equipo", t: "Egreso", m: 3150 },
        { f: addDays(t, -9), c: "Membresías Black", t: "Ingreso", m: 29970 },
        { f: addDays(t, -3), c: "Venta de suplementos", t: "Ingreso", m: 4280 },
        { f: addDays(t, -2), c: "Nómina de quincena", t: "Egreso", m: 31500 }
      ],
      respaldos: [{ f: t, h: "03:00", tam: "1.8 GB" }, { f: addDays(t, -1), h: "03:00", "tam": "1.8 GB" }, { f: addDays(t, -2), h: "03:00", tam: "1.7 GB" }]
    };
  }
  function load() { try { var r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} }

  /* ========== Estado del kiosko ========== */
  var SEDES_KIOSKO = ["Polanco", "Coyoacán", "Satélite", "Santa Fe"];
  var qs = new URLSearchParams(location.search);
  var SEDE = SEDES_KIOSKO.indexOf(qs.get("sede")) > -1 ? qs.get("sede") : "Polanco";
  var IDLE_MS = 60000;

  var DB;
  function sync() { DB = load() || seed(); }
  function member(id) { return DB.members.filter(function (m) { return m.id.toLowerCase() === String(id).toLowerCase(); })[0]; }
  function luhnLen(n) { return n.replace(/\D/g, "").length === 16; }

  var S = { view: "home", step: 1, plan: null, draft: null, created: null, error: "", paying: false, user: null, tab: null, confirm: false };
  var root = $("#kiosk");
  var idleT;

  function reset() { S.step = 1; S.plan = null; S.draft = null; S.created = null; S.error = ""; S.paying = false; S.user = null; S.tab = null; S.confirm = false; }
  function go(view) { reset(); S.view = view; render(); window.scrollTo(0, 0); }
  function bumpIdle() {
    clearTimeout(idleT);
    if (S.view === "home") return;
    idleT = setTimeout(function () { go("home"); toast("La pantalla volvió al inicio por inactividad."); }, IDLE_MS);
  }

  /* ========== Estructura común ========== */
  function topbar() {
    var right = "";
    if (S.view === "account") right = '<span class="muted">Socio <b>' + esc(S.user) + '</b></span><button class="btn sm" type="button" data-act="home">Cerrar sesión</button>';
    else if (S.view !== "home") right = '<button class="btn sm" type="button" data-act="home">← Inicio</button>';
    return '<div class="topbar"><div class="wrap"><button class="logo" type="button" data-act="home"><small>HR</small>GYM</button><div class="who"><span class="muted">Kiosko · ' + esc(SEDE) + '</span><span class="muted" id="clock"></span>' + right + "</div></div></div>";
  }
  function foot() { return '<p class="k-foot">Por seguridad, la pantalla vuelve al inicio después de 60 segundos sin actividad.</p>'; }
  function tick() { var c = $("#clock"); if (c) { var d = new Date(); c.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()); } }

  /* ========== Pantallas ========== */
  function viewHome() {
    return '<div class="wrap k-home"><div class="k-welcome"><span class="eyebrow">Bienvenido</span><h1 class="h2">¿Qué quieres hacer?</h1></div><div class="k-tiles">' +
      '<button class="k-tile" type="button" data-act="goPlans"><span class="k-t">Planes</span><span class="k-d">Conoce White, Grey y Black, elige uno e inscríbete.</span><span class="k-go">Comenzar →</span></button>' +
      '<button class="k-tile" type="button" data-act="goLogin"><span class="k-t">Iniciar sesión</span><span class="k-d">Socios: invitados Black, método de pago y cancelación de plan.</span><span class="k-go">Entrar →</span></button></div></div>';
  }

  function steps(n) {
    return '<div class="stepper">' + ["Plan", "Tus datos", "Pago", "Listo"].map(function (t, i) { return '<div class="' + (n === i + 1 ? "on" : n > i + 1 ? "done" : "") + '">' + (i + 1) + ". " + t + "</div>"; }).join("") + "</div>";
  }
  function viewPlans() {
    var h = '<div class="wrap k-page"><div class="k-head"><span class="eyebrow">Inscripción</span><h1 class="h2">' + (S.step === 1 ? "Elige tu plan" : S.step === 2 ? "Tus datos" : S.step === 3 ? "Pago con tarjeta" : "Bienvenido a HR GYM") + "</h1></div>" + steps(S.step);
    var d = S.draft || {};
    if (S.step === 1) {
      h += '<div class="plans">' + Object.keys(PLANS).map(function (k) {
        var p = PLANS[k];
        return '<button type="button" class="plan-card ' + k + '" data-act="pickPlan" data-plan="' + k + '"><span class="pn">' + p.n + '</span><span class="price">' + money(p.p) + ' <small>al mes</small></span><span class="tagline">' + esc(p.tag) + "</span><ul>" + p.b.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + '</ul><span class="pick">Elegir ' + p.n + " →</span></button>";
      }).join("") + "</div>";
    } else if (S.step === 2) {
      var pl = PLANS[S.plan];
      h += '<form class="card k-form" data-form="datos" autocomplete="off"><div class="alert info">Plan elegido: <b>' + pl.n + "</b> · " + money(pl.p) + ' al mes · sede ' + esc(SEDE) + '. <button type="button" class="k-link" data-act="changePlan">Cambiar plan</button></div>' +
        '<div class="row2"><div class="field"><label for="k-n">Nombre completo</label><input id="k-n" name="nombre" required value="' + esc(d.nombre) + '"></div><div class="field"><label for="k-e">Correo</label><input id="k-e" name="correo" type="email" required value="' + esc(d.correo) + '"></div></div>' +
        '<div class="row2"><div class="field"><label for="k-t">Teléfono</label><input id="k-t" name="tel" inputmode="tel" required value="' + esc(d.tel) + '"></div><div class="field"><label for="k-b">Fecha de nacimiento</label><input id="k-b" name="nac" type="date" required max="' + addDays(today(), -5840) + '" value="' + esc(d.nac) + '"></div></div>' +
        '<div class="row2"><div class="field"><label for="k-p">Contraseña (mínimo 8)</label><input id="k-p" name="pass" type="password" minlength="8" required></div><div class="field"><label for="k-p2">Repite la contraseña</label><input id="k-p2" name="pass2" type="password" minlength="8" required></div></div>' +
        (S.error ? '<div class="alert bad" role="alert">' + esc(S.error) + "</div>" : "") + '<div class="k-actions"><button class="btn" type="button" data-act="changePlan">Volver</button><button class="btn solid" type="submit">Continuar al pago</button></div></form>';
    } else if (S.step === 3) {
      var p3 = PLANS[S.plan];
      h += '<form class="card k-form" data-form="pago" autocomplete="off"><dl class="kv"><dt>Plan</dt><dd>' + p3.n + "</dd><dt>Sede</dt><dd>" + esc(SEDE) + "</dd><dt>Primer mes</dt><dd><b>" + money(p3.p) + '</b></dd></dl><div class="alert info">Demostración: no se procesa ningún pago real. Escribe cualquier número de 16 dígitos, por ejemplo 4242 4242 4242 4242. Solo se conserva la terminación.</div>' +
        '<div class="field"><label for="k-h">Nombre en la tarjeta</label><input id="k-h" name="titular" required value="' + esc(d.nombre) + '"></div><div class="field"><label for="k-c">Número de tarjeta</label><input id="k-c" class="cc" name="num" inputmode="numeric" required maxlength="19" placeholder="0000 0000 0000 0000"></div>' +
        '<div class="row2"><div class="field"><label for="k-v">Vence (MM/AA)</label><input id="k-v" class="exp" name="vence" inputmode="numeric" required maxlength="5" placeholder="MM/AA"></div><div class="field"><label for="k-s">Código de seguridad</label><input id="k-s" name="cvv" type="password" inputmode="numeric" required maxlength="4" placeholder="123"></div></div>' +
        (S.error ? '<div class="alert bad" role="alert">' + esc(S.error) + "</div>" : "") + '<div class="k-actions"><button class="btn" type="button" data-act="back2">Volver</button><button class="btn solid" type="submit"' + (S.paying ? " disabled" : "") + ">" + (S.paying ? "Procesando…" : "Pagar " + money(p3.p)) + "</button></div></form>";
    } else {
      var c = S.created;
      h += '<div class="card k-form"><div class="alert ok">Pago aprobado. Tu inscripción quedó registrada.</div><div class="email"><div class="hd"><span>Para: ' + esc(c.correo) + "</span><span>Asunto: Tu número de socio HR GYM</span></div><p>Hola " + esc(c.nombre) + ", bienvenido a HR GYM. Tu plan " + PLANS[c.plan].n + " está activo hasta el " + fmt(c.vence) + '.</p><p class="hint">Tu número de socio</p><p class="num">' + c.id + '</p><p>Con este número y tu contraseña inicias sesión en el kiosko y en el portal web.</p></div><p class="hint">Este correo es una simulación en pantalla. La demostración no envía mensajes reales.</p><div class="k-actions"><button class="btn solid" type="button" data-act="home">Terminar</button></div></div>';
    }
    return h + foot() + "</div>";
  }

  function viewLogin() {
    return '<div class="wrap k-page"><div class="k-head"><span class="eyebrow">Alumnos</span><h1 class="h2">Iniciar sesión</h1></div><form class="card k-form" data-form="login" autocomplete="off"><div class="field"><label for="k-id">Número de socio</label><input id="k-id" name="id" required placeholder="HR100231" autocapitalize="characters"></div><div class="field"><label for="k-pw">Contraseña</label><input id="k-pw" name="pass" type="password" required></div>' +
      (S.error ? '<div class="alert bad" role="alert">' + esc(S.error) + "</div>" : "") + '<div class="k-actions"><button class="btn" type="button" data-act="home">Cancelar</button><button class="btn solid" type="submit">Entrar</button></div><p class="hint">Tu número de socio llegó a tu correo cuando te inscribiste.</p></form>' + foot() + "</div>";
  }

  function viewAccount() {
    var m = member(S.user);
    if (!m) { go("home"); return ""; }
    var black = m.plan === "black";
    var tabs = [];
    if (black) tabs.push(["invitados", "Invitados Black"]);
    tabs.push(["pago", "Método de pago"], ["cancelar", "Cancelación de plan"]);
    if (!S.tab || !tabs.some(function (t) { return t[0] === S.tab; })) S.tab = tabs[0][0];
    var h = '<div class="wrap k-page"><div class="k-head"><span class="eyebrow">Tu cuenta</span><h1 class="h2">Hola, ' + esc(m.nombre) + '</h1><p class="muted"><span class="badge-plan ' + m.plan + '">' + PLANS[m.plan].n + "</span> &nbsp;" + (m.estado === "activa" ? "Activo hasta el " + fmt(m.vence) : m.estado === "cancelada" ? "Plan cancelado" : "Plan vencido el " + fmt(m.vence)) + '</p></div><div class="k-tabs" role="tablist">' +
      tabs.map(function (t) { return '<button type="button" role="tab" data-act="tab" data-tab="' + t[0] + '" aria-selected="' + (S.tab === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div>";
    if (S.tab === "invitados") {
      h += '<div class="card k-form"><h3>Invitados registrados · ' + m.invitados.length + " de 5</h3>" + (m.invitados.length ? '<ul class="list">' + m.invitados.map(function (g) {
        var cls = g.estado === "con credencial" || g.estado === "liberado hoy" ? "ok" : g.estado === "bloqueado" ? "bad" : "warn";
        return "<li><span>" + esc(g.nombre) + ' <span class="muted">· ' + g.id + '</span></span><span class="k-row"><span class="pill ' + cls + '">' + g.estado + '</span><button class="btn sm danger" type="button" data-act="delGuest" data-id="' + g.id + '">Quitar</button></span></li>';
      }).join("") + "</ul>" : '<p class="muted">Aún no registras invitados.</p>') +
        '<form class="form" data-form="guest" autocomplete="off"><div class="field"><label for="k-g">Nombre del invitado</label><input id="k-g" name="nombre" required></div><div class="k-actions"><button class="btn solid" type="submit"' + (m.invitados.length >= 5 ? " disabled" : "") + '>Registrar invitado</button></div></form><p class="hint">Recepción entrega la credencial del invitado cuando llega al gimnasio.</p></div>';
    } else if (S.tab === "pago") {
      h += '<form class="card k-form" data-form="card" autocomplete="off"><h3>Método de pago</h3><dl class="kv"><dt>Tarjeta actual</dt><dd>•••• •••• •••• ' + m.last4 + "</dd><dt>Titular</dt><dd>" + esc(m.titular) + '</dd></dl><div class="alert info">Demostración: no se guarda el número completo.</div>' +
        '<div class="field"><label for="u-h">Nombre en la tarjeta nueva</label><input id="u-h" name="titular" required></div><div class="field"><label for="u-c">Número de tarjeta nueva</label><input id="u-c" class="cc" name="num" inputmode="numeric" required maxlength="19" placeholder="0000 0000 0000 0000"></div>' +
        '<div class="row2"><div class="field"><label for="u-v">Vence (MM/AA)</label><input id="u-v" class="exp" name="vence" inputmode="numeric" required maxlength="5" placeholder="MM/AA"></div><div class="field"><label for="u-s">Código de seguridad</label><input id="u-s" name="cvv" type="password" inputmode="numeric" required maxlength="4" placeholder="123"></div></div>' +
        (S.error ? '<div class="alert bad" role="alert">' + esc(S.error) + "</div>" : "") + '<div class="k-actions"><button class="btn solid" type="submit">Cambiar tarjeta</button></div></form>';
    } else {
      h += '<div class="card k-form"><h3>Cancelación de plan</h3><dl class="kv"><dt>Plan</dt><dd>' + PLANS[m.plan].n + " · " + money(PLANS[m.plan].p) + " al mes</dd><dt>Estado</dt><dd>" + (m.estado === "activa" ? "Activo" : m.estado === "cancelada" ? "Cancelado" : "Vencido") + "</dd><dt>Vigencia</dt><dd>hasta el " + fmt(m.vence) + "</dd></dl>";
      if (m.estado === "cancelada") h += '<div class="alert warn">Tu plan está cancelado. No se harán más cobros.</div><div class="k-actions"><button class="btn solid" type="button" data-act="reactivate">Reactivar mi plan</button></div>';
      else if (S.confirm) h += '<div class="alert warn">¿Seguro que quieres cancelar tu plan? Conservas el acceso hasta el ' + fmt(m.vence) + '.</div><div class="k-actions"><button class="btn danger" type="button" data-act="cancelYes">Sí, cancelar mi plan</button><button class="btn" type="button" data-act="cancelNo">No, mantenerlo</button></div>';
      else h += '<div class="k-actions"><button class="btn danger" type="button" data-act="cancelAsk">Cancelar mi plan</button></div>';
      h += "</div>";
    }
    return h + foot() + "</div>";
  }

  function render() {
    sync();
    root.innerHTML = topbar() + (S.view === "plans" ? viewPlans() : S.view === "login" ? viewLogin() : S.view === "account" ? viewAccount() : viewHome());
    tick(); bumpIdle();
    var f = root.querySelector("form input:not([type=hidden])"); if (f && S.view !== "home" && !(S.view === "plans" && S.step === 4)) { try { f.focus({ preventScroll: true }); } catch (e) {} }
  }

  /* ========== Eventos ========== */
  root.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-act]"); if (!b) return;
    var a = b.getAttribute("data-act"), id = b.getAttribute("data-id"), m = S.user ? member(S.user) : null;
    switch (a) {
      case "home": go("home"); break;
      case "goPlans": go("plans"); break;
      case "goLogin": go("login"); break;
      case "pickPlan": S.plan = b.getAttribute("data-plan"); S.step = 2; S.error = ""; render(); window.scrollTo(0, 0); break;
      case "changePlan": S.step = 1; S.error = ""; render(); break;
      case "back2": S.step = 2; S.error = ""; render(); break;
      case "tab": S.tab = b.getAttribute("data-tab"); S.confirm = false; S.error = ""; render(); break;
      case "delGuest": m.invitados = m.invitados.filter(function (g) { return g.id !== id; }); save(); render(); break;
      case "cancelAsk": S.confirm = true; render(); break;
      case "cancelNo": S.confirm = false; render(); break;
      case "cancelYes": m.estado = "cancelada"; S.confirm = false; save(); toast("Tu plan quedó cancelado"); render(); break;
      case "reactivate": m.estado = "activa"; m.vence = addMonth(today()); m.acceso = "permitido"; save(); toast("Tu plan fue reactivado"); render(); break;
    }
  });
  root.addEventListener("input", function (ev) {
    var t = ev.target;
    if (t.classList.contains("cc")) t.value = t.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    else if (t.classList.contains("exp")) { var v = t.value.replace(/\D/g, "").slice(0, 4); t.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v; }
  });
  root.addEventListener("submit", function (ev) {
    var f = ev.target.closest("form[data-form]"); if (!f) return;
    ev.preventDefault(); sync();
    var k = f.getAttribute("data-form"), d = fdata(f), m = S.user ? member(S.user) : null;
    if (k === "login") {
      var u = member(d.id.trim());
      if (u && u.pass === d.pass) { S.user = u.id; S.view = "account"; S.tab = null; S.error = ""; render(); window.scrollTo(0, 0); }
      else { S.error = "Número de socio o contraseña incorrectos."; render(); }
    } else if (k === "datos") {
      S.draft = d;
      if (d.pass !== d.pass2) { S.error = "Las contraseñas no coinciden."; render(); return; }
      if (DB.members.some(function (x) { return x.correo.toLowerCase() === d.correo.toLowerCase(); })) { S.error = "Ya existe una cuenta con ese correo."; render(); return; }
      S.step = 3; S.error = ""; render(); window.scrollTo(0, 0);
    } else if (k === "pago") {
      if (!luhnLen(d.num)) { S.error = "El número de tarjeta debe tener 16 dígitos."; render(); return; }
      if (!/^(0[1-9]|1[0-2])\/\d\d$/.test(d.vence)) { S.error = "Escribe la vigencia como MM/AA."; render(); return; }
      if (!/^\d{3,4}$/.test(d.cvv)) { S.error = "El código de seguridad tiene 3 o 4 dígitos."; render(); return; }
      S.error = ""; S.paying = true; render();
      var last4 = d.num.replace(/\D/g, "").slice(-4), titular = d.titular, dr = S.draft, plan = S.plan;
      setTimeout(function () {
        sync();
        DB.seq += 1 + Math.floor(Math.random() * 7);
        var nm = { id: "HR" + DB.seq, nombre: dr.nombre, correo: dr.correo, tel: dr.tel, pass: dr.pass, plan: plan, sede: SEDE, acceso: "permitido", estado: "activa", vence: addMonth(today()), last4: last4, titular: titular, extras: { dieta: false, encuesta: null, plan: null }, asist: 0, invitados: [] };
        DB.members.push(nm); DB.libro.push({ f: today(), c: "Inscripción " + PLANS[plan].n + " · " + nm.id + " (kiosko)", t: "Ingreso", m: PLANS[plan].p }); save();
        if (S.view === "plans") { S.created = nm; S.step = 4; S.paying = false; render(); window.scrollTo(0, 0); }
      }, 900);
    } else if (k === "guest") {
      if (m.invitados.length >= 5) return;
      var n = 0; DB.members.forEach(function (x) { n += x.invitados.length; });
      m.invitados.push({ id: "INV-" + String(1000 + n + Math.floor(Math.random() * 90)).slice(-4), nombre: d.nombre.trim(), estado: "sin credencial" }); save(); toast("Invitado registrado"); render();
    } else if (k === "card") {
      if (!luhnLen(d.num)) { S.error = "El número de tarjeta debe tener 16 dígitos."; render(); return; }
      if (!/^(0[1-9]|1[0-2])\/\d\d$/.test(d.vence)) { S.error = "Escribe la vigencia como MM/AA."; render(); return; }
      if (!/^\d{3,4}$/.test(d.cvv)) { S.error = "El código de seguridad tiene 3 o 4 dígitos."; render(); return; }
      m.last4 = d.num.replace(/\D/g, "").slice(-4); m.titular = d.titular; S.error = ""; save(); toast("Tu tarjeta fue actualizada"); render();
    }
  });
  ["pointerdown", "keydown", "input"].forEach(function (e) { document.addEventListener(e, bumpIdle, true); });
  setInterval(tick, 20000);
  render();
})();
