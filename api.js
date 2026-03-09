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
