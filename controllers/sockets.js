const main = require('./socket/main');

module.exports = function(http){
    var io = require('socket.io')(http);

    io.on('connection', function(socket){
        // console.log('[SOCKET.IO] a user connected');
        main.addSocket({'socket': socket.id}, function(res){
            io.emit('user_connected', {user_count: res});
            // console.log('[SOCKET.IO] user connected');
        })

        socket.on('disconnect', function(){
        	main.removeSocket({'socket': socket.id}, function(res){
	            io.emit('user_disconnected', {user_count: res});
	            // console.log('[SOCKET.IO] user disconnected');

        	})
        })
    });

    console.log('[SOCKET.IO] socket connection started');
};
