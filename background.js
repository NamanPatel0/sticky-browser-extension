async function toggleSticky() {
    try {
        const data = await chrome.storage.local.get(["isOpen"]);
        await chrome.storage.local.set({ isOpen: !data.isOpen });
    } catch (err) {
        console.error("Sticky toggle error:", err);
    }
}

chrome.action.onClicked.addListener(() => {
    toggleSticky();
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-sticky") {
        toggleSticky();
    }
});

/* ======================================================
   CONVERT EXTERNAL IMAGES TO DATA URLs (BYPASSES CSP/CORS)
====================================================== */
const imageCache = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "FETCH_IMAGE_AS_DATA_URL" && message.url) {
        const targetUrl = message.url;

        if (imageCache.has(targetUrl)) {
            sendResponse({ success: true, dataUrl: imageCache.get(targetUrl) });
            return false;
        }

        fetch(targetUrl)
            .then(response => {
                if (!response.ok) throw new Error("HTTP " + response.status);
                const contentType = response.headers.get("content-type") || "image/png";
                return response.arrayBuffer().then(buffer => ({ buffer, contentType }));
            })
            .then(({ buffer, contentType }) => {
                const bytes = new Uint8Array(buffer);
                let binary = "";
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    const chunk = bytes.subarray(i, i + chunkSize);
                    binary += String.fromCharCode.apply(null, chunk);
                }
                const base64 = btoa(binary);
                const dataUrl = `data:${contentType};base64,${base64}`;

                if (imageCache.size > 100) {
                    const firstKey = imageCache.keys().next().value;
                    imageCache.delete(firstKey);
                }
                imageCache.set(targetUrl, dataUrl);

                sendResponse({ success: true, dataUrl });
            })
            .catch(error => {
                console.error("Image conversion error:", error);
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});