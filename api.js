export let stations = [];

// Fetch initial stations from the backend API
export async function fetchStations() {
    try {
        const response = await fetch('api/stations.php?type=default');
        const data = await response.json();
        if (data.status === 'success') {
            // clear array in place
            stations.length = 0;
            // push new items
            stations.push(...data.data);
        }
    } catch (error) {
        console.error("Error fetching stations from database:", error);
    }
    return stations;
}

// POST newly discovered stations back to the database for community indexing
export async function submitCustomStation(name, url, genre, country) {
    try {
        const response = await fetch('api/stations.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, url, genre, country })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error submitting custom station:", error);
        return { status: "error", message: "Network error." };
    }
}

// Fetch user-specific favorites from the DB
export async function fetchUserFavorites() {
    try {
        const response = await fetch('api/favorites.php');
        const data = await response.json();
        return data.status === 'success' ? data.data : [];
    } catch (error) {
        console.error("Error fetching favorites:", error);
        return [];
    }
}

// Add/Link a station to user favorites in the DB
export async function addFavorite(station) {
    try {
        const response = await fetch('api/favorites.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(station)
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding favorite:", error);
        return { status: "error" };
    }
}

// Remove a station from user favorites in the DB
export async function removeFavorite(url) {
    try {
        const response = await fetch('api/favorites.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        return await response.json();
    } catch (error) {
        console.error("Error removing favorite:", error);
        return { status: "error" };
    }
}

// Toggle the is_favorite flag for a station in the DB
export async function toggleFavorite(url, is_favorite) {
    try {
        const response = await fetch('api/favorites.php', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, is_favorite: is_favorite ? 1 : 0 })
        });
        return await response.json();
    } catch (error) {
        console.error("Error toggling favorite flag:", error);
        return { status: "error" };
    }
}
