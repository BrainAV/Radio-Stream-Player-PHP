export default {
    /**
     * @param {Request} request
     * @param {Env} env
     * @param {ExecutionContext} ctx
     */
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // 1. Security: Check Origin / Referer to restrict access
        const origin = request.headers.get("Origin");
        const referer = request.headers.get("Referer");

        // Determine the requesting domain
        let requestDomain = null;
        if (origin) {
            try { requestDomain = new URL(origin).hostname; } catch (e) { }
        } else if (referer) {
            try { requestDomain = new URL(referer).hostname; } catch (e) { }
        }

        // Allow localhost for dev, and any djay.ca subdomain
        const isAllowed = !requestDomain ||
            requestDomain === "localhost" ||
            requestDomain === "127.0.0.1" ||
            requestDomain.endsWith("djay.ca");

        if (!isAllowed) {
            return new Response("Forbidden: Access restricted to djay.ca domains.", { status: 403 });
        }

        // We echo back the allowed origin for CORS, or default to radio.djay.ca if missing
        const corsOrigin = origin || "http://radio.djay.ca";

        // 2. Handle CORS Preflight Requests (OPTIONS)
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": corsOrigin,
                    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                    "Access-Control-Allow-Headers": "Icy-MetaData",
                    "Access-Control-Max-Age": "86400",
                }
            });
        }

        // 2. Extract the target 'url' query parameter
        const targetUrlStr = url.searchParams.get('url');

        if (!targetUrlStr) {
            return new Response("Missing 'url' query parameter", { status: 400 });
        }

        let targetUrl;
        try {
            targetUrl = new URL(targetUrlStr);
        } catch (e) {
            return new Response("Invalid 'url' query parameter", { status: 400 });
        }

        // 2b. Check if this is a request for metadata
        const isMetadataRequest = url.pathname === '/metadata';

        // 3. Prevent infinite loops (don't let the worker proxy itself)
        if (targetUrl.hostname === url.hostname) {
            return new Response("Cannot proxy requests to yourself", { status: 400 });
        }

        // ==========================================
        // ROUTE: /metadata - Fetch and Parse ICY Data
        // ==========================================
        if (isMetadataRequest) {
            try {
                const metaHeaders = new Headers();
                metaHeaders.set('Icy-MetaData', '1');
                metaHeaders.set('User-Agent', 'VLC/3.0.18 LibVLC/3.0.18'); // Pretend to be VLC

                console.log(`Fetching metadata for: ${targetUrl.toString()}`);
                const response = await fetch(targetUrl, { headers: metaHeaders });

                const metaintStr = response.headers.get('icy-metaint');
                if (!metaintStr) {
                    return new Response(JSON.stringify({ error: "Stream does not support ICY metadata or missing icy-metaint header." }), {
                        status: 200, // Return 200 so frontend doesn't crash on poll, just handles the error gracefully
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": corsOrigin
                        }
                    });
                }

                const metaint = parseInt(metaintStr, 10);

                // Read the stream up to the first metadata block
                const reader = response.body.getReader();
                let bytesRead = 0;
                let metadataLengthByte = -1;
                let metadataBuffer = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    for (let i = 0; i < value.length; i++) {
                        if (bytesRead < metaint) {
                            // Still reading audio data before the metadata block, ignore it
                            bytesRead++;
                        } else if (metadataLengthByte === -1) {
                            // We hit the metadata length byte! 
                            // It indicates the length of the metadata block in 16-byte chunks (length * 16)
                            metadataLengthByte = value[i];
                            if (metadataLengthByte === 0) {
                                // Empty metadata block, reset counter to look for the next one
                                bytesRead = 0;
                                metadataLengthByte = -1;
                            }
                        } else {
                            // We are inside the metadata block, collect the text
                            metadataBuffer.push(value[i]);
                            if (metadataBuffer.length === metadataLengthByte * 16) {
                                // We've read the whole block! We can stop fetching.
                                reader.cancel();

                                // Convert bytes to string, remove trailing null characters (padding)
                                const textDecoder = new TextDecoder("utf-8");
                                const metadataStr = textDecoder.decode(new Uint8Array(metadataBuffer)).replace(/\0/g, '');

                                // Parse StreamTitle='My Song Name';
                                const titleMatch = metadataStr.match(/StreamTitle='([^']*)'/);
                                const title = titleMatch ? titleMatch[1] : null;

                                return new Response(JSON.stringify({
                                    raw: metadataStr,
                                    title: title,
                                    interval: metaint
                                }), {
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Access-Control-Allow-Origin": corsOrigin
                                    }
                                });
                            }
                        }
                    }
                }

                return new Response(JSON.stringify({ error: "Stream ended before metadata was found." }), {
                    status: 500,
                    headers: { "Access-Control-Allow-Origin": corsOrigin }
                });


            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": corsOrigin }
                });
            }
        }

        // ==========================================
        // ROUTE: / - Audio Proxy (No Metadata)
        // ==========================================

        // 4. Construct the fetch request to the actual radio stream
        const proxyRequestHeaders = new Headers(request.headers);

        // IMPORTANT: We must NOT ask for ICY metadata when proxying directly 
        // to an <audio> element. If we ask for it, the server injects metadata 
        // blocks into the audio stream. If the browser doesn't know how to parse 
        // them out, it plays the metadata as audio, causing glitching artifacts!
        // proxyRequestHeaders.set('Icy-MetaData', '1');

        // Note: Browsers will often send `Range` headers for audio, 
        // passing headers through generally helps playback
        const proxyRequest = new Request(targetUrl, {
            method: request.method,
            headers: proxyRequestHeaders,
            redirect: "follow",
        });

        console.log(`Proxying request to: ${targetUrl.toString()}`);

        try {
            // 5. Fetch the actual stream
            const response = await fetch(proxyRequest);

            // 6. Forward the response back to the client
            const body = response.body;

            // Prepare headers for the client
            const responseHeaders = new Headers(response.headers);

            // Add CORS headers so the browser allows the fetch from radio.djay.ca
            responseHeaders.set("Access-Control-Allow-Origin", corsOrigin);
            responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

            // Expose ICY headers so the frontend can read them if it needs to
            responseHeaders.set("Access-Control-Expose-Headers", "icy-metaint, icy-name, icy-genre, icy-url, icy-br");

            return new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders
            });

        } catch (error) {
            console.error(`Error proxying fetch:`, error);
            return new Response(`Proxy Error: ${error.message}`, { status: 502 });
        }
    },
};
