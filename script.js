import { getTeams } from './teams.js';

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



const positions = {
  WR: { 
      "name": "Wide Receivers",
      "depthLevel": 3 
    },
  QB: { 
      "name": "QuarterBacks",
      "depthLevel": 2 
    },
  RB: {
      "name": "Running Backs",
      "depthLevel": 2
    },
  TE: {
      "name": "Tight Ends",
      "depthLevel": 2
    },
  K: { 
      "name": "Kickers",
      "depthLevel": 2
    }
};
let selectedPositions = [positions.WR];
let numberOfPLayers = 7;

// Call the function to start fetching and processing the CSV data
getTeams(initPlayers);

function initPlayers(teams) {
  const teamNames = Object.keys(teams);

  const players = [];

  // choose 7 random players 
  for (let i = 0; i < numberOfPLayers; i++) {
    // select a position from the list of possible positions
    const selectedPosition = selectedPositions[Math.floor(Math.random() * selectedPositions.length)];
    // select a random team
    const selectedTeamIndex = Math.floor(Math.random() * teamNames.length);
    const selectedTeamName = teamNames[selectedTeamIndex];
    const selectedTeam = teams[selectedTeamName];
    // select a random player for the team and position
    const selectedPlayerIndex = Math.floor(Math.random() * selectedPosition.depthLevel);
    const selectedPlayer = selectedTeam[selectedPosition.name][selectedPlayerIndex];
    players.push({
      "teamName": selectedTeamName,
      "name": selectedPlayer,
      "position": selectedPosition,
      "depthRank": selectedPlayerIndex
    })
  }

  players.forEach((player, index) => {
    // Create the player div
    const $playerDiv = $("<div>").addClass("player");
    
    // Assign dataset attributes
    $playerDiv.attr("data-team", player.teamName);
    $playerDiv.attr("data-rank", player.depthRank);

    // Create and append rank div
    //const $rankDiv = $("<div>").addClass("rank").text(`#${index + 1}`);
    //$playerDiv.append($rankDiv);
    
    // Create and append name div
    const $nameDiv = $("<div>").addClass("name").text(player.name);
    $playerDiv.append($nameDiv);

    // Append the player div to the playerColumn
    $("#player-column").append($playerDiv);
  });
}

