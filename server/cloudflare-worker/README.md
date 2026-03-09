# Cloudflare Worker Proxy for Radio Stream Player

This directory contains the Cloudflare Worker script required to run the universal streaming proxy for the Radio Stream Player.

## Why is this needed?

Modern web browsers enforce a "Mixed Content" security policy. This means if you host your Radio Stream Player securely over `https://` (like on GitHub Pages), the browser will block any audio streams that use insecure `http://`.

Since many independent and legacy internet radio stations still broadcast over HTTP, this breaks playback.

To solve this, we use a Cloudflare Worker as a secure middleman.

1.  **Audio Proxy (`/`)**: The player sends the `http://` stream URL to the worker. The worker fetches the insecure stream on the server side and securely pipes the raw audio data back to your browser over HTTPS.
2.  **Metadata Extraction (`/metadata`)**: The player polls this endpoint. The worker fetches the stream, extracts the ICY metadata (Track & Artist Name), and returns it as a clean JSON object, preventing the browser from glitching trying to play metadata as audio.

## Deployment Instructions

1.  Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigate to **Workers & Pages** -> **Overview**.
3.  Click **Create Application** -> **Create Worker**.
4.  Give your worker a name (e.g., `radio-proxy`) and click **Deploy**.
5.  Click **Edit Code**.
6.  Copy the entire contents of `worker.js` from this folder and paste it into the Cloudflare code editor, replacing the default code.
7.  **(Crucial Step)** In `worker.js`, locate the security check around Line 23:
    ```javascript
    const isAllowed = !requestDomain ||
        requestDomain === "localhost" ||
        requestDomain === "127.0.0.1" ||
        requestDomain.endsWith("YOUR_DOMAIN_HERE.com"); // EDIT THIS
    ```
    Change `djay.ca` to the domain where you are hosting your frontend player to prevent unauthorized sites from stealing your bandwidth.
8.  Click **Deploy** in the top right corner.
9.  Note your new Worker URL (e.g., `https://radio-proxy.your-username.workers.dev`).

## Connecting to the Frontend

Once deployed, you need to tell the frontend player to use your new proxy.

1.  Open `player.js` in your project root.
2.  Locate the `PROXY_URL` constant near the top of the file (around line 26):
    ```javascript
    const PROXY_URL = 'https://api.djay.ca/'; // REPLACE THIS WITH YOUR WORKER URL
    ```
    *Make sure the URL ends with a trailing slash!*
3.  Save the file, and your player will now automatically route HTTP traffic through your newly deployed proxy!

## Request Limits & Capacity Planning (Cloudflare Free Tier)

Cloudflare's **Free Tier** allows for **100,000 requests per day**. It's important to understand how this player utilizes these requests to estimate your maximum concurrent user capacity.

**How Requests Are Triggered:**
When a user listens to a station, requests are made in two ways:
1.  **Audio Stream (1 Request):** The initial connection to the `/` proxy endpoint consumes exactly **1 request**. Because it is a continuous streaming connection, it stays open and does not generate additional requests, regardless of how long they listen.
2.  **Metadata Polling (Multiple Requests):** To display live track information, the frontend polls the `/metadata` endpoint every **12 seconds**.

**Usage Math per User:**
*   1 User listening for 1 Minute = 1 (Audio) + 5 (Metadata) = **6 Requests**
*   1 User listening for 1 Hour = 60 mins / 12 secs = 300 Metadata requests. Total = **301 Requests / Hour**.

**Capacity Estimation:**
With a limit of 100,000 requests per day:
*   Maximum total listening hours per day: `100,000 / 301` ≈ **332 Hours**
*   **Scenario A:** If your average user listens for 3 hours a day, you can support roughly **~110 daily active users**.
*   **Scenario B:** If your average user listens for 1 hour a day, you can support roughly **~330 daily active users**.

**How to Optimize (Reduce Requests):**
If you are approaching the 100k daily limit, you can dramatically reduce request volume by adjusting the frontend polling frequency.
1. Open `player.js` and `popout-script.js` in the project root.
2. Locate the `setInterval` function inside the `updateNowPlaying()` logic.
3. Change the interval time from `12000` (12 seconds) to a larger number, such as `30000` (30 seconds) or `60000` (1 minute).
*Example: Changing it to 60 seconds drops the metadata requests from 300/hr to 60/hr. This increases your free tier capacity by 5x!*

*Note: If your application grows beyond these limits, you can easily upgrade to Cloudflare Workers Paid ($5/month for 10 million requests).*
