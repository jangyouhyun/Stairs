import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import MainPage from './pages/MainPage';
import BookPage from './pages/BookPage';
import MyAutobiographyPage from './pages/MyAutobiographyPage';
import BookDesignPage from './pages/BookDesignPage'; 
import BookReadingPage from './pages/BookReadingPage';
import Chatbot from './pages/chatbot';
import Inquiry from './pages/inquiryPage';
import CustomerInquiryPage from './pages/CustomerInquiryPage';
import InquiryChatbot from './pages/InquiryChatbot';
import ModifyInfo from './pages/ModifyInfo';
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
        <Route path="/book-reading" element={<BookReadingPage />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/customerinquiry" element={<CustomerInquiryPage />} />
        <Route path="/inquirychatbot" element={<InquiryChatbot />} />
        <Route path="/modifyinfo" element={<ModifyInfo />} />
        <Route path="/book-reading/:bookId" element={<BookReadingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
