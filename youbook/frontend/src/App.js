import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import BookPage from './pages/BookPage';
import BookContentPage from './pages/BookContentPage';
import BookModifyPage from './pages/BookModifyPage';
import MyAutobiographyPage from './pages/MyAutobiographyPage';
import BookDesignPage from './pages/BookDesignPage'; 
import Chatbot from './pages/chatbot';
import ModifyInfo from './pages/ModifyInfo';
import CustomerInquiryPage from './pages/CustomerInquiryPage';
import $ from 'jquery';
import './assets/js/turn.js';

import './App.css';

function App() {
  useEffect(() => {
    console.log(typeof $.fn.turn); // "function"이 출력되어야 함
  }, []);
  

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/my-autobiography" element={<MyAutobiographyPage />} />
        <Route path="/book-design" element={<BookDesignPage />} />
        <Route path="/chatbot/:bookId" element={<Chatbot />} />
        <Route path="/modifyinfo" element={<ModifyInfo />} />
        <Route path="/book-reading/:bookId" element={<BookPage />} />
        <Route path="/book-content/:bookId" element={<BookContentPage />} />
        <Route path="/book-modify/:bookId" element={<BookModifyPage />} />
        <Route path="/customerinquiry" element={<CustomerInquiryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
