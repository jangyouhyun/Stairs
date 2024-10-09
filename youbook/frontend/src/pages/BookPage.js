import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js'; // Ensure this path is correct for your project
import './BookPage.css';
import book from '../assets/images/book.png';
import book2 from '../assets/images/book2.png'; // 활성화 상태일 때의 이미지
import edit from '../assets/images/edit.png';
import edit2 from '../assets/images/edit2.png'; // 활성화 상태일 때의 이미지
import logout from '../assets/images/log-out.png';
import logout2 from '../assets/images/log-out2.png';
import defaultProfileImage from '../assets/images/signup-icon.png';
import exit from '../assets/images/x.png';
import Design from './BookDesignPage';  
import signupIcon from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';
import askicon from '../assets/images/askicon.png';
import { useLocation } from 'react-router-dom';

function BookPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [totalPages, setTotalPages] = useState(0); // Total page count
  const [bookName, setBookName] = useState(''); // Book name state
  const [category, setCategory] = useState(''); // Book category state
  const [isRectangleVisible, setIsRectangleVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isDesignOpen, setIsDesignOpen] = useState(false);  // 팝업 열기 상태
  const [isWarningVisible, setIsWarningVisible] = useState(false);  // 경고 창 상태
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [bookContent, setBookContent] = useState([]);
  const { bookId } = useParams();
  const bookRef = useRef(null);
  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory;

  // Function to handle paragraph click
  const handleParagraphClick = () => {
    setIsActive(!isActive); // Toggle active state
  };
  // Function to handle right-click on the paragraph
  const handleParagraphRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    setSubmenuVisible(true); // Show the submenu
  };

  // Close the submenu if clicking outside
  const handleOutsideClick = (event) => {
    if (!event.target.closest('.submenu')) {
      setSubmenuVisible(false); // Hide the submenu
    }
  };

  const handleOpenDesignPage = () => {
    setIsDesignOpen(true);  // 팝업 열기
  };

  const handleCloseDesignPage = () => {
    setIsWarningVisible(true);  // 경고 창 열기
  };

  const handleConfirmClose = () => {
    setIsDesignOpen(false);  // 팝업 닫기
    setIsWarningVisible(false);  // 경고 창 숨기기
  };

  const handleCancelClose = () => {
    setIsWarningVisible(false);  // 경고 창 숨기기
  };

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
  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };
  const handleInquiryClick = () => {
    setIsRectangleVisible(!isRectangleVisible);
  };
  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };
  const handleHomeClick = () => {
    navigate('/');

  };
  const handleModifyClick = () => {
    navigate('/modifyinfo');
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
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  {/* 책 내용 끌고오기 */}  
  useEffect(() => {
    // Fetch book content from the API
    const fetchBookContent = async () => {
      try {
        const response = await fetch('/api/print', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            book_id: bookId, // Replace with actual book_id
            input_count: 1, // Replace with actual input_count
            category:selectedCategory
          }),
        });
        const data = await response.json();
        setBookContent(data); // Assuming data is an array of content strings
      } catch (error) {
        console.error('Failed to fetch book content:', error);
      }
    };

    fetchBookContent();
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
    <div className="book-page">
      {/* Header */}
      <header className="main-header">
      <button className="menu-button" onClick={handleMenuClick}>☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={signupIcon} alt="Profile" className="profile-image" />
        </button>
      </header>
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={defaultProfileImage} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
        <ul>
          <li>
            <img src={book} alt="Book" className="icon book-icon" onClick={handleProfileClick} />
          </li>
          <li>
            <img src={edit} alt="Edit" className="icon edit-icon" onClick={handleModifyClick}/>
          </li>
          <li>
            <img src={logout} alt="Logout" className="icon logout-icon" onClick={handleHomeClick}/>
          </li>
        </ul>
        </nav>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
      </aside>
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
          {/* text 마우스 왼쪽 버튼으로 클릭시 수정 아이콘 */}
          <div className="page-content">
            <p onContextMenu={handleParagraphRightClick} className={isActive ? 'active' : ''}>
          Since childhood, I grew up in a humble environment with my family...
            Since childhood, I grew up in a humble environment with my family...
            Since childhood, I grew up in a humble environment with my family...
            Since childhood, I grew up in a humble environment with my family...
            Since childhood, I grew up in a humble environment with my family...
            </p>
            {/* Submenu container */}
            {submenuVisible && (
              <div
                className="submenu"
                style={{ top: submenuPosition.y, left: submenuPosition.x }}
              >
                <button>Chatbot</button>
                <button>Edit</button>
                <button>Delete</button>
              </div>
      )}
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
        <button className="footer-button" onClick={handleOpenDesignPage}>표지 만들기</button>
        <button className="footer-button">그대로 완성</button>
        <button className="footer-button save-button" onClick={handleSaveClick}>임시 저장</button> {/* 임시 저장 button */}
      </div>
      
      <div className="fixed-inquiry-icon" onClick={handleInquiryClick}>
        <img src={askicon} alt="문의하기 아이콘" />
      </div>
      {isRectangleVisible && (
        <div className="vertical-rectangle">
          <ul>
            <li onClick={() => window.location.href = 'https://open.kakao.com/o/s9YXw5Sg'}>
              채팅 상담</li>
            <li onClick={() => navigate('/customerinquiry')}>1:1 문의</li>
          </ul>
        </div>
        
      )}
    {isDesignOpen && (
        <div className="design-popup">
          <Design onClose={handleCloseDesignPage} />
        </div>
      )}

      {isWarningVisible && (
        <div className="warning-popup">
          <p>창을 닫으면 표지가 초기화 됩니다.<br />그래도 닫겠습니까?</p>
          <div className="button-container">
            <button onClick={handleConfirmClose}>Yes</button>
            <button onClick={handleCancelClose}>No</button>
          </div>
        </div>
      )}
    </div>

  );
}

export default BookPage;