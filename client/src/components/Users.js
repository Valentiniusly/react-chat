import React, { useState, useEffect, useContext } from 'react';
import SocketContext from '../context/SocketContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const socket = useContext(SocketContext);
  useEffect(() => {
    socket.on('roomUsers', ({ room, users }) => {
      setUsers(users);
    });
    return () => {
      setUsers([]);
    };
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
