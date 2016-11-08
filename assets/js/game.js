
// Create a variable to reference the database.
var database = firebase.database();
//create player variables
var playerName;
var playerKey;
var playerRef;
var playerId;
var numberOfPlayers = 0;
//create game variables
var gameState;
var playerChoice;

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
    console.log("number of connections: " + snap.numChildren());
	$("#connected-viewers").text(snap.numChildren());
}, function(errorObject){
	alert("firebase encountered an error");
});

database.ref("/gameState").on("value", function(snap) {
    gameState = snap.val().gameState;
    console.log("GS: " + gameState);
    if (gameState === "need-players"){
        //highlight the middle box
    } else if (gameState === "p1") {
        //highlight player 1
    } else if (gameState === "p2") {
        //highlight player 2
    } else if (gameState === "show-result") {
        //highlight the middle box 
    };
    //display the game state
    $("#game-state").text(gameState);
   
}, function(errorObject){
	alert("firebase encountered an error");
});

database.ref("/players").on("child_added", function(snap) {
    numberOfPlayers += 1;
    console.log("new player added");
    console.log(snap);
    //if 2 players are logged in, hide the ability to log in, otherwise, show it
    if (numberOfPlayers === 2) {
        $("#login-form").hide();
        //set game state to player one's turn
        database.ref("/gameState").update({gameState: "p1"});
    };
}, function(errorObject){
	alert("firebase encountered an error");
});

database.ref("/players").on("value", function(snap) {
    
    //if both players have chosen a play, then carry out the play
        //stuff here

    //update the display of players' names, if they exist...
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
    console.log("message added to chat log");
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


//functionality when player clicks the login button
$("#login-form-btn").on("click", function(){
    //figure out if you are player 1 or player 2
    var playerNumber = numberOfPlayers + 1; //number of players comes from a global variable being updated by a database listener.
    playerId = "p" + playerNumber;
    //store the name locally
    playerName = $("#login-form-name").val().trim()
    //create the player object  //NOTE: would be cool to pull history from cookies if they have logged in before.
    var newPlayerData = {
        losses: 0,
        playerName: playerName,
        choice: "none",
        wins: 0
    };
    //set the player data and store the key in playerKey
    database.ref("/players/" + playerId).set(newPlayerData);
    //store the player's ref'
    playerRef = database.ref("/players/" + playerId);
    //conole logs for test
    console.log("player ref: " + playerRef);
    console.log("player id: " + playerId);
    //hide the login form because this player has already logged in
    $("#login-form").hide();
    //display
    setUpPlayer(playerId);
    //return false so it doesnt reload page
    return false;
});

//update the player's choice when button is clicked
$(document).on("click", ".game-choice", function(){
    //if it's your turn, execute your selection'
    if ( gameState === playerId){
        //grab the name of the clicked element and save it in the player's choice variable
        playerChoice = $(this).attr("data-name");
        console.log("player's choice: " + playerChoice);
        //update the server with the player's choices
        playerRef.update({choice: playerChoice});
        //create a display of the selections
        var choiceDisplay = $("<h2>");
        choiceDisplay.addClass("playerChoice");
        choiceDisplay.text(playerChoice);
        $(this).after(choiceDisplay);
        //remove all choices
        $(".game-choice").remove();
        
        //switch the game state
        if (gameState === "p1"){
            database.ref("/gameState").set({gameState: "p2"});
        } else {
            database.ref("/gameState").set({gameState: "show-results"});
        }
    }
    return false;
});

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
});

//this function will clear out the contents of the gameplay section for a new game
function setUpGame(){
    //fill in starter info
    $("#player1-header").html("<h3>Waiting for Player 1</h3>");
    $("#game-update").html("<h2>Waiting for players to log in</h2>");
    $("#player2-header").html("<h3>Waiting for Player 2</h3>");
    //set initial game state
    database.ref("/gameState").set({gameState: "need-players"});
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
    rock.attr("data-name", "rock");
    playerArea.append(rock);
    var paper = $("<h2 class='game-choice'>Paper</h2>");
    paper.attr("data-name", "paper");
    playerArea.append(paper);
    var scissors = $("<h2 class='game-choice'>scissors</h2>");
    scissors.attr("data-name", "scissors");
    playerArea.append(scissors);
    //add on.click functions? or do that outside
}

//this function will reset part of the game if a player disconnects
function playerDisconnected(playerId){
    //clear out that player's field

}


//run game
setUpGame();