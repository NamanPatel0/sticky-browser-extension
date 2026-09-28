// Reusable static parser to avoid DOM allocation thrashing
const previewParser = document.createElement("div");

function extractPreview(html) {
  if (!html || !html.trim()) return "Empty session";

  previewParser.innerHTML = html;
  previewParser.querySelectorAll("img").forEach((img) => {
    img.replaceWith(document.createTextNode("<image> "));
  });

  const text = previewParser.textContent.replace(/\s+/g, " ").trim();
  return text ? (text.length > 120 ? `${text.substring(0, 120)}...` : text) : "<image>";
}

async function loadSessions() {
  const { currentSession, sessions = [] } = await chrome.storage.local.get([
    "currentSession",
    "sessions"
  ]);

  const currentContainer = document.getElementById("current-session");
  const sessionsContainer = document.getElementById("sessions");

  // Render Current Session
  currentContainer.innerHTML = "";
  if (currentSession) {
    currentContainer.appendChild(createSessionCard(currentSession, true));
  } else {
    currentContainer.innerHTML = `<div class="empty-state">No active session</div>`;
  }

  // Render Previous Sessions
  sessionsContainer.innerHTML = "";
  if (sessions.length === 0) {
    sessionsContainer.innerHTML = `<div class="empty-state">No previous sessions saved yet.</div>`;
    return;
  }

  // Sort starred sessions first
  const sorted = [...sessions].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  sorted.forEach((session) => {
    sessionsContainer.appendChild(createSessionCard(session, false));
  });
}

function createSessionCard(session, isCurrent) {
  const card = document.createElement("div");
  card.className = `session-card${isCurrent ? " current" : ""}`;

  const name = document.createElement("div");
  name.className = "session-name";
  name.textContent = session.name || "Untitled";

  const preview = document.createElement("div");
  preview.className = "session-preview";
  preview.textContent = extractPreview(session.text);

  card.appendChild(name);
  card.appendChild(preview);

  // Switch to this session
  card.addEventListener("click", async () => {
    if (isCurrent) return; // Already active

    const { currentSession: oldCurrent, sessions = [] } = await chrome.storage.local.get([
      "currentSession",
      "sessions"
    ]);

    const remaining = sessions.filter((s) => String(s.id) !== String(session.id));

    // Archive old current session if it has content
    if (oldCurrent && (oldCurrent.name?.trim() || oldCurrent.text?.trim())) {
      remaining.push(oldCurrent);
    }

    await chrome.storage.local.set({
      currentSession: session,
      sessions: remaining,
      isOpen: true
    });

    loadSessions();
  });

  return card;
}

// Create New Session Button
document.getElementById("new-session").addEventListener("click", async () => {
  const { currentSession: oldCurrent, sessions = [] } = await chrome.storage.local.get([
    "currentSession",
    "sessions"
  ]);

  const updatedSessions = [...sessions];

  // Archive old session if not empty
  if (oldCurrent && (oldCurrent.name?.trim() || oldCurrent.text?.trim())) {
    updatedSessions.push(oldCurrent);
  }

  const newSession = {
    id: Date.now().toString(),
    name: "Untitled",
    text: "",
    image: ""
  };

  await chrome.storage.local.set({
    currentSession: newSession,
    sessions: updatedSessions,
    isOpen: true
  });

  loadSessions();
});

// Initial load
loadSessions();