import React, { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import SocketContext from '../context/SocketContext';
import Peer from 'simple-peer';
import Users from '../components/Users';
import Chat from '../components/Chat';

export default function ChatPage({ user, setUser }) {
  const socket = useContext(SocketContext);
  const history = useHistory();
  const input = useRef();
  const videoBtn = useRef();
  const myPeerRef = useRef();
  const peersRef = useRef([]);
  const [streaming, setStreaming] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  function messageHandler(e) {
    e.preventDefault();

    socket.emit('chatMessage', userMessage);

    setUserMessage('');
    input.current.focus();
  }

  function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('click', () => video.play());
    document.body.append(video);
  }

  function videoBtnHandler() {
    setStreaming(true);
    // start stream
    const myVideo = document.createElement('video');
    myVideo.muted = true;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        socket.emit('startStream', { id: socket.id, room: user.room });
        addVideoStream(myVideo, stream);
        myVideo.play();

        socket.on('usersForStream', (users) => {
          users.forEach((user) => {
            const peer = createPeer(user.id, socket.id, stream);
            peersRef.current.push({
              peerID: user.id,
              peer,
            });
            myPeerRef.current = peer;
          });
        });

        socket.on('receiving returned signal', ({ id, signal }) => {
          const item = peersRef.current.find((p) => p.peerID === id);
          item.peer.signal(signal);
        });
      });
  }

  function createPeer(userToSignal, callerID, stream) {
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

  function addPeer(incomingSignal, callerID) {
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

  useEffect(() => {
    let room = sessionStorage.getItem('room');
    const username = sessionStorage.getItem('username');

    if (!user.username) {
      // if came in with link
      room = window.location.pathname.slice(1).split('/')[1];
      sessionStorage.setItem('room', room);
      setUser((prev) => ({ ...prev, room }));
      history.push('/');
    } else {
      socket.emit('joinRoom', {
        username,
        room,
      });
      socket.on('isStreaming', (stream) => setStreaming(stream));

      socket.on('startStream', ({ signal, callerID }) => {
        setStreaming(true);
        const peer = addPeer(signal, callerID);
        peer.on('stream', (stream) => {
          const video = document.createElement('video');
          addVideoStream(video, stream);
        });
        myPeerRef.current = peer;
        console.log('start');
      });

      // stop stream if consumer
      socket.on('stopStream', (id) => {
        if (id !== socket.id) {
          const video = document.querySelector('video');
          video && video.remove();
          setStreaming(false);
        }
      });
    }

    return () => {
      myPeerRef.current && myPeerRef.current.destroy();
      const video = document.querySelector('video');
      if (video) {
        socket.emit('stopStream', { id: socket.id, room });
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
        video.srcObject = null;
        video.remove();
      }
    };
  }, []);

  return (
    <>
      <div className='container'>
        <div className='row justify-content-sm-center'>
          <div className='col col-lg-10 window window-chat'>
            <div className='chat-container'>
              <header className='chat-header'>
                <h1>Chat App</h1>
                <button
                  ref={videoBtn}
                  onClick={videoBtnHandler}
                  id='video-button'
                  className='btn btn-dark'
                  disabled={streaming}
                >
                  Video
                </button>
                <svg
                  viewBox='0 0 100 80'
                  height='20'
                  className='d-md-none'
                  data-bs-toggle='modal'
                  data-bs-target='#usersModal'
                >
                  <rect width='100' height='20'></rect>
                  <rect y='30' width='100' height='20'></rect>
                  <rect y='60' width='100' height='20'></rect>
                </svg>
              </header>
              <main className='content'>
                <aside className='users-container d-none d-md-block '>
                  <Users />
                </aside>
                <Chat />
              </main>
              <div className='message-input'>
                <form id='chat-form' onSubmit={messageHandler}>
                  <div className='input-group mb-3'>
                    <input
                      type='text'
                      id='msg'
                      className='form-control'
                      autoComplete='off'
                      placeholder='Type message'
                      required
                      aria-label="Recipient's username"
                      aria-describedby='button-addon2'
                      value={userMessage}
                      onChange={({ target }) => setUserMessage(target.value)}
                      ref={input}
                    />
                    <button
                      className='btn btn-dark'
                      type='submit'
                      id='button-addon2'
                      disabled={!userMessage}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='modal fade' tabIndex='-1' id='usersModal'>
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-body'>
              <Users />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
