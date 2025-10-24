import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalendarPage from './components/CalendarPage';
import DateDetailPage from './components/DateDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/date/:date" element={<DateDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;