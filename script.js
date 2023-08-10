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

// Usage
const csv = `Team,Quarterbacks,Running Backs,Wide Receivers,Tight Ends,Kickers
ARI,Kyler Murray (PUP),James Conner,Marquise Brown,Zach Ertz (PUP),Matt Prater
,Colt McCoy,Corey Clement,Rondale Moore,Trey McBride,
,Clayton Tune (R),Keaontay Ingram,Michael Wilson (R),Bernhard Seikovits,
,Jeff Driskel,Ty'Son Williams,Greg Dortch,,
,,,Zach Pascal (N),,
,,,Andre Baccellia,,
ATL,Desmond Ridder,Bijan Robinson (R),Drake London,Kyle Pitts,Younghoe Koo
,Taylor Heinicke (N),Tyler Allgeier,Mack Hollins (N),Jonnu Smith (N),
,Logan Woodside,Cordarrelle Patterson,Scotty Miller (N),Parker Hesse,
,,,Frank Darby,,
,,,KhaDarel Hodge,,
,,,Josh Ali,,
,,,Keilahn Harris (R),,
,,,Penny Hart (N),,
BAL,Lamar Jackson,J.K. Dobbins (PUP),Odell Beckham Jr. (N),Mark Andrews,Justin Tucker
,Tyler Huntley,Gus Edwards,Rashod Bateman,Isaiah Likely,
,Anthony A. Brown,Justice Hill,Zay Flowers (R),,
,Josh Johnson (N),Keaton Mitchell (R),Devin Duvernay,,
,,Melvin Gordon III (N),Nelson Agholor (N),,
,,Patrick Ricard,Tylan Wallace,,
,,,James Proche,,
,,,Laquon Treadwell (N),,
BUF,Josh Allen,James Cook,Stefon Diggs,Dawson Knox,Tyler Bass
,Kyle Allen (N),Damien Harris (N),Gabe Davis,Dalton Kincaid (R),
,Matt Barkley,Latavius Murray (N),Trent Sherfield (N),Quintin Morris,
,,Darrynton Evans (N),Khalil Shakir,,
,,Jordan Mims,Justin Shorter (R),,
,,,Deonte Harty (N),,
,,,KeeSean Johnson,,
,,,Tyrell Shavers (R),,
,,,Andy Isabella (N),,
CAR,Bryce Young (R),Miles Sanders (N),Adam Thielen (N),Hayden Hurst (N),Eddy Pineiro
,Andy Dalton (N),Chuba Hubbard,DJ Chark Jr. (N),Ian Thomas,
,Matt Corral,Raheem Blackshear,Terrace Marshall Jr.,Tommy Tremble,
,Jake Luton (N),Spencer Brown,Jonathan Mingo (R),,
,,Camerun Peoples (R),Laviska Shenault Jr.,,
,,,Shi Smith,,
,,,Damiere Byrd (N),,
CHI,Justin Fields,Khalil Herbert,DJ Moore (N),Cole Kmet,Cairo Santos
,PJ Walker (N),D'Onta Foreman (N),Darnell Mooney,Robert Tonyan (N),
,Nathan Peterman,Roschon Johnson (R),Chase Claypool (PUP),Jake Tonges,
,,Travis Homer (N),Equanimeous St. Brown,Marcedes Lewis (N),
,,Trestan Ebner,Tyler Scott (R),,
,,,Dante Pettis,,
,,,Velus Jones Jr.,,
,,,Nsimba Webster,,
CIN,Joe Burrow,Joe Mixon,Ja'Marr Chase,Irv Smith (N),Evan McPherson
,Jake Browning,Trayveon Williams,Tee Higgins,Drew Sample,
,Trevor Siemian (N),Chase Brown (R),Tyler Boyd,Devin Asiasi,
,Reid Sinnett (N),Chris Evans,Trenton Irwin,,
,,Jacob Saylors (R),Andrei Iosivas (R),,
,,Calvin Tyler (R),Charlie Jones (R),,
,,,Stanley Morgan,,
,,,Trent Taylor,,
,,,Mac Hippenhammer (R),,
CLE,Deshaun Watson,Nick Chubb,Amari Cooper,David Njoku,Cade York
,Joshua Dobbs,Jerome Ford,Elijah Moore (N),Jordan Akins (N),
,Dorian Thompson-Robinson (R),John Kelly,Donovan Peoples-Jones,Harrison Bryant,
,Kellen Mond,Hassan Hall (R),Cedric Tillman (R),,
,,,Marquise Goodwin (N),,
,,,David Bell,,
,,,Anthony Schwartz,,
DAL,Dak Prescott,Tony Pollard,CeeDee Lamb,Jake Ferguson,Brandon Aubrey (N)
,Cooper Rush,Malik Davis,Brandin Cooks (N),Luke Schoonmaker (R),
,,Deuce Vaughn (R),Michael Gallup,Peyton Hendershot,
,,Ronald Jones (N),Jalen Tolbert,Sean McKeon,
,,Rico Dowdle,Simi Fehoko,,
,,,Jalen Brooks (R),,
,,,KaVontae Turpin,,
,,,Jalen Moreno-Cropper (R),,
DEN,Russell Wilson,Javonte Williams,Jerry Jeudy,Greg Dulcich,Elliott Fry (N)
,Jarrett Stidham (N),Samaje Perine (N),Courtland Sutton,Chris Manhertz,
,Ben DiNucci (N),Tony Jones Jr. (N),Marvin Mims (R),Albert Okwuegbunam,
,,Emmanuel Wilson (R),Marquez Callaway (N),,
,,,Kendall Hinton,,
,,,Tim Patrick (IR),,
DET,Jared Goff,Jahmyr Gibbs (R),Amon-Ra St. Brown,Sam LaPorta (R),Riley Patterson (N)
,Hendon Hooker (R),David Montgomery (N),Marvin Jones (N),Brock Wright,
,Nate Sudfeld,Craig Reynolds,Josh Reynolds,James Mitchell,
,Adrian Martinez (R),Jermar Jefferson,Jameson Williams (SUS),,
,Teddy Bridgewater (N),Justin Jackson,Kalif Raymond,,
,,Mohamed Ibrahim (R),Antoine Green (R),,
GB,Jordan Love,Aaron Jones,Christian Watson,Luke Musgrave (R),Anders Carlson (R)
,Sean Clifford (R),AJ Dillon,Romeo Doubs,Tucker Kraft (R),
,,Patrick Taylor,Jayden Reed (R),Josiah Deguara,
,,Lew Nichols III (R),Dontayvion Wicks (R),Tyler Davis,
,,Tyler Goodson,Samori Toure,,
,,,Bo Melton,,
,,,Grant DuBose (R),,
,,,Malik Heath (R),,
HOU,C.J. Stroud (R),Dameon Pierce,Robert Woods (N),Dalton Schultz (N),Ka'imi Fairbairn
,Davis Mills,Devin Singletary (N),Nico Collins,Teagan Quitoriano,
,Case Keenum (N),Dare Ogunbowale,John Metchie,Brevin Jordan,
,,Mike Boone (N),Tank Dell (R),Eric Tomlinson (N),
,,Xazavian Valladay (R),Noah Brown (N),Dalton Keene (N),
,,,Xavier Hutchinson (R),,
,,,Steven Sims (N),,
,,,Jared Wayne (R),,
IND,Anthony Richardson (R),Jonathan Taylor (PUP),Michael Pittman Jr.,Jelani Woods,Matt Gay (N)
,Gardner Minshew (N),Zack Moss,Alec Pierce,Mo Alie-Cox,Lucas Havrisik (R)
,,Evan Hull (R),Isaiah McKenzie (N),Will Mallory (R),
,,Deon Jackson,Josh Downs (R),Pharaoh Brown (N),
,,,Mike Strachan,,
,,,Ashton Dulin,,
,,,Vyncint Smith,,
,,,Breshad Perriman (N),,
,,,Amari Rodgers (N),,
JAC,Trevor Lawrence,Travis Etienne,Calvin Ridley,Evan Engram,James McCourt
,C.J. Beathard,Tank Bigsby (R),Christian Kirk,Brenton Strange (R),Brandon McManus (N)
,,D'Ernest Johnson (N),Zay Jones,Luke Farrell,
,,JaMycal Hasty,Jamal Agnew,,
,,Snoop Conner,Kendric Pryor,,
,,,Tim X. Jones,,
,,,Parker Washington (R),,
,,,Jacob Harris (N),,
KC,Patrick Mahomes,Isiah Pacheco,Kadarius Toney,Travis Kelce,Harrison Butker
,Blaine Gabbert,Jerick McKinnon,Skyy Moore,Noah Gray,
,,Clyde Edwards-Helaire,Marquez Valdes-Scantling,Blake Bell,
,,Deneric Prince (R),Rashee Rice (R),,
,,La'Mical Perine,Justyn Ross,,
,,,Justin Watson,,
,,,Richie James (N),,
,,,Ihmir Smith-Marsette,,
LVR,Jimmy Garoppolo (N),Josh Jacobs,Davante Adams,Austin Hooper (N),Daniel Carlson
,Brian Hoyer (N),Zamir White,Jakobi Meyers (N),Michael Mayer (R),
,,Ameer Abdullah,Hunter Renfrow,,
,,Brandon Bolden,Keelan Cole,,
,,Brittain Brown,Phillip Dorsett (N),,
,,,Tre Tucker (R),,
,,,DeAndre Carter (N),,
,,,Cam Sims (N),,
LAC,Justin Herbert,Austin Ekeler,Keenan Allen,Gerald Everett,Cameron Dicker
,Easton Stick,Joshua Kelley,Mike Williams,Donald Parham (N),Dustin Hopkins
,Max Duggan (R),Isaiah Spiller,Quentin Johnston (R),Tre' McKitty,
,,Larry Rountree,Joshua Palmer,,
,,Elijah Dotson (R),Jalen Guyton,,
,,,Derius Davis (R),,
,,,Keelan Doss,,
,,,Terrell Bynum (R),,
LAR,Matthew Stafford,Cam Akers,Cooper Kupp,Tyler Higbee,Tanner Brown (R)
,Stetson Bennett (R),Zach Evans (R),Van Jefferson,Brycen Hopkins,
,Brett Rypien (N),Kyren Williams,Ben Skowronek,Davis Allen (R),
,,Royce Freeman (N),Puka Nacua (R),Hunter Long (N),
,,Ronnie Rivers,Tutu Atwell,,
,,,Lance McCutcheon,,
,,,Austin Trammell,,
,,,Demarcus Robinson (N),,
MIA,Tua Tagovailoa,Raheem Mostert,Tyreek Hill,Durham Smythe (N),Jason Sanders
,Mike White (N),Jeff Wilson Jr.,Jaylen Waddle,Eric Saubert,
,Skylar Thompson,De'Von Achane (R),Cedrick Wilson,Tyler Kroft (N),
,,Salvon Ahmed,Braxton Berrios (N),,
,,Myles Gaskin,Chosen Anderson (N),,
,,,Erik Ezukanma,,
,,,River Cracraft,,
,,,Elijah Higgins (R),,
MIN,Kirk Cousins,Alexander Mattison,Justin Jefferson,T.J. Hockenson,Greg Joseph
,Nick Mullens,Ty Chandler,K.J. Osborn,Josh Oliver,
,Jaren Hall (R),Kene Nwangwu,Jordan Addison (R),Johnny Mundt,
,,DeWayne McBride (R),Jalen Nailor,,
,,C.J. Ham,Jalen Reagor,,
,,,Brandon Powell (N),,
,,,N'Keal Harry (N),,
,,,Blake Proehl,,
NE,Mac Jones,Rhamondre Stevenson,JuJu Smith-Schuster (N),Hunter Henry,Nick Folk
,Bailey Zappe,Pierre Strong,DeVante Parker,Mike Gesicki (N),Chad Ryland (R)
,Trace McSorley (N),Ty Montgomery,Kendrick Bourne,Anthony Firkser (N),
,,Kevin Harris,Tyquan Thornton,,
,,,Demario Douglas (R),,
,,,Kayshon Boutte (R),,
,,,Matthew Slater,,
NO,Derek Carr (N),Alvin Kamara (SUS),Chris Olave,Taysom Hill,Wil Lutz
,Jameis Winston,Jamaal Williams (N),Michael Thomas,Juwan Johnson,
,Jake Haener (R),Kendre Miller (R),Rashid Shaheed,Foster Moreau (N),
,,Dwayne Washington,Tre'Quan Smith,Jimmy Graham (N),
,,Eno Benjamin (IR),Keith Kirkwood,Jesse James (N),
,,,Bryan Edwards (N),,
,,,A.T. Perry (R),,
,,,James Washington (N),,
NYG,Daniel Jones,Saquon Barkley,Isaiah Hodgins,Darren Waller (N),Graham Gano
,Tyrod Taylor,Matt Breida,Parris Campbell (N),Daniel Bellinger,
,,Eric Gray (R),Darius Slayton,Tommy Sweeney (N),
,,James Robinson (N),Jalin Hyatt (R),,
,,Gary Brightwell,Wan'Dale Robinson (PUP),,
,,,Sterling Shepard,,
,,,Jamison Crowder (N),,
,,,Cole Beasley (N),,
,,,Bryce Ford-Wheaton (R),,
NYJ,Aaron Rodgers (N),Breece Hall,Garrett Wilson,Tyler Conklin,Greg Zuerlein
,Zach Wilson,Michael Carter,Allen Lazard (N),C.J. Uzomah,
,Tim Boyle (N),Israel Abanikanda (R),Mecole Hardman (N),Kenny Yeboah,
,,Zonovan Knight,Corey Davis,Zack Kuntz (R),
,,Travis Dye (R),Jason Brownlee (R),,
PHI,Jalen Hurts,D'Andre Swift (N),A.J. Brown,Dallas Goedert,Jake Elliott
,Marcus Mariota (N),Rashaad Penny (N),DeVonta Smith,Dan Arnold (N),
,Tanner McKee (R),Kenneth Gainwell,Olamide Zaccheaus (N),Jack Stoll,
,,Boston Scott,Quez Watkins,Grant Calcaterra,
,,Trey Sermon,Britain Covey,,
,,,Greg Ward Jr.,,
,,,Tyrie Cleveland,,
PIT,Kenny Pickett,Najee Harris,George Pickens,Pat Freiermuth,Chris Boswell
,Mitchell Trubisky,Jaylen Warren,Diontae Johnson,Darnell Washington (R),
,Mason Rudolph,Anthony McFarland,Allen Robinson (N),Hakeem Butler (N),
,,Jordan Byrd (R),Calvin Austin,Zach Gentry,
,,,Gunner Olszewski,,
,,,Miles Boykin,,
SEA,Geno Smith,Kenneth Walker III,DK Metcalf,Noah Fant,Jason Myers
,Drew Lock,Zach Charbonnet (R),Tyler Lockett,Will Dissly,
,,DeeJay Dallas,Jaxon Smith-Njigba (R),Colby Parkinson,
,,Kenny McIntosh (R),Dee Eskridge,,
,,Chris Z. Smith (R),Dareke Young,,
,,,Cody Thompson,,
,,,Cade Johnson,,
,,,Jake Bobo (R),,
,,,Matt Landers (R),,
SF,Brock Purdy,Christian McCaffrey,Brandon Aiyuk,George Kittle,Zane Gonzalez (N)
,Trey Lance,Elijah Mitchell,Deebo Samuel,Ross Dwelley,Jake Moody (R)
,Sam Darnold (N),Tyrion Davis-Price,Jauan Jennings,Cameron Latu (R),
,Brandon Allen (N),Jordan Mason,Danny Gray,Brayden Willis (R),
,,Kyle Juszczyk,Chris Conley (N),,
,,,Ray-Ray McCloud,,
,,,Ronnie Bell (R),,
TB,Baker Mayfield (N),Rachaad White,Mike Evans,Cade Otton,Chase McLaughlin (N)
,Kyle Trask,Chase Edmonds (N),Chris Godwin,Ko Kieft,
,John Wolford (N),Sean Tucker (R),Russell Gage Jr.,Payne Durham (R),
,,Ke'Shawn Vaughn,David Moore (N),,
,,Patrick Laird,Deven Thompkins,,
,,Ronnie Brown (R),Kaylon Geiger,,
,,,Trey Palmer (R),,
TEN,Ryan Tannehill,Derrick Henry,DeAndre Hopkins (N),Chigoziem Okonkwo,Caleb Shudak
,Will Levis (R),Tyjae Spears (R),Treylon Burks,Josh Whyle (R),
,Malik Willis,Hassan Haskins,Nick Westbrook-Ikhine,Trevon Wesco (N),
,,Julius Chestnut,Kyle Philips,,
,,Jonathan Ward,Racey McMath,,
,,,Colton Dowell (R),,
,,,Chris Moore,,
WAS,Sam Howell,Brian Robinson Jr.,Terry McLaurin,Logan Thomas,Joey Slye
,Jacoby Brissett (N),Antonio Gibson,Jahan Dotson,John Bates,Michael Badgley (N)
,,Chris Rodriguez Jr. (R),Curtis Samuel,,
,,Jonathan Williams,Dyami Brown,,
,,Jaret Patterson,Byron Pringle (N),,
,,,Dax Milne,,
,,,Kyric McGowan,,
`;  // Replace YOUR_CSV_DATA_HERE with the given CSV data.
const parsedCsv = parseCsv(csv);
const result = transformToDesiredFormat(parsedCsv);
console.log(result);








function initPlayers(teams) {
  const teamNames = Object.keys(teams);
  debugger;
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

initPlayers(result.teams);
