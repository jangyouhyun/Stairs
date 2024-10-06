import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js'; // Ensure this path is correct for your project
import './BookReadingPage.css';
import signupIcon from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';

function BookReadingPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [totalPages, setTotalPages] = useState(0); // Total page count
  const [bookName, setBookName] = useState(''); // Book name state
  const [category, setCategory] = useState(''); // Book category state

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

  useEffect(() => {
    // Ensure the DOM is loaded before calling turn.js
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
  }, []);

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
          <img src={signupIcon} alt="Profile" className="profile-image" />
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
            <p>Since childhood, I grew up in a humble environment with my family...</p>
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