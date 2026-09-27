function toggleSticky() {

    chrome.storage.local.get(
        ["isOpen"],
        function(data) {

            const newState =
                !data.isOpen;

            chrome.storage.local.set({
                isOpen: newState
            });

        }
    );

}


chrome.action.onClicked.addListener(
    function() {

        toggleSticky();

    }
);


chrome.commands.onCommand.addListener(
    function(command) {

        if (
            command ===
            "toggle-sticky"
        ) {

            toggleSticky();

        }

    }
);