import { getTeams } from './teams.js';
import { POSITIONS } from './positions.js';
import { showCorrectGuess, showWrongGuess, showPointsLost, showPointsGained } from './notifications.js';


let NUM_PLAYERS_PER_ROUND = 7;
var NUM_ROUNDS = 10;
var COUNT_DOWN_MINS = 0.5; // Initial minutes for the countdown

let SelectedPositions = [];
let ChosenPlayers = {};
var RankColumns = [];

let Rounds = null;
let RoundNumber = 1;
let BonusMultiplier = 100;
let Streak = 0;
let ColorTimer = null;

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
        startRound(1, Rounds[1]);
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

function setRoundNumber(roundNumber) {
  RoundNumber = roundNumber;
  $('#rounds').text(`${roundNumber}/${NUM_ROUNDS}`)
}

function startRound(roundNumber, round) {
  setRoundNumber(roundNumber);
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

// Capture the event when any switch is toggled
$('.custom-control-input').on('change', function() {
    if ($(this).prop('id') == 'customSwitchAll') {
        return;
    }

    if ($(this).prop('checked') == false) {
      $('#customSwitchAll').prop('checked', false);
    }

    updateBonusPoints();
    checkEnableStart();
});

function checkEnableStart() {
    // Check if at least one switch is toggled on
    if ($('.custom-control-input:checked').length > 0) {
        $('#btn-start').prop('disabled', false);

        if (ColorTimer) {
          return;
        }

        startBonusMultiplierSfx();
    } else {
        $('#btn-start').prop('disabled', true);

        resetBonusMultiplierStyle();

        if (ColorTimer) {
          clearInterval(ColorTimer);
          ColorTimer = null;
        }
    }
}

function startBonusMultiplierSfx() {
  var colors = new Array(
    [62, 35, 255],
    [60, 255, 60],
    [255, 35, 98],
    [45, 175, 230],
    [255, 0, 255],
    [255, 128, 0]
  );

  var step = 0;
  //color table indices for: 
  // current color left
  // next color left
  // current color right
  // next color right
  var colorIndices = [0, 1, 2, 3];

  //transition speed
  var gradientSpeed = 0.002;

  function updateGradient() {

    if ($ === undefined) return;

    var c0_0 = colors[colorIndices[0]];
    var c0_1 = colors[colorIndices[1]];
    var c1_0 = colors[colorIndices[2]];
    var c1_1 = colors[colorIndices[3]];

    var istep = 1 - step;
    var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
    var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
    var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
    var color1 = "rgb(" + r1 + "," + g1 + "," + b1 + ")";

    var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
    var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
    var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
    var color2 = "rgb(" + r2 + "," + g2 + "," + b2 + ")";

    $('#bonus-multiplier-container').css({
      "background-image": "-webkit-linear-gradient(left, " + color1 + ", " + color2 + ")"
    }).css({
      "background-image": "-moz-linear-gradient(left, " + color1 + ", " + color2 + ")"
    }).css({
      "color": "transparent",
      "-webkit-background-clip": "text",
      "background-clip": "text"
    });

    step += gradientSpeed;
    if (step >= 1) {
      step %= 1;
      colorIndices[0] = colorIndices[1];
      colorIndices[2] = colorIndices[3];

      //pick two new target color indices
      //do not pick the same as the current one
      colorIndices[1] = (colorIndices[1] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
      colorIndices[3] = (colorIndices[3] + Math.floor(1 + Math.random() * (colors.length - 1))) % colors.length;
    }
  }

  ColorTimer = setInterval(updateGradient, 0.5);
}

function resetBonusMultiplierStyle() {
  $('#bonus-multiplier-container').css({
    "background-image": "none",
    "color": "white",
    "-webkit-background-clip": "border-box",
    "background-clip": "border-box"
  });
}

function updateBonusPoints() {
    // Update the bonus points multiplier
    BonusMultiplier = 100;
    SelectedPositions = [];
    $('.custom-control-input:checked').each(function() {
        switch ($(this).prop('id')) {
            case 'customSwitchAll':
                return;
            case 'wrSwitch':
                BonusMultiplier += POSITIONS.WR.bonusPoints;
                SelectedPositions.push(POSITIONS.WR);
                break;
            case 'rbSwitch':
                BonusMultiplier += POSITIONS.RB.bonusPoints;
                SelectedPositions.push(POSITIONS.RB);
                break;
            case 'qbSwitch':
                BonusMultiplier += POSITIONS.QB.bonusPoints;
                SelectedPositions.push(POSITIONS.QB);
                break;
            case 'teSwitch':
                BonusMultiplier += POSITIONS.TE.bonusPoints;
                SelectedPositions.push(POSITIONS.TE);
                break;
            case 'kSwitch':
                BonusMultiplier += POSITIONS.K.bonusPoints;
                SelectedPositions.push(POSITIONS.K);
                break;
        }
    });
    $('#bonus-multiplier').text(BonusMultiplier);

    // set the Number of Rounds depending on the positions selected.
    // there are only enough Kickers to make 4 rounds if only Kickers are selected
    if (SelectedPositions.length < 2) {
        if (SelectedPositions.includes(POSITIONS.WR)) {
          NUM_ROUNDS = POSITIONS.WR.maxRounds;
        } else if (SelectedPositions.includes(POSITIONS.RB)) {
          NUM_ROUNDS = POSITIONS.RB.maxRounds;
        } else if (SelectedPositions.includes(POSITIONS.QB)) {
          NUM_ROUNDS = POSITIONS.QB.maxRounds;
        } else if (SelectedPositions.includes(POSITIONS.TE)) {
          NUM_ROUNDS = POSITIONS.TE.maxRounds;
        } else if (SelectedPositions.includes(POSITIONS.K)) {
          NUM_ROUNDS = POSITIONS.K.maxRounds;
        }
    } else {
      NUM_ROUNDS = POSITIONS.WR.maxRounds;
    }
}

// Toggle all switches when "All" switch is toggled
$('#customSwitchAll').on('change', function() {
    var allSwitches = $('.custom-control-input');
    allSwitches.prop('checked', $(this).prop('checked'));
    if ($(this).prop('checked') == false) {
      $('#bonus-multiplier').text(100);
    }
    updateBonusPoints();
    checkEnableStart();
});

// Add event listener for the start button
$("#btn-start").on("click", function(e) {
  e.preventDefault();
  $("#game-settings").hide();
  $("#game-board").show();
  $("#btn-start").hide();
  startGame();
});

// Add event listener for the reset button
$("#btn-restart").on("click", function(e) {
  e.preventDefault();
  resetColumns();
  setRoundNumber(1);
  setScore(0);
  ChosenPlayers = {};
  $('#btn-restart').hide();
  startGame();
});


$("#btn-submit").click(function(e) {
  e.preventDefault();
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
    showPointsGained(`Speed Bonus: +${RemainingTime+100} points!`);
    incrementStreak();
    showPointsGained(`Streak Bonus: x${Streak} +${Streak*10} points!`);
    showPointsGained(`Difficulty Bonus: +${BonusMultiplier}%`);

    let totalScore = ((RemainingTime + 100) + (Streak*10)) * (BonusMultiplier/100);
    showPointsGained(`Total Score: +${totalScore} points!`);
    setScore(totalScore);

    resetColumns();
    setRoundNumber(RoundNumber+1);
    startRound(RoundNumber, Rounds[RoundNumber]);
  } else {
    showWrongGuess();
    setScore(-25);
    showPointsLost(25);
    resetStreak();
  }
});

$('#new-game').on('click', function(event) {
    event.preventDefault();  // Prevents default navigation behavior
    location.reload();
});

function incrementStreak() {
  Streak++;
}

function resetStreak() {
  Streak = 0;
}

function setScore(points) {
    $('#score').text(function(i, oldVal) {
        if (points == 0) {
          return 0;
        }
        return parseInt(oldVal) + points;
    });
}