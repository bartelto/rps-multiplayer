//global variables
let playerName = "";
let playerKey = "";
let playerAttack = "";
let isChallenger = false; // the challenger always initiates database communication

let opponentName = "";
let opponentKey = "";
let opponentAttack = "";
let challengerOutcome = "";

let total = {
    wins: 0,
    losses: 0,
    draws: 0
};

// hide game controls
$("#game-controls").hide();

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDoDBuWPnXPUH9rTBuYf-Eav8sJCvVXQcI",
    authDomain: "rps-arena-ff0d5.firebaseapp.com",
    databaseURL: "https://rps-arena-ff0d5.firebaseio.com",
    projectId: "rps-arena-ff0d5",
    storageBucket: "",
    messagingSenderId: "267639517864",
    appId: "1:267639517864:web:3a6d6b8c6099582c"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let database = firebase.database();
let playersRef = database.ref("/players");
let matchesRef = database.ref("/challenges");
let matchRef = "";
let playsRef = database.ref("/plays"); // for storing the moves from each match
let playRef = "";

$("#button-enter-name").on("click", function() {
    console.log("new player: " + $("#input-screen-name").val());
    playerName = $("#input-screen-name").val().trim();
    // Add user to the players list.
    let playerRef = playersRef.push({
        name: playerName
    });
    console.log(playerRef);

    // Remove user from the database when they disconnect.
    playerRef.onDisconnect().remove();
    console.log("setting playerkey");
    playerKey = playerRef.key;
    flagThisPlayer($(`button[data-key=${playerKey}]`));
});

playersRef.on("child_added", function(snapshot) {
    //console.log("player added");
    let newPlayer = $("<button>")
        .text(snapshot.val().name)  
        .addClass("list-group-item list-group-item-action competitor")
        .attr('data-key', snapshot.key)
        .attr('data-toggle', "modal")
        .attr('data-target', '#challenge-modal');
    if (snapshot.key === playerKey) {
        flagThisPlayer(newPlayer);
    }
    $("#players-list").append(newPlayer);
});

function flagThisPlayer (player) {
    newBadge = $("<span>")
        .text("You")
        .addClass("badge badge-primary");
    player
        .text(player.text()+" ")
        .removeClass("competitor")
        .append(newBadge);
}

playersRef.on("child_removed", function(snapshot) {
    console.log("child removed: " + snapshot.key);
    $(`button[data-key=${snapshot.key}]`).remove();
});

// clicking on a competitor's name
$(document).on("click", ".competitor", function() {
    console.log("here");
    console.log("clicked " + $(this).text());
    opponentName = $(this).text();
    opponentKey = $(this).attr("data-key");
    $("#button-challenge").attr("data-action", "challenge");
    $("#challenge-comm").text(`Do you want to challenge ${opponentName} to play rock/paper/scissors?`);

});

// sending or accepting a challenge
$("#button-challenge").on("click", function() {
    console.log("clicked YES");
    if ($(this).attr("data-action") === "challenge") {
        $("#challenge-comm").text(`Waiting for ${opponentName} to accept your challenge!`);
        matchRef = matchesRef.push({
            to: opponentKey,
            from: playerKey,
            accepted: false
        });
        console.log(matchRef);

        matchRef.child("accepted").on("value", function(snapshot) {
            if (snapshot.val() === true) { // opponent has accepted the challenge
                isChallenger = true;
                console.log("opponent accepted!");
                $('#challenge-modal').modal("hide");
                // reveal game controls
                $("#game-controls").show();
            }
        });
    } // accepting a challenge
    else if ($(this).attr("data-action") === "accept") {
        matchRef.child("accepted").set(true); // won't affect other children
        $('#challenge-modal').modal("hide");
        $("#game-controls").show();
    }
});

// receiving a challenge from another player
matchesRef.on("child_added", function(snapshot) {
    if (snapshot.val().to === playerKey) {
        matchRef = snapshot.ref;
        opponentName = $(`button[data-key="${snapshot.val().from}"]`).text();
        opponentKey = $(`button[data-key="${snapshot.val().from}"]`).attr("data-key");
        $("#challenge-comm").text(`${opponentName} is challenging you to play rock/paper/scissors. Accept?`);
        $("#button-challenge").attr("data-action", "accept");
        $('#challenge-modal').modal("show");
    }
});

/////////////////////
// GAME PLAY LOGIC //
/////////////////////

// player chooses an attack (rock, paper or scissors)
$(".attack").click(function() {
    playerAttack = $(this).attr("data-attack");

    // display attack on screen
    $("#player-attack").text(playerAttack);

    if (isChallenger) { // challenger initiates the database communication
        // Add attack to the attacks list on the database
        let playRef = playsRef.push({
            to: opponentKey,
            attack: playerAttack
        });

        // challenger listens for defender's counterattack
        playRef.child("counterattack").on("value", function(snapshot) {
            if (snapshot.val() !== null && snapshot.val() !== "") {
                opponentAttack = snapshot.val();
                console.log("received a counterattack of " + opponentAttack);
                // display opponent's attack on screen
                $("#opponent-attack").text(opponentAttack);
                // both sides have attacked; determine winner
                challengerOutcome = determineOutcome();
            }
        });
    } else if (opponentAttack !== "") { // player is defender, and the challenger has already attacked
        // both sides have attacked; determine winner
        challengerOutcome = determineOutcome();

        // defender sends counterattack to challenger

    }
});

// defender listens for challenger to make an attack
playsRef.on("child_added", function(snapshot) {
    if (snapshot.val().to === playerKey) { // i.e., the defender
        opponentAttack = snapshot.val().attack;
        // display opponent's attack on screen
        $("#opponent-attack").text(opponentAttack);
        console.log("received an attack of " + opponentAttack);
        if (playerAttack !== "") {
            // place counterattack in database
            snapshot.child("counterattack").set(playerAttack);
            // both sides have attacked; determine winner
            challengerOutcome = determineOutcome();
        }
    }
});

function determineOutcome() { // from the perspective of the player
    if (playerAttack === opponentAttack) {
        total.draws++;
        $("#total-draws").text(`Draws: ${total.draws}`);
        $("#announcer").text("It's a draw!");
        return "draw";
    } else if (
        (playerAttack === "rock" && opponentAttack === "paper") ||
        (playerAttack === "paper" && opponentAttack === "scissors") ||
        (playerAttack === "scissors" && opponentAttack === "rock")) {
        total.losses++;
        $("#total-losses").text(`Losses: ${total.losses}`);
        $("#announcer").text("You win!");
        return "lose";
    } else {
        $("#total-wins").text(`Wins: ${total.wins}`);
        total.wins++;
        $("#announcer").text(`${opponentName} wins!`);
        return "win"; 
    }   
}

function resetArena() {

}