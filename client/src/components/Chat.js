import React, { useState, useContext, useRef, useEffect } from 'react';
import SocketContext from '../context/SocketContext';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const socket = useContext(SocketContext);
  const chat = useRef();

  useEffect(() => {
    socket.on('oldMessages', (messages) => {
      setMessages(messages);
    });

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (chat.current) {
        const scroll = chat.current.scrollHeight - chat.current.clientHeight;
        chat.current.scrollTo(0, scroll);
      }
    });
    return () => {
      setMessages([]);
    };
  }, []);

  return (
    <div className='chat' ref={chat}>
      {messages.map((msg) => {
        if (msg.type === 'system') {
          return (
            <div className='system-message' key={Date.now() + Math.random()}>
              {msg.text}
            </div>
          );
        } else {
          return (
            <div className='message' key={Date.now() + Math.random()}>
              <span className='author'>{msg.username}</span>&nbsp;
              <span className='date'>{msg.time}</span>
              <p className='text'>{msg.text}</p>
            </div>
          );
        }
      })}
    </div>
  );
}
