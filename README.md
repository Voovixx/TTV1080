# TTV1080 - 1080p Unlocker (Configurable)

This is a modified version of the TTV1080 extension, which allows you to use your own proxy server to unlock 1080p quality on Twitch.

## How it works

The extension works by redirecting the traffic to Twitch's video playlist servers (`usher.ttvnw.net`) through a proxy server. This tricks Twitch into thinking that you are in a region where 1080p is available.

**Important:** Only the playlist files are proxied, not the video stream itself. This means that your connection to the video stream is still direct and not affected by the proxy.

## How to use

1.  Open the extension's options page.
2.  Enter your proxy server details (scheme, host, and port).
3.  Save the settings.
4.  The extension will automatically apply the proxy settings when you visit Twitch.

## How to test your proxy

Due to the limitations of the Manifest V3 platform, it is not possible to reliably test the proxy from the extension itself. However, you can manually test your proxy using the `curl` command in your terminal:

```
curl -x SCHEME://HOST:PORT -I https://usher.ttvnw.net/api/channel/hls/CHANNEL.m3u8
```

Replace `SCHEME`, `HOST`, `PORT`, and `CHANNEL` with your proxy details and a Twitch channel name. If the command returns a `HTTP/2 200` status code, it means that your proxy is working correctly.

## How to install

1.  Open Chrome and go to `chrome://extensions/`
2.  Enable "Developer mode" in the top right corner
3.  Click "Load unpacked"
4.  Select the `TTV1080` folder
5.  The extension will be installed
