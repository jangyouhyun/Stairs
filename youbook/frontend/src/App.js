import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
<<<<<<< HEAD:frontend/src/App.js
import MyAutobiographyPage from './pages/MyAutobiographyPage';
import BookReadingPage from './pages/BookReadingPage'; // BookReadingPage 추가
=======
import BookPage from './pages/BookPage';
import MyAutobiographyPage from './pages/MyAutobiographyPage'; // 새로운 페이지 추가
import './App.css';
>>>>>>> stairs/main:youbook/frontend/src/App.js

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
<<<<<<< HEAD:frontend/src/App.js
        <Route path="/my-autobiography" element={<MyAutobiographyPage />} />
        <Route path="/book-reading" element={<BookReadingPage />} /> {/* BookReadingPage 경로 추가 */}
=======
        <Route path="/book" element={<BookPage />} />
        <Route path="/my-autobiography" element={<MyAutobiographyPage />} /> {/* 새로운 페이지 경로 추가 */}
>>>>>>> stairs/main:youbook/frontend/src/App.js
      </Routes>
    </Router>
  );
}

export default App;
