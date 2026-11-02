/* global L */

"use strict";

const CONTACT_EMAIL = "anchortowerspreschool@gmail.com"; 
const MAP_CENTRE = [-25.7479, 28.2293];
const MAP_ZOOM = 11;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuButton = $(".menu-toggle");
const navigation = $("#site-nav");
if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.textContent = isOpen ? "Close" : "Menu";
  });
}

$$("[data-year]").forEach((item) => { item.textContent = new Date().getFullYear(); });

(function revealOnScroll() {
  const items = $$(".reveal");
  if (!items.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  document.documentElement.classList.add("js-reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => observer.observe(el));
})();

$$(".accordion-trigger").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
  });
});

const SERVICES = [
  { name: "Morning school pick-up", category: "daily", text: "Collected from your area and delivered to school before the first bell." },
  { name: "Afternoon school drop-off", category: "daily", text: "Safe, punctual return trips from school to your collection area." },
  { name: "Return-trip routes", category: "daily", text: "Combined morning and afternoon trips arranged on one route." },
  { name: "School event transport", category: "private", text: "Transport for sports days, outings and other school-related activities." },
  { name: "Private group booking", category: "private", text: "One-off bookings arranged to suit your date, destination and group size." },
  { name: "Route availability check", category: "support", text: "Tell us your area and school and we confirm whether a route works." },
  { name: "Personalised quote", category: "support", text: "Clear pricing based on your route, school and schedule." }
];
const CATEGORY_LABELS = { daily: "Daily transport", private: "Private bookings", support: "Planning & support" };

(function serviceFinder() {
  const list = $("#service-list");
  if (!list) return;
  const search = $("#service-search");
  const filter = $("#service-filter");
  const sort = $("#service-sort");
  const count = $("#service-count");

  function render() {
    const term = search.value.trim().toLowerCase();
    let results = SERVICES.filter((s) =>
      (filter.value === "all" || s.category === filter.value) &&
      (`${s.name} ${s.text} ${CATEGORY_LABELS[s.category]}`.toLowerCase().includes(term)));

    results.sort((a, b) => {
      if (sort.value === "name-desc") return b.name.localeCompare(a.name);
      if (sort.value === "category") return CATEGORY_LABELS[a.category].localeCompare(CATEGORY_LABELS[b.category]) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

    list.textContent = "";
    results.forEach((s) => {
      const card = document.createElement("article");
      card.className = "card";
      const tag = document.createElement("p");
      tag.className = "eyebrow";
      tag.textContent = CATEGORY_LABELS[s.category];
      const title = document.createElement("h3");
      title.textContent = s.name;
      const text = document.createElement("p");
      text.textContent = s.text;
      card.append(tag, title, text);
      list.appendChild(card);
    });

    if (!results.length) {
      const empty = document.createElement("p");
      empty.textContent = "No services match your search. Try a different word or send us an enquiry.";
      list.appendChild(empty);
    }
    count.textContent = `${results.length} of ${SERVICES.length} services shown`;
  }

  [search, filter, sort].forEach((el) => el.addEventListener("input", render));
  render();
})();

(function lightbox() {
  const box = $("#lightbox");
  const items = $$(".gallery-item");
  if (!box || !items.length) return;
  const img = $("#lightbox-img");
  const caption = $("#lightbox-caption");
  let current = 0;
  let lastFocus = null;

  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    img.src = item.dataset.full;
    img.alt = item.dataset.alt;
    caption.textContent = item.dataset.caption;
  }
  function open(index) {
    lastFocus = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.classList.add("no-scroll");
    $(".lightbox-close", box).focus();
  }
  function close() {
    box.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  items.forEach((item, i) => item.addEventListener("click", () => open(i)));
  $(".lightbox-close", box).addEventListener("click", close);
  $(".lightbox-prev", box).addEventListener("click", () => show(current - 1));
  $(".lightbox-next", box).addEventListener("click", () => show(current + 1));
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "Tab") {            // keep keyboard focus inside the dialog
      const focusable = $$("button", box);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

window.addEventListener("load", () => {
  const mapEl = $("#map");
  if (!mapEl || typeof L === "undefined") return;
  const map = L.map(mapEl, { scrollWheelZoom: false }).setView(MAP_CENTRE, MAP_ZOOM);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  L.circle(MAP_CENTRE, { radius: 9000, color: "#102b52", fillColor: "#f4bd19", fillOpacity: 0.2 }).addTo(map);
  L.marker(MAP_CENTRE).addTo(map).bindPopup("<strong>Lagoqoza School Transport</strong><br>Local school routes around Pretoria");
});

const PHONE_PATTERN = /^(?:\+27|0)[1-9]\d{8}$/;                 
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' .-]{1,59}$/;

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  if (error) error.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  if (message) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
  return !message;
}

function checkField(input) {
  const value = input.value.trim();
  const id = input.id.replace(/^c-/, "");
  if (input.required && !value) return setError(input, "This field is required.");
  if (!value) return setError(input, "");

  if (id === "name" && !NAME_PATTERN.test(value)) return setError(input, "Enter a valid name (2–60 letters; no numbers).");
  if (id === "phone") {
    const digits = value.replace(/[\s()-]/g, "");
    if (!PHONE_PATTERN.test(digits)) return setError(input, "Enter a valid South African number, e.g. 082 123 4567 or +27 82 123 4567.");
  }
  if (id === "email" && !EMAIL_PATTERN.test(value)) return setError(input, "Enter a valid email address, e.g. name@example.com.");
  if ((id === "school" || id === "area") && value.length < 2) return setError(input, "Please enter at least 2 characters.");
  if (id === "startdate") {
    const chosen = new Date(`${value}T00:00:00`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime())) return setError(input, "Enter a valid date.");
    if (chosen < today) return setError(input, "The start date cannot be in the past.");
  }
  if (id === "message" && input.minLength > 0 && value.length < input.minLength) return setError(input, `Please write at least ${input.minLength} characters.`);
  if (value.length > input.maxLength && input.maxLength > 0) return setError(input, `Please keep this under ${input.maxLength} characters.`);
  return setError(input, "");
}

function validateForm(form) {
  let firstInvalid = null;
  $$("input[id], select[id], textarea[id]", form).forEach((input) => {
    if (input.type === "checkbox") return;
    if (!checkField(input) && !firstInvalid) firstInvalid = input;
  });
  return firstInvalid;
}

function liveValidation(form) {
  $$("input[id], select[id], textarea[id]", form).forEach((input) => {
    if (input.type === "checkbox") return;
    input.addEventListener("blur", () => checkField(input));
    input.addEventListener("input", () => { if (input.classList.contains("invalid")) checkField(input); });
  });
  $$("textarea[maxlength]", form).forEach((area) => {
    const counter = document.getElementById(`${area.id}-count`);
    if (counter) area.addEventListener("input", () => { counter.textContent = area.value.length; });
  });
}

const enquiryForm = $("#enquiry-form");
if (enquiryForm) {
  const formMessage = $("#form-message");
  const submitButton = $("#enquiry-submit");
  const responseBox = $("#enquiry-response");
  liveValidation(enquiryForm);

  const dateInput = $("#startdate");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  function buildResponse(data, reference) {
    const typeText = {
      daily: "daily school transport",
      private: "a private booking",
      general: "your question"
    }[data.type];
    const times = [data.morning && "morning pick-up", data.afternoon && "afternoon drop-off", data.privateBooking && "a private booking"].filter(Boolean);
    const lines = [];
    lines.push(`Thank you, ${data.name.split(" ")[0]}. We have received your enquiry about ${typeText} (reference ${reference}).`);

    if (data.type === "daily") {
      lines.push(`Availability: we will check whether a route runs from ${data.area} to ${data.school}${times.length ? ` for ${times.join(" and ")}` : ""}${data.startdate ? `, starting ${data.startdate}` : ""}. Places on each route are limited, so we confirm availability before quoting.`);
      lines.push("Cost: your quote depends on the distance, the number of trips each day and the length of the booking. A personalised quote follows once availability is confirmed.");
    } else if (data.type === "private") {
      lines.push(`Availability: we will check our vehicles and drivers for your trip to ${data.school}${data.startdate ? ` on ${data.startdate}` : ""}.`);
      lines.push("Cost: private bookings are priced by distance, waiting time and group size. We will send a quote with clear next steps.");
    } else {
      lines.push("We will read your message and reply with the information you need.");
    }
    lines.push(`We will contact you on ${data.phone}${data.email ? ` or ${data.email}` : ""} soon.`);
    return lines;
  }

  async function sendEnquiry(formData) {
    const url = enquiryForm.getAttribute("action");
    if (!url || url.includes("YOUR_FORM_ID")) {       
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { ok: true };
    }
    return fetch(url, { method: "POST", body: formData, headers: { Accept: "application/json" } });
  }

  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formMessage.textContent = "";
    formMessage.className = "form-message";
    responseBox.hidden = true;

    const firstInvalid = validateForm(enquiryForm);
    const timingError = $("#timing-error");
    const typeValue = $("#type").value;
    const anyTime = $$("#timing-fieldset input[type=checkbox]").some((c) => c.checked);
    timingError.textContent = (typeValue === "daily" || typeValue === "private") && !anyTime
      ? "Please tick at least one option so we can plan your transport." : "";

    if (firstInvalid || timingError.textContent) {
      formMessage.textContent = "Please correct the highlighted fields and try again.";
      formMessage.classList.add("is-error");
      (firstInvalid || $("#timing-fieldset input")).focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    try {
      const formData = new FormData(enquiryForm);
      const response = await sendEnquiry(formData);
      if (!response.ok) throw new Error("Server error");

      const data = Object.fromEntries(formData.entries());
      data.morning = formData.has("morning");
      data.afternoon = formData.has("afternoon");
      data.privateBooking = formData.has("privateBooking");
      const reference = `LST-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      responseBox.textContent = "";
      const heading = document.createElement("h3");
      heading.textContent = "Enquiry received";
      responseBox.appendChild(heading);
      buildResponse(data, reference).forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        responseBox.appendChild(p);
      });
      responseBox.hidden = false;
      formMessage.textContent = "Your enquiry was sent successfully.";
      formMessage.classList.add("is-success");
      enquiryForm.reset();
      $("#message-count").textContent = "0";
      responseBox.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    } catch (err) {
      formMessage.textContent = "Sorry, your enquiry could not be sent. Please check your connection and try again.";
      formMessage.classList.add("is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send enquiry";
    }
  });
}

const contactForm = $("#contact-form");
if (contactForm) {
  liveValidation(contactForm);
  const status = $("#contact-status");
  const preview = $("#email-preview");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    status.className = "form-message";
    preview.hidden = true;

    const firstInvalid = validateForm(contactForm);
    if (firstInvalid) {
      status.textContent = "Please correct the highlighted fields and try again.";
      status.classList.add("is-error");
      firstInvalid.focus();
      return;
    }

    const name = $("#c-name").value.trim();
    const email = $("#c-email").value.trim();
    const phone = $("#c-phone").value.trim();
    const topic = $("#c-topic").value;
    const message = $("#c-message").value.trim();

    const subject = `${topic} from ${name}`;
    const body = [`Name: ${name}`, `Email: ${email}`, phone ? `Phone: ${phone}` : null, `Message type: ${topic}`, "", message]
      .filter((line) => line !== null).join("\n");

    $("#preview-to").textContent = CONTACT_EMAIL;
    $("#preview-subject").textContent = subject;
    $("#preview-body").textContent = body;
    $("#send-email").href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    preview.hidden = false;
    status.textContent = "Your message is valid and your email is ready to send.";
    status.classList.add("is-success");
    preview.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
  });
}