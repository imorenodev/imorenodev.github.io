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
  if (target.id === "player-column") {
    target.appendChild(el);
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
});

// Add event listener for the reset button
$("#rank-column-restart").on("click", function() {
  var rankColumns = [rankColumn1, rankColumn2, rankColumn3];

  rankColumns.forEach(function(column) {
    $(column).find(".player").appendTo(playerColumn);
  });
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
    $('#rank-column-restart').toggle();
  }
}
updateCountdown(); // Start the countdown when the page loads

function resetTimer() {
  clearTimeout(countdownTimer);
  remainingTime = initialMinutes * 60;
  updateCountdown();
}
