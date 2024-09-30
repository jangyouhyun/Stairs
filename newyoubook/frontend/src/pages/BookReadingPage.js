import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';  // useParams 추가
import $ from 'jquery';
import '../assets/js/turn.js'; 
import './BookReadingPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import signupIcon from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';

function BookReadingPage() {
  const navigate = useNavigate();
  const { bookId } = useParams();  // URL 파라미터에서 bookId 추출
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [totalPages, setTotalPages] = useState(0); // Total page count
  const [bookName, setBookName] = useState(''); // Book name state
  const [category, setCategory] = useState(''); // Book category state
  const [bookContent, setBookContent] = useState(''); // DB에서 가져온 내용 저장
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  // Navigate to the autobiography page
  const handleProfileClick = () => {
    navigate('/my-autobiography');
  };

  // Navigate to the book design page
  const handleEditClick = () => {
    navigate('/book-design');
  };

  // Handle "임시 저장" click event to show a popup
  const handleSaveClick = () => {
    alert('임시 저장되었습니다'); // Show popup when "임시 저장" is clicked
  };

  // 유저 정보를 서버에서 가져옴
  useEffect(() => {
    fetch('/api/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProfileImagePath(data.imagePath || defaultProfileImage); // 프로필 이미지 경로를 상태에 저장
          
        } else {
          console.error(data.message);
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  }, [navigate]);

  useEffect(() => {
    fetch(`/api/book-content/${bookId}`)  // 백틱을 사용하여 동적으로 bookId를 가져옴
      .then(response => response.json())
      .then(data => {
        if (data.status === 200) {
          setBookContent(data.content); // 데이터 설정
        } else {
          console.error('Failed to fetch book content');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  
    const $book = $('#book');
  
    // Ensure book element exists before initializing turn.js
    if ($book.length) {
      $book.turn({
        width: 800,
        height: 500,
        autoCenter: true, // Center the book
        elevation: 50,
        gradients: true,
        duration: 1000,
        pages: 6, // Set total pages
        when: {
          turned: function (event, page) {
            const actualPage = Math.floor((page - 2) / 2) + 1; // Calculate actual page number
            setCurrentPage(actualPage >= 0 ? actualPage : 0); // Set current page state
          },
        },
      });
  
      // Set total pages count
      setTotalPages(Math.ceil($book.turn('pages') / 2));
    }
  }, [bookId]);  // bookId가 변경될 때마다 호출되도록 의존성 배열에 추가
  

  // Handle previous button click to flip the page backward
  const handlePrevious = () => {
    $('#book').turn('previous');
  };

  // Handle next button click to flip the page forward
  const handleNext = () => {
    $('#book').turn('next');
  };

  return (
    <div className="book-reading-page">
      {/* Header */}
      <header className="main-header">
        <button className="menu-button">☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>

      {/* Book name input and category selection */}
      <div className="book-details">
      <div className="input-group">
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">카테고리</option>
            <option value="fiction">카테고리1</option>
            <option value="nonfiction">카테고리2</option>
            <option value="biography">카테고리3</option>
          </select>
        </div>
        <div className="input-group name">
          <input
            type="text"
            id="bookName"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="책 이름을 입력하세요"
          />
        </div>
      </div>

      {/* Book content */}
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
            <p>{bookContent || 'Loading content...'}</p> {/* DB에서 가져온 content 렌더링 */}
          </div>
        </div>
        <div className="page">
          <div className="page-content">
            <p>The path to presidency was far from easy...</p>
          </div>
        </div>
        <div className="hard">
          <div className="page-content">
            <h2>Back Cover</h2>
          </div>
        </div>
      </div>

      {/* Page navigation (left and right arrows) */}
      <div className="page-move">
        <span className="left-button" onClick={handlePrevious}>
          <img src={leftArrow} alt="Previous" />
        </span>
        <span className="page-indicator">{currentPage} / {totalPages}</span>
        <span className="right-button" onClick={handleNext}>
          <img src={rightArrow} alt="Next" />
        </span>
      </div>

      {/* Footer buttons */}
      <div className="book-footer">
        <button className="footer-button" onClick={handleEditClick}>직접 수정</button>
        <button className="footer-button">그대로 완성</button>
        <button className="footer-button save-button" onClick={handleSaveClick}>임시 저장</button> {/* 임시 저장 button */}
      </div>
    </div>
  );
}

export default BookReadingPage;