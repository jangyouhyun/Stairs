import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import BookPage from './pages/BookPage';
import MyAutobiographyPage from './pages/MyAutobiographyPage'; // 새로운 페이지 추가
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/my-autobiography" element={<MyAutobiographyPage />} /> {/* 새로운 페이지 경로 추가 */}
      </Routes>
    </Router>
  );
}

export default App;
