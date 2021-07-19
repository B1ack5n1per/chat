const socket = io('/');
const peer = new Peer();
const grid = document.getElementById('container');

class User {
    constructor(id) {
        this.id = id;
        this.video = document.createElement('video');
        this.img = document.createElement('img');
    }

    getElement() {
        this.container = document.createElement('div');
        this.container.classList.add('user');
        this.container.id = this.id;
        this.container.append(this.video);
        this.container.append(this.img);
        return this.container;
    }

    setSrc(stream) {
        this.video.srcObject = stream;
        this.video.addEventListener('loadedmetadata', () => {
            this.video.play();
        });
    }

    setMuted(muted) {
        this.video.muted = muted;
    }

    remove() {
        this.container.remove();
    }
}

let user = new User();
navigator.mediaDevices.getUserMedia( {
    video: true,
    audio: true
}).then((stream) => {
    user.setSrc(stream);
    user.setMuted(true);
    
    grid.append(user.getElement());

    peer.on('call', (call) => {
        call.answer(stream);
        const newUser = new User();
        grid.append(newUser.getElement());
        call.on('stream', (userVideoStream) => {
            newUser.setSrc(userVideoStream);
        })
    })
    socket.on('user-connected', (userId) => {
        console.log(userId);
        connectToNewUser(userId, stream);
    });
});

peer.on('open', (userId) => {
    socket.emit('join-room', ROOM_ID, userId);
    user.id = userId;
});

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const newUser = new User(userId);
    grid.append(newUser.getElement());

    call.on('stream', (userVideoStream) => {
        console.log('stream connected')
        newUser.setSrc(userVideoStream);
    });
    call.on('close', () => {
        newUser.remove();
    });
}