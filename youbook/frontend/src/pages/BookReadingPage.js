import React from 'react';
import './BookReadingPage.css';
import profileImage from '../assets/images/signup-icon.png'; // 예시 프로필 이미지
import regenerateIcon from '../assets/images/regenerate-icon.png'; // 예시 regenerate 아이콘

function BookReadingPage() {
  return (
    <div className="book-reading-page">
      <header className="main-header">
        <div className="header-left">
          <button className="menu-button">☰</button>
          <h2>2020 나의 자서전 - 내 자서전</h2>
        </div>
        <div className="header-right">
          <img src={regenerateIcon} alt="Regenerate" className="regenerate-icon" />
          <img src={profileImage} alt="Profile" className="profile-icon" />
        </div>
      </header>

      <div className="book-content">
        <div className="page-left">
          <h3>Chapter 7: The Journey to Presidency</h3>
          <p>Since childhood, I grew up in a humble environment with my family...</p>
          <p>My interest in politics sparked from the day I attended an open community meeting...</p>
        </div>
        <div className="page-right">
          <p>The path to presidency was far from easy...</p>
          <p>However, this achievement was not solely my own...</p>
        </div>
      </div>

      <footer className="book-footer">
        <div className="navigation-buttons">
          <button className="nav-button">←</button>
          <span>1 / 253</span>
          <button className="nav-button">→</button>
        </div>
        <div className="action-buttons">
          <button className="action-button">직접 수정</button>
          <button className="action-button">그대로 완성</button>
        </div>
      </footer>
    </div>
  );
}

export default BookReadingPage;
