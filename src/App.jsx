// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalendarPage from './components/CalendarPage';
import EventDetailPage from './components/EventDetailPage';
import './App.css';
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/day/:date" element={<EventDetailPage />} />
      </Routes>
    </Router>
  );
}
 
export default App;
