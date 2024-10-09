import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js';
import './BookReadingPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';
import book from '../assets/images/book.png';
import edit from '../assets/images/edit.png';
import logout from '../assets/images/log-out.png';
import exit from '../assets/images/x.png';
import Design from './BookDesignPage';  // BookDesignPage 불러오기

function BookReadingPage() {
  const [isRectangleVisible, setIsRectangleVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [bookName, setBookName] = useState('');
  const [category, setCategory] = useState('');
  const [bookContent, setBookContent] = useState([]);
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage);
  const bookRef = useRef(null);
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [isDesignOpen, setIsDesignOpen] = useState(false);  // 팝업 열기 상태
  const [isWarningVisible, setIsWarningVisible] = useState(false);  // 경고 창 상태

  // 사용자 프로필 정보 가져오기
  useEffect(() => {
    fetch('/api/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setProfileImagePath(data.imagePath || defaultProfileImage);
        } else {
          console.error(data.message);
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  }, [navigate]);

  // 책 내용 가져오기
  useEffect(() => {
    fetch(`/api/book-content/${bookId}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 200) {
          const paragraphs = data.content.split('\n');
          distributeContentToPages(paragraphs);  // 내용 분배
        } else {
          console.error('Failed to fetch book content');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [bookId]);

  // 책 내용 분배 함수
  const distributeContentToPages = (paragraphs) => {
    const pages = [];
    let currentPageContent = '';
    const pageHeight = 500;
    const lineHeight = 24;

    paragraphs.forEach(paragraph => {
      const paragraphHeight = Math.ceil(paragraph.length / 50) * lineHeight;
      if (paragraphHeight + currentPageContent.length * lineHeight <= pageHeight) {
        currentPageContent += `${paragraph}\n`;
      } else {
        pages.push(currentPageContent.trim());
        currentPageContent = paragraph;
      }
    });

    if (currentPageContent) {
      pages.push(currentPageContent.trim());
    }

    setBookContent(pages);
    setTotalPages(pages.length);
  };

  // turn.js 초기화 및 페이지 넘김 효과 처리
  useEffect(() => {
    const $book = $('#book');

    if (bookContent.length && $book.length) {
      if ($book.data('turn')) {
        $book.turn('destroy');
      }

      $book.empty();
      $book.append(`
        <div class="hard">
          <div class="page-content">
            <h2>Cover Page</h2>
          </div>
        </div>
      `);
      $book.append(`
        <div class="hard">
          <div class="page-content">
            <h2>Inner Cover</h2>
          </div>
        </div>
      `);

      bookContent.forEach((content, index) => {
        const pageContent = `
          <div class="page">
            <div class="page-content">
              ${content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
              <div class="page-number ${index % 2 === 1 ? 'left' : 'right'}">${index + 1}</div>
            </div>
          </div>
        `;
        $book.append(pageContent);
      });

      $book.append(`
        <div class="hard">
          <div class="page-content">
            <h2>Back Cover</h2>
          </div>
        </div>
      `);

      $book.turn({
        width: 800,
        height: 600,
        autoCenter: true,
        elevation: 50,
        gradients: true,
        duration: 1000,
        pages: bookContent.length + 2,
        when: {
          turned: function (event, page) {
            const actualPage = Math.floor((page - 2) / 2) + 1;
            setCurrentPage(actualPage >= 0 ? actualPage : 1);
          },
        },
      });
    }
  }, [bookContent]);

  const handlePrevious = () => {
    $('#book').turn('previous');
  };

  const handleNext = () => {
    $('#book').turn('next');
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

  return (
    <div className="book-reading-page">
      <header className="main-header">
        <button className="menu-button" onClick={() => setIsSidebarVisible(true)}>☰</button>
        <button className="profile-button" onClick={() => navigate('/my-autobiography')}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>

      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={defaultProfileImage} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <img src={book} alt="Book" className="icon book-icon" onClick={() => navigate('/my-autobiography')} />
            </li>
            <li>
              <img src={edit} alt="Edit" className="icon edit-icon" onClick={() => navigate('/modifyinfo')} />
            </li>
            <li>
              <img src={logout} alt="Logout" className="icon logout-icon" onClick={() => navigate('/')} />
            </li>
          </ul>
        </nav>
        <img src={exit} alt="Exit" className="exit" onClick={() => setIsSidebarVisible(false)} />
      </aside>

      <div id="book" className="book-content"></div>

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
        <button className="footer-button" onClick={handleOpenDesignPage}>표지 만들기</button>
        <button className="footer-button">완성</button>
        <button className="footer-button save-button" onClick={() => alert('임시 저장되었습니다')}>임시 저장</button>
      </div>

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

export default BookReadingPage;