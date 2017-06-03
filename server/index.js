const io = require('socket.io')(3000);

const arrUserOnline = [];

// Lang nghe connection
io.on('connection', socket => {
    socket.on('SIGN_UP', user => {
        // Check exist
        const isExist = arrUserOnline.some(u => u.name === user.name);
        if (isExist) {
            return socket.emit('SIGN_UP_FAILED');
        }

        // Push user online
        socket.peerId = user.peerId;
        arrUserOnline.push(user);

        // Notify
        socket.emit('LIST_USER_ONLINE', arrUserOnline);
        socket.broadcast.emit('NEW_USER', user);
    });


    // Handle disconnect
    socket.on('disconnect', () => {
        const index = arrUserOnline.findIndex(user => user.peerId === socket.peerId);
        arrUserOnline.splice(index, 1);

        io.emit('SOME_ONE_OUT', socket.peerId);
    });
});

