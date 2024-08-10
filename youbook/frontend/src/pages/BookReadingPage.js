import React, { useEffect } from 'react';
import $ from 'jquery';
import 'path-to-your-turnjs/turn.js'; // turn.js 파일 경로 설정
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';
import signupIcon from '../assets/images/signup-icon.png';
import './BookReadingPage.css';

function BookReadingPage() {
  useEffect(() => {
    $('#book').turn({
      width: 800,
      height: 600,
      autoCenter: true
    });
  }, []);

  return (
    <div className="book-reading-page">
      <div className="main-header">
        <button className="menu-button">☰</button>
        <span>2020 나의 자서전 - 내 자서전</span>
        <button className="profile-button">
          <img src={signupIcon} alt="Profile" className="profile-image" />
        </button>
      </div>

      <div id="book" className="book-content">
        <div className="page">
          <div className="text-content">
            <h2>Chapter 1: The Journey to Presidency</h2>
            <p>
              Since childhood, I grew up in a humble environment with my family...
            </p>
          </div>
        </div>
        <div className="page">
          <div className="text-content">
            <p>
              The path to presidency was far from easy...
            </p>
          </div>
        </div>
        {/* 필요한 페이지 만큼 .page div 추가 */}
      </div>

      <div className="page-move">
        <span className="left-button" onClick={() => $('#book').turn('previous')}>
          <img src={leftArrow} alt="Previous" />
        </span>
        <span className="page-indicator">1 / 253</span>
        <span className="right-button" onClick={() => $('#book').turn('next')}>
          <img src={rightArrow} alt="Next" />
        </span>
      </div>

      <div className="book-footer">
        <button className="footer-button">직접 수정</button>
        <button className="footer-button">그대로 완성</button>
      </div>
    </div>
  );
}

export default BookReadingPage;
