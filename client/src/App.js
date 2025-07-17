import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import OtherPage from './OtherPage';
import Fib from './Fib';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="App logo" />

          <nav className="App-nav">
            <NavLink
              to="/"
              className={({ isActive }) => "nav-link" + (isActive ? " active-link" : "")}
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/otherpage"
              className={({ isActive }) => "nav-link" + (isActive ? " active-link" : "")}
            >
              Other Page
            </NavLink>
          </nav>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<Fib />} />
            <Route path="/otherpage" element={<OtherPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
