(() => {
    // 1. Guard against duplicate injection
    if (document.getElementById("sticky-box")) {
        return;
    }

    const box = document.createElement("div");
    box.id = "sticky-box";

    box.innerHTML = `
        <div id="sticky-top">
            <button id="home-button" title="Sessions">
                <svg viewBox="0 0 24 24">
                    <path d="M7 17L17 7"></path>
                    <path d="M9 7H17V15"></path>
                    <circle cx="6" cy="18" r="2"></circle>
                </svg>
            </button>
            <div id="drag-handle"></div>
            <button id="menu-button" title="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>

        <div id="note-view">
            <input
                id="sticky-title"
                type="text"
                value="Untitled"
                placeholder="Untitled"
                autocomplete="off"
                spellcheck="false"
            >
            <div
                id="sticky-content"
                contenteditable="true"
                data-placeholder="Paste something..."
            ></div>
        </div>

        <div id="home-view">
            <div class="home-header">
                <div>
                    <div class="home-label">STICKY</div>
                    <div class="home-title">Sessions</div>
                </div>
                <button id="home-close">×</button>
            </div>
            <div id="session-list"></div>
            <button id="home-new-session">
                <span>+</span>
                <span>New session</span>
            </button>
        </div>

        <div id="settings-view">
            <div class="settings-header">
                <div>
                    <div class="settings-label">PREFERENCES</div>
                    <div class="settings-title">Settings</div>
                </div>
                <button id="settings-close">×</button>
            </div>
            <div class="settings-section">
                <div class="section-label">COLOR THEME</div>
                <div class="theme-list">
                    <button class="theme-option" data-theme="clay">
                        <div class="theme-preview clay-preview"><span></span><span></span><span></span></div>
                        <span>Clay</span>
                    </button>
                    <button class="theme-option" data-theme="monochrome">
                        <div class="theme-preview mono-preview"><span></span><span></span><span></span></div>
                        <span>Monochrome</span>
                    </button>
                    <button class="theme-option" data-theme="contrast">
                        <div class="theme-preview contrast-preview"><span></span><span></span><span></span></div>
                        <span>Contrast</span>
                    </button>
                    <button class="theme-option" data-theme="forest">
                        <div class="theme-preview forest-preview"><span></span><span></span><span></span></div>
                        <span>Forest</span>
                    </button>
                    <button class="theme-option" data-theme="paper">
                        <div class="theme-preview paper-preview"><span></span><span></span><span></span></div>
                        <span>Paper</span>
                    </button>
                </div>
            </div>
            <div class="setting-row">
                <div>
                    <strong>Quick shortcut</strong>
                    <small>Press Alt + S to open or close Sticky</small>
                </div>
            </div>
        </div>

        <div id="sticky-menu">
            <button id="new-session">
                <span class="menu-icon">+</span>
                <span>New</span>
            </button>
            <button id="sticky-settings">
                <span class="menu-icon">⚙</span>
                <span>Settings</span>
            </button>
            <button id="close-sticky" class="close-option">
                <span class="menu-icon">×</span>
                <span>Close</span>
            </button>
        </div>

        <div id="sticky-toast"></div>

        <!-- IMAGE RESIZER OVERLAY -->
        <div id="image-resizer">
            <div class="img-resizer-pill">
                <button type="button" class="img-size-btn" data-width="33%">33%</button>
                <button type="button" class="img-size-btn" data-width="66%">66%</button>
                <button type="button" class="img-size-btn" data-width="100%">100%</button>
                <button type="button" class="img-size-btn delete-img-btn" title="Remove image">✕</button>
            </div>
            <div class="img-resize-handle" title="Drag to resize"></div>
        </div>
    `;

    document.body.appendChild(box);

    /* ======================================================
       OVERLAY
    ====================================================== */
    const overlay = document.createElement("div");
    overlay.id = "sticky-overlay";
    document.body.appendChild(overlay);

    /* ======================================================
       INJECT STYLES FOR TOAST & RESIZER
    ====================================================== */
    const extraStyles = document.createElement("style");
    extraStyles.textContent = `
        #sticky-toast {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%) translateY(8px);
            background: rgba(26, 26, 26, 0.92);
            backdrop-filter: blur(8px);
            color: #ffffff;
            font-size: 11.5px;
            font-weight: 500;
            padding: 7px 14px;
            border-radius: 20px;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
            z-index: 2147483647;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(0,0,0,0.28);
            font-family: inherit;
        }
        #sticky-toast.show {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }

        /* IMAGE RESIZER */
        #image-resizer {
            position: absolute;
            display: none;
            pointer-events: none;
            border: 2px solid #3b82f6;
            border-radius: 4px;
            z-index: 2147483645;
            box-sizing: border-box;
        }
        #image-resizer.show {
            display: block;
        }
        .img-resizer-pill {
            position: absolute;
            top: -36px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 4px;
            background: rgba(26, 26, 26, 0.92);
            backdrop-filter: blur(8px);
            padding: 4px 6px;
            border-radius: 14px;
            pointer-events: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .img-size-btn {
            background: transparent;
            border: none;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 7px;
            border-radius: 6px;
            cursor: pointer;
        }
        .img-size-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .delete-img-btn:hover {
            background: #ef4444 !important;
        }
        .img-resize-handle {
            position: absolute;
            right: -6px;
            bottom: -6px;
            width: 12px;
            height: 12px;
            background: #3b82f6;
            border: 2px solid #ffffff;
            border-radius: 3px;
            cursor: se-resize;
            pointer-events: auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        #sticky-content img {
            cursor: pointer;
            transition: outline 0.15s ease;
            max-width: 100%;
            border-radius: 4px;
            display: inline-block;
        }
        #sticky-content img:hover {
            outline: 2px dashed #3b82f6;
        }
    `;
    document.head.appendChild(extraStyles);

    /* ======================================================
       ELEMENTS
    ====================================================== */
    const content = box.querySelector("#sticky-content");
    const titleInput = box.querySelector("#sticky-title");
    const dragHandle = box.querySelector("#drag-handle");
    const menuButton = box.querySelector("#menu-button");
    const menu = box.querySelector("#sticky-menu");
    const noteView = box.querySelector("#note-view");
    const homeView = box.querySelector("#home-view");
    const settingsView = box.querySelector("#settings-view");
    const sessionList = box.querySelector("#session-list");
    const homeButton = box.querySelector("#home-button");
    const homeClose = box.querySelector("#home-close");
    const homeNewSession = box.querySelector("#home-new-session");
    const settingsButton = box.querySelector("#sticky-settings");
    const settingsClose = box.querySelector("#settings-close");
    const newSessionButton = box.querySelector("#new-session");
    const closeStickyButton = box.querySelector("#close-sticky");
    const toast = box.querySelector("#sticky-toast");
    const imageResizer = box.querySelector("#image-resizer");
    const resizeHandle = imageResizer.querySelector(".img-resize-handle");

    /* ======================================================
       STATE
    ====================================================== */
    let currentSession = null;
    let sessions = [];
    let stickyGeometry = { x: 100, y: 100, width: 305, height: 310 };
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let isHomeOpen = false;
    let homeGeometry = null;
    let suppressResizeSave = false;
    let saveTimer = null;
    let geometrySaveTimer = null;
    let closeHomeTimer = null;
    let toastTimer = null;
    let activePointerId = null;
    let selectedImg = null;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function createDefaultSession() {
        return {
            id: Date.now().toString(),
            name: "",
            text: "",
            image: ""
        };
    }

    function createDefaultGeometry() {
        return { x: 100, y: 100, width: 305, height: 310 };
    }

    function isSessionEmpty(session) {
        if (!session) return true;
        const name = (session.name || "").trim().toLowerCase();
        const isDefaultName = !name || name === "untitled";
        const rawText = (session.text || "")
            .replace(/<br\s*\/?>/gi, "")
            .replace(/<div>\s*<\/div>/gi, "")
            .replace(/&nbsp;/gi, "")
            .trim();
        const hasImages = (session.text || "").includes("<img");
        return isDefaultName && !rawText && !hasImages;
    }

    /* ======================================================
       LOAD DATA
    ====================================================== */
    chrome.storage.local.get(
        ["currentSession", "sessions", "stickyGeometry", "isOpen", "stickyTheme"],
        function(data) {
            currentSession = data.currentSession ? { ...data.currentSession } : createDefaultSession();
            sessions = Array.isArray(data.sessions) ? data.sessions.map(s => ({ ...s })) : [];

            if (data.stickyGeometry && typeof data.stickyGeometry === "object") {
                stickyGeometry = { ...createDefaultGeometry(), ...data.stickyGeometry };
            } else {
                stickyGeometry = createDefaultGeometry();
                chrome.storage.local.set({ stickyGeometry });
            }

            loadSession(currentSession);
            setTheme(data.stickyTheme || "monochrome");

            if (data.isOpen) {
                box.style.display = "block";
                box.classList.add("fade-in");
            }
        }
    );

    function loadSession(session) {
        if (!session || isHomeOpen) return;
        currentSession = { ...session };
        applyGeometry();
        titleInput.value = session.name || "";
        content.innerHTML = session.text || "";
    }

    /* ======================================================
       STORAGE SYNC
    ====================================================== */
    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area !== "local") return;

        if (changes.currentSession && changes.currentSession.newValue) {
            const newSession = changes.currentSession.newValue;
            currentSession = { ...newSession };

            if (!isHomeOpen && !isDragging) {
                if (document.activeElement !== titleInput) {
                    titleInput.value = newSession.name || "";
                }
                if (document.activeElement !== content) {
                    content.innerHTML = newSession.text || "";
                }
            }
            if (isHomeOpen) renderSessions();
        }

        if (changes.sessions) {
            sessions = Array.isArray(changes.sessions.newValue)
                ? changes.sessions.newValue.map(s => ({ ...s }))
                : [];
            if (isHomeOpen) renderSessions();
        }

        if (changes.stickyGeometry && !isHomeOpen && !isDragging) {
            stickyGeometry = { ...createDefaultGeometry(), ...changes.stickyGeometry.newValue };
            applyGeometry();
        }

        if (changes.isOpen) {
            if (changes.isOpen.newValue) {
                box.style.display = "block";
                box.classList.remove("fade-in");
                void box.offsetWidth;
                box.classList.add("fade-in");
            } else {
                box.style.display = "none";
                closeMenu();
                closeHome();
                closeSettings();
            }
        }

        if (changes.stickyTheme) {
            setTheme(changes.stickyTheme.newValue);
        }
    });

    function applyGeometry() {
        if (!stickyGeometry) return;
        box.style.left = Math.max(0, Number(stickyGeometry.x) || 100) + "px";
        box.style.top = Math.max(0, Number(stickyGeometry.y) || 100) + "px";
        box.style.width = Math.max(Number(stickyGeometry.width) || 305, 220) + "px";
        box.style.height = Math.max(Number(stickyGeometry.height) || 310, 180) + "px";
    }

    /* ======================================================
       IMAGE RESIZING LOGIC
    ====================================================== */
    function updateResizerPosition() {
        if (!selectedImg || !box.contains(selectedImg)) {
            hideResizer();
            return;
        }

        const boxRect = box.getBoundingClientRect();
        const imgRect = selectedImg.getBoundingClientRect();

        imageResizer.style.left = (imgRect.left - boxRect.left) + "px";
        imageResizer.style.top = (imgRect.top - boxRect.top) + "px";
        imageResizer.style.width = imgRect.width + "px";
        imageResizer.style.height = imgRect.height + "px";
        imageResizer.classList.add("show");
    }

    function hideResizer() {
        selectedImg = null;
        imageResizer.classList.remove("show");
    }

    // Click on image to activate resizer
    content.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") {
            e.stopPropagation();
            selectedImg = e.target;
            updateResizerPosition();
        } else {
            hideResizer();
        }
    });

    // Reposition when content scrolls
    content.addEventListener("scroll", () => {
        if (selectedImg) updateResizerPosition();
    });

    // Dismiss resizer when clicking outside
    document.addEventListener("pointerdown", (e) => {
        if (!imageResizer.contains(e.target) && e.target !== selectedImg) {
            hideResizer();
        }
    });

    // Preset button clicks (33%, 66%, 100%, delete)
    imageResizer.querySelectorAll(".img-size-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!selectedImg) return;

            if (btn.classList.contains("delete-img-btn")) {
                selectedImg.remove();
                hideResizer();
                currentSession.text = content.innerHTML;
                scheduleSave();
                return;
            }

            const width = btn.dataset.width;
            selectedImg.style.width = width;
            selectedImg.style.height = "auto";
            updateResizerPosition();
            currentSession.text = content.innerHTML;
            scheduleSave();
        });
    });

    // Drag-to-resize handle
    resizeHandle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedImg) return;

        const startX = e.clientX;
        const startWidth = selectedImg.offsetWidth;
        const containerWidth = content.clientWidth;

        const onPointerMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = Math.max(50, Math.min(startWidth + deltaX, containerWidth));
            selectedImg.style.width = newWidth + "px";
            selectedImg.style.height = "auto";
            updateResizerPosition();
        };

        const onPointerUp = () => {
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            currentSession.text = content.innerHTML;
            scheduleSave();
        };

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
    });

    /* ======================================================
       DRAGGING THE STICKY NOTE
    ====================================================== */
    dragHandle.addEventListener("pointerdown", function(event) {
        if (isHomeOpen) return;
        hideResizer();
        isDragging = true;
        activePointerId = event.pointerId;
        box.classList.add("dragging");

        const rect = box.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        try {
            dragHandle.setPointerCapture(event.pointerId);
        } catch (e) {}

        event.preventDefault();
        event.stopPropagation();
    });

    document.addEventListener("pointermove", function(event) {
        if (!isDragging) return;

        const width = box.offsetWidth;
        const height = box.offsetHeight;
        let newX = event.clientX - offsetX;
        let newY = event.clientY - offsetY;

        const maxX = window.innerWidth - width;
        const maxY = window.innerHeight - height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        box.style.left = newX + "px";
        box.style.top = newY + "px";
    });

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        box.classList.remove("dragging");

        if (activePointerId !== null) {
            try {
                dragHandle.releasePointerCapture(activePointerId);
            } catch (e) {}
            activePointerId = null;
        }

        saveGeometry();
    }

    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);

    /* ======================================================
       RESIZE OBSERVER
    ====================================================== */
    const resizeObserver = new ResizeObserver(function() {
        if (suppressResizeSave || isHomeOpen || box.style.display === "none") return;
        if (selectedImg) updateResizerPosition();
        scheduleGeometrySave();
    });
    resizeObserver.observe(box);

    /* ======================================================
       INPUTS & SAVING
    ====================================================== */
    titleInput.addEventListener("input", function() {
        if (isHomeOpen || !currentSession) return;
        currentSession.name = titleInput.value;
        scheduleSave();
    });

    content.addEventListener("input", function() {
        if (isHomeOpen || !currentSession) return;
        if (content.innerHTML === "<br>" || content.innerHTML.trim() === "<div><br></div>") {
            content.innerHTML = "";
        }
        currentSession.text = content.innerHTML;
        scheduleSave();
    });

    content.addEventListener("paste", function(event) {
        const clipboard = event.clipboardData;
        if (!clipboard) return;

        const items = Array.from(clipboard.items || []);
        const imageItem = items.find(item => item.kind === "file" && item.type.startsWith("image/"));
        if (!imageItem) return;

        event.preventDefault();
        const file = imageItem.getAsFile();
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(loadEvent) {
            const image = document.createElement("img");
            image.src = loadEvent.target.result;
            image.alt = "Pasted image";
            image.style.width = "100%";

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                content.appendChild(image);
            } else {
                const range = selection.getRangeAt(0);
                if (!content.contains(range.commonAncestorContainer)) {
                    content.appendChild(image);
                } else {
                    range.deleteContents();
                    range.insertNode(image);
                    range.setStartAfter(image);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }

            if (currentSession) {
                currentSession.text = content.innerHTML;
                scheduleSave();
            }
        };
        reader.readAsDataURL(file);
    });

    function updateSessionFromUI() {
        if (!currentSession) return;
        currentSession.name = titleInput.value;
        currentSession.text = content.innerHTML;
    }

    function scheduleSave() {
        if (isHomeOpen || !currentSession) return;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveSession, 300);
    }

    function saveSession() {
        if (isHomeOpen || !currentSession) return;
        updateSessionFromUI();
        chrome.storage.local.set({ currentSession: { ...currentSession } });
    }

    window.addEventListener("beforeunload", () => {
        if (currentSession && !isHomeOpen) {
            updateSessionFromUI();
            chrome.storage.local.set({ currentSession: { ...currentSession } });
        }
    });

    function updateGeometryFromUI() {
        const rect = box.getBoundingClientRect();
        stickyGeometry = {
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };
    }

    function scheduleGeometrySave() {
        if (isHomeOpen || suppressResizeSave) return;
        clearTimeout(geometrySaveTimer);
        geometrySaveTimer = setTimeout(saveGeometry, 150);
    }

    function saveGeometry() {
        if (isHomeOpen || suppressResizeSave) return;
        updateGeometryFromUI();
        chrome.storage.local.set({ stickyGeometry: { ...stickyGeometry } });
    }

    /* ======================================================
       MENU & SETTINGS
    ====================================================== */
    menuButton.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        hideResizer();
        if (settingsView.classList.contains("show")) {
            closeSettings();
            return;
        }
        menu.classList.toggle("show");
        menuButton.classList.toggle("active", menu.classList.contains("show"));
    });

    function closeMenu() {
        menu.classList.remove("show");
        menuButton.classList.remove("active");
    }

    document.addEventListener("pointerdown", function(event) {
        if (!menu.contains(event.target) && event.target !== menuButton) {
            closeMenu();
        }
    });

    settingsButton.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        openSettings();
    });

    function openSettings() {
        closeMenu();
        hideResizer();

        if (isHomeOpen) {
            isHomeOpen = false;
            clearTimeout(closeHomeTimer);
            homeView.classList.remove("show");
            box.classList.remove("home-open");
            overlay.classList.remove("show");
            box.style.transform = "none";
            applyGeometry();
        }

        noteView.classList.add("hide");
        settingsView.classList.add("show");
        box.classList.add("settings-open");
    }

    function closeSettings() {
        settingsView.classList.remove("show");
        noteView.classList.remove("hide");
        box.classList.remove("settings-open");
        applyGeometry();
    }

    settingsClose.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeSettings();
    });

    closeStickyButton.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        closeSettings();
        chrome.storage.local.set({ isOpen: false });
    });

    /* ======================================================
       NEW SESSION LOGIC
    ====================================================== */
    function createNewSession() {
        hideResizer();
        updateSessionFromUI();

        if (isSessionEmpty(currentSession)) {
            if (isHomeOpen) {
                closeHome();
            }
            closeMenu();
            showToast("A new session is already open and empty");
            titleInput.focus();
            return;
        }

        const oldSession = currentSession ? { ...currentSession } : null;
        const newSession = createDefaultSession();
        const updatedSessions = sessions.slice();

        if (oldSession && (oldSession.name.trim() || oldSession.text.trim())) {
            updatedSessions.push(oldSession);
        }

        currentSession = newSession;
        sessions = updatedSessions;
        suppressResizeSave = true;

        chrome.storage.local.set({
            currentSession: newSession,
            sessions: updatedSessions,
            isOpen: true
        }, function() {
            titleInput.value = "";
            content.innerHTML = "";
            applyGeometry();
            closeMenu();
            closeHome();
            closeSettings();
            suppressResizeSave = false;
        });
    }

    newSessionButton.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        createNewSession();
    });

    homeNewSession.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        createNewSession();
    });

    /* ======================================================
       HOME / SESSIONS VIEW
    ====================================================== */
    homeButton.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        hideResizer();
        if (isHomeOpen) closeHome();
        else openHome();
    });

    homeClose.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeHome();
    });

    overlay.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();
        closeHome();
    });

    function openHome() {
        if (isHomeOpen) return;
        hideResizer();
        clearTimeout(closeHomeTimer);
        closeMenu();
        closeSettings();
        updateSessionFromUI();

        if (currentSession) {
            chrome.storage.local.set({ currentSession: { ...currentSession } });
        }

        const rect = box.getBoundingClientRect();
        homeGeometry = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };

        isHomeOpen = true;
        suppressResizeSave = true;
        renderSessions();

        box.style.left = rect.left + "px";
        box.style.top = rect.top + "px";
        box.style.width = rect.width + "px";
        box.style.height = rect.height + "px";
        box.style.transform = "none";

        overlay.classList.add("show");
        void box.offsetWidth;
        box.classList.add("home-open");
        homeView.classList.add("show");
        noteView.classList.add("hide");

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                box.style.left = "50%";
                box.style.top = "50%";
                box.style.width = Math.min(900, Math.max(220, window.innerWidth - 80)) + "px";
                box.style.height = Math.min(680, Math.max(180, window.innerHeight - 80)) + "px";
                box.style.transform = "translate(-50%, -50%)";
            });
        });
    }

    function closeHome() {
        if (!isHomeOpen) return;
        clearTimeout(closeHomeTimer);
        suppressResizeSave = true;

        const rect = box.getBoundingClientRect();
        box.style.left = rect.left + "px";
        box.style.top = rect.top + "px";
        box.style.width = rect.width + "px";
        box.style.height = rect.height + "px";
        box.style.transform = "none";

        homeView.classList.remove("show");
        noteView.classList.remove("hide");
        void box.offsetWidth;
        box.classList.remove("home-open");
        overlay.classList.remove("show");

        requestAnimationFrame(() => {
            if (!homeGeometry) {
                isHomeOpen = false;
                suppressResizeSave = false;
                applyGeometry();
                return;
            }

            box.style.left = homeGeometry.left + "px";
            box.style.top = homeGeometry.top + "px";
            box.style.width = homeGeometry.width + "px";
            box.style.height = homeGeometry.height + "px";
            box.style.transform = "none";

            closeHomeTimer = setTimeout(() => {
                isHomeOpen = false;
                suppressResizeSave = false;
                applyGeometry();
                if (currentSession) {
                    titleInput.value = currentSession.name || "";
                    content.innerHTML = currentSession.text || "";
                }
            }, 300);
        });
    }

    /* ======================================================
       RENDER SESSIONS
    ====================================================== */
    function renderSessions() {
        sessionList.innerHTML = "";
        if (currentSession) {
            sessionList.appendChild(createSessionCard(currentSession, true));
        }

        const sorted = [...sessions].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
        sorted.forEach(s => sessionList.appendChild(createSessionCard(s, false)));

        if (!currentSession && sessions.length === 0) {
            const empty = document.createElement("div");
            empty.className = "sessions-empty";
            empty.textContent = "No sessions";
            sessionList.appendChild(empty);
        }
    }

    function createSessionCard(session, isCurrent) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "session-card" + (isCurrent ? " current-card" : "");

        const title = document.createElement("div");
        title.className = "session-name";
        title.textContent = session.name || "Untitled";

        const preview = document.createElement("div");
        preview.className = "session-preview";
        preview.textContent = getPreview(session);

        card.appendChild(title);
        card.appendChild(preview);

        if (!isCurrent) {
            const star = document.createElement("span");
            star.className = "session-star" + (session.starred ? " starred" : "");
            star.textContent = session.starred ? "★" : "☆";
            star.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSessionStar(session.id);
            });
            card.appendChild(star);

            const deleteButton = document.createElement("span");
            deleteButton.className = "session-delete";
            deleteButton.textContent = "×";
            deleteButton.title = "Delete session";
            deleteButton.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteSession(session.id);
            });
            card.appendChild(deleteButton);
        }

        if (isCurrent) {
            const currentLabel = document.createElement("div");
            currentLabel.className = "session-current-label";
            currentLabel.textContent = "CURRENT";
            card.appendChild(currentLabel);

            const selectCurrent = (e) => {
                e.preventDefault();
                e.stopPropagation();
                titleInput.value = currentSession.name || "";
                content.innerHTML = currentSession.text || "";
                closeHome();
            };

            card.addEventListener("click", selectCurrent);
            card.addEventListener("pointerdown", selectCurrent);
        } else {
            card.addEventListener("click", (e) => {
                if (e.target.closest(".session-delete") || e.target.closest(".session-star")) return;
                selectSession(session.id);
            });
        }

        return card;
    }

    function toggleSessionStar(id) {
        const index = sessions.findIndex(s => String(s.id) === String(id));
        if (index === -1) return;
        sessions[index].starred = !sessions[index].starred;
        chrome.storage.local.set({ sessions });
        renderSessions();
    }

    function deleteSession(id) {
        sessions = sessions.filter(s => String(s.id) !== String(id));
        chrome.storage.local.set({ sessions });
        renderSessions();
    }

    function getPreview(session) {
        const html = session.text || "";
        if (!html.trim()) return "Empty note";
        const temp = document.createElement("div");
        temp.innerHTML = html;
        temp.querySelectorAll("img").forEach(img => img.replaceWith(document.createTextNode("<image>")));
        const text = temp.textContent.replace(/\s+/g, " ").trim();
        return text ? (text.length > 90 ? text.substring(0, 90) + "..." : text) : "<image>";
    }

    function selectSession(id) {
        const selected = sessions.find(s => String(s.id) === String(id));
        if (!selected) return;

        updateSessionFromUI();
        const oldCurrent = currentSession ? { ...currentSession } : null;
        const remaining = sessions.filter(s => String(s.id) !== String(id));

        if (oldCurrent && (oldCurrent.name.trim() || oldCurrent.text.trim())) {
            remaining.push(oldCurrent);
        }

        currentSession = { ...selected };
        sessions = remaining;
        suppressResizeSave = true;

        chrome.storage.local.set({
            currentSession: currentSession,
            sessions: remaining,
            isOpen: true
        }, function() {
            titleInput.value = currentSession.name || "";
            content.innerHTML = currentSession.text || "";
            applyGeometry();
            closeHome();
            suppressResizeSave = false;
        });
    }

    /* ======================================================
       THEMES
    ====================================================== */
    const themeButtons = box.querySelectorAll(".theme-option");
    themeButtons.forEach(button => {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            const theme = button.dataset.theme;
            setTheme(theme);
            chrome.storage.local.set({ stickyTheme: theme });
        });
    });

    function setTheme(theme) {
        const validThemes = ["clay", "monochrome", "contrast", "forest", "paper"];
        if (!validThemes.includes(theme)) theme = "monochrome";
        box.dataset.theme = theme;
        themeButtons.forEach(btn => btn.classList.toggle("selected", btn.dataset.theme === theme));
    }

    chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
        if (req.action === "PING") sendResponse({ status: "OK" });
    });
})();