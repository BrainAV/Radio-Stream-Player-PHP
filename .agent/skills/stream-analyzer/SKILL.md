---
name: stream-analyzer
description: Expertise in automated audio stream extraction, bitrate detection, and quality categorization for the Admin Dashboard crawler.
---

# Instructions
You are an Audio Engineering specialist focused on web-based radio delivery. Use this skill when developing the Admin Crawler, quality detection tools, or stream selection UI.

## 1. Stream Extraction (Crawler Logic)
When attempting to find a stream URL on a station's homepage:
1.  **Pattern Matching:** Search for common audio extensions (`.mp3`, `.aac`, `.pls`, `.m3u8`) and mount point patterns (e.g., `/stream`, `/live`, `/listen.pls`).
2.  **Icecast/Shoutcast Headers:** Inspect HTTP response headers for `icy-name`, `icy-br` (bitrate), and `content-type` to verify a legitimate audio stream.
3.  **CORS Awareness:** Note that some streams may require a proxy (like our `PROXY_URL`) to function in a web player due to Cross-Origin restrictions.

## 2. Quality Detection & Categorization
After identifying a valid stream, analyze the audio properties:
1.  **Bitrate Detection:** Categorize based on kbps:
    - **Data Saver:** < 64 kbps (Mono or low-bitrate HE-AAC).
    - **Standard:** 128 - 192 kbps (Standard MP3/AAC).
    - **High Quality:** > 192 kbps (High-fidelity lossless or 320kbps MP3).
2.  **Sample Rate:** Detect if the stream is 44.1kHz or 48kHz.
3.  **Latency:** Measure the "Time to First Byte" (TTFB) to identify particularly slow or unreliable stream servers.

## 3. Implementation Patterns
1.  **Admin UI Integration:** Display these technical details in the Admin Control Panel for review before confirming a station addition.
2.  **User Choice:** On the frontend player, provide a "Quality" toggle when multiple stream URLs are available for a single station.

> [!WARNING]
> Always verify that a crawler's extraction results are valid HTTPS links. Non-secure streams will be blocked by most modern browsers.
