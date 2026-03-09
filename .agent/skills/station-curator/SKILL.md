---
name: station-curator
description: Use this skill to validate radio stream URLs, enrich metadata, and format station objects for the Radio-Stream-Player JSON/JS config.
---

# Instructions
You are an expert in streaming media protocols and web-based radio players. Use this skill when the user wants to add new stations to their `Radio-Stream-Player` or fix existing ones.

## 1. Validation Process
When given a station name or URL:
1.  **Check Stream Health:** Verify if the `stream_url` is a direct audio link (e.g., Icecast, Shoutcast, or direct .mp3/.aac). 
2.  **Metadata Enrichment:** Find accurate and clean names, genres, and countries of origin for the station. 
3.  **Genre Mapping:** Categorize the station based on the project's existing categories (e.g., Lo-Fi, Jazz, Cyberpunk).

## 2. Output Format
Always return a valid JavaScript object matching the `stations.js` array schema used in the project.

**Project Schema:**
```javascript
{
  name: "Station Name",
  url: "https://example.com/stream",
  genre: "Genre Name",
  country: "Country Name"
}
```

> [!IMPORTANT]
> **Do not** invent new fields like `hash`, `logo`, `description`, or `social`. Stick strictly to the four fields above (`name`, `url`, `genre`, `country`) to prevent breaking the frontend player code.


## 3. Best Practices for Gemini
Silent Thinking: Before providing the code, check if the stream_url uses HTTPS. Browsers will block non-HTTPS streams in a web player due to Mixed Content policies.

Examples
User: "Add 'SomaFM Groove Salad' to my player."
Assistant: "I will use the station-curator skill to fetch the latest HTTPS stream for SomaFM and format it for your config..."