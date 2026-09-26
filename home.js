function loadSessions() {

    chrome.storage.local.get(
        ["currentSession", "sessions"],
        function(data) {

            const current = data.currentSession;
            const sessions = data.sessions || [];

            const currentContainer =
                document.getElementById("current-session");

            const sessionsContainer =
                document.getElementById("sessions");


            // Current session

            currentContainer.innerHTML = "";

            if (current) {

                const card = createSessionCard(current);

                currentContainer.appendChild(card);

            }


            // Previous sessions

            sessionsContainer.innerHTML = "";

            if (sessions.length === 0) {

                sessionsContainer.textContent =
                    "No previous sessions.";

                return;
            }


            sessions.forEach(function(session) {

                const card = createSessionCard(session);

                sessionsContainer.appendChild(card);

            });

        }
    );
}


function createSessionCard(session) {

    const card = document.createElement("div");

    card.className = "session-card";

    const name = document.createElement("div");

    name.className = "session-name";

    name.textContent = session.name;


    const preview = document.createElement("div");

    preview.className = "session-preview";

    preview.textContent =
        session.text || "Empty session";


    card.appendChild(name);

    card.appendChild(preview);


    // Load this session

    card.addEventListener("click", function() {

        chrome.storage.local.set({

            currentSession: session

        });

    });


    return card;
}


// New session

document.getElementById("new-session")
    .addEventListener("click", function() {

        chrome.storage.local.get(
            ["currentSession", "sessions"],
            function(data) {

                const current = data.currentSession;

                const sessions = data.sessions || [];


                if (current) {

                    sessions.push(current);

                }


                const newSession = {

                    id: Date.now().toString(),

                    name: "Untitled",

                    text: "",

                    image: "",

                    x: 100,

                    y: 100,

                    width: 300,

                    height: 200

                };


                chrome.storage.local.set({

                    currentSession: newSession,

                    sessions: sessions

                });


                loadSessions();

            }
        );

    });


loadSessions();