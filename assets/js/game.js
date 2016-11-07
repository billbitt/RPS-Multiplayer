
// Create a variable to reference the database.
var database = firebase.database();

//create player variables
var playerName;
var playerKey;
var playerId;
var numberOfPlayers;

// '.info/connected' is a special location provided by Firebase that is updated every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are 
// When the client's connection state changes...
database.ref(".info/connected").on("value", function(snap) {
	// If someone is connected..
	if( snap.val() ) {
		// Add user to the connections list.
		var con = database.ref("/connections").push(true);
		// Remove user from the connection list when they disconnect.
		con.onDisconnect().remove();
	};
});

// database.ref("/connections") references a secific location in our database.
// All of our connections will be stored in this directory.
// When first loaded or when the connections list changes...
database.ref("/connections").on("value", function(snap) {
	// Display the viewer count in the html. The number of online users is the number of children in the connections list.
    console.log(snap.numChildren());
	$("#connected-viewers").text(snap.numChildren());
});

database.ref("/gameState").on("value", function(snap) {
    var state = snap.val().gameState;
    if (state === "need-players"){
        //stuff
    } else if (state === "player-one") {
        //stuff
    } else if (state === "player-two") {
        //stuff
    } else if (state === "result") {
        //stuff 
    };
   
});

database.ref("/players").on("value", function(snap) {
    //if 2 players are logged in, hide the ability to log in, otherwise, show it
    numberOfPlayers = parseInt(snap.numChildren());
    if (numberOfPlayers >= 2) {
        $("#login-form").hide();
        //set game state to player one's turn'
        database.ref("/gameState").set({
            gameState: "player-one"
        });
    } else {
        $("#login-form").show();
    };
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
    //store the name locally
    playerName = $("#login-form-name").val().trim()
    //create the player object  //NOTE: would be cool to pull history from cookies if they have logged in before.
    var newPlayerData = {
        losses: 0,
        name: playerName,
        wins: 0
    };
    var newPlayer = database.ref("/players").push(newPlayerData);
    //store the player key so we can access it on the database
    playerKey = newPlayer.key;
    console.log("player key: " + playerKey);
    //link the player to the appropriate box 
    playerId = numberOfPlayers;
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
    //clear out contents of each of the gameplay boxes
    $(".gameplay-component").empty();
    //fill in starter info
    $("#player1-section").html("<h2>Waiting for Player 1</h2>");
    $("#game-status").html("<h3>Waiting for players to log in</h3>");
    $("#player2-section").html("<h2>Waiting for Player 2</h2>");
    //set initial game state
    database.ref("/gameState").set({
        gameState: "need-players"
    });
}

function setUpPlayer(playerId){
    //decide which player area to edit
    var playerArea;
    if (playerId === 1){
        playerArea = $("#player1-section");
    } else if (playerId === 2) {
        playerArea = $("#player2-section");
    };
    //clear out contents of each of the gameplay boxes
    playerArea.empty();
    //fill in starter info
    playerArea.html("<h3>" + playerName + "</h3>");  //note: get player name from database
    var rock = $("<h2 class='game-choice'>Rock</h2>");
    rock.data("name", "rock");
    playerArea.append(rock);
    var paper = $("<h2 class='game-choice'>Paper</h2>");
    paper.data("name", "paper");
    playerArea.append(paper);
    var scissors = $("<h2 class='game-choice'>scissors</h2>");
    scissors.data("name", "scissors");
    playerArea.append(scissors);
    playerArea.append("<div class='player-stats' id='wins'>Wins: </div>");
    playerArea.append("<div class='player-stats' id='losses'>Losses: </div>");
}

//this function will reset part of the game if a player disconnects
function playerDisconnected(playerId){
    //clear out that player's field

}


//run game
setUpGame();