const socket = io('http://localhost:3000');

$('#chat').hide();

/**
 * Open stream with config
 */
function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config)
}

/**
 * Play stream on video container
 * @param {*} idVideoContainer 
 * @param {*} stream 
 */
function playStream(idVideoContainer, stream) {
    const video = document.getElementById(idVideoContainer);

    video.srcObject = stream;
    video.play();
}

// openStream()
// .then(stream => playStream('localStream', stream));

var peer = new Peer({ key: 'peerjs', host: 'serverpeer5509.herokuapp.com', secure: true, port: 443 });

peer.on('open', id => {
    // Show peerId
    $('#myPeer').append(id);

    // Allow signup
    $('#btnSignUp').click(() => {
        const username = $('#txtUsername').val();
        const signupData = {
            name: username,
            peerId: id
        }

        socket.emit('SIGN_UP', signupData);
    });
});

// Call
$('#btnCall').click(() => {
    const remoteId = $('#remoteId').val();

    openStream()
        .then(stream => {
            playStream('localStream', stream);
            const call = peer.call(remoteId, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        })
});

// When recieve call
peer.on('call', call => {
    openStream()
        .then(stream => {
            call.answer(stream);
            playStream('localStream', stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        })
});

socket.on('LIST_USER_ONLINE', arr => {

    $('#chat').show();
    $('#signup').hide();

    arr.forEach(user => {
        const { name, peerId } = user;
        $('#ulUsers').append(`<li id="${peerId}">${name} <button peerId="${peerId}">Call</button></li>`);
    });

    socket.on('NEW_USER', user => {
        const { name, peerId } = user;
        $('#ulUsers').append(`<li id="${peerId}">${name} <button peerId="${peerId}">Call</button></li>`);
    });

    socket.on('SOME_ONE_OUT', peerId => {
         $(`#${peerId}`).remove();
    });
});

socket.on('SIGN_UP_FAILED', () => {
    alert('Ten da duoc su dung!');
});

$('#ulUsers').on('click', 'button', function() {
    const peerId = $(this).attr('peerId');

    openStream()
        .then(stream => {
            playStream('localStream', stream);
            const call = peer.call(peerId, stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        })
});