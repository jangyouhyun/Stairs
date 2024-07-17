import React from 'react';
import './MainPage.css';

function MainPage() {
  return (
    <div className="main-container">
      <header className="main-header">
        <button className="menu-button">☰</button>
        <div className="main-title">자서전에 들어갔으면 하는 내용을 적어주세요!</div>
        <button className="profile-button">⚪</button>
      </header>
      <div className="main-content">
        <img src="/path/to/your/image.png" alt="책과 전구 이미지" className="main-image" />
        <button className="question-button">입력내용으로 질문받기...</button>
        <textarea className="main-textarea" placeholder="내 인생의 사건에 대해서 적어주세요..."></textarea>
      </div>
    </div>
  );
}

export default MainPage;
