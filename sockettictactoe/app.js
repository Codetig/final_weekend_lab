var express = require('express'),
app = express(),
http = require('http').Server(app),
io = require('socket.io')(http),
client = require('redis').createClient(),
// redis = require('redis'),
// client = redis.createClient(),
bodyParser = require('body-parser'),
methodOverride = require('method-override');

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));


// routes
app.get('/', function(req, res){
  res.render("index");
});

//socket connection handling (chat and game)
var players = [], prevId = ""; // needed for identifying players
io.on("connection", function(socket){
  console.log("a user connected id: " + socket.id);
  console.log(players);
  

  //on chat message received
  socket.on("chat-message", function(msg){
    console.log('message: ' + msg.name + " " + msg.message);
    //if=dentifying theplayers
    if(players.indexOf(socket.id) > -1){
      msg.name = msg.name + " (Player " + (players.indexOf(socket.id) + 1) + ")";
    }

    io.emit("chat-message", msg);
  }); // end of received chat message

  //note winner
  socket.on("winner", function(name){
    if(players.indexOf(socket.id) > -1 && prevId === socket.id){
    client.hincrby("leaderboard", name, 1);
    }
  });

  //add player

  socket.on("Add-player", function(){
    if(players.length < 2 && players.indexOf(socket.id === -1)){
    players.push(socket.id);
    // io.emit("chat-message", {"name": "Server", "message": ""});
  }
  });

  //game action received
  socket.on("game-act", function(act){
    if(players.indexOf(socket.id) > -1 && prevId !== socket.id){
      prevId = socket.id;
      console.log(prevId);
      // console.log(act);
      io.emit("game-act", act);
    }
  });

  //reset command received
  socket.on("game-reset", function(act){
    console.log("reset command from " + act.name);
    if(players.indexOf(socket.id) > -1){
      prevId = "";
      io.emit("game-reset");
      var name = "Server",
      msg = act.name + "(Player " + (players.indexOf(socket.id) + 1) + ") has reset the game";
      io.emit("chat-message", {"name": name, "message": msg});
    }
  }); //end of reset

  //handling disconnection
  socket.on("disconnect", function(){
    var msg = {};
    msg.name = "Server";
    msg.message = "a spectator left the room";
    if(players.indexOf(socket.id) > -1){
      msg.message = "Player " + (players.indexOf(socket.id) + 1)+ " has left the room";
      players = [];
    }
    io.emit("chat-message", msg);
    console.log("A user has disconected id: " + socket.id);
  }); //handling disconnection
}); //end of io connection

// start Server
http.listen(3000, function(){
  console.log("Server started on port #3000");
}); //need to test using app. Are app.listen and http.listen interchangeable?