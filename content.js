(() => {
    if (document.getElementById("sticky-host-root")) {
        return;
    }

    /* ======================================================
       1. SHADOW DOM ISOLATION (HOST-PAGE CSS IMMUNITY)
    ====================================================== */
    const host = document.createElement("div");
    host.id = "sticky-host-root";
    host.style.cssText = "all: initial !important; position: static !important; z-index: 2147483647 !important;";

    const shadow = host.attachShadow({ mode: "open" });
    document.body.appendChild(host);

    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = chrome.runtime.getURL("style.css");
    shadow.appendChild(styleLink);

    /* ======================================================
       2. DOM STRUCTURE
    ====================================================== */
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
            <div class="settings-footer-links">
    <a href="https://github.com/NamanPatel0/sticky-browser-extension/tree/main?tab=readme-ov-file" target="_blank" rel="noopener noreferrer" class="settings-link">GitHub</a>
    <span class="settings-sep">·</span>
    <a href="https://ko-fi.com/naman_patel" target="_blank" rel="noopener noreferrer" class="settings-link">Ko-fi ⭐</a>
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
            <button id="close-sticky">
                <span class="menu-icon">×</span>
                <span>Close</span>
            </button>
        </div>

        <div id="sticky-toast"></div>

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

    shadow.appendChild(box);

    const overlay = document.createElement("div");
    overlay.id = "sticky-overlay";
    shadow.appendChild(overlay);

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
        }
        #sticky-content img:hover {
            outline: 2px dashed #3b82f6;
        }
    `;
    shadow.appendChild(extraStyles);

    /* ======================================================
       3. ELEMENTS
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
       4. STATE & POOLS
    ====================================================== */
    let currentSession = null;
    let sessions = [];
    let stickyGeometry = { x: 100, y: 100, width: 305, height: 310 };
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let dragRafId = null;
    let isHomeOpen = false;
    let homeGeometry = null;
    let suppressResizeSave = true;
    let saveTimer = null;
    let geometrySaveTimer = null;
    let scrollSaveTimer = null;
    let closeHomeTimer = null;
    let toastTimer = null;
    let activePointerId = null;
    let selectedImg = null;
    let isRestoringScroll = false;

    const previewPool = document.createElement("div");

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
            scrollTop: 0
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
       5. SCROLL RESTORATION HELPER
    ====================================================== */
    function restoreScrollPosition(top) {
        if (typeof top !== "number") return;
        isRestoringScroll = true;
        content.scrollTop = top;

        requestAnimationFrame(() => {
            content.scrollTop = top;
            setTimeout(() => {
                isRestoringScroll = false;
            }, 60);
        });

        const imgs = content.querySelectorAll("img");
        imgs.forEach(img => {
            if (!img.complete) {
                img.addEventListener("load", () => {
                    content.scrollTop = top;
                }, { once: true });
            }
        });
    }

    /* ======================================================
       6. STRIP FOREIGN CLASSES & INLINE STYLES
    ====================================================== */
    function cleanContentStyles(shouldPersist = false) {
        if (!content) return;
        let modified = false;

        const allChildren = content.querySelectorAll("*");
        const len = allChildren.length;

        for (let i = 0; i < len; i++) {
            const el = allChildren[i];
            if (el.hasAttribute("class")) {
                el.removeAttribute("class");
                modified = true;
            }
            if (el.hasAttribute("id")) {
                el.removeAttribute("id");
                modified = true;
            }
            if (el.tagName !== "IMG") {
                if (el.style.color || el.style.backgroundColor || el.style.background || el.style.border || el.style.padding || el.style.margin || el.style.position || el.style.float) {
                    el.style.color = "";
                    el.style.backgroundColor = "";
                    el.style.background = "";
                    el.style.border = "";
                    el.style.padding = "";
                    el.style.margin = "";
                    el.style.position = "";
                    el.style.float = "";
                    modified = true;
                }
            }
        }

        if (modified && shouldPersist && currentSession) {
            currentSession.text = content.innerHTML;
            scheduleSave();
        }
    }

    /* ======================================================
       7. IMAGE CONVERSION TO DATA URLS (CSP/CORS IMMUNITY)
    ====================================================== */
    function convertExternalImages() {
        if (!content) return;
        const images = content.querySelectorAll("img");
        images.forEach(img => {
            const rawSrc = img.getAttribute("src") || img.src;
            if (!rawSrc || rawSrc.startsWith("data:") || img.dataset.converting === "true" || img.dataset.convertFailed === "true") {
                return;
            }

            img.dataset.converting = "true";
            const absoluteUrl = img.src;

            chrome.runtime.sendMessage(
                { action: "FETCH_IMAGE_AS_DATA_URL", url: absoluteUrl },
                (response) => {
                    delete img.dataset.converting;
                    if (response && response.success && response.dataUrl) {
                        img.src = response.dataUrl;
                        if (currentSession) {
                            currentSession.text = content.innerHTML;
                            scheduleSave();
                        }
                    } else {
                        img.dataset.convertFailed = "true";
                    }
                }
            );
        });
    }

    function insertNodeAtSelection(node) {
        const selection = shadow.getSelection ? shadow.getSelection() : window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            content.appendChild(node);
        } else {
            const range = selection.getRangeAt(0);
            if (!content.contains(range.commonAncestorContainer)) {
                content.appendChild(node);
            } else {
                range.deleteContents();
                range.insertNode(node);
                range.setStartAfter(node);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    }

    /* ======================================================
       8. LOAD DATA
    ====================================================== */
    chrome.storage.local.get(
        ["currentSession", "sessions", "stickyGeometry", "isOpen", "stickyTheme"],
        (data) => {
            currentSession = data.currentSession ? { ...data.currentSession } : createDefaultSession();
            sessions = Array.isArray(data.sessions) ? data.sessions.map(s => ({ ...s })) : [];

            if (data.stickyGeometry && typeof data.stickyGeometry === "object") {
                stickyGeometry = { ...createDefaultGeometry(), ...data.stickyGeometry };
            } else {
                stickyGeometry = createDefaultGeometry();
                chrome.storage.local.set({ stickyGeometry });
            }

            suppressResizeSave = true;
            loadSession(currentSession);
            setTheme(data.stickyTheme || "monochrome");

            if (data.isOpen) {
                box.style.display = "block";
                box.classList.add("fade-in");
            }

            setTimeout(() => {
                suppressResizeSave = false;
            }, 100);
        }
    );

    function loadSession(session) {
        if (!session || isHomeOpen) return;
        currentSession = { ...session };
        applyGeometry();
        titleInput.value = session.name || "";
        content.innerHTML = session.text || "";
        cleanContentStyles(false);
        convertExternalImages();
        restoreScrollPosition(session.scrollTop || 0);
    }

    /* ======================================================
       9. STORAGE SYNC & TAB VISIBILITY
    ====================================================== */
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;

        if (changes.currentSession && changes.currentSession.newValue) {
            const newSession = changes.currentSession.newValue;
            currentSession = { ...newSession };

            if (!isHomeOpen && !isDragging) {
                const activeEl = shadow.activeElement || document.activeElement;
                if (activeEl !== titleInput) {
                    titleInput.value = newSession.name || "";
                }
                if (activeEl !== content) {
                    content.innerHTML = newSession.text || "";
                    cleanContentStyles(false);
                    convertExternalImages();
                }
                if (typeof newSession.scrollTop === "number" && !isRestoringScroll) {
                    restoreScrollPosition(newSession.scrollTop);
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
            suppressResizeSave = true;
            stickyGeometry = { ...createDefaultGeometry(), ...changes.stickyGeometry.newValue };
            applyGeometry();
            setTimeout(() => {
                suppressResizeSave = false;
            }, 100);
        }

        if (changes.isOpen) {
            if (changes.isOpen.newValue) {
                box.style.display = "block";
                box.classList.remove("fade-in");
                void box.offsetWidth;
                box.classList.add("fade-in");
                if (currentSession) {
                    restoreScrollPosition(currentSession.scrollTop || 0);
                }
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

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && currentSession && !isHomeOpen) {
            chrome.storage.local.get(["currentSession"], (data) => {
                if (data.currentSession && typeof data.currentSession.scrollTop === "number") {
                    currentSession.scrollTop = data.currentSession.scrollTop;
                    restoreScrollPosition(data.currentSession.scrollTop);
                }
            });
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
       10. IMAGE RESIZING OVERLAY & CONTROLS
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

    content.addEventListener("click", (e) => {
        if (e.target.tagName === "IMG") {
            e.stopPropagation();
            selectedImg = e.target;
            updateResizerPosition();
        } else {
            hideResizer();
        }
    });

    content.addEventListener("scroll", () => {
        if (selectedImg) updateResizerPosition();
        if (isHomeOpen || !currentSession || isRestoringScroll) return;

        currentSession.scrollTop = Math.round(content.scrollTop);
        clearTimeout(scrollSaveTimer);
        scrollSaveTimer = setTimeout(() => {
            if (currentSession && !isHomeOpen && !isRestoringScroll) {
                chrome.storage.local.set({ currentSession });
            }
        }, 120);
    }, { passive: true });

    document.addEventListener("pointerdown", (e) => {
        const path = e.composedPath ? e.composedPath() : [e.target];
        if (!path.includes(imageResizer) && !path.includes(selectedImg)) {
            hideResizer();
        }
    });

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

    resizeHandle.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!selectedImg) return;

        const startX = e.clientX;
        const startWidth = selectedImg.offsetWidth;
        const containerWidth = content.clientWidth;
        let resizeRaf = null;

        const onPointerMove = (moveEvent) => {
            if (resizeRaf) return;
            resizeRaf = requestAnimationFrame(() => {
                const deltaX = moveEvent.clientX - startX;
                const newWidth = Math.max(50, Math.min(startWidth + deltaX, containerWidth));
                selectedImg.style.width = newWidth + "px";
                selectedImg.style.height = "auto";
                updateResizerPosition();
                resizeRaf = null;
            });
        };

        const onPointerUp = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
            currentSession.text = content.innerHTML;
            scheduleSave();
        };

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
    });

    /* ======================================================
       11. DRAGGING (RAF-BATCHED)
    ====================================================== */
    dragHandle.addEventListener("pointerdown", (event) => {
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
        } catch (_) {}

        event.preventDefault();
        event.stopPropagation();
    });

    document.addEventListener("pointermove", (event) => {
        if (!isDragging) return;

        if (dragRafId) return;
        dragRafId = requestAnimationFrame(() => {
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
            dragRafId = null;
        });
    });

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        if (dragRafId) {
            cancelAnimationFrame(dragRafId);
            dragRafId = null;
        }
        box.classList.remove("dragging");

        if (activePointerId !== null) {
            try {
                dragHandle.releasePointerCapture(activePointerId);
            } catch (_) {}
            activePointerId = null;
        }

        saveGeometry();
    }

    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);

    /* ======================================================
       12. RESIZE OBSERVER
    ====================================================== */
    const resizeObserver = new ResizeObserver(() => {
        if (suppressResizeSave || isHomeOpen || box.style.display === "none") return;
        if (selectedImg) updateResizerPosition();
        scheduleGeometrySave();
    });
    resizeObserver.observe(box);

    /* ======================================================
       13. INPUTS & ASYNC PERSISTENCE
    ====================================================== */
    titleInput.addEventListener("input", () => {
        if (isHomeOpen || !currentSession) return;
        scheduleSave();
    });

    content.addEventListener("input", () => {
        if (isHomeOpen || !currentSession) return;
        scheduleSave();
    });

    content.addEventListener("paste", (event) => {
        const clipboard = event.clipboardData;
        if (!clipboard) return;

        const items = Array.from(clipboard.items || []);
        const imageItem = items.find(item => item.kind === "file" && item.type.startsWith("image/"));

        if (imageItem) {
            event.preventDefault();
            const file = imageItem.getAsFile();
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const image = document.createElement("img");
                image.src = loadEvent.target.result;
                image.alt = "Pasted image";
                image.style.width = "100%";

                insertNodeAtSelection(image);
                if (currentSession) {
                    currentSession.text = content.innerHTML;
                    currentSession.scrollTop = Math.round(content.scrollTop);
                    scheduleSave();
                }
            };
            reader.readAsDataURL(file);
            return;
        }

        setTimeout(() => {
            cleanContentStyles(true);
            convertExternalImages();
            if (currentSession) {
                currentSession.text = content.innerHTML;
                currentSession.scrollTop = Math.round(content.scrollTop);
                scheduleSave();
            }
        }, 50);
    });

    function updateSessionFromUI() {
        if (!currentSession) return;
        currentSession.name = titleInput.value;
        if (content.innerHTML === "<br>" || content.innerHTML.trim() === "<div><br></div>") {
            content.innerHTML = "";
        }
        currentSession.text = content.innerHTML;
        currentSession.scrollTop = Math.round(content.scrollTop);
    }

    function scheduleSave() {
        if (isHomeOpen || !currentSession) return;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveSession, 300);
    }

    function saveSession() {
        if (isHomeOpen || !currentSession) return;
        updateSessionFromUI();
        chrome.storage.local.set({ currentSession });
    }

    window.addEventListener("beforeunload", () => {
        if (currentSession && !isHomeOpen) {
            updateSessionFromUI();
            chrome.storage.local.set({ currentSession });
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
        chrome.storage.local.set({ stickyGeometry });
    }

    /* ======================================================
       14. MENU & SETTINGS VIEW
    ====================================================== */
    menuButton.addEventListener("pointerdown", (event) => {
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

    document.addEventListener("pointerdown", (event) => {
        const path = event.composedPath ? event.composedPath() : [event.target];
        if (!path.includes(menu) && !path.includes(menuButton)) {
            closeMenu();
        }
    });

    settingsButton.addEventListener("click", (event) => {
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
            box.classList.remove("home-open", "home-animating");
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

    settingsClose.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeSettings();
    });

    closeStickyButton.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        closeSettings();
        chrome.storage.local.set({ isOpen: false });
    });

    /* ======================================================
       15. NEW SESSION LOGIC
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
        }, () => {
            titleInput.value = "";
            content.innerHTML = "";
            applyGeometry();
            closeMenu();
            closeHome();
            closeSettings();
            setTimeout(() => {
                suppressResizeSave = false;
            }, 100);
        });
    }

    newSessionButton.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        createNewSession();
    });

    homeNewSession.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        createNewSession();
    });

    /* ======================================================
       16. HOME / SESSIONS VIEW (SYMMETRICAL 2-WAY TRANSITIONS)
    ====================================================== */
    homeButton.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        hideResizer();
        if (isHomeOpen) closeHome();
        else openHome();
    });

    homeClose.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeHome();
    });

    overlay.addEventListener("pointerdown", (event) => {
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
            chrome.storage.local.set({ currentSession });
        }

        const rect = box.getBoundingClientRect();
        homeGeometry = {
            left: Math.round(rect.left),
            top: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        };

        isHomeOpen = true;
        suppressResizeSave = true;
        renderSessions();

        box.style.left = homeGeometry.left + "px";
        box.style.top = homeGeometry.top + "px";
        box.style.width = homeGeometry.width + "px";
        box.style.height = homeGeometry.height + "px";
        box.style.transform = "none";

        overlay.classList.add("show");
        homeView.classList.add("show");
        noteView.classList.add("hide");

        void box.offsetWidth;

        box.classList.add("home-animating", "home-open");

        requestAnimationFrame(() => {
            box.style.left = "50%";
            box.style.top = "50%";
            box.style.width = Math.min(900, Math.max(220, window.innerWidth - 80)) + "px";
            box.style.height = Math.min(680, Math.max(180, window.innerHeight - 80)) + "px";
            box.style.transform = "translate(-50%, -50%)";

            closeHomeTimer = setTimeout(() => {
                box.classList.remove("home-animating");
            }, 400);
        });
    }

    function closeHome() {
        if (!isHomeOpen) return;
        clearTimeout(closeHomeTimer);
        suppressResizeSave = true;
        isHomeOpen = false;

        homeView.classList.remove("show");
        noteView.classList.remove("hide");
        overlay.classList.remove("show");

        box.classList.add("home-animating");
        box.classList.remove("home-open");

        void box.offsetWidth;

        requestAnimationFrame(() => {
            const target = homeGeometry || stickyGeometry;
            box.style.left = (target.left || target.x || 100) + "px";
            box.style.top = (target.top || target.y || 100) + "px";
            box.style.width = (target.width || 305) + "px";
            box.style.height = (target.height || 310) + "px";
            box.style.transform = "none";

            closeHomeTimer = setTimeout(() => {
                box.classList.remove("home-animating");
                suppressResizeSave = false;
                applyGeometry();

                if (currentSession) {
                    titleInput.value = currentSession.name || "";
                    content.innerHTML = currentSession.text || "";
                    cleanContentStyles(false);
                    convertExternalImages();
                    restoreScrollPosition(currentSession.scrollTop || 0);
                }
            }, 400);
        });
    }

    /* ======================================================
       17. SESSIONS LIST RENDERING
    ====================================================== */
    function renderSessions() {
        sessionList.innerHTML = "";
        if (currentSession) {
            sessionList.appendChild(createSessionCard(currentSession, true));
        }

        const sorted = [...sessions].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
        const len = sorted.length;
        for (let i = 0; i < len; i++) {
            sessionList.appendChild(createSessionCard(sorted[i], false));
        }

        if (!currentSession && len === 0) {
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

            card.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                titleInput.value = currentSession.name || "";
                content.innerHTML = currentSession.text || "";
                closeHome();
            });
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
        const preprocessed = html.replace(/<img[^>]*>/gi, " <image> ");
        previewPool.innerHTML = preprocessed;
        const text = (previewPool.textContent || "").replace(/\s+/g, " ").trim();
        previewPool.textContent = "";
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
            currentSession,
            sessions: remaining,
            isOpen: true
        }, () => {
            titleInput.value = currentSession.name || "";
            content.innerHTML = currentSession.text || "";
            applyGeometry();
            closeHome();
            setTimeout(() => {
                suppressResizeSave = false;
            }, 100);
            cleanContentStyles(false);
            convertExternalImages();
            restoreScrollPosition(currentSession.scrollTop || 0);
        });
    }

    /* ======================================================
       18. THEMES
    ====================================================== */
    const themeButtons = box.querySelectorAll(".theme-option");
    themeButtons.forEach(button => {
        button.addEventListener("click", (e) => {
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
})();