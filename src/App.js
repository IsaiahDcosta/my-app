import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import SummaryPage from './SummaryPage';
import Budget from './components/Budget';

const App = () => {
  

  return (
    <Router>
      <Routes>
      <Route path="/" element={<SummaryPage />} />
        <Route path="/budget" element={<Budget />} />
        
      </Routes>
    </Router>
  );
};

export default App;
