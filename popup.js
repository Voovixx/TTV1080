const optionsButton = document.getElementById('options-button'); // Re-added
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');

let messages = {};

async function fetchMessages(lang) {
    const response = await fetch(`/_locales/${lang}/messages.json`);
    const json = await response.json();
    messages = json;
}

function translate(key) {
    if (messages[key]) {
        return messages[key].message;
    }
    return key;
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function updateStatus() {
    chrome.storage.sync.get('proxy', (syncData) => { // Get proxy from sync
        chrome.storage.local.get(['extensionStatus', 'twitchDetected'], (localData) => { // Get status from local
            const proxyHost = syncData.proxy ? syncData.proxy.host : '';
            const proxyPort = syncData.proxy ? syncData.proxy.port : '';

            if (!proxyHost || !proxyPort) {
                statusIcon.src = 'icons/icon32.png'; // Use colored Twitch icon
                statusText.textContent = translate('proxyNotConfigured'); // Set the message
                return; // Exit the function
            }

            // Original logic for when proxy is configured
            const extensionStatus = localData.extensionStatus || 'disabled';
            const twitchDetected = localData.twitchDetected || false;

            let statusKey = '';
            let icon = 'icons/icon32_bw.png'; // Default to grayscale

            if (extensionStatus === 'enabled') {
                if (twitchDetected) {
                    statusKey = 'statusEnabledTwitchDetected';
                    icon = 'icons/icon32.png'; // Colored icon if Twitch detected
                } else {
                    statusKey = 'statusEnabledTwitchNotDetected';
                    icon = 'icons/icon32.png'; // Colored icon even if Twitch not detected, but enabled
                }
            } else {
                statusKey = 'statusDisabled';
                // icon remains 'icons/icon32_bw.png' (grayscale)
            }

            statusIcon.src = icon;
            statusText.textContent = translate(statusKey);
        });
    });
}



optionsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});

document.addEventListener('DOMContentLoaded', () => {
    const port = chrome.runtime.connect({ name: "popup" });
    port.onMessage.addListener((msg) => {
        if (msg.language) {
            fetchMessages(msg.language).then(() => {
                const elements = document.querySelectorAll('[data-i18n]');
                elements.forEach(element => {
                    const key = element.getAttribute('data-i18n');
                    element.textContent = translate(key);
                });
                updateStatus();
            });
        }
    });

    chrome.storage.sync.get('theme', (data) => {
        applyTheme('dark'); // Force dark theme
    });

    // Fetch initial language and then update status
    chrome.storage.sync.get('language', (data) => {
        const lang = data.language || 'en'; // Default to English
        fetchMessages(lang).then(() => {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                element.textContent = translate(key);
            });
            updateStatus(); // Call updateStatus after messages are loaded
        });
    });

    // Also update status when storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && (changes.extensionStatus || changes.twitchDetected)) {
            // Ensure messages are loaded before updating status
            chrome.storage.sync.get('language', (data) => {
                const lang = data.language || 'en';
                fetchMessages(lang).then(() => {
                    updateStatus();
                });
            });
        }
        if (area === 'sync' && changes.theme) {
            applyTheme('dark'); // Force dark theme
        }
    });
});