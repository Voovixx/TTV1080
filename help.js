function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

function applyTranslations() {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || 'en';

    document.documentElement.lang = lang;
    fetch(`/_locales/${lang}/messages.json`)
        .then(response => response.json())
        .then(messages => {
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (messages[key]) {
                    element.textContent = messages[key].message;
                }
            });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('theme', (data) => {
        applyTheme('dark'); // Force dark theme
    });
    applyTranslations();
});