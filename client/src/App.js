import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { io } from 'socket.io-client';
import SocketContext from './context/SocketContext';
import Welcome from './pages/Welcome';
import Chat from './pages/ChatPage';
import './App.css';

function App() {
  const socket = io('http://localhost:4000');
  const sessionName = sessionStorage.getItem('username');
  const sessionRoom = sessionStorage.getItem('room');
  const [user, setUser] = useState({
    username: sessionName,
    room: sessionRoom,
  });

  return (
    <SocketContext.Provider value={socket}>
      <Router>
        <Switch>
          <Route exact path='/'>
            <Welcome user={user} setUser={setUser} />
          </Route>

          <Route exact path='/chat/:room'>
            <Chat user={user} setUser={setUser} />
          </Route>

          <Redirect to='/' />
        </Switch>
      </Router>
    </SocketContext.Provider>
  );
}

export default App;
