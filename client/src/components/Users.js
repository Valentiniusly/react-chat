import React, { useState, useEffect } from 'react';
import SocketContext from '../context/SocketContext';

export default function Users({ socket }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    socket.on('roomUsers', ({ room, users }) => {
      setUsers(users);
    });
  }, []);

  return (
    <>
      <h3>Users</h3>
      <ul className='users'>
        {users.map((user) => (
          <li key={user.id} className='user'>
            {user.username}
          </li>
        ))}
      </ul>
    </>
  );
}
