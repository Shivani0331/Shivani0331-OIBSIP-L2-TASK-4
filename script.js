/* ========= Helpers ========= */

// Toast notifications
function notify(message, type = "info") {
  const note = document.getElementById("notification");
  if (!note) return;
  note.textContent = message;
  note.style.background = type === "error" ? "crimson" : "seagreen";
  note.style.display = "block";
  setTimeout(() => { note.style.display = "none"; }, 2500);
}

// Toggle password visibility
function togglePassword(id, el) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
  if (el) el.textContent = input.type === "password" ? "👁" : "🙈";
}

// Password strength live check (register page only)
const regPasswordEl = document.getElementById("regPassword");
if (regPasswordEl) {
  regPasswordEl.addEventListener("input", () => {
    const s = document.getElementById("strength");
    const val = regPasswordEl.value;
    if (!s) return;
    if (val.length < 4) {
      s.textContent = "Password strength: Weak";
      s.className = "strength weak";
    } else if (/[A-Z]/.test(val) && /\d/.test(val) && val.length >= 6) {
      s.textContent = "Password strength: Strong";
      s.className = "strength strong";
    } else {
      s.textContent = "Password strength: Medium";
      s.className = "strength medium";
    }
  });
}

// Avatar preview on register
const regAvatarInput = document.getElementById("regAvatar");
if (regAvatarInput) {
  regAvatarInput.addEventListener("change", () => {
    const file = regAvatarInput.files?.[0];
    const preview = document.getElementById("avatarPreview");
    if (!preview) return;
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  });
}

/* ========= Theme Toggle ========= */
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
  }
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}

/* ========= Particle Background ========= */
const canvas = document.getElementById("bg");
if (canvas) {
  const ctx = canvas.getContext("2d");
  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  addEventListener("resize", resize);

  const particles = Array.from({ length: 60 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 3 + 1,
    dx: (Math.random() - 0.5) * 1.2,
    dy: (Math.random() - 0.5) * 1.2,
  }));

  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  })();
}

/* ========= Auth (single-user demo, pure JS) ========= */

// Save user to localStorage
function saveUser({ username, password, avatarDataUrl }) {
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
  if (avatarDataUrl) localStorage.setItem("avatar", avatarDataUrl);
}

// Load user (single)
function loadUser() {
  return {
    username: localStorage.getItem("username"),
    password: localStorage.getItem("password"),
    avatar: localStorage.getItem("avatar") || null,
  };
}

// Register (with optional avatar)
function register() {
  const username = document.getElementById("regUsername")?.value?.trim();
  const password = document.getElementById("regPassword")?.value?.trim();
  const file = document.getElementById("regAvatar")?.files?.[0];

  if (!username || !password) {
    notify("Please fill all fields!", "error");
    return;
  }
  if (password.length < 6) {
    notify("Password must be at least 6 characters.", "error");
    return;
  }

  // Read avatar (if provided) then save
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      saveUser({ username, password, avatarDataUrl: e.target.result });
      notify("Registration successful! Please login.", "success");
      setTimeout(() => (window.location.href = "login.html"), 1200);
    };
    reader.readAsDataURL(file);
  } else {
    saveUser({ username, password, avatarDataUrl: null });
    notify("Registration successful! Please login.", "success");
    setTimeout(() => (window.location.href = "login.html"), 1200);
  }
}

// Login
function login() {
  const username = document.getElementById("loginUsername")?.value?.trim();
  const password = document.getElementById("loginPassword")?.value?.trim();

  const stored = loadUser();
  if (username === stored.username && password === stored.password) {
    // Save current session user (so we can show avatar easily)
    const currentUser = { username: stored.username, avatar: stored.avatar };
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    notify("Login successful!", "success");
    setTimeout(() => (window.location.href = "secured.html"), 1200);
  } else {
    notify("Invalid username or password!", "error");
  }
}

// Logout
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  notify("Logged out!", "success");
  setTimeout(() => (window.location.href = "login.html"), 1000);
}

// Secured page guard + avatar render
if (window.location.pathname.includes("secured.html")) {
  const logged = localStorage.getItem("isLoggedIn") === "true";
  if (!logged) {
    notify("You must login first!", "error");
    setTimeout(() => (window.location.href = "login.html"), 1000);
  } else {
    const current = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const welcome = document.getElementById("welcomeMsg");
    const img = document.getElementById("avatarImg");
    const circle = document.getElementById("avatarCircle");

    const name = current?.username || "User";
    welcome.textContent = `Hello, ${name}! 🎉`;

    if (current?.avatar) {
      img.src = current.avatar;
      img.style.display = "block";
      circle.style.display = "none";
    } else {
      // Fallback: show initial in a colored circle
      const initial = name.charAt(0).toUpperCase();
      circle.textContent = initial;
      circle.style.display = "grid";
      img.style.display = "none";
    }
  }
}




