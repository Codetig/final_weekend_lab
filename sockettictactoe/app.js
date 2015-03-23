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

//chat handling
var players = []; // needed for identifying players
io.on("connection", function(socket){
  console.log("a user connected id: " + socket.id);
  console.log(players);
  if(players.length < 2 && players.indexOf(socket.id === -1)){
    players.push(socket.id);
  }
  socket.on("chat-message", function(msg){
    console.log('message: ' + msg.name + " " + msg.message);
    //if=dentifying theplayers
    if(players.indexOf(socket.id) > -1){
      msg.name = msg.name + " (Player " + (players.indexOf(socket.id) + 1) + ")";
    }

    io.emit("chat-message", msg);
  }); // dealing with the message sent

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