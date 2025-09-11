/* ---------------- Elements ---------------- */
const sidebar = document.getElementById("sidebar");
const cornerBtn = document.getElementById("cornerBtn");
const themeBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const heroAvatar = document.getElementById("heroAvatar");
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const yearEl = document.getElementById("year");

/* ---------------- Sidebar open/close + outside click + accessibility ---------------- */
function toggleSidebar() {
  const opened = sidebar.classList.toggle("open");
  sidebar.setAttribute("aria-hidden", String(!opened));
  cornerBtn.setAttribute("aria-expanded", String(opened));

  if (opened) {
    // focus first interactive element in sidebar
    const focusable = sidebar.querySelector(
      'a, button, input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable && focusable.focus();
  } else {
    cornerBtn.focus();
  }
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
    cornerBtn.setAttribute("aria-expanded", "false");
  }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("open")) toggleSidebar();
});

/* ---------------- Theme toggle with persistence & image switching ---------------- */
const root = document.documentElement;

function updateThemeImages(theme) {
  // hero/profile images that have data-dark-src / data-light-src
  document.querySelectorAll("[data-dark-src]").forEach((img) => {
    const src = img.getAttribute(`data-${theme}-src`);
    if (src) img.src = src;
  });
  // theme icon showing the current theme image
  if (themeIcon) {
    themeIcon.src = theme === "dark" ? "dark.jpg" : "light.jpg";
    themeIcon.alt = theme === "dark" ? "dark theme" : "light theme";
  }
}

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem("site-theme", theme);
  updateThemeImages(theme);
}

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
  });
}

// load saved theme (default dark)
const saved = localStorage.getItem("site-theme");
if (saved) setTheme(saved);
else setTheme("dark");

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

/* ---------------- Project Read More toggles (improved, accessible) ---------------- */
document.querySelectorAll(".project-card").forEach((card) => {
  const btn = card.querySelector(".read-more");
  const more = card.querySelector(".more");
  if (!btn || !more) return;

  // Ensure there is a data-open attribute
  if (!more.hasAttribute("data-open")) more.setAttribute("data-open", "false");

  // Accessibility
  btn.setAttribute("aria-expanded", "false");

  btn.addEventListener("click", () => {
    const open = more.getAttribute("data-open") === "true";
    more.setAttribute("data-open", open ? "false" : "true");
    btn.textContent = open ? "Read more" : "Read less";
    btn.setAttribute("aria-expanded", String(!open));
  });
});

/* ---------------- Contact form (Formspree) ---------------- */
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!statusEl) return;
    statusEl.classList.remove("error");
    statusEl.textContent = "";
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn && submitBtn.classList.add("loading");
    submitBtn && (submitBtn.disabled = true);

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        statusEl.textContent =
          " Thank you — message sent. Dinesh will respond shortly as soon as possible .";
        form.reset();
      } else {
        const json = await res.json().catch(() => ({}));
        const errMsg =
          json?.errors?.map((x) => x.message).join(", ") ||
          "⚠️ Submission failed. Try again.";
        statusEl.textContent = errMsg;
        statusEl.classList.add("error");
      }
    } catch (err) {
      statusEl.textContent = "⚠️ Network error. Try again.";
      statusEl.classList.add("error");
    } finally {
      submitBtn && submitBtn.classList.remove("loading");
      submitBtn && (submitBtn.disabled = false);
    }
  });
}

/* ---------------- Footer year ---------------- */
if (yearEl) yearEl.textContent = new Date().getFullYear();
