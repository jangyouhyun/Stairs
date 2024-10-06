import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js';
import './BookReadingPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';

function BookReadingPage() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [bookName, setBookName] = useState('');
  const [category, setCategory] = useState('');
  const [bookContent, setBookContent] = useState([]);
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage);
  const bookRef = useRef(null);

  const handleProfileClick = () => {
    navigate('/my-autobiography');
  };

  const handleEditClick = () => {
    navigate('/book-design');
  };

  const handleSaveClick = () => {
    alert('임시 저장되었습니다');
  };

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

  useEffect(() => {
    fetch(`/api/book-content/${bookId}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 200) {
          const paragraphs = data.content.split('\n');
          distributeContentToPages(paragraphs);
        } else {
          console.error('Failed to fetch book content');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, [bookId]);

  const distributeContentToPages = (paragraphs) => {
    const pages = [];
    let currentPageContent = '';
    const pageHeight = 500; // 페이지 높이 설정
    const lineHeight = 24; // 각 줄의 높이 설정

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

  useEffect(() => {
    const $book = $('#book');
  
    // 내용이 있을 경우에만 실행
    if (bookContent.length && $book.length) {
      // 기존 인스턴스가 존재하면 제거
      if ($book.data('turn')) {
        $book.turn('destroy'); // 페이지를 삭제
      }
  
      // 페이지 초기화
      $book.empty(); // 페이지 내용 비우기
  
      // 커버 페이지 추가
      $book.append(`
        <div class="hard">
          <div class="page-content">
            <h2>Cover Page</h2>
          </div>
        </div>
      `);
  
      // 내지 커버 추가
      $book.append(`
        <div class="hard">
          <div class="page-content">
            <h2>Inner Cover</h2>
          </div>
        </div>
      `);
  
      // 책 내용 페이지 추가
      bookContent.forEach((content, index) => {
        const pageContent = `
          <div class="page">
            <div class="page-content">
              ${content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
              <div class="page-number ${index % 2 === 1 ? 'left' : 'right'}"> ${index + 1}</div> <!-- Adjusting for Cover Pages -->
            </div>
          </div>
        `;
        $book.append(pageContent);
      });
  
      // 백커버 추가
      $book.append(`
        <div class="hard">
          <div class="page-content">
            <h2>Back Cover</h2>
          </div>
        </div>
      `);
  
      // 페이지 초기화
      $book.turn({
        width: 800,
        height: 500,
        autoCenter: true,
        elevation: 50,
        gradients: true,
        duration: 1000,
        pages: bookContent.length + 2, // Cover pages 포함
        when: {
          turned: function (event, page) {
            const actualPage = Math.floor((page - 2) / 2) + 1;
            setCurrentPage(actualPage >= 0 ? actualPage : 0);
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

  return (
    <div className="book-reading-page">
      <header className="main-header">
        <button className="menu-button">☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>

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

      <div id="book" className="book-content" ref={bookRef}>
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
        {bookContent.map((content, index) => (
          <div key={index} className="page">
            <div className="page-content">
              {content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
              <div className="page-number"> {/* 페이지 번호 추가 */}
                {index + 1}
              </div>
            </div>
          </div>
        ))}
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
        <button className="footer-button" onClick={handleEditClick}>직접 수정</button>
        <button className="footer-button">그대로 완성</button>
        <button className="footer-button save-button" onClick={handleSaveClick}>임시 저장</button>
      </div>
    </div>
  );
}

export default BookReadingPage;
