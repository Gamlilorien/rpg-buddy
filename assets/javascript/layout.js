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
    var cName = "Anonymous";
    //set initial settings on page load
    $("#cName").text(cName);

    function getUserName() {
        //get value from form
        cName = $("#name-input").val().trim();
        console.log(cName);
        //update settings to reflect change
        $("#cName").text(cName);
        //don't forget to empty the form textbox after submiting
        $("#name-input").val("");
    };

    //set value of dice array to settings popover when ever it changes.
    function showDiceArray() {
        $("#dieButton-array").text(buttons);
    }
    

//************** FIREBASE MANIPULATION *********
function setFirebase() {
    database.ref().set({
        buttons: buttons,
        systems: systems,
        log: log_history
      });
};

function pushFirebase() {
    dbvalue.ref().push({
        log: newLog
      });
};


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
         dbvalue = snapshot.val();
         console.log(dbvalue);
  
         log_history = dbvalue.log;
         //console.log(log_history);
         //first we need to clear existing log values in the HTML or we will see duplicates
         $("#tabletop-view").empty();
        //now display the latest Firebase results in the HTML
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

        //added this function here so it also updates the printed list in the settings popover
        showDiceArray();
    };

    function addNewButton () {
        //get the input VALUE as a variable. TRIM any excess spaces or characters
        var dieButton = $("#die-input").val().trim();
        //don't forget to empty the form textbox after submiting
        $("#die-input").val("");
        //PUSH this new value to the 'buttons' array
        buttons.push(dieButton);
    };


    //this function is triggered by clicking on the 'Trim Log Results' button
    //it will remove all but the 3 most recent items from the log_history array
    //replace with the existing firebase value for 'log'
    //and then the database.ref().on("value"... will do the rest
    function trimLogs() {
        //grab the last 3 items from the log_history array
        //if the array length is 6, I would want indexes [3, 4, 5]
        var len = log_history.length;
        //if len > 3 then do len -3, -2, -1
        if (len > 3) {
            var a1 = log_history[len -3];
            var a2 = log_history[len -2];
            var a3 = log_history[len -1];
            var newLog = [a1, a2, a3];
            console.log(newLog);
            //now update the log_history value with this value and push it to Firebase
            log_history = newLog;
            setFirebase();
        }
        //else nothing
    };

    
//*********** ADD NEW BUTTON and CREATE BUTTONS
    // We need a onClick trigger for the +Add form button
    $("#add-die").on("click", function(event) {
        
        event.preventDefault(); // this prevents the html form from relaoding the page on submit
        //now add this new value to the 'buttons' array, and then update the buttons
        addNewButton();

        createButtons();
    });

    //Add click event for the Set Name button on the settings page
    $("#add-name").on("click", function(event) {
        
        event.preventDefault(); // this prevents the html form from relaoding the page on submit
        //now add this new value to the 'buttons' array, and then update the buttons
        getUserName();
    });

    //Generates the log records in the html FROM the Firebase results so it updtes dynamically
    function displayLogRecords() {
        var len = log_history.length;
        for (i = 0; i < len; i++) {
            var values = log_history[i].split("|");
            var CurrentDate = values[1];
            var summary = values[0];
            //console.log(summary);
            //console.log(CurrentDate);
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
   
    
   
    //option for users to clear giff results on their own.
    $(document).on("click", "#trimLogs", trimLogs);


    createButtons();
    //getUserName();

    