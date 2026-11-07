import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

import Home from './Home';
import Articles from './Articles';
import Style from './Style';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <NavLink to="/" className="logo" aria-label="RIFRAF">
            <span className="a">RIF</span>
            <span className="b">RAF</span>
          </NavLink>

          <div className="nav-links">
            <NavLink to="/street" className={({ isActive }) => isActive ? 'active' : ''}>
              Street
            </NavLink>

            <NavLink to="/mood" className={({ isActive }) => isActive ? 'active' : ''}>
              Mood
            </NavLink>
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/street" element={<Articles />} />
          <Route path="/mood" element={<Style />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;