
// Create a variable to reference the database.
var database = firebase.database();


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
	// Display the viewer count in the html.
	// The number of online users is the number of children in the connections list.
    console.log(snap.numChildren());
	$("#connected-viewers").text(snap.numChildren());
});

//let everyone know a new player is watching the chat
database.ref("/chatdata").set({
	chat: "<-- a new user has entered chat -->",
});

//on initial load, get a snapshot.  also if any values change, get a snapshot.
// v-v-v-v all code for chat box goes here v-v-v-v //
database.ref("/chatdata").on("value", function(snapshot){
	// Console.log the initial "snapshot" value (the object itself)
	console.log("inside chata data value change ref")
    console.log(snapshot);
    
    // get the current value, if any  
        //note:future state - this should just append the most recent of the chat array
    var getMessage = snapshot.val().chat;
    //update the chat window by adding the latest chat
    var latestChat = $("<p>");
    latestChat.addClass("chat-text");
    latestChat.text(getMessage);
    $("#chat-display").append(latestChat);

}, function(errorObject){
	alert("firebase encountered an error");
});



//add "on click" function to the login form's button to submit player info
$("#login-form-btn").on("click", function(){

    //return false so it doesnt reload page
    return false;
})

//add "on click" function to the login form's button to submit player info
$("#chat-form-btn").on("click", function(){
    //debugger;
    //store the chat
    var newChat = $("#chat-form-input").val().trim();

    //post the chat to the database
    database.ref("/chatdata").set({
        chat: newChat,
    });

    //return false so it doesnt reload page
    return false;
})
