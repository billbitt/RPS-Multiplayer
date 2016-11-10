
// Create a variable to reference the database.
var database = firebase.database();
//create player variables
var playerName;
var playerKey;
var playerRef;
var playerId;
var numberOfPlayers = 0;
//create game variables
var state;
var playerChoice; //note: am i using this?
var player1exists = false;
var player2exists = false;
var player1name;
var player2name;



//this function will clear out the contents of the gameplay section for a new game
function setUpGame(){
    //fill in starter info
    $("#player1-header").html("<h3>Waiting for Player 1</h3>");
    $("#game-update").html("<h2>Waiting for players to log in</h2>");
    $("#player2-header").html("<h3>Waiting for Player 2</h3>");
    //clear the player choice areas
    $("#player1-body").empty();
    $("#player2-body").empty();
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

function startNextRound(){
    //clear out game update text
    $("#game-update").text("");
    //reset player choice area
    $("#player1-body").empty();
    $("#player2-body").empty();
    //fill in player choice area
    setUpPlayer(playerId);
    //reset game state
    database.ref("/gameState").set({gameState: "p1"});
}

// When the client's connection state changes...
database.ref(".info/connected").on("value", function(snap) {
	// If someone is connected add a key with value of "true" to the connections list
	if( snap.val() ) {
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
    state = snap.val().gameState;
    console.log("GS: " + state);
    if (state === "need-players"){
        //highlight the middle box
        $("#game-update").text("Waiting for all players to join.")
    } else if (state === "p1") {
        //highlight player 1
        $("#game-update").text(player1name + "'s turn.")
    } else if (state === "p2") {
        //highlight player 2
        $("#game-update").text(player2name + "'s turn.")
    } else if (state === "show-result") {
        //highlight the middle box

    };
    //display the game state
    $("#game-state").text(state);
   
}, function(errorObject){
	alert("firebase encountered an error");
});

//if any player connects we need to set up all the common information that all computers will see
database.ref("/players").on("child_added", function(playerSnap){
    console.log("child added to /players");
    //update the display of players' names, when they are added
    if (playerSnap.getKey() === "p1"){
        console.log("child key is p1");
        player1exists = true;
        console.log("player1exists: " + player1exists)
        //display the player's name and record
        $("#player1-header").html("<p>" + playerSnap.val().playerName + "</p>");
        $("#player1-footer").html("<p>Wins: " + playerSnap.val().wins + ", Losses: " + playerSnap.val().losses + "</p>")
        //store the player's name locally
        player1name = playerSnap.val().playerName;
    };

    if (playerSnap.getKey() === "p2"){
        console.log("child key is p2");
        player2exists = true;
        console.log("player2exists: " + player2exists)
       //display the player's name and record
        $("#player2-header").html("<p>" + playerSnap.val().playerName + "</p>")
        $("#player2-footer").html("<p>Wins: " + playerSnap.val().wins + ", Losses: " + playerSnap.val().losses + "</p>")
        //store the player's name locally
        player2name = playerSnap.val().playerName;
    }; 

    //if 2 players are logged in, hide the ability to log in. also, udpate state.
    if ((player1exists === true) && (player2exists === true)){ 
        //hide the ability to log in
        $("#login-form").hide();
        //set game state to player one's turn
        database.ref("/gameState").update({gameState: "p1"});
    };
    
});
//if any player disconnects, we need to reset the common information that all computers will see
database.ref("/players").on("child_removed", function(playerSnap){
    //if p1 disconnected, reset player 1's play area`
    if (playerSnap.getKey() === "p1"){
        console.log("p1 was removed");
        //reset area
        $("#player1-header").html("<p>Waiting for player 1</p>");
        $("#player1-footer").html("<p></p>")
        //update the local variable for tracking whether p1 exists
        player1exists = false;
        //clear the player's name locally
        player1name = "";
    };
    //if p2 disconnected, reset player 2's play area
    if (playerSnap.getKey() === "p2"){
        console.log("p2 was removed");
        $("#player2-header").html("<p>Waiting for Player 2</p>")
        $("#player2-footer").html("<p></p>")
        //update local tracking variable
        player2exists = false;
        //clear the player's name locally
        player2name = "";
    }; 
    
    //as long as you are not already connected..show the login form
    if((playerId != "p1") && (playerId != "p2")){
        $("#login-form").show();
        database.ref("/gameState").update({gameState: "need-players"});
    };
    
});


database.ref("/players").on("value", function(playersSnap) {   //note: this block used to be on.child_added? 
    console.log("value change in '/players'");

    //if both player's exist, check for choices and run game'  //note: i am getting stuck in an infinite loop here b/c it updates the player then that triggers another go.  need to update after resetting choices.
    if ((player1exists === true) && (player2exists === true)){
        //if both players have made a choice, carry out the game logic
        if ((playersSnap.val().p1.choice != "none") && (playersSnap.val().p2.choice != "none")){
            //get the choices of p1 and p2
            var p1choice = playersSnap.val().p1.choice;
            var p2choice = playersSnap.val().p2.choice;
            //reset their choices so this wont run again.
            database.ref("/players/p1/choice").set("none");
            database.ref("/players/p2/choice").set("none");
            //see who won & update the database with the results
            var result = "Tie";
            if (p1choice === "rock"){
                if (p2choice === "scissors"){
                    database.ref("/players/p1/wins").set(playersSnap.val().p1.wins + 1);
                    database.ref("/players/p2/losses").set(playersSnap.val().p2.losses + 1);
                    result = player1name + "Wins!";
                } else if (p2choice === "paper"){
                    database.ref("/players/p1/losses").set(playersSnap.val().p1.losses + 1);
                    database.ref("/players/p2/wins").set(playersSnap.val().p2.wins + 1);
                    result = player2name + "Wins!";
                };
            } else if (p1choice === "paper"){
                if (p2choice === "rock"){
                    database.ref("/players/p1/wins").set(playersSnap.val().p1.wins + 1);
                    database.ref("/players/p2/losses").set(playersSnap.val().p2.losses + 1);
                    result = player1name + "Wins!";
                } else if (p2choice === "scissors"){
                    database.ref("/players/p1/losses").set(playersSnap.val().p1.losses + 1);
                    database.ref("/players/p2/wins").set(playersSnap.val().p2.wins + 1);
                    result = player2name + "Wins!";
                };
            } else if (p1choice === "scissors"){
                if (p2choice === "paper"){
                    database.ref("/players/p1/wins").set(playersSnap.val().p1.wins + 1);
                    database.ref("/players/p2/losses").set(playersSnap.val().p2.losses + 1);
                    result = player1name + "Wins!";
                } else if (p2choice === "rock"){
                    database.ref("/players/p1/losses").set(playersSnap.val().p1.losses + 1);
                    database.ref("/players/p2/wins").set(playersSnap.val().p2.wins + 1);
                    result = player2name + "Wins!";
                };
            };
            //display result locally
            $("#game-update").text(result)
            //set a timer to execute the "nextRound" function 
            setTimeout(startNextRound, 3000)
        };
    };

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
    //update the number of players
    numberOfPlayers += 1;
    //create the player's player id
    //figure out if you are player 1 or player 2.
    if(player1exists === false){  //NOTE: snap doesnt work here in this function so using the variables updated above in the listener
        //then this player is player 1
        playerId = "p1";
    //otherwise if p1 does exist
    } else {
        //then this player is player 2
        playerId = "p2";
    };

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
    //set a disconnect function for the player you just added so it will remove itself when (NEW 6:20pm)
    playerRef.onDisconnect().remove();
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
    if ( state === playerId){
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
        if (state === "p1"){
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

//run game
setUpGame();