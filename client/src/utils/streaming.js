import Peer from 'simple-peer';

export function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('click', () => video.play());
  document.body.append(video);
}

// create streaming peer
export function createPeer(userToSignal, callerID, stream, socket) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
  });

  peer.on('signal', (signal) => {
    socket.emit('sending signal', { userToSignal, callerID, signal });
  });

  peer.on('error', (error) => {
    console.log(error);
  });

  return peer;
}

// create consuming peer
export function addPeer(incomingSignal, callerID, socket) {
  const peer = new Peer({
    trickle: false,
  });

  peer.on('signal', (signal) => {
    socket.emit('returning signal', { signal, callerID });
  });

  peer.on('error', (error) => {
    console.log(error);
  });

  peer.signal(incomingSignal);

  return peer;
}
