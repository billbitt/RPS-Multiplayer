
// Create a variable to reference the database.
var database = firebase.database();

//create player variables
var playerName;
var playerKey;
var playerId;
var numberOfPlayers;

// When the client's connection state changes...
database.ref(".info/connected").on("value", function(snap) {
	// If someone is connected..
	if( snap.val() ) {
		// Add user to the connections list.
		var con = database.ref("/connections").push(true);
		// Remove user from the connection list when they disconnect.
		con.onDisconnect().remove();
	};
}, function(errorObject){
	alert("firebase encountered an error");
});

// When first loaded or when the connections list changes...
database.ref("/connections").on("value", function(snap) {
	// Display the viewer count in the html. The number of online users is the number of children in the connections list.
    console.log(snap.numChildren());
	$("#connected-viewers").text(snap.numChildren());
}, function(errorObject){
	alert("firebase encountered an error");
});

database.ref("/gameState").on("value", function(snap) {
    var state = snap.val().gameState;
    if (state === "need-players"){
        //stuff
    } else if (state === "player-one-turn") {
        //stuff
    } else if (state === "player-two-turn") {
        //stuff
    } else if (state === "show-result") {
        //stuff 
    };
   
}, function(errorObject){
	alert("firebase encountered an error");
});

database.ref("/players").on("value", function(snap) {
    //figure out how many players are logged in
    numberOfPlayers = parseInt(snap.numChildren());
    //if 2 players are logged in, hide the ability to log in, otherwise, show it
    if (numberOfPlayers >= 2) {
        $("#login-form").hide();
        //set game state to player one's turn'
        database.ref("/gameState").set({
            gameState: "player-one"
        });
    } else {
        $("#login-form").show();
    };

    //update the display of player's names, if they exist
    if (snap.child("p1").exists()){
        console.log("p1 exists");
        //display the player's name and record
        $("#player1-header").html("<p>" + snap.val().p1.playerName + "</p>");
        $("#player1-footer").html("<p>Wins: " + snap.val().p1.wins + ", Losses: " + snap.val().p1.losses + "</p>")
    };
    
    if (snap.child("p2").exists()){
        console.log("p2 exists");
       //display the player's name and record
        $("#player2-header").html("<p>" + snap.val().p2.playerName + "</p>")
        $("#player1-footer").html("<p>Wins: " + snap.val().p2.wins + ", Losses: " + snap.val().p2.losses + "</p>")
    };
    
}, function(errorObject){
	alert("firebase encountered an error");
});

database.ref("/players").on("child_added", function(snap) {
    console.log("new player added");
}, function(errorObject){
	alert("firebase encountered an error");
});

//if data in the players change, see if it is time to compare results
database.ref("/players").on("child_changed", function(snap) {
    console.log("child info changed");
    //compare their selections

    //if the selections are both valid, then compare them 

}, function(errorObject){
	alert("firebase encountered an error");
});

//on initial load, get a snapshot.  also if any values change, get a snapshot.
database.ref("/chatLog").on("child_added", function(childSnapshot){
	// Console.log the initial "snapshot" value (the object itself)
    console.log("child added");
    //update the chat window by adding the latest chat
    var latestMessage = $("<p>");
    latestMessage.addClass("chat-text");
    latestMessage.text(childSnapshot.val().message);
    $("#chat-display").append(latestMessage);
    //scroll the chat log to show newest chat
    var c = $("#chat-display");
    c.scrollTop(c.prop("scrollHeight"));
}, function(errorObject){
	alert("firebase encountered an error");
});

//let everyone know a new player is watching the chat by adding a child
database.ref("/chatLog").push({
	message: "<-- a new user has entered chat -->",
    dateAdded: firebase.database.ServerValue.TIMESTAMP
}); 


//functionality when player clicks the login button
$("#login-form-btn").on("click", function(){
    //figure out if you are player 1 or player 2
    var playerNumber = numberOfPlayers + 1; 
    playerId = "p" + playerNumber;
    //store the name locally
    playerName = $("#login-form-name").val().trim()
    //create the player object  //NOTE: would be cool to pull history from cookies if they have logged in before.
    var newPlayerData = {
        losses: 0,
        playerName: playerName,
        wins: 0
    };
    //push the player data and store the key in playerKey
    var playerKey = database.ref("/players/" + playerId).set(newPlayerData).key;
    //conole logs for test
    console.log("player key: " + playerKey);
    console.log("player id: " + playerId);
    //hide the login form because this player has already logged in
    $("#login-form").hide();
    //display
    setUpPlayer(playerId);
    //return false so it doesnt reload page
    return false;
})

//functionality when player clicks the chat button
$("#chat-form-btn").on("click", function(){
    //go get the message from the chat input 
    var newMessage = (playerName + ": " + $("#chat-form-input").val().trim());
    //post the chat to the database
    database.ref("/chatLog").push({
        message: newMessage,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
    //clear out the value of the form so their chat input is refreshed.
    $("#chat-form-input").val("");
    //return false so it doesnt reload page
    return false;
})

//this function will clear out the contents of the gameplay section for a new game
function setUpGame(){
    //fill in starter info
    $("#player1-header").html("<h3>Waiting for Player 1</h3>");
    $("#game-status").html("<h2>Waiting for players to log in</h2>");
    $("#player2-header").html("<h3>Waiting for Player 2</h3>");
    //set initial game state
    database.ref("/gameState").set({
        gameState: "need-players"
    });
}

function setUpPlayer(playerId){
    //decide which player area to edit
    var playerArea;
    if (playerId === "p1"){
        playerArea = $("#player1-body");
    } else if (playerId === "p2") {
        playerArea = $("#player2-body");
    };
    //clear out contents of the area where the selections will go
    playerArea.empty();
    //fill in the selections
    var rock = $("<h2 class='game-choice'>Rock</h2>");
    rock.data("name", "rock");
    playerArea.append(rock);
    var paper = $("<h2 class='game-choice'>Paper</h2>");
    paper.data("name", "paper");
    playerArea.append(paper);
    var scissors = $("<h2 class='game-choice'>scissors</h2>");
    scissors.data("name", "scissors");
    //add on.click functions? or do that outside
}

//this function will reset part of the game if a player disconnects
function playerDisconnected(playerId){
    //clear out that player's field

}


//run game
setUpGame();