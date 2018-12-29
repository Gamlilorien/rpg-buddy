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
    // we want an array of superheroes titled 'topics'
    var database = firebase.database();
    // console.log(database);

    var systems = [
        "Rifts",
        "Transformers",
        "Conan",
        "Battlestations"
    ];

    var topics = [
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

//************** FIREBASE MANIPULATION *********
// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function(snap) {

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




//********** FUNCTIONS
    //Buttons get rebuilt each time so we need a function
    function createButtons () {
        // first we need to empty the current giphs if any...
        $("#button-view").empty();

        // now loop through 'topics' array and make a button for each
        for (i =0; i < topics.length; i++) {
            //now create a new button element, assign it a css class, and label it with the array value
            var newButton = $("<button>");
            newButton = newButton.addClass("rollDie btn btn-primary").text(topics[i]);
            $("#button-view").append(newButton);
        }
    };

    function addNewButton () {
        //get the input VALUE as a variable. TRIM any excess spaces or characters
        var newSuperhero = $("#die-input").val().trim();
        //don't forget to empty the form textbox after submiting
        $("#die-input").val("");
        //PUSH this new value to the 'topics' array
        topics.push(newSuperhero);
    };

//**************** GIPHY API
    //we want a way to save the returned giphy results for later parsing
    var giphyResults = {};

    var countResults = 0;
//Code for connecting to and parsing data from the Giphy API
//see https://developers.giphy.com/explorer/

//sample SEARCH request
// https://api.giphy.com/v1/gifs/search?api_key=pwoVnnT9lpebiS2XpkHvqJ1Ehl8Q1CnH&q=superman&limit=10&offset=0&rating=G&lang=en
    function parseGiphyResults() {        
        
        //first, create a responsive flexbox row
        var newRow = $("<div>").addClass("row");

        //we want to loop through the results and grab the fixed width image, and image rating
        for (i = 0; 1 < giphyResults.length; i++) {

            //create new <img> element
            var still = giphyResults[i].images.fixed_height_still.url;
            var giff = giphyResults[i].images.fixed_height.url;
            //also add a "giff" class to it, the initial src url, and data-animate, data-still, and data-state attributes too.
            var newImg = $("<img>").addClass("giff").attr({"src": still, "data-animate": giff, "data-still": still, "data-state": "still"});

            var title = "<p>Title: " +giphyResults[i].title +"</p>";
            var rating = "<p>Rating: " +giphyResults[i].rating +"</p>";
            var download = "<a href='" +giff +"' download='" +giphyResults[i].title +"'><i class='fas fa-save fa-2x'></i></a>"

            // this is what we are trying to build
            // <a href="assets/images/drive-by_laugh.gif" download><i class="fas fa-save fa-2x"></i></a>

            //combine it all togehter in a column div
            var newCol = $("<div>").addClass("col-sm").append(newImg);
            newCol = newCol.append(title);
            newCol = newCol.append(rating);
            newCol = newCol.append(download);

            //add to the HTML variable
            
            newRow = newRow.append(newCol);

            $("#giphy-view").append(newRow);

            //update countResults by 10.... for some reason +10 made it 100 not 10. Was it treating like a string?
            countResults = countResults + 1;
            $("#resultCount").text(countResults);

        }
    
    };

    function displayGiffs() {

        //fist, clear previous images if any
        //disabled this step to allow a running list of results        
        //define temp variables
        var method = "search";
        var apiKey = "pwoVnnT9lpebiS2XpkHvqJ1Ehl8Q1CnH";
        var search = $(this).text();

        var queryURL = "https://api.giphy.com/v1/gifs/" +method +"?api_key=" +apiKey +"&q=" +search +"&limit=10&offset=0&lang=en";
        // console.log(queryURL);

        $.ajax({
        url: queryURL,
        method: "GET"
        }).then(function(response) {
            // console.log(response);
            //save results as global variable for parsing
            giphyResults = response.data;

            //now parse giphyResults and insert into the page
            //this NEEDS to be included here and not below due to the slight lag in response from the API. Otherwise it tries to immediately run and results in an error...
            parseGiphyResults();
        });

    };

    function toggleGiffs() {
        // console.log(this);
        //we will toggle each giff to either STILL or ANIMATE
        var state = $(this).attr("data-state");
  
        if (state == "still") {
        //   console.log("still");
          $(this).attr("src", $(this).attr("data-animate"));
          $(this).attr("data-state", "animate")
        }
  
        if (state == "animate") {
        //   console.log("animate");
          $(this).attr("src", $(this).attr("data-still"));
          $(this).attr("data-state", "still");
        }
  
    };

    function clearGiffs() {
        $("#tabletop-view").empty();
        $("#resultCount").empty();
        //need to clear variable too
        countResults = 0;

    };

    //atempting to force download image using javascript
    //see: http://forums.devshed.com/javascript-development-115/save-image-webpage-using-javascript-157493.html
    //would need this in HTML to work
    //<a HREF="javascript: void 0">   
    //<IMG  ONCLICK="saveImageAs(document.anImage); return false" NAME="anImage" SRC="http://www.mosharakah.com/images/icons/messenger/7052005214036.gif"></a>
  
    function saveImageAs (imgOrURL) {
        if (typeof imgOrURL == 'object')
          imgOrURL = imgOrURL.src;
        window.win = open (imgOrURL);
        setTimeout('win.resizeTo(0, 0);',100);
        setTimeout('win.moveTo(0, 0);',200);
        setTimeout('win.document.execCommand("SaveAs")', 500);
        setTimeout('win.close()',1000);
      }
    
//*********** ADD NEW BUTTON and CREATE BUTTONS
    // We need a onClick trigger for the +Add form button
    $("#add-die").on("click", function(event) {
        
        event.preventDefault(); // this prevents the html form from relaoding the page on submit
        //now add this new value to the 'topics' array, and then update the buttons
        addNewButton();

        createButtons();
    });


//Call the createButtons function automatically (ie when page loads)
    createButtons();
    

    $(document).on("click", ".giff", toggleGiffs);
    // Again trying to use this DIDN'T work $(".gif").on("click", function() {
   
    //option for users to clear giff results on their own.
    $(document).on("click", "#clearGiffs", clearGiffs);