var playerColumn = document.getElementById("player-column");
var rankColumns = [
  document.getElementById("rank-column-1"),
  document.getElementById("rank-column-2"),
  document.getElementById("rank-column-3"),
  document.getElementById("rank-column-4")
];

var countdownElement = $("#countdown");

var drake = null;

function initDragContainers() {

  disableDragAndDrop();

  drake = dragula([
      playerColumn,
      ...rankColumns,
    ],   
    {
      invalid: function (el, handle) {
        return el.className != "player";
      }
    }
  );

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
}

function disableDragAndDrop() {
  if (drake) {
    drake.cancel(true);
    drake.destroy();
  }
}

function checkIfAllThreeZonesFilled() {
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
  rankColumns.forEach(function(column) {
    $(column).find(".player").appendTo(playerColumn);
  });

  $('#rank-column-restart').hide();
  resetTimer();
});


$("#rank-column-submit").click(function() {
  var success = true;
  for (let column in rankColumns) {
    var team = $(column).attr("data-team");
    var rank = $(column).attr("data-rank");

    // Find the matching player in the current rank column
    var matchingPlayer = $(column).find(".player[data-team='" + team + "'][data-rank='" + rank + "']");

    // Check if a matching player exists in the current rank column
    if (matchingPlayer.length === 0) {
      success = false;
      break;
    }
  }

  // Display the appropriate message
  if (success) {
    disableDragAndDrop();
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
    disableDragAndDrop();
    countdownElement.text("Time's up!");
    $('#rank-column-restart').show();
    $('#rank-column-submit').hide();
  }
}
updateCountdown(); // Start the countdown when the page loads
initDragContainers();

function resetTimer() {
  initDragContainers();
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
  while (remainingWideReceivers.length < 4) {
    const randomTeamName = teamNames[Math.floor(Math.random() * teamNames.length)];
    const randomTeamWideReceivers = teams[randomTeamName]["Wide Receivers"];

    if (randomTeamWideReceivers.length > 0) {
      const randomWideReceiver = randomTeamWideReceivers[Math.floor(Math.random() * randomTeamWideReceivers.length)];
      remainingWideReceivers.push(randomWideReceiver);
    }
  }

  // Combine both arrays
  const allPlayers = [...wideReceivers, ...remainingWideReceivers];

  // Function to shuffle an array using Fisher-Yates algorithm
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
  }

  // Shuffle the combined array
  shuffleArray(allPlayers);

  const playerColumn = document.getElementById("player-column");

  allPlayers.forEach((player, index) => {
    // Create the player div
    const $playerDiv = $("<div>").addClass("player");
    
    // Assign dataset attributes
    const teamValue = index < 3 ? randomTeam : teamNames[Math.floor(Math.random() * teamNames.length)];
    $playerDiv.attr("data-team", teamValue);
    $playerDiv.attr("data-rank", index + 1);

    // Create and append rank div
    const $rankDiv = $("<div>").addClass("rank").text(`#${index + 1}`);
    $playerDiv.append($rankDiv);
    
    // Create and append name div
    const $nameDiv = $("<div>").addClass("name").text(player);
    $playerDiv.append($nameDiv);

    // Append the player div to the playerColumn
    $("#player-column").append($playerDiv);
  });
}

