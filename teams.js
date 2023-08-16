import { images } from './assets.js';

// https://tools.thehuddle.com/nfl-depth-charts
// paste into excel
// export as csv
// run through this logic

// Example usage
var teams;
export async function getTeams(callback) {
    if (teams) {
        callback(teams);
    } else {
        const csvData = await fetchCSVFile();
        if (csvData) {
            // Process the CSV data
            const parsedCsv = parseCsv(csvData);
            const result = transformToDesiredFormat(parsedCsv);
            console.log(result);
            callback(result.teams);
        }
    }
}

// Function to fetch the CSV data from the external file
async function fetchCSVFile() {
    try {
        const response = await fetch('data.csv'); // Change the filename if necessary
        const csvData = await response.text();
        return csvData;
    } catch (error) {
        console.error('Error fetching CSV file:', error);
        return null;
    }
}

function parseCsv(csv) {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    
    const data = [];
    let currentTeam = "";
  
    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(",");
        const obj = {};
        
        // If the current line has a team, update the current team
        if (currentLine[0]) {
            currentTeam = currentLine[0];
        }
        
        obj[headers[0]] = currentTeam;
        for (let j = 1; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }
        data.push(obj);
    }
    
    return data;
}

function transformToDesiredFormat(csvData) {
    const result = { teams: {} };
    
    csvData.forEach(row => {
        let teamName = row.Team;
        if (!images[teamName]) {
            console.log(teamName + " is missing from images");
        }
        let imgBgUrl = images[teamName].imgBgUrl;
        let imgLogoUrl = images[teamName].imgLogoUrl;
        if (!result.teams[row.Team]) {
            result.teams[row.Team] = {
                "Quarterbacks": [],
                "Running Backs": [],
                "Wide Receivers": [],
                "Tight Ends": [],
                "Kickers": [],
                "imgBgUrl": imgBgUrl,
                "imgLogoUrl": imgLogoUrl,
            };
        }

        for (let position in result.teams[row.Team]) {
            if (row[position] && row[position].trim()) {
                result.teams[row.Team][position].push(row[position].trim());
            }
        }
    });

    return result;
}
