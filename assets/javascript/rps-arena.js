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


$("#button-enter").on("click", function() {
    console.log("new player: " + $("#input-screen-name").val());
     // Add user to the players list.
     let playerRef = playersRef.push({
         name: $("#input-screen-name").val()
     });
     console.log(playerRef);
     // Remove user from the players list when they disconnect.
     playerRef.onDisconnect().remove();
});

playersRef.on("child_added", function(snapshot) {
    console.log(snapshot.val());
    let newPlayer = $("<li>")
        .text(snapshot.val().name)
        .addClass("list-group-item")
        .attr('data-key', snapshot.key);
    $("#players-list").append(newPlayer);
});

playersRef.on("child_removed", function(snapshot) {
    console.log("child removed: " + snapshot.key);
    $(`li[data-key=${snapshot.key}]`).remove();
});