- compare localstore list with users db list and import one by one or all
- give logged in users ability to hide un-favorited system stations. (added favorites stay, system stations hide, another incentive to register user)    
- decide on payment system to remove ads, and get premium features
- build premium feature list
- radio station pages that are dynamic, and seo, with basic, logged in, and pro level features / benefits / access. 
- for recording, server space is no good, so it has to be done in browser level and saved that way, or we allow users (not the host) to connect their personal google account and cloud drive space and we route the recording to their cloud drive space somehow. 
- do radio streams offer song feeds like rss? Or are we extracting using chron to update the database song history when users are not listening. Set a standard low budget song history per station, per user, and admin/premium level listing.
- sharing dynamic routes for stations, countries, genres, and user profiles. 
- If page get refreshed, player forgets and defaults back to 1st station in list to play. Like set play state in the local memory and if the page gets reloaded, it should resume where it left off.    

Manage My Collection
- If a user edits a "Manage My Collection" station. Does that station edit for only that user, or is this a global station upate? Could be a security issue if the global station link or details are updated by a user... just forward thinking of when we create drynamic pages for stations that are shared for all users. 

new - 3/19/2026 - Adsense isn't loading on mobile test pages. I think the adsense area being displayed is smaller than the ads being delivered. Need to consider Mobile ad sizes. Also I want to know if Adsense allows you to reload the ad spaced after a certain amount of time, or would I need to come up with a different strategy for ads to refresh, or build out with dynamic radio station pages. 

- console errors I checked after the stream stops (could be time to change away from the api on cloudflare):
[PWA] Service Worker registered ServiceWorkerRegistration
api.djay.ca/metadata?url=https%3A%2F%2Fstream1-technolovers.radiohost.de%2Fmelodic-house-techno:1  Failed to load resource: net::ERR_CONNECTION_CLOSED
player.js:579 Failed to fetch stream metadata: TypeError: Failed to fetch
    at fetchMetadata (player.js:538:36)
    at player.js:660:17
fetchMetadata @ player.js:579
api.djay.ca/?url=https%3A%2F%2Fstream1-technolovers.radiohost.de%2Fmelodic-house-techno:1  Failed to load resource: net::ERR_QUIC_PROTOCOL_ERROR

- <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">

Page refresh gives this:

index.html?ev=01_262:233 Uncaught TypeError: Cannot read properties of undefined (reading 'setRushSimulatedLocalEvents')
    at index.html?ev=01_262:233:562
(anonymous) @ index.html?ev=01_262:233

script.js:37 [PWA] Service Worker registered ServiceWorkerRegistration {installing: null, waiting: null, active: ServiceWorker, navigationPreload: NavigationPreloadManager, scope: 'https://radio.djay.ca/', …}

(index):1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
