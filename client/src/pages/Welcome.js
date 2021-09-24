import React, { useState, useContext, useEffect } from 'react';
import SocketContext from '../context/SocketContext';
import { useHistory } from 'react-router-dom';

export default function Welcome({ user, setUser }) {
  const history = useHistory();
  const socket = useContext(SocketContext);
  const [nameInput, setNameInput] = useState(user.username || '');

  const onSubmitHandler = (e) => {
    e.preventDefault();

    sessionStorage.setItem('username', nameInput);
    const room = sessionStorage.getItem('room') || socket.id;
    sessionStorage.setItem('room', room);

    setUser((prev) => ({ ...prev, username: nameInput, room }));

    history.push(`/chat/${room}`);
  };

  useEffect(() => {
    if (user.username) socket.emit('leaveRoom');
  });

  return (
    <div className='container'>
      <div className='row justify-content-sm-center'>
        <div className='col col-sm-8 col-md-6 col-lg-4 window'>
          <h1>Chat app</h1>
          <form id='name-form' onSubmit={onSubmitHandler}>
            <div className='mb-3'>
              <label htmlFor='username' className='form-label'>
                Please enter your name
              </label>
              <input
                type='text'
                className='form-control'
                id='username'
                name='username'
                required
                placeholder='Gorgeous'
                autoComplete='off'
                value={nameInput}
                onChange={({ target }) => setNameInput(target.value)}
              />
            </div>
            <button type='submit' className='btn btn-dark'>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
