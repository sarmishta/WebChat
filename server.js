/*
S.A.Krishnaa
Sarmishta Burujupelli
Server Code
*/
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose=require('mongoose');
server.listen(9998);
var users = {};
var offline_users=[];
var rooms = ['IT','CSE','ECE','Bio-Tech','Civil'];
var usernames={};
//i think this id for rooms
mongoose.connect('mongodb://localhost/Passer',function(err){
    //Passer is the name of the table
   if(err)
   {
       console.log(err);
   }
    else
   {
       console.log("Connected to mongo DB");
   }
});

var chatSchema = mongoose.Schema({
    too:String,
    from:String,        //Definitions for details to be stored on mongoDB
    msg:String,
    created:{type:Date,default:Date.now}
});
var count=1;
var Chat=mongoose.model ('Message',chatSchema); //object model

io.on('connection', function (socket) {
    //As soon as a user logs in it goes to a new page where a user will be able to send messages
    console.log("new client connected");

    socket.on('private message', function (too, from, msg, callback) {
        if (too in users) {
            var newMsg=new Chat({too:too, from:from, msg:msg});
            newMsg.save(function(err){
                if(err){
                    throw err;      //saves any new message that is sent if no error into mongoDB
                }


            });
            if(count == 1) {
                //this part of the code loads all the old messages between the sender and the receiver
                var query1 = Chat.find({too: too, from: from});

                query1.sort('-created').exec(function (err, docs) { //sorts the messages based on time of creation
                                                                    // and emits to client both to sender and receiver
                    console.log(docs+"to=too");
                    if (err) throw err;
                    users[from].emit('old', too, from, msg, docs);
                    users[too].emit('old',too,from,msg,docs);

                });

                var query2=Chat.find({too: from, from: too});

                query2.sort('-created').exec(function (err, docs) {
                    console.log(docs+"too=from");
                    if (err) throw err;
                    users[from].emit('old', too, from, msg, docs);
                    users[too].emit('old',too,from,msg,docs);

                });
                count++;
            }

            console.log('hi');
            users[too].emit('chatMessage', too, from, msg);
            users[from].emit('chatMessage', too, from, msg);

        }
    });

    socket.on('notifyUser', function (too, from) {
        //notifies if the sender is typing or not
        users[too].emit('notifyUser', too, from);
    });

    socket.on('adduser', function (data, callback) {
        // creates a user and adds into dictionary
        if (data in users) {
            callback(true);
        }
        else {
            callback(true);
            socket.nickname = data;
            users[socket.nickname] = socket;
        }
        var m=2;
        io.emit('usernames',Object.keys(users));
        io.emit('check',offline_users,Object.keys(users));
        io.emit('outdated_users',offline_users,Object.keys(users),m);

//this is where the error is

        console.log("jhgj...usernames "+Object.keys(users));

        socket.data = data;
        socket.room = 'IT';
        usernames[data] = data;
        socket.join('IT');
        socket.emit('updatechat', 'HEY', 'you have connected to IT');
        console.log('it group');
        socket.broadcast.to('IT').emit('updatechat', 'HEY', data + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'IT');

    });
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('updatechat', socket.data, data);
    });
    socket.on('switchRoom', function(newroom){
        // leave the current room (stored in session)
        socket.leave(socket.room);
        // join new room, received as function parameter
        socket.join(newroom);
        socket.emit('updatechat', 'HEY', 'you have connected to '+ newroom);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('updatechat', 'HEY', socket.username+' has left this room');
        // update socket session room title
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'HEY', socket.username+' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });
    socket.on('creategroup',function(groupname)
    {
        rooms.push(groupname);
    });

    var y=0;
    socket.on('disconnect',function(data){

        if(!socket.nickname)
            return;
        offline_users.push(socket.nickname);
        console.log(offline_users+" ..offline users...");
        var m=1;
        io.emit('outdated_users',offline_users,Object.keys(users));
        delete users[socket.nickname];
        io.emit('usernames',Object.keys(users));
        //groups
        delete usernames[socket.nickname];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'HEY', socket.nickname + ' has disconnected');
        socket.leave(socket.room);

    });


    socket.on('checktoo',function(offline_users){
        console.log("check too off"+offline_users);
        io.emit('outdated_users',offline_users,Object.keys(users));
    });

});