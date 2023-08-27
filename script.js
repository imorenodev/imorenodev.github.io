import { getTeams } from './teams.js';
import { POSITIONS } from './positions.js';
import { showCorrectGuess, showWrongGuess, showPointsLost, showPointsGained } from './notifications.js';


let NUM_PLAYERS_PER_ROUND = 7;
var NUM_ROUNDS = 10;
var COUNT_DOWN_MINS = 0.5; // Initial minutes for the countdown

let SelectedPositions = [POSITIONS.WR];
let ChosenPlayers = {};
var RankColumns = [];

let Rounds = null;
let RoundNumber = 1;

var PlayerColumn = document.getElementById("player-column");
var CountdownElement = $("#countdown");

var RemainingTime = COUNT_DOWN_MINS * 60; // Convert minutes to seconds
var CountdownTimer; // Variable to store the timer

var Drake = null;


function initRankColumns() {
  if (RankColumns.length <= 0) {
    RankColumns = [
      document.getElementById("rank-column-1"),
      document.getElementById("rank-column-2"),
      document.getElementById("rank-column-3"),
      document.getElementById("rank-column-4")
    ];
  }
  return RankColumns;
}

function resetColumns() {
  $('#player-column').empty();
  $('#rank-column').empty();
  RankColumns = [];
}

function initDragContainers() {

  disableDragAndDrop();

  Drake = dragula([
      PlayerColumn,
      ...RankColumns
    ],   
    {
      invalid: function (el, handle) {
        return el.className != "player";
      }
    }
  );

  // Handle drop event
  Drake.on("drop", function(el, target, source, sibling) {
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
  if (Drake) {
    Drake.cancel(true);
    Drake.destroy();
  }
}

function checkIfAllThreeZonesFilled() {
  $('#btn-submit').hide();

  for (let column in RankColumns) {
    let player = $(RankColumns[column]).find(".player");
    if (player.length <= 0) {
      return;
    }
  }
  $('#btn-submit').show();
}

function updateCountdown() {
  var minutes = Math.floor(RemainingTime / 60);
  var seconds = RemainingTime % 60;

  // Format the remaining time as "mm:ss"
  var formattedTime = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  CountdownElement.text(formattedTime);

  if (RemainingTime > 0) {
    RemainingTime--;
    CountdownTimer = setTimeout(updateCountdown, 1000); // Update every second
  } else {
    gameOver();
  }
}

function gameOver() {
    resetTimer();
    disableDragAndDrop();
    CountdownElement.text("Time's up!");
    $('#btn-restart').show();
    $('#btn-submit').hide();
    enableTooltips();
}

function resetTimer() {
  clearTimeout(CountdownTimer);
  RemainingTime = COUNT_DOWN_MINS * 60;
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

// Call the function to start fetching and processing the CSV data
async function startGame() {
  const teams = await getTeams();
  if (teams) {
      Rounds = initRounds(teams);
      if (Rounds) {
        startRound(RoundNumber, Rounds[1]);
      }
  }
}

function initRounds(teams) {
  var rounds = {}
  for (var i = 1; i <= NUM_ROUNDS; i++) {
    rounds[i] = initRound(teams);
  }
  return rounds;
}

function initRound(teams) {
  const teamNames = Object.keys(teams);

  const players = [];
  const teamsToMatch = [];

  let selectedPosition, selectedTeamIndex, selectedTeamName, selectedTeam, selectedPlayerIndex, selectedPlayerName, depthRank;
  // choose 7 random players 
  for (let i = 0; i < NUM_PLAYERS_PER_ROUND; i++) {

    do {
      // select a position from the list of possible positions
      selectedPosition = SelectedPositions[Math.floor(Math.random() * SelectedPositions.length)];

      // select a random team
      selectedTeamIndex = Math.floor(Math.random() * teamNames.length);
      selectedTeamName = teamNames[selectedTeamIndex];
      selectedTeam = teams[selectedTeamName];

      // select a random player for the team and position
      selectedPlayerIndex = Math.floor(Math.random() * selectedPosition.depthLevel);
      selectedPlayerName = selectedTeam[selectedPosition.name][selectedPlayerIndex].replace(/\s\((N|R|PUP|SUS)\)$/, "");
      depthRank = selectedPlayerIndex + 1;
    } while (ChosenPlayers[`${selectedTeamIndex}-${selectedPosition.id}-${selectedPlayerIndex}`]); // Check if the combination exists

    // Add the combination to the cache
    ChosenPlayers[`${selectedTeamIndex}-${selectedPosition.id}-${selectedPlayerIndex}`] = true;
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
  return { 
    players: players,
    teamsToMatch: teamsToMatch
  }
}

function startRound(roundNumber, round) {
  $('#rounds').text(`${roundNumber}/${NUM_ROUNDS}`)
  round.teamsToMatch.forEach((teamToMatch, index) => {
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
          .addClass(`badge badge-pill badge-warning ${index !== 3 ? "mb-2" : ""}`)
          .text(`${teamToMatch.position.id} ${teamToMatch.depthRank}`);

      const $teamContainer = $("<div>");
      $teamContainer.append($teamDiv, $positionSpan);  // Append both to the container

      $("#rank-column").append($teamContainer);
  });

  round.players.forEach((player, index) => {
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


// Event Listeners

// Add event listener for the start button
$("#btn-start").on("click", function() {
  $("#game-board").show();
  $("#btn-start").hide();
  startGame();
});

// Add event listener for the reset button
$("#btn-restart").on("click", function() {
  resetColumns();
  ChosenPlayers = {};
  $('#btn-restart').hide();
  startGame();
});


$("#btn-submit").click(function() {
  var success = true;
  for (let column in RankColumns) {
    var team = $(RankColumns[column]).attr("data-team");
    var rank = $(RankColumns[column]).attr("data-rank");

    // Find the matching player in the current rank column
    var matchingPlayer = $(RankColumns[column]).find(".player[data-team='" + team + "'][data-rank='" + rank + "']");

    // Check if a matching player exists in the current rank column
    if (matchingPlayer.length === 0) {
      success = false;
      break;
    }
  }

  // Display the appropriate message
  if (success) {
    disableDragAndDrop();
    clearTimeout(CountdownTimer); // Stop the countdown
    showCorrectGuess();
    showPointsGained(100);
    resetColumns();
    RoundNumber++;
    startRound(RoundNumber, Rounds[RoundNumber]);
  } else {
    showWrongGuess();
    showPointsLost(10);
  }
});
