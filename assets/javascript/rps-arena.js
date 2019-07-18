//global variables
let opponentName = "";
let opponentKey = "";

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
let thisPlayerKey = "";

$("#button-enter-name").on("click", function() {
    console.log("new player: " + $("#input-screen-name").val());
     // Add user to the players list.
     let playerRef = playersRef.push({
         name: $("#input-screen-name").val()
     });
     console.log(playerRef);
     // Remove user from the players list when they disconnect.
     playerRef.onDisconnect().remove();
     console.log("setting thisPlayerkey");
     thisPlayerKey = playerRef.key;
     flagThisPlayer($(`button[data-key=${thisPlayerKey}]`));
});

playersRef.on("child_added", function(snapshot) {
    //console.log("child added");
    let newPlayer = $("<button>")
        .text(snapshot.val().name)  
        .addClass("list-group-item list-group-item-action competitor")
        .attr('data-key', snapshot.key)
        .attr('data-toggle', "modal")
        .attr('data-target', '#challenge-modal');
    if (snapshot.key === thisPlayerKey) {
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
    if ($(this).attr("data-action") === "challenge") {
        $("#challenge-comm").text(`Waiting for ${opponentName} to accept your challenge!`);
        let matchRef = matchesRef.push({
            to: opponentKey,
            from: thisPlayerKey
        });
    }
    else if ($(this).attr("data-action") === "accept") {
        
    }
});

// receiving a challenge from another player
matchesRef.on("child_added", function(snapshot) {
    if (snapshot.val().to === thisPlayerKey) {
        opponentName = $(`button[data-key="${snapshot.val().from}"]`).text();
        opponentKey = $(`button[data-key="${snapshot.val().from}"]`).attr("data-key");
        $("#challenge-comm").text(`${opponentName} is challenging you to play rock/paper/scissors. Accept?`);
        $("#button-challenge").attr("data-action", "accept");
        $('#challenge-modal').modal("show");
    }
});