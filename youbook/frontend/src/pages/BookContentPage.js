import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js'; 
import './BookPage.css';
import book from '../assets/images/book.png';
import edit from '../assets/images/edit.png';
import logout from '../assets/images/log-out.png';
import defaultProfileImage from '../assets/images/signup-icon.png';
import exit from '../assets/images/x.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';
import askicon from '../assets/images/askicon.png';
import modifyicon from '../assets/images/modify.png';

function BookContentPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isRectangleVisible, setIsRectangleVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [savedCoverImageUrl, setSavedCoverImageUrl] = useState(null);
  const { bookId } = useParams();
  const location = useLocation();
  const { paragraph, title, subtitle, imageUrl } = location.state || {};
  const [contentArray, setContentArray] = useState([]);
  const [bookContent, setBookContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const selectedCategory = location.state?.selectedCategory;
  
  useEffect(() => {
    fetch('/api/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUserName(data.nickname);
          setProfileImagePath(data.imagePath || defaultProfileImage);
        } else {
          navigate('/');
        }
      })
      .catch(error => console.error('Error fetching user info:', error));
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/get_category', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.categorys);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchBookContent = async () => {
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookId,
          input_count: 1,
          category: selectedCategory,
        }),
      });
      const data = await response.json();
      setBookContent(data.contentArray);
    } catch (error) {
      console.error('Failed to fetch book content:', error);
    }
  };

  useEffect(() => {
    fetchBookContent();
  }, [bookId, selectedCategory]);

  useEffect(() => {
    if (bookContent.length > 0) {
      convertBookContentToContent();
    }
  }, [bookContent]);

  const convertBookContentToContent = () => {
    const newContent = bookContent.map(contentItem => ({
      title: contentItem.title || '',
      subtitle: contentItem.subtitle || '',
      imageUrl: contentItem.imageUrl || '',
      paragraph: contentItem.paragraph || '',
    }));
    setContentArray(newContent);
    setTotalPages(newContent.length);
  };

  const initializeTurnJS = () => {
    const $book = $('#book');
    if ($book.length && !$book.data('turn')) {
      $book.turn({
        width: 800,
        height: 500,
        autoCenter: true,
        elevation: 50,
        gradients: true,
        duration: 1000,
        pages: contentArray.length * 2 || 6, // Fix page count
        when: {
          turned: function (event, page) {
            const actualPage = Math.floor((page - 2) / 2) + 1;
            setCurrentPage(actualPage >= 0 ? actualPage : 0);
          },
        },
      });
    }
  };

  useEffect(() => {
    if (contentArray.length > 0) {
      initializeTurnJS(); // Initialize only when content is ready
    }

    return () => {
      const $book = $('#book');
      if ($book.data('turn')) {
        $book.turn('destroy'); // Cleanup turn.js on unmount
      }
    };
  }, [contentArray]); // Re-run only if contentArray changes

  const handlePrevious = () => {
    $('#book').turn('previous');
  };

  const handleNext = () => {
    $('#book').turn('next');
  };

  const handleOpenModifyPage = () => {
    navigate(`/book-modify/${bookId}`, {
      state: {
        contentArray: contentArray,
        selectedCategory: selectedCategory,
      },
    });
  };

  return (
    <div className="book-page">
      <header className="main-header">
        <button className="menu-button" onClick={() => setIsSidebarVisible(true)}>☰</button>
        <button className="profile-button" onClick={() => navigate('/my-autobiography')}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>

      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={profileImagePath} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li><img src={book} alt="Book" onClick={() => navigate('/my-autobiography')} /></li>
            <li><img src={edit} alt="Edit" onClick={() => navigate('/modifyinfo')} /></li>
            <li><img src={logout} alt="Logout" onClick={() => navigate('/')} /></li>
          </ul>
        </nav>
        <img src={exit} alt="Exit" onClick={() => setIsSidebarVisible(false)} />
      </aside>

      <div className="book-info">
        <div className="book-name">{location.state?.name || 'Book Name'}</div>
        <button className="modify-button" onClick={handleOpenModifyPage}>
          <img src={modifyicon} alt="Modify Icon" />
        </button>
      </div>

      <div id="book">
        <div className="hard">
          {savedCoverImageUrl && <img src={savedCoverImageUrl} alt="Book Cover" className="cover-image" />}
        </div>
        <div className="hard"><div className="page-content"></div></div>

        {contentArray.map((contentItem, index) => (
          <div className="page" key={`page-${index}`}>
            <div className="page-content">
              <h1>{contentItem.title}</h1>
              <h4>{contentItem.subtitle}</h4>
              {contentItem.imageUrl && (
                <img src={contentItem.imageUrl} alt="Uploaded" style={{ width: '60%', height: 'auto' }} />
              )}
              <p>{contentItem.paragraph}</p>
            </div>
          </div>
        ))}

        <div className="hard"><div className="page-content"></div></div>
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

      <div className="fixed-inquiry-icon" onClick={() => setIsRectangleVisible(!isRectangleVisible)}>
        <img src={askicon} alt="문의하기 아이콘" />
      </div>

      {isRectangleVisible && (
        <div className="vertical-rectangle">
          <ul>
            <li onClick={() => window.location.href = 'https://open.kakao.com/o/s9YXw5Sg'}>채팅 상담</li>
            <li onClick={() => navigate('/customerinquiry')}>1:1 문의</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default BookContentPage;
