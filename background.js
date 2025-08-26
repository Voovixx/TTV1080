async function updateIcon(status, onTwitch = false) {
  if (status === 'enabled' && onTwitch) {
    await chrome.action.setIcon({
      path: {
        '16': 'icons/icon16.png',
        '32': 'icons/icon32.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png'
      }
    });
    await chrome.action.setBadgeText({ text: '' });
    await chrome.action.setTitle({ title: 'TTV1080: Активно - 1080p доступен на Twitch' });
  } else {
    try {
      await chrome.action.setIcon({
        path: {
          '16': 'icons/icon16_bw.png',
          '32': 'icons/icon32_bw.png',
          '48': 'icons/icon48_bw.png',
          '128': 'icons/icon128_bw.png'
        }
      });
      await chrome.action.setBadgeText({ text: '' });
    } catch (error) {
      
      await chrome.action.setIcon({
        path: {
          '16': 'icons/icon16.png',
          '32': 'icons/icon32.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png'
        }
      });
      await chrome.action.setBadgeText({ text: '●' });
      await chrome.action.setBadgeBackgroundColor({ color: '#999999' });
    }

    if (status === 'enabled' && !onTwitch) {
      await chrome.action.setTitle({ title: 'TTV1080: Готов - откройте Twitch для 1080p' });
    } else {
      await chrome.action.setTitle({ title: 'TTV1080: Неактивно' });
    }
  }
}

async function toggleSystem() {
  const { extensionStatus } = await chrome.storage.local.get({ extensionStatus: 'disabled' });
  const newStatus = extensionStatus === 'enabled' ? 'disabled' : 'enabled';

  await chrome.storage.local.set({ extensionStatus: newStatus });
  await applySystem();

  
}

async function applySystem() {
  const { extensionStatus } = await chrome.storage.local.get({ extensionStatus: 'disabled' });
  const { proxy } = await chrome.storage.sync.get('proxy');

  if (extensionStatus === 'disabled' || !proxy || !proxy.host || !proxy.port) {
    
    await chrome.proxy.settings.clear({ scope: 'regular' });
    const tabs = await chrome.tabs.query({});
    const twitchTabs = tabs.filter(tab =>
      tab.url && (
        tab.url.includes('twitch.tv') ||
        tab.url.includes('usher.ttvnw.net') ||
        tab.url.includes('www.twitch.tv') ||
        tab.url.includes('m.twitch.tv') ||
        tab.url.includes('player.twitch.tv')
      )
    );
    await updateIcon('disabled', twitchTabs.length > 0);
    return;
  }

  

  const pacScript = `
    function FindProxyForURL(url, host) {
      if (host == 'usher.ttvnw.net') {
        return '${proxy.scheme.toUpperCase()} ${proxy.host}:${proxy.port}';
      }
      return 'DIRECT';
    }
  `;

  const config = {
    mode: 'pac_script',
    pacScript: { data: pacScript }
  };

  await chrome.proxy.settings.set({ value: config, scope: 'regular' });
  const tabs = await chrome.tabs.query({});
  const twitchTabs = tabs.filter(tab =>
    tab.url && (
      tab.url.includes('twitch.tv') ||
      tab.url.includes('usher.ttvnw.net') ||
      tab.url.includes('www.twitch.tv') ||
      tab.url.includes('m.twitch.tv') ||
      tab.url.includes('player.twitch.tv')
    )
  );
  await updateIcon('enabled', twitchTabs.length > 0);
  
}

async function checkTwitchTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const twitchTabs = tabs.filter(tab =>
      tab.url && (
        tab.url.includes('twitch.tv') ||
        tab.url.includes('usher.ttvnw.net') ||
        tab.url.includes('www.twitch.tv') ||
        tab.url.includes('m.twitch.tv') ||
        tab.url.includes('player.twitch.tv')
      )
    );
    const twitchDetected = twitchTabs.length > 0;
    await chrome.storage.local.set({ twitchDetected });

    const { extensionStatus } = await chrome.storage.local.get({ extensionStatus: 'disabled' });

    if (twitchDetected && extensionStatus === 'disabled') {
      
      await chrome.storage.local.set({ extensionStatus: 'enabled' });
      await applySystem();
    }

    if (!twitchDetected && extensionStatus === 'enabled') {
      
      await chrome.storage.local.set({ extensionStatus: 'disabled' });
      await applySystem();
    }

    await updateIcon(extensionStatus, twitchDetected);

  } catch (error) {
    
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.proxy) {
    
    applySystem();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  
  await chrome.storage.local.set({ extensionStatus: 'disabled', twitchDetected: false });
  await applySystem();
});

chrome.runtime.onStartup.addListener(async () => {
  
  await applySystem();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "applySystem") {
    applySystem();
  } else if (message.action === "toggleSystem") {
    toggleSystem();
  }
});

chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        chrome.storage.sync.get('language', (data) => {
            port.postMessage({ language: data.language });
        });
    }
});

setInterval(checkTwitchTabs, 2000);