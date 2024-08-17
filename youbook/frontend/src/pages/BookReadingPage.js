import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js';
import './BookReadingPage.css';
import signupIcon from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';

function BookReadingPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태
  const [totalPages, setTotalPages] = useState(0); // 총 페이지 수 상태

  const handleProfileClick = () => {
    navigate('/my-autobiography');
  };

  useEffect(() => {
    const $book = $('#book');

    $book.turn({
      width: 800,
      height: 500,
      autoCenter: true,
      elevation: 50,
      gradients: true,
      duration: 1000,
      pages:6,
      when: {
        turned: function(event, page, view) {
          const actualPage = Math.floor((page - 2) / 2) + 1; // 페이지 번호 계산
          setCurrentPage(actualPage >= 0 ? actualPage : 0); // 표지일 때는 0으로 설정

          if (page === 1) {
            // 첫 페이지일 때 중앙 정렬 유지
            $book.addClass('centered');
          } else {
            // 첫 페이지를 넘기면 원래 위치로 복귀
            $book.removeClass('centered');
          }
        }
      }
    });

    // 총 페이지 수를 설정
    setTotalPages(Math.ceil($book.turn('pages') / 2));

    // 초기 상태에서 첫 페이지가 중앙에 있도록 설정
    $book.addClass('centered');
  }, []);

  const handlePrevious = () => {
    $('#book').turn('previous');
  };

  const handleNext = () => {
    $('#book').turn('next');
  };

  return (
    <div className="book-reading-page">
      <header className="main-header">
        <button className="menu-button">☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={signupIcon} alt="Profile" className="profile-image" />
        </button>
      </header>

      <div id="book" className="book-content">
        <div className="hard">
          <div className="page-content">
            <h2>Cover Page</h2>
          </div>
        </div>
        <div className="hard">
          <div className="page-content">
            <h2>Inner Cover</h2>
          </div>
        </div>
        <div className="page">
          <div className="page-content">
            <h2>Chapter 1: The Journey to Presidency</h2>
            <p>
              Since childhood, I grew up in a humble environment with my family...
            </p>
          </div>
        </div>
        <div className="page">
          <div className="page-content">
            <p>
              The path to presidency was far from easy...
            </p>
          </div>
        </div>
        <div className="hard">
          <div className="page-content">
            <h2>Back Cover</h2>
          </div>
        </div>
      </div>
      <div className="page-move">
        <span className="left-button" onClick={handlePrevious}>
          <img src={leftArrow} alt="Previous" /> 
        </span>
        <span className="page-indicator">{currentPage} / {totalPages}</span>
        <span className="right-button" onClick={handleNext}>
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
