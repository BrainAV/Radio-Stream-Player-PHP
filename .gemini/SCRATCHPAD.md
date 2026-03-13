
- can we show the stream bitrate when playing or in the admin or settings if there's space, or offer a color coded icon setting , roadmap idea
- CIDC only left side is showing in VU meter, is that mono ?
- compare localstore list with users db list and import one by one or all
- give logged in users ability to hide un-favorited system stations. (added favorites stay, system stations hide, another incentive to register user)    
- decide on payment system to remove ads, and get premium features
- build premium feature list
- radio station pages that are dynamic, and seo, with basic, logged in, and pro level features / benefits / access. 
- for recording, server space is no good, so it has to be done in browser level and saved that way, or we allow users (not the host) to connect their personal google account and cloud drive space and we route the recording to their cloud drive space somehow. 
- admin dashboard, user management, add premium user toggle,b add site config tab, add api/admin/settings.php
- do radio streams offer song feeds like rss? Or are we extracting using chron to update the database song history when users are not listening. Set a standard low budget song history per station, per user, and admin/premium level listing.
- sharing dynamic routes for stations, countries, genres, and user profiles. 
- donations link / icon
- ✅ Eye icon to see password when logging in. (some old people need to see pw)

new-
- Browser Title could get some dynamic updates. Something like for what's Now Playing, Resesearch if home page should be dynamic titles for browser, or just the future dynamic station pages that get built out.
- remove padding from the banner ads and place them inside the player below all in it's own row before the bottom of the player

- If page get refreshed, player forgets and defaults back to 1st station in list to play. Like set play state in the local memory and if the page gets reloaded, it should resume where it left off.    




- ETN.FM  stream dropped or wouldn't load for a moment. I wasn't sure if it was our end or their server, as the player didn't tell me why it couldn't connect. (not sure if I want to keep re-trying to connect in case the radio server was just having a moment)

Console logs:'''api.djay.ca/?url=https%3A%2F%2Fstream.pcradio.ru%2Fetnfm_trance-hi:1  Failed to load resource: the server responded with a status of 502 ()
player.js:247 Stream dropped. Attempting to reconnect in 3 seconds...
player.js:43 Playback failed: NotSupportedError: Failed to load because no supported source was found.
(anonymous) @ player.js:43
api.djay.ca/?url=https%3A%2F%2Fstream.pcradio.ru%2Fetnfm_trance-hi:1  Failed to load resource: the server responded with a status of 502 ()
player.js:247 Stream dropped. Attempting to reconnect in 3 seconds...
player.js:80 Playback failed: NotSupportedError: Failed to load because no supported source was found.
(anonymous) @ player.js:80
api.djay.ca/?url=https%3A%2F%2Fstream.pcradio.ru%2Fetnfm_trance-hi:1  Failed to load resource: the server responded with a status of 404 ()
player.js:247 Stream dropped. Attempting to reconnect in 3 seconds...
player.js:80 Playback failed: NotSupportedError: Failed to load because no supported source was found.
(anonymous) @ player.js:80
'''