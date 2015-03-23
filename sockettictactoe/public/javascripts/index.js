$(document).ready(function(){

  var socket = io(); //for socket.io
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
  score1 = 0,
  score2 = 0,
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
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 5, 9],
    [3, 5, 7],
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

  var boxClick =function(target){
    // var target = event.target;
    if (gameArr.indexOf(target.attr('id')) < 0){ //checks to see if the box was already picked before
      gameArr.push(parseInt(target.attr('id')));
      if(gameArr.length % 2 === 1){
        arrP1.push(gameArr[gameArr.length - 1]);
        pColor(p1,"white");
        pColor(p2,"orange");
        //or: alert("player 2's turn to play");
        target.text("X");
        // or target.setAttribute("class", "turnYellow text-center game");
        target.css("background-color", "yellow");
      } else if(gameArr.length % 2 === 0){
        arrP2.push(gameArr[gameArr.length - 1]);
        pColor(p1,"yellow");
        //or: alert("player 1's turn to play");
        pColor(p2,"white");
        target.text("O");
        // or target.setAttribute("class", "turnOrange text-center game");
        target.css("background-color", "orange");
      }

        //checks for a winner or a draw.
      if(gameArr.length > 4){
        if(winner(arrP1)){
          score1++;
          $('#scr1').text("Win(s): " + score1.toString());
          socket.emit("winner", playerName);
          alert("Player 1 wins!");
          gameOver();
        } else if(winner(arrP2)){
          score2++;
          $('#scr2').text("Win(s): " + score2.toString());
          socket.emit("winner", playerName);
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
    socket.emit("game-reset", {"name": playerName, "element":"#reset", "action":"reset"});
  });

  $('#play').on('click',function(){
    socket.emit("Add-player");
  });

  socket.on("game-reset", function(act){
    resetPressed();
  });

  function resetPressed(){
    for (var i = 0; i < $boxes.length; i++) {
      $($boxes[i]).text("");
      $($boxes[i]).css("background-color", "white");
    }
    gameArr = [];
    arrP1 = [];
    arrP2 = [];
    $('.game').on("click", function(ev){
    var el = $(ev.target).attr('id');
    socket.emit("game-act", el);
  });
  }

  $('.game').on("click", function(ev){
    var el = $(ev.target).attr('id');
    socket.emit("game-act", el);
  });

  socket.on("game-act",function(el){
    boxClick($("#" + el));
  });

  //dealing with chat
  
  
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