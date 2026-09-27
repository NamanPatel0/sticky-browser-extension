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

        <div class="previous-heading">
            SESSIONS
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
                <div class="settings-label">
                    PREFERENCES
                </div>

                <div class="settings-title">
                    Settings
                </div>
            </div>

            <button id="settings-close">
                ×
            </button>

        </div>

        <div class="settings-section">

            <div class="section-label">
                COLOR THEME
            </div>

            <div class="theme-list">

                <button
                    class="theme-option"
                    data-theme="clay">

                    <div class="theme-preview clay-preview">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>Clay</span>

                </button>

                <button
                    class="theme-option"
                    data-theme="monochrome">

                    <div class="theme-preview mono-preview">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>Monochrome</span>

                </button>

                <button
                    class="theme-option"
                    data-theme="contrast">

                    <div class="theme-preview contrast-preview">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>Contrast</span>

                </button>

                <button
                    class="theme-option"
                    data-theme="forest">

                    <div class="theme-preview forest-preview">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>Forest</span>

                </button>

                <button
                    class="theme-option"
                    data-theme="paper">

                    <div class="theme-preview paper-preview">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>Paper</span>

                </button>

            </div>

        </div>

        <div class="setting-row">

            <div>
                <strong>Keep formatting</strong>
                <small>Preserve styles when pasting text</small>
            </div>

            <input
                type="checkbox"
                id="keep-formatting"
                checked
            >

        </div>

        <div class="setting-row">

            <div>
                <strong>Compact images</strong>
                <small>Fit pasted images inside the window</small>
            </div>

            <input
                type="checkbox"
                id="compact-images"
                checked
            >

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

        <button
            id="close-sticky"
            class="close-option">

            <span class="menu-icon">×</span>
            <span>Close</span>

        </button>

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
   ELEMENTS
====================================================== */

const content =
    document.getElementById("sticky-content");

const titleInput =
    document.getElementById("sticky-title");

const dragHandle =
    document.getElementById("drag-handle");

const menuButton =
    document.getElementById("menu-button");

const menu =
    document.getElementById("sticky-menu");

const noteView =
    document.getElementById("note-view");

const homeView =
    document.getElementById("home-view");

const settingsView =
    document.getElementById("settings-view");

const sessionList =
    document.getElementById("session-list");

const homeButton =
    document.getElementById("home-button");

const homeClose =
    document.getElementById("home-close");

const homeNewSession =
    document.getElementById("home-new-session");

const settingsButton =
    document.getElementById("sticky-settings");

const settingsClose =
    document.getElementById("settings-close");

const newSessionButton =
    document.getElementById("new-session");

const closeStickyButton =
    document.getElementById("close-sticky");


/* ======================================================
   TITLE INPUT STYLE
====================================================== */

titleInput.style.cssText = `
    display: block;
    width: 100%;
    box-sizing: border-box;
    border: none;
    outline: none;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 600;
    font-size: 17px;
    padding: 8px 12px 5px;
    margin: 0;
`;

content.style.cssText += `
    box-sizing: border-box;
`;


/* ======================================================
   STATE
====================================================== */

let currentSession = null;

let sessions = [];

let stickyGeometry = {
    x: 100,
    y: 100,
    width: 305,
    height: 310
};

let isDragging = false;

let offsetX = 0;
let offsetY = 0;

let isHomeOpen = false;

let homeGeometry = null;

let suppressResizeSave = false;

let saveTimer = null;

let geometrySaveTimer = null;

let isSaving = false;

let pendingSave = false;

let isGeometrySaving = false;

let pendingGeometrySave = false;


/* ======================================================
   DEFAULTS
====================================================== */

function createDefaultSession() {

    return {
        id: Date.now().toString(),

        name: "",

        text: "",

        image: ""
    };

}


function createDefaultGeometry() {

    return {
        x: 100,
        y: 100,
        width: 305,
        height: 310
    };

}


/* ======================================================
   LOAD
====================================================== */

chrome.storage.local.get(
    [
        "currentSession",
        "sessions",
        "stickyGeometry",
        "isOpen",
        "stickyTheme"
    ],
    function(data) {

        if (data.currentSession) {

            currentSession = {
                ...data.currentSession
            };

        } else {

            currentSession =
                createDefaultSession();

        }


        sessions =
            Array.isArray(data.sessions)
                ? data.sessions.map(
                    function(session) {
                        return {
                            ...session
                        };
                    }
                )
                : [];


        if (
            data.stickyGeometry &&
            typeof data.stickyGeometry === "object"
        ) {

            stickyGeometry = {
                ...createDefaultGeometry(),
                ...data.stickyGeometry
            };

        } else {

            /*
                Old versions stored size/position
                inside every session.

                We deliberately ignore those values
                and use one global Sticky geometry.
            */

            stickyGeometry =
                createDefaultGeometry();

            chrome.storage.local.set({
                stickyGeometry:
                    stickyGeometry
            });

        }


        loadSession(
            currentSession
        );


        const theme =
            data.stickyTheme ||
            "monochrome";

        setTheme(theme);


        if (!data.stickyTheme) {

            chrome.storage.local.set({
                stickyTheme: "monochrome"
            });

        }


        if (data.isOpen) {

            box.style.display =
                "block";

        }

    }
);


/* ======================================================
   LOAD SESSION
====================================================== */

function loadSession(session) {

    if (!session || isHomeOpen) {
        return;
    }

    currentSession = {
        ...session
    };


    box.style.left =
        Math.max(
            0,
            Number(stickyGeometry.x) || 100
        ) + "px";

    box.style.top =
        Math.max(
            0,
            Number(stickyGeometry.y) || 100
        ) + "px";


    box.style.width =
        Math.max(
            Number(stickyGeometry.width) || 305,
            220
        ) + "px";

    box.style.height =
        Math.max(
            Number(stickyGeometry.height) || 310,
            180
        ) + "px";


    titleInput.value =
        session.name || "";

content.innerHTML =
    session.text || "";

}


/* ======================================================
   STORAGE CHANGES
====================================================== */

chrome.storage.onChanged.addListener(
    function(changes, area) {

        if (area !== "local") {
            return;
        }


        /* -----------------------------------------------
           CURRENT SESSION
        ----------------------------------------------- */

        if (changes.currentSession) {

            const newSession =
                changes.currentSession.newValue;


if (newSession) {

    const previousId =
        currentSession
            ? currentSession.id
            : null;

    currentSession = {
        ...newSession
    };

    /*
        Do not reload the inputs when the same
        session is being saved.

        Otherwise typing in the title/content
        gets overwritten by storage.onChanged.
    */

    if (
        !isHomeOpen &&
        !isDragging &&
        previousId !== newSession.id
    ) {

        loadSession(
            newSession
        );

    }

}


            if (isHomeOpen) {

                renderSessions();

            }

        }


        /* -----------------------------------------------
           PREVIOUS SESSIONS
        ----------------------------------------------- */

        if (changes.sessions) {

            sessions =
                Array.isArray(
                    changes.sessions.newValue
                )
                    ? changes.sessions.newValue.map(
                        function(session) {
                            return {
                                ...session
                            };
                        }
                    )
                    : [];


            if (isHomeOpen) {

                renderSessions();

            }

        }


        /* -----------------------------------------------
           GLOBAL GEOMETRY
        ----------------------------------------------- */

        if (changes.stickyGeometry) {

            const newGeometry =
                changes.stickyGeometry.newValue;


            if (
                newGeometry &&
                typeof newGeometry === "object"
            ) {

                stickyGeometry = {
                    ...createDefaultGeometry(),
                    ...newGeometry
                };

            }


            if (
                !isHomeOpen &&
                !isDragging
            ) {

                applyGeometry();

            }

        }


        /* -----------------------------------------------
           OPEN / CLOSE
        ----------------------------------------------- */

        if (changes.isOpen) {

            if (
                changes.isOpen.newValue
            ) {

                box.style.display =
                    "block";

            } else {

                box.style.display =
                    "none";

                closeMenu();
                closeHome();
                closeSettings();

            }

        }


        /* -----------------------------------------------
           THEME
        ----------------------------------------------- */

        if (changes.stickyTheme) {

            setTheme(
                changes.stickyTheme.newValue
            );

        }

    }
);


/* ======================================================
   APPLY GLOBAL GEOMETRY
====================================================== */

function applyGeometry() {

    if (!stickyGeometry) {
        return;
    }


    box.style.left =
        Math.max(
            0,
            Number(stickyGeometry.x) || 100
        ) + "px";


    box.style.top =
        Math.max(
            0,
            Number(stickyGeometry.y) || 100
        ) + "px";


    box.style.width =
        Math.max(
            Number(stickyGeometry.width) || 305,
            220
        ) + "px";

    box.style.height =
        Math.max(
            Number(stickyGeometry.height) || 310,
            180
        ) + "px";

}


/* ======================================================
   DRAGGING
====================================================== */

dragHandle.addEventListener(
    "pointerdown",
    function(event) {

        if (isHomeOpen) {
            return;
        }


        isDragging = true;

        box.classList.add(
            "dragging"
        );


        const rect =
            box.getBoundingClientRect();


        offsetX =
            event.clientX -
            rect.left;


        offsetY =
            event.clientY -
            rect.top;


        try {

            dragHandle.setPointerCapture(
                event.pointerId
            );

        } catch (error) {
            // Pointer capture is optional.
        }


        event.preventDefault();
        event.stopPropagation();

    }
);


document.addEventListener(
    "pointermove",
    function(event) {

        if (!isDragging) {
            return;
        }


        box.style.left =
            (event.clientX - offsetX)
            + "px";


        box.style.top =
            (event.clientY - offsetY)
            + "px";

    }
);


document.addEventListener(
    "pointerup",
    function() {

        if (!isDragging) {
            return;
        }


        isDragging = false;


        box.classList.remove(
            "dragging"
        );


        saveGeometry();

    }
);


/* ======================================================
   RESIZE
====================================================== */

const resizeObserver =
    new ResizeObserver(
        function() {

            if (
                suppressResizeSave ||
                isHomeOpen ||
                box.style.display === "none"
            ) {
                return;
            }


            scheduleGeometrySave();

        }
    );


resizeObserver.observe(box);


/* ======================================================
   TITLE
====================================================== */

titleInput.addEventListener(
    "input",
    function() {

        if (
            isHomeOpen ||
            !currentSession
        ) {
            return;
        }


        currentSession.name =
            titleInput.value;


        scheduleSave();

    }
);


/* ======================================================
   TEXT
====================================================== */

content.addEventListener(
    "input",
    function() {

        if (
            isHomeOpen ||
            !currentSession
        ) {
            return;
        }


        currentSession.text =
            content.innerHTML;


        scheduleSave();

    }
);

/* ======================================================
   IMAGE PASTE
====================================================== */

content.addEventListener(
    "paste",
    function(event) {

        const clipboard =
            event.clipboardData;

        if (!clipboard) {
            return;
        }

        const items =
            Array.from(
                clipboard.items || []
            );

        const imageItem =
            items.find(
                function(item) {

                    return (
                        item.kind === "file" &&
                        item.type.startsWith("image/")
                    );

                }
            );

        /*
            If there is no image, let the browser
            handle normal text pasting.
        */

        if (!imageItem) {
            return;
        }

        event.preventDefault();

        const file =
            imageItem.getAsFile();

        if (!file) {
            return;
        }

        const reader =
            new FileReader();

        reader.onload = function(loadEvent) {

            const image =
                document.createElement("img");

            image.src =
                loadEvent.target.result;

            image.alt =
                "Pasted image";


            const selection =
                window.getSelection();


            if (
                !selection ||
                selection.rangeCount === 0
            ) {

                content.appendChild(
                    image
                );

            } else {

                const range =
                    selection.getRangeAt(0);


                if (
                    !content.contains(
                        range.commonAncestorContainer
                    )
                ) {

                    content.appendChild(
                        image
                    );

                } else {

                    range.deleteContents();

                    range.insertNode(
                        image
                    );


                    range.setStartAfter(
                        image
                    );

                    range.collapse(
                        true
                    );


                    selection.removeAllRanges();

                    selection.addRange(
                        range
                    );

                }

            }


            if (currentSession) {

                currentSession.text =
                    content.innerHTML;

                scheduleSave();

            }

        };


        reader.readAsDataURL(file);

    }
);

/* ======================================================
   SAVE SESSION
====================================================== */

function updateSessionFromUI() {

    if (!currentSession) {
        return;
    }


    currentSession = {
        ...currentSession,

        name:
            titleInput.value,

        text:
            content.innerHTML
    };

}


/* ======================================================
   SCHEDULE SESSION SAVE
====================================================== */

function scheduleSave() {

    if (
        isHomeOpen ||
        suppressResizeSave ||
        !currentSession
    ) {
        return;
    }


    clearTimeout(
        saveTimer
    );


    saveTimer =
        setTimeout(
            function() {

                saveSession();

            },
            150
        );

}


/* ======================================================
   SAVE SESSION
====================================================== */

function saveSession() {

    if (
        isHomeOpen ||
        suppressResizeSave ||
        !currentSession
    ) {
        return;
    }


    updateSessionFromUI();


    if (isSaving) {

        pendingSave = true;

        return;

    }


    isSaving = true;


    const sessionToSave = {
        ...currentSession
    };


    chrome.storage.local.set(
        {
            currentSession:
                sessionToSave
        },
        function() {

            isSaving = false;


            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Sticky save error:",
                    chrome.runtime.lastError.message
                );

            }


            if (pendingSave) {

                pendingSave = false;

                saveSession();

            }

        }
    );

}


/* ======================================================
   GEOMETRY SAVE
====================================================== */

function updateGeometryFromUI() {

    stickyGeometry = {

        x:
            Math.round(
                box.offsetLeft
            ),

        y:
            Math.round(
                box.offsetTop
            ),

        width:
            Math.round(
                box.offsetWidth
            ),

        height:
            Math.round(
                box.offsetHeight
            )

    };

}


/* ======================================================
   SCHEDULE GEOMETRY SAVE
====================================================== */

function scheduleGeometrySave() {

    if (
        isHomeOpen ||
        suppressResizeSave
    ) {
        return;
    }


    clearTimeout(
        geometrySaveTimer
    );


    geometrySaveTimer =
        setTimeout(
            function() {

                saveGeometry();

            },
            100
        );

}


/* ======================================================
   SAVE GEOMETRY
====================================================== */

function saveGeometry() {

    if (
        isHomeOpen ||
        suppressResizeSave
    ) {
        return;
    }


    updateGeometryFromUI();


    if (isGeometrySaving) {

        pendingGeometrySave = true;

        return;

    }


    isGeometrySaving = true;


    const geometryToSave = {
        ...stickyGeometry
    };


    chrome.storage.local.set(
        {
            stickyGeometry:
                geometryToSave
        },
        function() {

            isGeometrySaving = false;


            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Sticky geometry save error:",
                    chrome.runtime.lastError.message
                );

            }


            if (pendingGeometrySave) {

                pendingGeometrySave = false;

                saveGeometry();

            }

        }
    );

}


/* ======================================================
   MENU
====================================================== */

menuButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();


        if (isHomeOpen) {
            return;
        }


        if (
            settingsView.classList.contains(
                "show"
            )
        ) {

            closeSettings();

            return;

        }


        menu.classList.toggle(
            "show"
        );


        menuButton.classList.toggle(
            "active",
            menu.classList.contains(
                "show"
            )
        );

    },
    true
);


function closeMenu() {

    menu.classList.remove(
        "show"
    );


    menuButton.classList.remove(
        "active"
    );

}


document.addEventListener(
    "pointerdown",
    function(event) {

        if (
            !menu.contains(
                event.target
            ) &&
            event.target !== menuButton
        ) {

            closeMenu();

        }

    }
);


/* ======================================================
   SETTINGS
====================================================== */

settingsButton.addEventListener(
    "click",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        closeMenu();

        openSettings();

    },
    true
);


function openSettings() {

    if (isHomeOpen) {

        closeHome();

    }


    closeMenu();


    noteView.classList.add(
        "hide"
    );


    settingsView.classList.add(
        "show"
    );


    box.classList.add(
        "settings-open"
    );

}


function closeSettings() {

    settingsView.classList.remove(
        "show"
    );


    noteView.classList.remove(
        "hide"
    );


    box.classList.remove(
        "settings-open"
    );

}


settingsClose.addEventListener(
    "click",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        closeSettings();

    },
    true
);


/* ======================================================
   CLOSE STICKY
====================================================== */

closeStickyButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();


        closeMenu();
        closeSettings();


        chrome.storage.local.set({
            isOpen: false
        });

    },
    true
);


/* ======================================================
   NEW SESSION
====================================================== */

newSessionButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();


        createNewSession();

    },
    true
);


homeNewSession.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();


        createNewSession();

    },
    true
);


/* ======================================================
   CREATE NEW SESSION
====================================================== */

function createNewSession() {

    /*
        Save the current session's latest content
        before moving it into previous sessions.
    */

    updateSessionFromUI();


    const oldSession =
        currentSession
            ? {
                ...currentSession
            }
            : null;


    const newSession =
        createDefaultSession();


    const updatedSessions =
        sessions.slice();


    if (oldSession) {

        updatedSessions.push(
            oldSession
        );

    }


    currentSession =
        newSession;


    sessions =
        updatedSessions;


    suppressResizeSave = true;


    chrome.storage.local.set(
        {
            currentSession:
                newSession,

            sessions:
                updatedSessions,

            isOpen:
                true
        },
        function() {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Sticky new-session error:",
                    chrome.runtime.lastError.message
                );

            }


            titleInput.value =
                "";


            content.innerHTML =
    "";


            /*
                Keep the current Sticky size and
                position. New sessions do NOT
                reset the window dimensions.
            */

            applyGeometry();


            closeMenu();
            closeHome();
            closeSettings();


            suppressResizeSave =
                false;

        }
    );

}


/* ======================================================
   HOME / SESSIONS
====================================================== */

homeButton.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();


        if (isHomeOpen) {

            closeHome();

        } else {

            openHome();

        }

    },
    true
);


homeClose.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        closeHome();

    },
    true
);


overlay.addEventListener(
    "pointerdown",
    function(event) {

        event.preventDefault();
        event.stopPropagation();

        closeHome();

    }
);


/* ======================================================
   OPEN HOME
====================================================== */

function openHome() {

    if (isHomeOpen) {
        return;
    }


    closeMenu();
    closeSettings();


    /*
        Make absolutely sure the latest title
        and note content are saved first.
    */

    updateSessionFromUI();


    if (currentSession) {

        const sessionToSave = {
            ...currentSession
        };


        chrome.storage.local.set({
            currentSession:
                sessionToSave
        });

    }


    const rect =
        box.getBoundingClientRect();


    homeGeometry = {

        left:
            rect.left,

        top:
            rect.top,

        width:
            rect.width,

        height:
            rect.height

    };


    isHomeOpen = true;

    suppressResizeSave = true;


    renderSessions();


    box.style.left =
        rect.left + "px";


    box.style.top =
        rect.top + "px";


    box.style.width =
        rect.width + "px";


    box.style.height =
        rect.height + "px";


    box.style.transform =
        "none";


    overlay.classList.add(
        "show"
    );


    void box.offsetWidth;


    box.classList.add(
        "home-open"
    );


    homeView.classList.add(
        "show"
    );


    noteView.classList.add(
        "hide"
    );


    requestAnimationFrame(
        function() {

            requestAnimationFrame(
                function() {

                    box.style.left =
                        "50%";


                    box.style.top =
                        "50%";


                    box.style.width =
                        Math.min(
                            900,
                            Math.max(
                                220,
                                window.innerWidth - 80
                            )
                        ) + "px";


                    box.style.height =
                        Math.min(
                            680,
                            Math.max(
                                180,
                                window.innerHeight - 80
                            )
                        ) + "px";


                    box.style.transform =
                        "translate(-50%, -50%)";

                }
            );

        }
    );

}


/* ======================================================
   CLOSE HOME
====================================================== */

function closeHome() {

    if (!isHomeOpen) {
        return;
    }


    suppressResizeSave = true;


    const rect =
        box.getBoundingClientRect();


    box.style.left =
        rect.left + "px";


    box.style.top =
        rect.top + "px";


    box.style.width =
        rect.width + "px";


    box.style.height =
        rect.height + "px";


    box.style.transform =
        "none";


    homeView.classList.remove(
        "show"
    );


    noteView.classList.remove(
        "hide"
    );


    void box.offsetWidth;


    box.classList.remove(
        "home-open"
    );


    overlay.classList.remove(
        "show"
    );


    requestAnimationFrame(
        function() {

            if (!homeGeometry) {

                isHomeOpen = false;

                suppressResizeSave = false;

                applyGeometry();

                return;

            }


            box.style.left =
                homeGeometry.left + "px";


            box.style.top =
                homeGeometry.top + "px";


            box.style.width =
                homeGeometry.width + "px";


            box.style.height =
                homeGeometry.height + "px";


            box.style.transform =
                "none";


            setTimeout(
                function() {

                    isHomeOpen = false;

                    suppressResizeSave =
                        false;


                    applyGeometry();


                    if (currentSession) {

                        titleInput.value =
                            currentSession.name ||
                            "";


                        content.innerHTML =
    currentSession.text ||
    "";

                    }

                },
                500
            );

        }
    );

}


/* ======================================================
   RENDER SESSIONS
====================================================== */

function renderSessions() {

    sessionList.innerHTML = "";


    /*
        The current session is shown first,
        followed by previous sessions.

        There is no separate CURRENT section.
    */

    if (currentSession) {

        const currentCard =
            createSessionCard(
                currentSession,
                true
            );


        sessionList.appendChild(
            currentCard
        );

    }


    const reversed =
        [...sessions].reverse();


    reversed.forEach(
        function(session) {

            const card =
                createSessionCard(
                    session,
                    false
                );


            sessionList.appendChild(
                card
            );

        }
    );


    if (
        !currentSession &&
        sessions.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "sessions-empty";


        empty.textContent =
            "No sessions";


        sessionList.appendChild(
            empty
        );

    }

}


/* ======================================================
   SESSION CARD
====================================================== */

function createSessionCard(
    session,
    isCurrent
) {

    const card =
        document.createElement(
            "button"
        );


    card.type =
        "button";


    card.className =
        "session-card";


    if (isCurrent) {

        card.classList.add(
            "current-card"
        );

    }


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "session-name";


    title.textContent =
        session.name ||
        "Untitled";


    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "session-preview";


    preview.textContent =
        getPreview(session);


    card.appendChild(
        title
    );


    card.appendChild(
        preview
    );


    if (isCurrent) {

        const currentLabel =
            document.createElement(
                "div"
            );


        currentLabel.className =
            "session-current-label";


        currentLabel.textContent =
            "CURRENT";


        card.appendChild(
            currentLabel
        );


        /*
            The current session is displayed
            but clicking it does nothing.
        */

        card.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

            },
            true
        );

    } else {

        card.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();
                event.stopPropagation();


                selectSession(
                    session.id
                );

            },
            true
        );

    }


    return card;

}


/* ======================================================
   SESSION PREVIEW
====================================================== */

function getPreview(session) {

    const text =
        (session.text || "")
            .replace(/\s+/g, " ")
            .trim();


    if (!text) {

        return "Empty note";

    }


    if (text.length > 90) {

        return (
            text.substring(0, 90) +
            "..."
        );

    }


    return text;

}


/* ======================================================
   SELECT SESSION
====================================================== */

function selectSession(id) {

    const selected =
        sessions.find(
            function(session) {

                return session.id === id;

            }
        );


    if (!selected) {
        return;
    }


    /*
        Save the current session's latest
        title/content before switching.
    */

    updateSessionFromUI();


    const oldCurrent =
        currentSession
            ? {
                ...currentSession
            }
            : null;


    const remaining =
        sessions.filter(
            function(session) {

                return session.id !== id;

            }
        );


    if (oldCurrent) {

        remaining.push(
            oldCurrent
        );

    }


    const selectedCopy = {
        ...selected
    };


    currentSession =
        selectedCopy;


    sessions =
        remaining;


    suppressResizeSave = true;


    chrome.storage.local.set(
        {
            currentSession:
                selectedCopy,

            sessions:
                remaining,

            isOpen:
                true
        },
        function() {

            if (
                chrome.runtime.lastError
            ) {

                console.error(
                    "Sticky session selection error:",
                    chrome.runtime.lastError.message
                );

            }


            /*
                IMPORTANT:
                Only the content/title changes.

                Position and size stay exactly
                where the Sticky currently is.
            */

            titleInput.value =
                selectedCopy.name ||
                "";


            content.innerHTML =
    selectedCopy.text ||
    "";


            applyGeometry();


            closeHome();


            suppressResizeSave =
                false;

        }
    );

}


/* ======================================================
   THEMES
====================================================== */

const themeButtons =
    document.querySelectorAll(
        ".theme-option"
    );


themeButtons.forEach(
    function(button) {

        button.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();
                event.stopPropagation();


                const theme =
                    button.dataset.theme;


                setTheme(
                    theme
                );


                chrome.storage.local.set({
                    stickyTheme:
                        theme
                });

            },
            true
        );

    }
);


function setTheme(theme) {

    const validThemes = [
        "clay",
        "monochrome",
        "contrast",
        "forest",
        "paper"
    ];


    if (
        !validThemes.includes(theme)
    ) {

        theme =
            "monochrome";

    }


    box.dataset.theme =
        theme;


    themeButtons.forEach(
        function(button) {

            button.classList.toggle(
                "selected",
                button.dataset.theme === theme
            );

        }
    );

}