// import logo from './logo.svg';
import { Route, Routes } from 'react-router-dom';
import './App.css';

import HomePage from './Pages/HomePage.js';
import ChatPage from './Pages/ChatPage.js';


function App() {
  return (
    <div className="App">
      
      <Routes>
      <Route path='/' Component={HomePage}/>
      <Route path='/chats' Component={ChatPage}/>
      </Routes>
      
      

    </div>
  );
}

export default App;
