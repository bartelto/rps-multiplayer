//global variables
let competitorName = "";
let competitorKey = "";

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
let challengesRef = database.ref("/challenges");
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

$(document).on("click", ".competitor", function() {
    console.log("here");
    console.log("clicked " + $(this).text());
    competitorName = $(this).text();
    competitorKey = $(this).attr("data-key");
    $("#challenge-comm").text(`Do you want to challenge ${competitorName} to play rock/paper/scissors?`);

});

$("#button-challenge").on("click", function() {
    $("#challenge-comm").text(`Waiting for ${competitorName} to accept your challenge!`);
    let challengeRef = challengesRef.push({
        to: competitorKey,
        from: thisPlayerKey
    });
});