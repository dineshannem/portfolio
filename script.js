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
  // ensure attribute value is a string 'true'/'false'
  sidebar.setAttribute("aria-hidden", String(!opened));
  // hide the corner (hamburger) button while sidebar is open so the three lines become invisible
  if (cornerBtn) cornerBtn.classList.toggle("hidden", opened);
}
window.toggleSidebar = toggleSidebar;

// Defensive: attach handlers to any `.close-sidebar` buttons so the X reliably closes
// the sidebar even if an inline handler is missed or JS is evaluated in a different order.
document.querySelectorAll(".close-sidebar").forEach((btn) => {
  // ensure it's a real button and not in a form submit context
  btn.type = btn.type || "button";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    // ensure sidebar is closed
    if (sidebar && sidebar.classList.contains("open")) {
      toggleSidebar();
    } else {
      // if for some reason sidebar isn't marked open, still ensure aria-hidden correct
      sidebar && sidebar.setAttribute("aria-hidden", "true");
      cornerBtn && cornerBtn.classList.remove("hidden");
    }
  });
});

// Close sidebar with Escape key for better UX
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    if (sidebar && sidebar.classList.contains("open")) {
      toggleSidebar();
    }
  }
});

// Close when clicking outside (but ignore clicks on the corner button)
document.addEventListener("click", (e) => {
  if (!sidebar.classList.contains("open")) return;
  const clickInside =
    sidebar.contains(e.target) || cornerBtn.contains(e.target);
  if (!clickInside) {
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    // restore corner button visibility when sidebar closes
    if (cornerBtn) cornerBtn.classList.remove("hidden");
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
        // If this is the typing element, start typing only after it is revealed
        if (entry.target === typingEl) {
          // guard to ensure typing starts only once
          if (!window._typingStarted) {
            window._typingStarted = true;
            // small delay so the reveal transition finishes before typing modifies content
            setTimeout(typeLoop, 400);
          }
        }
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((node) => io.observe(node));

/* ---------------- Typing effect ---------------- */
const typingEl = document.querySelector(".typing");
const roles = ["Full Stack Developer", "Problem Solver", "Quick Learner"];
let ridx = 0,
  cidx = 0,
  ttimeout;

// measure the longest role and set exact min-width (px) on the typing element
function setTypingMinWidth() {
  if (!typingEl || !roles || !roles.length) return;
  // create a hidden span that inherits the typing element's font
  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.whiteSpace = "nowrap";
  // copy computed font styles from typingEl
  const cs = window.getComputedStyle(typingEl);
  span.style.font = cs.font;
  span.style.fontSize = cs.fontSize;
  span.style.fontWeight = cs.fontWeight;
  document.body.appendChild(span);

  let maxW = 0;
  let maxH = 0;
  roles.forEach((r) => {
    span.textContent = r;
    const w = span.getBoundingClientRect().width;
    const h = span.getBoundingClientRect().height;
    if (w > maxW) maxW = w;
    if (h > maxH) maxH = h;
  });

  document.body.removeChild(span);
  // add a small padding buffer (14px) for safe headroom
  const minPx = Math.ceil(maxW + 14) + "px";
  // set CSS variable so min-width is applied via stylesheet before reveal
  try {
    document.documentElement.style.setProperty("--typing-min", minPx);
    // set a min-height (px) so the typing area occupies vertical space even when empty
    const minHpx = Math.ceil(maxH + 6) + "px"; // small buffer for line-height differences
    document.documentElement.style.setProperty("--typing-min-height", minHpx);
  } catch (err) {
    // fallback to inline style if CSS variable cannot be set
    typingEl.style.minWidth = minPx;
    // fallback for minHeight too
    typingEl.style.minHeight = Math.ceil(maxH + 6) + "px";
  }
}

// set min-width as early as possible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setTypingMinWidth);
} else {
  setTypingMinWidth();
}

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
// typing now starts when the typing element is revealed by the observer (see above)

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

// if the sidebar is pre-open (unlikely) ensure corner button hidden state syncs
if (sidebar && cornerBtn) {
  const opened = sidebar.classList.contains("open");
  cornerBtn.classList.toggle("hidden", opened);
}
