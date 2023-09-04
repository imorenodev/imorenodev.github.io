var games;
export async function getGames() {
    if (games) {
        return games;
    } else {
        const gamesData = await fetchGamesFile();
        if (gamesData) {
            console.log(gamesData);
            games = gamesData.games; // cache result
            return games;
        }
        return null;
    }
}

// Function to fetch the JSON games data from the external file
async function fetchGamesFile() {
    try {
        const response = await fetch('games.json'); // Change the filename if necessary
        const gamesData = await response.json();
        return gamesData;
    } catch (error) {
        console.error('Error fetching games data file:', error);
        return null;
    }
}

export function addNewGame(game) {
    games.push(game);
}