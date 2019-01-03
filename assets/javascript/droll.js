//See: https://github.com/thebinarypenguin/droll

(function(root) {

    "use strict";
 
   var droll = {};
 
   // Define a "class" to represent a formula
   function DrollFormula() {
     this.numDice   = 0;
     this.numSides  = 0;
     this.modifier  = 0;
     
     this.minResult = 0;
     this.maxResult = 0;
     this.avgResult = 0;
   }
 
   // Define a "class" to represent the results of the roll
   function DrollResult() {
     this.rolls    = [];
     this.modifier = 0;
     this.total    = 0;
   }
 
   /**
    * Returns a string representation of the roll result
    */
   DrollResult.prototype.toString = function() {
     if (this.rolls.length === 1 && this.modifier === 0) {
       return this.rolls[0] + '';
     }
 
     if (this.rolls.length > 1 && this.modifier === 0) {
       return this.rolls.join(' + ') + ' = ' + this.total;
     }
 
     if (this.rolls.length === 1 && this.modifier > 0) {
       return this.rolls[0] + ' + ' + this.modifier + ' = ' + this.total;
     }
 
     if (this.rolls.length > 1 && this.modifier > 0) {
       return this.rolls.join(' + ') + ' + ' + this.modifier + ' = ' + this.total;
     }
 
     if (this.rolls.length === 1 && this.modifier < 0) {
       return this.rolls[0] + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
     }
 
     if (this.rolls.length > 1 && this.modifier < 0) {
       return this.rolls.join(' + ') + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
     }
   };
 
   /**
    * Parse the formula into its component pieces.
    * Returns a DrollFormula object on success or false on failure.
    */
   droll.parse = function(formula) {
     var pieces = null;
     var result = new DrollFormula();
 
     pieces = formula.match(/^([1-9]\d*)?d([1-9]\d*)([+-]\d+)?$/i);
     if (!pieces) { return false; }
 
     result.numDice  = (pieces[1] - 0) || 1;
     result.numSides = (pieces[2] - 0);
     result.modifier = (pieces[3] - 0) || 0;
 
     result.minResult = (result.numDice * 1) + result.modifier;
     result.maxResult = (result.numDice * result.numSides) + result.modifier;
     result.avgResult = (result.maxResult + result.minResult) / 2;
 
     return result;
   };
 
   /**
    * Test the validity of the formula.
    * Returns true on success or false on failure.
    */
   droll.validate = function(formula) {
     return (droll.parse(formula)) ? true : false ;
   };
 
   /**
    * Roll the dice defined by the formula.
    * Returns a DrollResult object on success or false on failure.
    */
   droll.roll = function(formula) {
     var pieces = null;
     var result = new DrollResult();
 
     pieces = droll.parse(formula);
     if (!pieces) { return false; }
 
     for (var a=0; a<pieces.numDice; a++) {
       result.rolls[a] = (1 + Math.floor(Math.random() * pieces.numSides));
     }
 
     result.modifier = pieces.modifier;
 
     for (var b=0; b<result.rolls.length; b++) {
       result.total += result.rolls[b];
     }
     result.total += result.modifier;
 
     return result;
   };
 
   // Export library for use in node.js or browser
   if (typeof module !== 'undefined' && module.exports) {
     module.exports = droll;
   } else {
     root.droll = droll;
   }
 
 }(this));


// Custom functions added by JCMH
function roll(die) {
  var result = droll.roll(die);
  var total = result.total;
  var diceRolls = result.rolls.join("+");
  var modifier = result.modifier;
  if (modifier > 0) {
    var summary = "Rolled a " +total +" (" +die +": " +diceRolls +"+" +modifier +"=" +total +")";
  } else {
    var summary = "Rolled a " +total +" (" +die +": " +diceRolls +"=" +total +")";
  }
  var CurrentDate = moment().format("l, LTS");


  //set values as string so it can be pushed to Firebase
  newLog = summary +"|" +CurrentDate;
  console.log(newLog);

  //push to local variable and then SET to database to override existing database value
  log_history.push(newLog);

  console.log(log_history);
  //Disabled this because it keeps making a new instance in Firebase rather than pushing to the existing instance
  // database.ref().push({
  //   log: newLog,
  //   dateAdded: firebase.database.ServerValue.TIMESTAMP
  // });

  //set erases ALL instances and starts over...
  // database.ref().set({
  //   log: log_history
  // });

  //now append to current page
  showRowResults(summary, CurrentDate);

  //pushFirebase();
  //log_history.push(summary +"|" +CurrentDate);
};


function rollButton() {
  var die = $(this).text();
  roll(die);
};

function rollInput() {
  var die = $("#qRoll-input").val().trim();
  roll(die);
  //now clear input
  $("#qRoll-input").val("");
};

function showRowResults(result, date) {
    var content = $("<p>").addClass("log-result").html(result).append(
      $("<p>").addClass("log-timestamp").html(date)
    );
  
    var log = $("<div>").addClass("log-container").html(
      content
    );
    //prepend result to page so most recent entries (ie ones with the higer index) appear on top
    $("#tabletop-view").prepend(log);
};

//Sample result for testing
// var result = droll.roll('d6+1');
// var total = result.total;
// console.log(result);
// console.log(total);

//we need a listner for quickRolls
$("#quickRoll").on("click", function(event) {
        
  event.preventDefault(); // this prevents the html form from relaoding the page on submit
  //now add this new value to the 'buttons' array, and then update the buttons
  rollInput();
});
// Adding click event listeners to all elements with a class of "rollDie"
$(document).on("click", ".rollDie", rollButton);

// database.ref().on("child_added", function(childSnapshot) {
//   console.log(childSnapshot);
// });