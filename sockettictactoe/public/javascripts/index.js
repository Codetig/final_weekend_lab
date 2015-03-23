$(document).ready(function(){

  var playerName = prompt("Please enter your name below:");
  var $chat = $("#chat-msg");

// Tic-tac-toe game
  var counter = 0, //for deciding turns and color
  gameArr = [], //tracking board state
  arrP1 = [], //tracking player1's moves
  arrP2 = [], //tracking player2's moves
  // $btnReset = $('#reset'),
  $p1 = $('#p1'),
  $p2 = $('#p2'),
  $boxes = $('.game');



  var containedIn = function(subArr, arr){ //checks if winning array is in player array
    for (var i = 0; i < subArr.length; i++) {
      if(arr.indexOf(subArr[i]) < 0){
        return false;
      }
    }
    return true;
  };

  var pColor = function(player, color){ //set color of player to play
    // player.style.backgroundColor = color;
    $(player).css("background-color", color);
  };

  var winner = function(arr){
    var winCombo = [
    [$boxes[0], $boxes[3], $boxes[6]],
    [$boxes[1], $boxes[4], $boxes[7]],
    [$boxes[2], $boxes[5], $boxes[8]],
    [$boxes[0], $boxes[1], $boxes[2]],
    [$boxes[3], $boxes[4], $boxes[5]],
    [$boxes[6], $boxes[7], $boxes[8]],
    [$boxes[0], $boxes[4], $boxes[8]],
    [$boxes[2], $boxes[4], $boxes[6]],
    ];

      //checks the player 1 & 2 array against the winning combo if they have more than 3 entries and returns winner
    if(arr.length > 2){
      for (var i = 0; i < winCombo.length; i++) { 
        if(containedIn(winCombo[i], arr)){
          $("#reset").attr("class", "text-center player btn btn-primary");
          console.log(winCombo[i]);
          console.log(arrP1);
          return true;
        }
      }
    }
    return false;
  };

  var boxClick =function(event){
    var target = event.target;
    if (gameArr.indexOf(target) < 0){ //checks to see if the box was already picked before
      gameArr.push(target);
      if(gameArr.length % 2 === 1){
        arrP1.push(gameArr[gameArr.length - 1]);
        pColor(p1,"white");
        pColor(p2,"orange");
        //or: alert("player 2's turn to play");
        target.innerHTML = "X";
        // or target.setAttribute("class", "turnYellow text-center game");
        target.style.backgroundColor = "yellow";
      } else if(gameArr.length % 2 === 0){
        arrP2.push(gameArr[gameArr.length - 1]);
        pColor(p1,"yellow");
        //or: alert("player 1's turn to play");
        pColor(p2,"white");
        target.innerHTML = "O";
        // or target.setAttribute("class", "turnOrange text-center game");
        target.style.backgroundColor = "orange";
      }

        //checks for a winner or a draw.
      if(gameArr.length > 4){
        if(winner(arrP1)){
          alert("Player 1 wins!");
          gameOver();
        } else if(winner(arrP2)){
          alert("Player 2 wins!");
          gameOver();
        }else if(gameArr.length == 9){
          $("#reset").attr("class", "text-center player btn btn-primary");
          alert("The game was a hard-fought tie! Click reset to play again");
          gameOver();
        }
      }
    }
  };

  function gameOver(){
    pColor(p1,"white");
    pColor(p2,"white");
    for (var i = 0; i < $boxes.length; i++) {
      $boxes[i].removeEventListener("click", boxClick);
    }
  }

  $('#reset').on("click",function(e){
    e.preventDefault();
    for (var i = 0; i < $boxes.length; i++) {
      $($boxes[i]).text("");
      $($boxes[i]).css("background-color", "white");
    }
    gameArr = [];
    arrP1 = [];
    arrP2 = [];
    $('.game').on("click", boxClick);
  });

  $('.game').on("click", boxClick);

  //dealing with chat
  var socket = io();
  
  $("#chat-type form").on("submit", function(e){
    // e.preventDefault();
    socket.emit("chat-message", {"name": playerName, "message":$chat.val()});
    $chat.val("");
    return false;
  });

  socket.on("chat-message", function(msg){
    $("#chat-list").append($("<li>").text(msg.name + ": " + msg.message));
  });


});