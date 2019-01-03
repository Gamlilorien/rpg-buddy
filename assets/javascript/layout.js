// ********** FIREBASE
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDE9oqcZaqgigTAzbiq6Cz3swSAmeuXrpE",
    authDomain: "tabletop-buddy-f0924.firebaseapp.com",
    databaseURL: "https://tabletop-buddy-f0924.firebaseio.com",
    projectId: "tabletop-buddy-f0924",
    storageBucket: "tabletop-buddy-f0924.appspot.com",
    messagingSenderId: "956732188092"
  };
  firebase.initializeApp(config);


// ********** VARIABLES
    var database = firebase.database();
    // console.log(database);

    var systems = ["Rifts", "Transformers", "Conan", "DC", "Battlestations"];

    // we want an array of diceRoll buttons titled 'buttons'
    var buttons = [
        "d20",
        "d100",
        "d10",
        "6d6",
        "5d6",
        "4d6",
        "3d6",
        "2d6",
        "d6",
        "d4"
    ];

    var log_history = [];

//************** FIREBASE MANIPULATION *********
function setFirebase() {
    database.ref().set({
        buttons: buttons,
        systems: systems,
        log: log_history
      });
};

function pushFirebase() {
    database.ref().push({
        log: newLog
      });
};
// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

    //Now that these items are in firebase, we don't need to re-assign them
    // database.ref().set({
    //     buttons: buttons,
    //     systems: systems,
    //     log: log_history
    //   });

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#connected-viewers").text(snap.numChildren());
});

// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
//database.ref().on("child_added", function(childSnapshot) {

    // Log everything that's coming out of snapshot
    //console.log(childSnapshot.val().log);
    //console.log(childSnapshot.val().dataAdded);
  
//     log_history = childSnapshot.val().log;

//     //now append to HTML rather than re-writing all log items
        
  
//     // Handle the errors
//   }, function(errorObject) {
//     console.log("Errors handled: " + errorObject.code);
//   });


// Using .on("value", function(snapshot)) syntax will retrieve the data
// from the database (both initially and every time something changes)
// This will then store the data inside the variable "snapshot". We could rename "snapshot" to anything.
    database.ref().on("value", function(snapshot) {

         // Then we console.log the value of snapshot
         var value = snapshot.val();
         //console.log(value);
  
         log_history = value.log;
         //console.log(log_history);
         //now display results in the HTML
         displayLogRecords();
       });


//********** FUNCTIONS
    //Buttons get rebuilt each time so we need a function
    function createButtons () {
        // first we need to empty the current giphs if any...
        $("#button-view").empty();

        // now loop through 'buttons' array and make a button for each
        for (i =0; i < buttons.length; i++) {
            //now create a new button element, assign it a css class, and label it with the array value
            var newButton = $("<button>");
            newButton = newButton.addClass("rollDie btn btn-primary").text(buttons[i]);
            $("#button-view").append(newButton);
        }
    };

    function addNewButton () {
        //get the input VALUE as a variable. TRIM any excess spaces or characters
        var newSuperhero = $("#die-input").val().trim();
        //don't forget to empty the form textbox after submiting
        $("#die-input").val("");
        //PUSH this new value to the 'buttons' array
        buttons.push(newSuperhero);
    };



    function clearLogList() {
        $("#tabletop-view").empty();
        $("#resultCount").empty();
        //need to clear variable too
        countResults = 0;

    };

    
//*********** ADD NEW BUTTON and CREATE BUTTONS
    // We need a onClick trigger for the +Add form button
    $("#add-die").on("click", function(event) {
        
        event.preventDefault(); // this prevents the html form from relaoding the page on submit
        //now add this new value to the 'buttons' array, and then update the buttons
        addNewButton();

        createButtons();
    });

    //Generates the log records in the html FROM the Firebase results so it updtes dynamically
    function displayLogRecords() {
        var len = log_history.length -1;
        for (i = 0; i < len; i++) {
            var values = log_history[i].split("|");
            var CurrentDate = values[1];
            var summary = values[0];
            //console.log(summary);
            var content = $("<p>").addClass("log-result").html(summary).append(
              $("<p>").addClass("log-timestamp").html(CurrentDate)
            );
          
            var log = $("<div>").addClass("log-container").html(
              content
            );
            //prepend result to page so most recent entries (ie ones with the higer index) appear on top
            $("#tabletop-view").prepend(log);
        }
    }; 

//Call the createButtons function automatically (ie when page loads)
    createButtons();
    
   
    //option for users to clear giff results on their own.
    $(document).on("click", "#clearLogList", clearLogList);