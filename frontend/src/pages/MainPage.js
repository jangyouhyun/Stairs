import React from 'react';
import './MainPage.css';
import chatbotImage from '../assets/images/chatbot1.png'; // 이미지 경로 수정
import signupIcon from '../assets/images/signup-icon.png'; // signup-icon 이미지 임포트

function MainPage() {
  return (
    <div className="main-page">
      <header className="main-header">
        <button className="menu-button">☰</button>
        <button className="profile-button">
          <img src={signupIcon} alt="Profile" className="profile-image" />
        </button>
      </header>
      <div className="main-content">
        <div className="title-image-container">
          <img src={chatbotImage} alt="Chatbot" className="main-image" />
          <h1 className="main-title">자서전에 들어갔으면 하는 내용을 적어주세요!</h1>
        </div>
        <button className="question-button">입력내용으로 질문받기...</button>
        <textarea className="main-textarea" placeholder="내 인생의 사건에 대해서 적어주세요..."></textarea>
      </div>
    </div>
  );
}

export default MainPage;
