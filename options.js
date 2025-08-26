const scheme = document.getElementById('proxy-scheme');
const host = document.getElementById('proxy-host');
const port = document.getElementById('proxy-port');
const saveButton = document.getElementById('save');
const status = document.getElementById('status');
const langSelect = document.getElementById('language-select');
const helpLink = document.querySelector('.help-section a');
const generateCurlButton = document.getElementById('generate-curl');
const curlCommand = document.getElementById('curl-command');
const copyCurlButton = document.getElementById('copy-curl');
const curlInstructions = document.querySelector('[data-i18n="curlInstructions"]');

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

async function applyTranslations() {
    const lang = langSelect.value;
    document.documentElement.lang = lang;
    await fetchMessages(lang);
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key === 'curlInstructions') {
            element.innerHTML = translate(key);
        } else {
            element.textContent = translate(key);
        }
    });
    // Translate buttons specifically
    generateCurlButton.textContent = translate('generateCurlButton');
    copyCurlButton.textContent = translate('copyCurlButton');
    saveButton.textContent = translate('saveButton');
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

saveButton.addEventListener('click', () => {
  const proxySettings = {
    scheme: scheme.value,
    host: host.value,
    port: parseInt(port.value, 10),
  };

  const storageArea = chrome.storage.sync;

    storageArea.set({ proxy: proxySettings }, () => {
    status.textContent = translate('statusSaved');
    status.style.color = '#42b72a';
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  });
});

generateCurlButton.addEventListener('click', () => {
    const proxyScheme = scheme.value;
    const proxyHost = host.value;
    const proxyPort = port.value;

    if (!proxyHost || !proxyPort) {
        status.textContent = 'Please fill in proxy host and port';
        status.style.color = '#fa3e3e';
        return;
    }

    const command = `curl -x ${proxyScheme}://${proxyHost}:${proxyPort} -I http://example.com`;
    curlCommand.value = command;
});

copyCurlButton.addEventListener('click', () => {
    curlCommand.select();
    document.execCommand('copy');
    status.textContent = 'Copied to clipboard';
    status.style.color = '#42b72a';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
});

langSelect.addEventListener('change', () => {
    const lang = langSelect.value;
    chrome.storage.sync.set({ language: lang }, () => {
        applyTranslations();
    });
});



helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    const lang = langSelect.value;
    const url = `help.html?lang=${lang}`;
    window.open(url, '_blank');
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['proxy', 'language'], (data) => {
    if (data.proxy) {
      scheme.value = data.proxy.scheme || 'socks5';
      host.value = data.proxy.host || '';
      port.value = data.proxy.port || '';
    }
    if (data.language) {
        langSelect.value = data.language;
    }
    applyTheme('dark'); // Apply dark theme
    applyTranslations();
  });
});