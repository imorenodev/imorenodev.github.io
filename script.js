var playerColumn = document.getElementById("player-column");
var rankColumn1 = document.getElementById("rank-column-1");
var rankColumn2 = document.getElementById("rank-column-2");
var rankColumn3 = document.getElementById("rank-column-3");

var drake = dragula([
  playerColumn,
  rankColumn1,
  rankColumn2,
  rankColumn3
]);

// Handle drop event
drake.on("drop", function(el, target, source, sibling) {
  // no limit on number of players in player-column
  if (target.id === "player-column") { 
    target.appendChild(el);
    checkIfAllThreeZonesFilled();
    return;
  }

  // Check if the target column already has an item
  var targetItems = target.getElementsByClassName("player");

  for (let item of targetItems) {
    if (!item.classList.contains("gu-transit")) {
      source.appendChild(item);
    }
  }
  target.appendChild(el);

  checkIfAllThreeZonesFilled();
});

function checkIfAllThreeZonesFilled() {
  var rankColumns = [rankColumn1, rankColumn2, rankColumn3];

  $('#rank-column-submit').hide();

  for (let column in rankColumns) {
    let player = $(rankColumns[column]).find(".player");
    if (player.length <= 0) {
      return;
    }
  }
  $('#rank-column-submit').show();
}

// Add event listener for the reset button
$("#rank-column-restart").on("click", function() {
  var rankColumns = [rankColumn1, rankColumn2, rankColumn3];

  rankColumns.forEach(function(column) {
    $(column).find(".player").appendTo(playerColumn);
  });

  $('#rank-column-restart').hide();
  resetTimer();
});


var countdownElement = $("#countdown");

$("#rank-column-submit").click(function() {
  var success = true;
  // Loop through each rank column
  for (var i = 1; i <= 3; i++) {
    var column = $("#rank-column-" + i);
    var team = column.attr("data-team");
    var rank = column.attr("data-rank");

    // Find the matching player in the current rank column
    var matchingPlayer = column.find(".player[data-team='" + team + "'][data-rank='" + rank + "']");

    // Check if a matching player exists in the current rank column
    if (matchingPlayer.length === 0) {
      success = false;
      break; // Exit the loop early if a match is missing
    }
  }

  // Display the appropriate message
  if (success) {
    clearTimeout(countdownTimer); // Stop the countdown
    alert("Success!");
  } else {
    alert("Missing matching players in rank columns.");
  }
});

var countdownElement = $("#countdown");
var initialMinutes = 0.5; // Initial minutes for the countdown
var remainingTime = initialMinutes * 60; // Convert minutes to seconds
var countdownTimer; // Variable to store the timer

function updateCountdown() {
  var minutes = Math.floor(remainingTime / 60);
  var seconds = remainingTime % 60;

  // Format the remaining time as "mm:ss"
  var formattedTime = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  countdownElement.text(formattedTime);

  if (remainingTime > 0) {
    remainingTime--;
    countdownTimer = setTimeout(updateCountdown, 1000); // Update every second
  } else {
    countdownElement.text("Time's up!");
    $('#rank-column-restart').show();
    $('#rank-column-submit').hide();
  }
}
updateCountdown(); // Start the countdown when the page loads

function resetTimer() {
  clearTimeout(countdownTimer);
  remainingTime = initialMinutes * 60;
  updateCountdown();
}



// https://tools.thehuddle.com/nfl-depth-charts
// paste into excel
// export as csv
// run through this logic

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
        if (!result.teams[row.Team]) {
            result.teams[row.Team] = {
                "Quarterbacks": [],
                "Running Backs": [],
                "Wide Receivers": [],
                "Tight Ends": [],
                "Kickers": []
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

// Example usage
async function processData() {
    const csvData = await fetchCSVFile();
    if (csvData) {
        // Process the CSV data
        const parsedCsv = parseCsv(csvData);
        const result = transformToDesiredFormat(parsedCsv);
        console.log(result);
        initPlayers(result.teams);
    }
}

// Call the function to start fetching and processing the CSV data
processData();

function initPlayers(teams) {
  const teamNames = Object.keys(teams);
  const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
  const selectedTeam = teams[randomTeam];
  const wideReceivers = selectedTeam["Wide Receivers"].slice(0, 3);

  const remainingWideReceivers = [];
  while (remainingWideReceivers.length < 6) {
    const randomTeamName = teamNames[Math.floor(Math.random() * teamNames.length)];
    const randomTeamWideReceivers = teams[randomTeamName]["Wide Receivers"];

    if (randomTeamWideReceivers.length > 0) {
      const randomWideReceiver = randomTeamWideReceivers[Math.floor(Math.random() * randomTeamWideReceivers.length)];
      remainingWideReceivers.push(randomWideReceiver);
    }
  }

  const playerColumn = document.getElementById("player-column");

  [...wideReceivers, ...remainingWideReceivers].forEach((player, index) => {
    const div = document.createElement("div");
    div.classList.add("player");
    div.dataset.team = index < 3 ? randomTeam : teamNames[Math.floor(Math.random() * teamNames.length)];
    div.dataset.rank = index + 1;
    div.textContent = `#${index + 1} ${player}`;
    playerColumn.appendChild(div);
  });
}

