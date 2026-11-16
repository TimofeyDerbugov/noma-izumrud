/* ===== НоМа Изумруд: прайс и онлайн-запись ===== */

// Услуги и цены — примерные, на карточке салона их пока нет. Заменить на актуальные.
const SERVICES = [
  { id: "cut-w", cat: "Волосы", name: "Женская стрижка", time: "1 ч", price: 1500, from: true, role: "hair" },
  { id: "cut-m", cat: "Волосы", name: "Мужская стрижка", time: "40 мин", price: 900, from: true, role: "hair" },
  { id: "color", cat: "Волосы", name: "Окрашивание в один тон", time: "2 ч", price: 3500, from: true, role: "hair" },
  { id: "style", cat: "Волосы", name: "Укладка", time: "45 мин", price: 1200, from: true, role: "hair" },
  { id: "care", cat: "Волосы", name: "Уход для волос", time: "1 ч", price: 2500, from: false, role: "hair" },

  { id: "mani", cat: "Ногти", name: "Маникюр с покрытием", time: "1 ч 30 мин", price: 1800, from: false, role: "nails" },
  { id: "pedi", cat: "Ногти", name: "Педикюр с покрытием", time: "1 ч 45 мин", price: 2300, from: false, role: "nails" },
  { id: "mani-c", cat: "Ногти", name: "Маникюр без покрытия", time: "45 мин", price: 900, from: false, role: "nails" },

  { id: "brows", cat: "Брови и ресницы", name: "Коррекция и окрашивание бровей", time: "45 мин", price: 1000, from: false, role: "brows" },
  { id: "lam", cat: "Брови и ресницы", name: "Ламинирование ресниц", time: "1 ч", price: 1700, from: false, role: "brows" },
  { id: "lam-b", cat: "Брови и ресницы", name: "Долговременная укладка бровей", time: "1 ч", price: 1600, from: false, role: "brows" }
];

// Мастера — заглушки: подставить имена и специализации.
const MASTERS = [
  { id: "any", name: "Любой свободный", roles: ["hair", "nails", "brows"] },
  { id: "m1", name: "Мастер-стилист", roles: ["hair"] },
  { id: "m2", name: "Топ-стилист", roles: ["hair"] },
  { id: "m3", name: "Мастер маникюра", roles: ["nails"] },
  { id: "m4", name: "Бровист-лешмейкер", roles: ["brows"] }
];

const HOURS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const DAYS_AHEAD = 14;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
const priceText = (s) => (s.from ? "от " : "") + rub(s.price);

const state = { service: null, master: "any", day: null, time: null };

/* ----- Прайс ----- */

function renderPrice() {
  const cats = [...new Set(SERVICES.map((s) => s.cat))];
  $("[data-price]").innerHTML = cats
    .map(
      (cat) => `
      <div class="price__group">
        <h3 class="price__cat">${cat}</h3>
        <div class="price__rows">
        ${SERVICES.filter((s) => s.cat === cat)
          .map(
            (s) => `
          <div class="price__row">
            <span class="price__name">${s.name}</span>
            <span class="price__time">${s.time}</span>
            <span class="price__cost">${priceText(s)}</span>
          </div>`
          )
          .join("")}
        </div>
      </div>`
    )
    .join("");
}

/* ----- Шаги записи ----- */

function chip(name, value, label, checked, disabled = false, extra = "") {
  return `
    <label class="chip">
      <input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
      <span>${label}${extra}</span>
    </label>`;
}

function renderServices() {
  $("[data-services]").innerHTML = SERVICES.map((s) =>
    chip("service", s.id, s.name, state.service === s.id, false, `<small>${priceText(s)}, ${s.time}</small>`)
  ).join("");
}

function renderMasters() {
  const svc = SERVICES.find((s) => s.id === state.service);
  const list = MASTERS.filter((m) => !svc || m.roles.includes(svc.role));
  if (!list.some((m) => m.id === state.master)) state.master = "any";
  $("[data-masters]").innerHTML = list.map((m) => chip("master", m.id, m.name, state.master === m.id)).join("");
}

function dayKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function renderDays() {
  const wd = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const out = [];
  const d = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const key = dayKey(d);
    if (!state.day) state.day = key;
    const label = i === 0 ? "сегодня" : wd[d.getDay()];
    out.push(chip("day", key, `<b>${d.getDate()}</b>${label}`, state.day === key));
    d.setDate(d.getDate() + 1);
  }
  $("[data-days]").innerHTML = out.join("");
}

// Занятость — демонстрационная: стабильная псевдослучайная сетка по дате и мастеру.
function isBusy(day, hour) {
  const seed = [...(day + hour + state.master)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return seed % 4 === 0;
}

function renderTimes() {
  const now = new Date();
  const today = dayKey(now) === state.day;
  $("[data-times]").innerHTML = HOURS.map((h) => {
    const past = today && parseInt(h, 10) <= now.getHours();
    const disabled = past || isBusy(state.day, h);
    if (disabled && state.time === h) state.time = null;
    return chip("time", h, h, state.time === h, disabled);
  }).join("");
}

function renderSummary() {
  const svc = SERVICES.find((s) => s.id === state.service);
  const master = MASTERS.find((m) => m.id === state.master);

  $("[data-sum-service]").textContent = svc ? svc.name : "не выбрана";
  $("[data-sum-master]").textContent = master ? master.name.toLowerCase() : "любой свободный";
  $("[data-sum-price]").textContent = svc ? priceText(svc) : "—";

  if (state.day && state.time) {
    const d = new Date(state.day + "T00:00:00");
    const date = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
    $("[data-sum-time]").textContent = `${date}, ${state.time}`;
  } else {
    $("[data-sum-time]").textContent = "не выбрано";
  }
}

/* ----- Телефон ----- */

function formatPhone(value) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);

  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += " " + p[0];
  if (p[1]) out += " " + p[1];
  if (p[2]) out += "-" + p[2];
  if (p[3]) out += "-" + p[3];
  return out;
}

/* ----- Отправка ----- */

// Здесь подключается приём заявок (например, Telegram-бот через свой сервер или CRM салона).
async function sendBooking(data) {
  console.log("Новая запись:", data);
  return new Promise((resolve) => setTimeout(resolve, 500));
}

async function submit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const error = $("[data-error]");
  $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));

  if (!state.service) {
    error.textContent = "Выберите услугу в первом шаге.";
    return;
  }
  if (!state.time) {
    error.textContent = "Выберите свободное время в третьем шаге.";
    return;
  }

  const bad = [];
  if (!form.name.value.trim()) bad.push(form.name);
  if (form.phone.value.replace(/\D/g, "").length !== 11) bad.push(form.phone);
  if (bad.length) {
    bad.forEach((f) => f.classList.add("is-invalid"));
    error.textContent = "Укажите имя и телефон — нужно 10 цифр после +7.";
    bad[0].focus();
    return;
  }
  if (!form.agree.checked) {
    form.agree.closest(".check").classList.add("is-invalid");
    error.textContent = "Отметьте согласие на обработку данных.";
    return;
  }

  error.textContent = "";
  const btn = $("[data-submit]");
  btn.disabled = true;
  btn.textContent = "Отправляем…";

  const summary = {
    service: $("[data-sum-service]").textContent,
    master: $("[data-sum-master]").textContent,
    when: $("[data-sum-time]").textContent,
    price: $("[data-sum-price]").textContent,
    name: form.name.value.trim(),
    phone: form.phone.value,
    comment: form.comment.value.trim()
  };
  await sendBooking(summary);

  btn.disabled = false;
  btn.textContent = "Записаться";
  form.hidden = true;
  $("[data-done-text]").textContent =
    `${summary.service}, ${summary.when}. Администратор перезвонит на ${summary.phone}, чтобы подтвердить запись.`;
  $("[data-done]").hidden = false;
  $("#booking").scrollIntoView();
}

function again() {
  const form = $("[data-booking]");
  form.reset();
  Object.assign(state, { service: null, master: "any", time: null });
  renderAll();
  form.hidden = false;
  $("[data-done]").hidden = true;
}

/* ----- События ----- */

function renderAll() {
  renderServices();
  renderMasters();
  renderDays();
  renderTimes();
  renderSummary();
}

$("[data-booking]").addEventListener("change", (e) => {
  const { name, value } = e.target;
  if (name === "service") {
    state.service = value;
    renderMasters();
    renderTimes();
  }
  if (name === "master") {
    state.master = value;
    renderTimes();
  }
  if (name === "day") {
    state.day = value;
    state.time = null;
    renderTimes();
  }
  if (name === "time") state.time = value;
  if (name === "agree") e.target.closest(".check").classList.remove("is-invalid");
  renderSummary();
});

$("[data-phone]").addEventListener("input", (e) => {
  e.target.value = formatPhone(e.target.value);
});

$("[data-booking]").addEventListener("submit", submit);
$("[data-again]").addEventListener("click", again);

renderPrice();
renderAll();
