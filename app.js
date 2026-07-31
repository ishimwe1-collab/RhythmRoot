"use strict";

const STORAGE_KEY = "rhythmroot-habits-v1";
const COUNTRY_KEY = "rhythmroot-country-v1";
const state = { habits: readHabits(), holidays: [] };
const $ = (selector) => document.querySelector(selector);
const dateInput = $("#view-date");
const today = localDate();
dateInput.value = today;

function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
function readHabits() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveHabits() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.habits)); }
function isDue(habit, isoDate) {
  if (habit.frequency === "daily") return true;
  const weekday = new Date(`${isoDate}T12:00:00`).getDay();
  return weekday > 0 && weekday < 6;
}
function completed(habit, isoDate) { return habit.completedDates.includes(isoDate); }
function streak(habit, until = today) {
  let count = 0; let cursor = new Date(`${until}T12:00:00`);
  for (let guard = 0; guard < 730; guard += 1) {
    const iso = localDate(cursor);
    if (isDue(habit, iso)) { if (!completed(habit, iso)) break; count += 1; }
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
function formatDate(iso) { return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" }).format(new Date(`${iso}T12:00:00`)); }
function render() { renderHabits(); renderStats(); }
function renderHabits() {
  const list = $("#habit-list"); const empty = $("#empty-state"); const selectedDate = dateInput.value;
  const search = $("#search-input").value.trim().toLowerCase(); const filter = $("#filter-select").value; const sorting = $("#sort-select").value;
  let habits = state.habits.filter((habit) => habit.name.toLowerCase().includes(search) || habit.category.toLowerCase().includes(search));
  habits = habits.filter((habit) => filter === "all" || (filter === "completed" ? completed(habit, selectedDate) : !completed(habit, selectedDate)));
  habits.sort((a, b) => sorting === "name" ? a.name.localeCompare(b.name) : sorting === "streak" ? streak(b) - streak(a) : b.createdAt.localeCompare(a.createdAt));
  list.replaceChildren(); empty.hidden = state.habits.length > 0;
  if (!habits.length && state.habits.length) { const message = document.createElement("p"); message.className = "stat-detail"; message.textContent = "No habits match these controls."; list.append(message); return; }
  habits.forEach((habit) => {
    const item = $("#habit-template").content.cloneNode(true);
    const card = item.querySelector(".habit-card"); const done = completed(habit, selectedDate);
    card.classList.toggle("is-complete", done);
    card.querySelector(".category-pill").textContent = habit.category;
    card.querySelector(".frequency-label").textContent = habit.frequency === "daily" ? "Daily" : "Weekdays";
    card.querySelector(".habit-name").textContent = habit.name;
    const note = card.querySelector(".habit-note"); note.textContent = habit.note || "No note added yet.";
    const habitStreak = streak(habit); card.querySelector(".streak-label").textContent = habitStreak ? `✦ ${habitStreak}-day current streak` : "Start your streak today";
    const check = card.querySelector(".check-button"); check.setAttribute("aria-label", `${done ? "Mark incomplete" : "Mark complete"}: ${habit.name}`);
    check.addEventListener("click", () => toggleHabit(habit.id, selectedDate));
    card.querySelector(".delete-button").addEventListener("click", () => removeHabit(habit.id, habit.name));
    list.append(item);
  });
}
function renderStats() {
  const selectedDate = dateInput.value; const due = state.habits.filter((h) => isDue(h, selectedDate)); const done = due.filter((h) => completed(h, selectedDate));
  $("#today-date").textContent = formatDate(selectedDate); $("#today-progress").textContent = `${done.length} / ${due.length}`; $("#today-progress-bar").style.width = due.length ? `${done.length / due.length * 100}%` : "0%";
  let potential = 0; let achieved = 0; const cursor = new Date(`${today}T12:00:00`);
  for (let i = 0; i < 7; i += 1) { const iso = localDate(cursor); state.habits.forEach((h) => { if (isDue(h, iso)) { potential += 1; if (completed(h, iso)) achieved += 1; } }); cursor.setDate(cursor.getDate() - 1); }
  const rate = potential ? Math.round(achieved / potential * 100) : 0; $("#week-rate").textContent = `${rate}%`; $("#week-detail").textContent = potential ? `${achieved} of ${potential} planned check-ins` : "Add a habit to begin";
  const leader = [...state.habits].sort((a,b) => streak(b) - streak(a))[0]; const leaderStreak = leader ? streak(leader) : 0;
  $("#best-streak").textContent = `${leaderStreak} ${leaderStreak === 1 ? "day" : "days"}`; $("#best-streak-detail").textContent = leaderStreak ? `${leader.name} is leading` : "Consistency starts today";
}
function toggleHabit(id, isoDate) { const habit = state.habits.find((h) => h.id === id); if (!habit) return; const i = habit.completedDates.indexOf(isoDate); if (i === -1) habit.completedDates.push(isoDate); else habit.completedDates.splice(i, 1); saveHabits(); render(); }
function removeHabit(id, name) { if (!window.confirm(`Remove “${name}”? Your completion history will be deleted.`)) return; state.habits = state.habits.filter((h) => h.id !== id); saveHabits(); render(); }
function openModal() { $("#form-error").textContent = ""; $("#habit-form").reset(); $("#habit-modal").showModal(); $("#habit-name").focus(); }
function addHabit(event) { event.preventDefault(); const name = $("#habit-name").value.trim(); if (!name) { $("#form-error").textContent = "Please give this habit a name."; return; } state.habits.unshift({ id: crypto.randomUUID(), name, category: $("#habit-category").value, frequency: $("#habit-frequency").value, note: $("#habit-note").value.trim(), completedDates: [], createdAt: new Date().toISOString() }); saveHabits(); $("#habit-modal").close(); render(); }
async function loadHolidays() {
  const country = $("#country-select").value; localStorage.setItem(COUNTRY_KEY, country); const status = $("#api-status"); status.classList.remove("error"); status.textContent = "Fetching upcoming public holidays…"; $("#holiday-list").replaceChildren();
  try { const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${new Date().getFullYear()}/${encodeURIComponent(country)}`); if (!response.ok) throw new Error(`Service returned ${response.status}`); const holidays = await response.json(); if (!Array.isArray(holidays)) throw new Error("Unexpected response"); state.holidays = holidays.filter((h) => h.date >= today).slice(0, 3); renderHolidays(); }
  catch (error) { state.holidays = []; $("#holiday-title").textContent = "Holiday service unavailable"; $("#holiday-detail").textContent = "Your habit tracker still works normally."; status.classList.add("error"); status.textContent = `We could not load holiday dates right now (${error.message}). Please try again later.`; }
}
function renderHolidays() { const list = $("#holiday-list"); list.replaceChildren(); const next = state.holidays[0]; $("#holiday-title").textContent = next ? next.name : "No more holidays this year"; $("#holiday-detail").textContent = next ? formatDate(next.date) : "Choose a country to refresh"; $("#api-status").textContent = state.holidays.length ? `Showing the next ${state.holidays.length} public holiday${state.holidays.length === 1 ? "" : "s"}.` : "No upcoming public holidays were returned for this year."; state.holidays.forEach((holiday) => { const item = document.createElement("div"); item.className = "holiday-item"; const name = document.createElement("strong"); name.textContent = holiday.name; const date = document.createElement("span"); date.textContent = formatDate(holiday.date); item.append(name, date); list.append(item); }); }

async function loadWeather() {
  const city = $("#weather-city").value.trim() || "Kigali";
  const status = $("#weather-status");
  const result = $("#weather-result");
  status.textContent = "Checking weather suggestion…";
  result.innerHTML = "";

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error("Weather service unavailable");
    const weather = await response.json();
    result.innerHTML = `
      <strong>${weather.city}</strong>
      <p>${weather.temp} · ${weather.description}</p>
      <p>${weather.advice}</p>
    `;
    status.textContent = "Weather-based habit advice is ready.";
  } catch (error) {
    status.textContent = `Could not load weather advice (${error.message}).`;
  }
}

$("#open-habit-modal").addEventListener("click", openModal); $("#empty-add-button").addEventListener("click", openModal); $("#close-modal").addEventListener("click", () => $("#habit-modal").close()); $("#cancel-modal").addEventListener("click", () => $("#habit-modal").close()); $("#habit-form").addEventListener("submit", addHabit); ["#search-input", "#filter-select", "#sort-select", "#view-date"].forEach((id) => $(id).addEventListener("input", render)); $("#refresh-holidays").addEventListener("click", loadHolidays); $("#weather-button").addEventListener("click", loadWeather); $("#weather-city").addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); loadWeather(); } }); $("#country-select").value = localStorage.getItem(COUNTRY_KEY) || "RW"; render(); loadHolidays(); loadWeather();
