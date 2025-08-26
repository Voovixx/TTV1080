chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'testProxy') {
        const { settings, testUrl } = message;

        const iframe = document.createElement('iframe');
        iframe.src = testUrl;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        let timeout = setTimeout(() => {
            sendResponse({ success: false, error: "Timeout" });
            document.body.removeChild(iframe);
        }, 5000);

        iframe.onload = () => {
            clearTimeout(timeout);
            sendResponse({ success: true });
            document.body.removeChild(iframe);
        };

        iframe.onerror = () => {
            clearTimeout(timeout);
            sendResponse({ success: false, error: "Failed to load" });
            document.body.removeChild(iframe);
        };
        return true; // Indicates that the response is sent asynchronously
    }
});