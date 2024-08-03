import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import MyAutobiographyPage from './pages/MyAutobiographyPage';
import BookReadingPage from './pages/BookReadingPage'; // BookReadingPage 추가

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/my-autobiography" element={<MyAutobiographyPage />} />
        <Route path="/book-reading" element={<BookReadingPage />} /> {/* BookReadingPage 경로 추가 */}
      </Routes>
    </Router>
  );
}

export default App;
