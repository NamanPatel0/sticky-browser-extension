chrome.action.onClicked.addListener(function() {

    chrome.storage.local.get(["isOpen"], function(data) {

        const newState = !data.isOpen;

        chrome.storage.local.set({
            isOpen: newState
        });

    });

});