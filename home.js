const homePreviewPool = document.createElement("div");

async function loadSessions() {
    try {
        const data = await chrome.storage.local.get(["currentSession", "sessions"]);
        const current = data.currentSession;
        const sessions = data.sessions || [];

        const currentContainer = document.getElementById("current-session");
        const sessionsContainer = document.getElementById("sessions");

        currentContainer.innerHTML = "";
        if (current) {
            currentContainer.appendChild(createSessionCard(current, true));
        }

        sessionsContainer.innerHTML = "";
        if (sessions.length === 0) {
            sessionsContainer.textContent = "No previous sessions.";
            return;
        }

        const fragment = document.createDocumentFragment();
        sessions.forEach(session => {
            fragment.appendChild(createSessionCard(session, false));
        });
        sessionsContainer.appendChild(fragment);
    } catch (err) {
        console.error("Failed to load sessions:", err);
    }
}

function extractTextPreview(html) {
    if (!html || !html.trim()) return "Empty session";
    const preprocessed = html.replace(/<img[^>]*>/gi, " <image> ");
    homePreviewPool.innerHTML = preprocessed;
    const text = (homePreviewPool.textContent || "").replace(/\s+/g, " ").trim();
    homePreviewPool.textContent = "";
    return text ? (text.length > 100 ? text.substring(0, 100) + "..." : text) : "<image>";
}

function createSessionCard(session, isCurrent) {
    const card = document.createElement("div");
    card.className = "session-card" + (isCurrent ? " current" : "");

    const name = document.createElement("div");
    name.className = "session-name";
    name.textContent = session.name || "Untitled";

    const preview = document.createElement("div");
    preview.className = "session-preview";
    preview.textContent = extractTextPreview(session.text);

    card.appendChild(name);
    card.appendChild(preview);

    card.addEventListener("click", async () => {
        try {
            const data = await chrome.storage.local.get(["currentSession", "sessions"]);
            const oldCurrent = data.currentSession;
            const existingSessions = data.sessions || [];

            const remaining = existingSessions.filter(s => String(s.id) !== String(session.id));
            if (oldCurrent && (oldCurrent.name.trim() || oldCurrent.text.trim())) {
                remaining.push(oldCurrent);
            }

            await chrome.storage.local.set({
                currentSession: session,
                sessions: remaining,
                isOpen: true
            });
            loadSessions();
        } catch (err) {
            console.error("Failed to switch session:", err);
        }
    });

    return card;
}

document.getElementById("new-session").addEventListener("click", async () => {
    try {
        const data = await chrome.storage.local.get(["currentSession", "sessions"]);
        const current = data.currentSession;
        const sessions = data.sessions || [];

        if (current && (current.name.trim() || current.text.trim())) {
            sessions.push(current);
        }

        const newSession = {
            id: Date.now().toString(),
            name: "Untitled",
            text: ""
        };

        await chrome.storage.local.set({
            currentSession: newSession,
            sessions,
            isOpen: true
        });
        loadSessions();
    } catch (err) {
        console.error("Failed to create new session:", err);
    }
});

loadSessions();