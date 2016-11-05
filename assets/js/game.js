
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


//add "on click" function to the login form's button to submit player info
$("#login-form-btn").on("click", function(){

    //return false so it doesnt reload page
    return false;
})

