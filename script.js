import { getTeams } from './teams.js';

var playerColumn = document.getElementById("player-column");

var rankColumns = [];
function initRankColumns() {
  if (rankColumns.length <= 0) {
    rankColumns = [
      document.getElementById("rank-column-1"),
      document.getElementById("rank-column-2"),
      document.getElementById("rank-column-3"),
      document.getElementById("rank-column-4")
    ];
  }
  return rankColumns;
}

function resetColumns() {
  $('#player-column').empty();
  $('#rank-column').empty();
  rankColumns = [];
}

var drake = null;

function initDragContainers() {

  disableDragAndDrop();

  drake = dragula([
      playerColumn,
      ...rankColumns
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
  resetColumns();
  chosenPlayers = {};
  $('#rank-column-restart').hide();
  startRound();
});


$("#rank-column-submit").click(function() {
  var success = true;
  for (let column in rankColumns) {
    var team = $(rankColumns[column]).attr("data-team");
    var rank = $(rankColumns[column]).attr("data-rank");

    // Find the matching player in the current rank column
    var matchingPlayer = $(rankColumns[column]).find(".player[data-team='" + team + "'][data-rank='" + rank + "']");

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
    resetColumns();
    startRound();
  } else {
    alert("WRONG. Try Again.");
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
    resetTimer();
    disableDragAndDrop();
    countdownElement.text("Time's up!");
    $('#rank-column-restart').show();
    $('#rank-column-submit').hide();
    enableTooltips();
  }
}

function resetTimer() {
  clearTimeout(countdownTimer);
  remainingTime = initialMinutes * 60;
}

function enableTooltips() {
  $('[data-toggle="popover-hover"]').popover({
    html: true,
    trigger: 'hover',
    placement: 'right',
    content: function () { 
      const $positionSpan = $("<span>")
        .addClass("badge bagde-pill badge-warning ml-2")
        .text(" " + $(this).data('position') + " " + $(this).data('rank'));
      return '<img class="small-logo" src="' + $(this).data('logo') + '" />' + $positionSpan.prop('outerHTML'); 
    }
  });
  $(".fas.fa-info-circle").show();
}

function disableTooltips() {
  $('[data-toggle="popover-hover"]').popover('dispose');
  $(".fas.fa-info-circle").hide();
}

const positions = {
  WR: { 
      "id": "WR", 
      "name": "Wide Receivers",
      "depthLevel": 3 
    },
  QB: { 
      "id": "QB", 
      "name": "QuarterBacks",
      "depthLevel": 2 
    },
  RB: {
      "id": "RB", 
      "name": "Running Backs",
      "depthLevel": 2
    },
  TE: {
      "id": "TE", 
      "name": "Tight Ends",
      "depthLevel": 2
    },
  K: { 
      "id": "K", 
      "name": "Kickers",
      "depthLevel": 2
    }
};
let selectedPositions = [positions.WR];
let NUM_PLAYERS_PER_ROUND = 7;

// Call the function to start fetching and processing the CSV data
function startRound() {
  getTeams(initPlayers);
}

let chosenPlayers = {};

function initPlayers(teams) {
  const teamNames = Object.keys(teams);

  const players = [];
  const teamsToMatch = [];

  let selectedPosition, selectedTeamIndex, selectedTeamName, selectedTeam, selectedPlayerIndex, selectedPlayerName, depthRank;
  // choose 7 random players 
  for (let i = 0; i < NUM_PLAYERS_PER_ROUND; i++) {

    do {
      // select a position from the list of possible positions
      selectedPosition = selectedPositions[Math.floor(Math.random() * selectedPositions.length)];

      // select a random team
      selectedTeamIndex = Math.floor(Math.random() * teamNames.length);
      selectedTeamName = teamNames[selectedTeamIndex];
      selectedTeam = teams[selectedTeamName];

      // select a random player for the team and position
      selectedPlayerIndex = Math.floor(Math.random() * selectedPosition.depthLevel);
      selectedPlayerName = selectedTeam[selectedPosition.name][selectedPlayerIndex].replace(/\s\((N|R|PUP|SUS)\)$/, "");
      depthRank = selectedPlayerIndex + 1;
    } while (chosenPlayers[`${selectedTeamIndex}-${selectedPosition.id}-${selectedPlayerIndex}`]); // Check if the combination exists

    // Add the combination to the cache
    chosenPlayers[`${selectedTeamIndex}-${selectedPosition.id}-${selectedPlayerIndex}`] = true;
    players.push({
      "teamName": selectedTeamName,
      "name": selectedPlayerName,
      "position": selectedPosition,
      "depthRank": depthRank,
      "imgBgUrl": selectedTeam.imgBgUrl,
      "imgLogoUrl": selectedTeam.imgLogoUrl
    });

    if (teamsToMatch.length < 4) {
      teamsToMatch.push({
        "teamName": selectedTeamName,
        "name": selectedPlayerName,
        "position": selectedPosition,
        "depthRank": depthRank,
        "imgBgUrl": selectedTeam.imgBgUrl,
        "imgLogoUrl": selectedTeam.imgLogoUrl
      });
    }
  }

  teamsToMatch.forEach((teamToMatch, index) => {
      const $teamDiv = $("<div>")
          .addClass("container zone-container ranks")
          .attr("id", "rank-column-" + (index + 1))
          .attr("data-team", teamToMatch.teamName)
          .attr("data-rank", teamToMatch.depthRank)
          .attr("data-position", teamToMatch.position.id)
          .css("background-image", `url(${teamToMatch.imgBgUrl})`);

      const $imgElem = $("<img>").attr("src", teamToMatch.imgLogoUrl);
      $teamDiv.append($imgElem);

      const $positionSpan = $("<span>")
          .addClass("badge bagde-pill badge-warning mb-2")
          .text(teamToMatch.position.id + " " + teamToMatch.depthRank);

      const $teamContainer = $("<div>");
      $teamContainer.append($teamDiv, $positionSpan);  // Append both to the container

      $("#rank-column").append($teamContainer);
  });

  players.forEach((player, index) => {
    // Create the player div
    const $playerDiv = $("<div>").addClass("player");
    
    // Assign dataset attributes
    $playerDiv.attr("data-team", player.teamName);
    $playerDiv.attr("data-rank", player.depthRank);
    $playerDiv.attr("data-position", player.position.id);
    $playerDiv.attr("data-logo", player.imgLogoUrl);
    $playerDiv.attr("data-toggle", "popover-hover");

    // Create and append name div
    const $nameDiv = $("<div>").addClass("name").text(player.name);
    $nameDiv.append('<i class="fas fa-info-circle ml-2"></i>');
    $playerDiv.append($nameDiv);

    // Append the player div to the playerColumn
    $("#player-column").append($playerDiv);
  });

  disableTooltips();
  initRankColumns();
  initDragContainers();
  resetTimer();
  updateCountdown(); // Start the countdown when the page loads
}

startRound();