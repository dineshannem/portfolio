/* ---------------- Elements ---------------- */
const sidebar = document.getElementById("sidebar");
const cornerBtn = document.getElementById("cornerBtn");
const themeBtn = document.getElementById("themeToggle");
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const yearEl = document.getElementById("year");

/* ---------------- Sidebar open/close + outside click ---------------- */
function toggleSidebar() {
  const opened = sidebar.classList.toggle("open");
  sidebar.setAttribute("aria-hidden", !opened);
}
window.toggleSidebar = toggleSidebar;

// Close when clicking outside (but ignore clicks on the corner button)
document.addEventListener("click", (e) => {
  if (!sidebar.classList.contains("open")) return;
  const clickInside =
    sidebar.contains(e.target) || cornerBtn.contains(e.target);
  if (!clickInside) {
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
  }
});

/* ---------------- Theme toggle with persistence ---------------- */
const root = document.documentElement;
function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeBtn) themeBtn.textContent = theme === "dark" ? "🌙" : "☀️";
  localStorage.setItem("site-theme", theme);
}
themeBtn &&
  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
// load saved theme
const saved = localStorage.getItem("site-theme");
if (saved) setTheme(saved);

/* ---------------- Reveal-on-scroll (IntersectionObserver) ---------------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((node) => io.observe(node));

/* ---------------- Typing effect ---------------- */
const typingEl = document.querySelector(".typing");
const roles = ["Full Stack Developer", "Problem Solver", "Quick Learner"];
let ridx = 0,
  cidx = 0,
  ttimeout;

function typeLoop() {
  if (!typingEl) return;
  const word = roles[ridx];
  if (cidx < word.length) {
    typingEl.textContent += word[cidx++];
    ttimeout = setTimeout(typeLoop, 90);
  } else {
    setTimeout(eraseLoop, 1100);
  }
}
function eraseLoop() {
  if (!typingEl) return;
  if (cidx > 0) {
    typingEl.textContent = typingEl.textContent.slice(0, -1);
    cidx--;
    setTimeout(eraseLoop, 45);
  } else {
    ridx = (ridx + 1) % roles.length;
    setTimeout(typeLoop, 300);
  }
}
document.addEventListener("DOMContentLoaded", () => setTimeout(typeLoop, 400));

/* ---------------- Project Read More toggles ---------------- */
document.querySelectorAll(".project-card").forEach((card) => {
  const btn = card.querySelector(".read-more");
  const more = card.querySelector(".more");
  if (!btn || !more) return;
  btn.addEventListener("click", () => {
    const open = more.getAttribute("data-open") === "true";
    more.setAttribute("data-open", open ? "false" : "true");
    btn.textContent = open ? "Read more" : "Read less";
  });
});

/* ---------------- Contact form (Formspree) ---------------- */
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!statusEl) return;
    statusEl.textContent = "";
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn && submitBtn.classList.add("loading");

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        statusEl.textContent =
          "✅  Thank you --Message sent — dinesh will respond very shortly .";
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        statusEl.textContent =
          json?.errors?.map((x) => x.message).join(", ") ||
          "⚠️ Submission failed. Try again.";
      }
    } catch (err) {
      statusEl.textContent = "⚠️ Network error. Try again.";
    } finally {
      submitBtn && submitBtn.classList.remove("loading");
    }
  });
}

/* ---------------- Footer year ---------------- */
if (yearEl) yearEl.textContent = new Date().getFullYear();
