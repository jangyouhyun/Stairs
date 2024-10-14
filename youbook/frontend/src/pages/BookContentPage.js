
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import $ from 'jquery';
import '../assets/js/turn.js'; // Ensure this path is correct for your project
import './BookPage.css';
import book from '../assets/images/book.png';
import edit from '../assets/images/edit.png';
import logout from '../assets/images/log-out.png';
import defaultProfileImage from '../assets/images/signup-icon.png';
import exit from '../assets/images/x.png';
import signupIcon from '../assets/images/signup-icon.png';
import leftArrow from '../assets/images/left.png';
import rightArrow from '../assets/images/right.png';
import askicon from '../assets/images/askicon.png';
import modifyicon from '../assets/images/modify.png';

function BookContentPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [totalPages, setTotalPages] = useState(0); // Total page count
  const [isRectangleVisible, setIsRectangleVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [savedCoverImageUrl, setSavedCoverImageUrl] = useState(null);
  const { userId, bookId } = useParams();   // URL에서 bookId 추출
  const location = useLocation();
  const { paragraph, title, subtitle, imageUrl } = location.state || {};
  const [contentArray, setContentArray] = useState([]);
  const [content, setContent] = useState({
    title: title || '',         // 제목 설정
    subtitle: subtitle || '',   // 부제 설정
    imageUrl: imageUrl || '',   // 이미지 URL 설정
    paragraph: paragraph || '', // 본문 설정
  });
  const { category, name, image, date } = location.state || {};

  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // 로딩 중 상태
  const [isBiographyCreated, setIsBiographyCreated] = useState(false);
  const fileInputRef = useRef(null); // 파일 input 요소에 접근하기 위한 ref
  const [imgData, setImgData] = useState(null);
 
  const [bookContent, setBookContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const bookRef = useRef(null);
  const selectedCategory = location.state?.selectedCategory;

  // 카테고리 가져오는 함수
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
        setCategories(data.categorys); // 카테고리 상태 업데이트
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // 페이지 로드 시 카테고리 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  const [pages, setPages] = useState([]); 
  const pageRef = useRef(null);
  const [pageRefs, setPageRefs] = useState([]); 




// 책 내용 가져오는 함 수 
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
        category: selectedCategory
      }),
    });

    const data = await response.json();
    setBookContent(data.contentArray); // 상태 업데이트

  } catch (error) {
    console.error('Failed to fetch book content:', error);
  }
};
useEffect(() => {
  fetchBookContent();
}, []); // 'location'이 변경될 때마다 fetchBookContent 실행

// bookContent가 업데이트되었을 때 convertBookContentToContent 실행
useEffect(() => {
  if (bookContent.length > 0) { // bookContent가 업데이트된 후 실행
    console.log(bookContent); // 업데이트된 bookContent 출력
    convertBookContentToContent(); // bookContent 기반으로 content 생성
  }
}, [bookContent]);

const convertBookContentToContent = () => {
  const newContent = bookContent.map((paragraph) => ({
    title: title || '', // 타이틀이 없을 경우 기본값
    subtitle: subtitle || '', // 부제가 없을 경우 기본값
    imageUrl: imageUrl || '', // 이미지 URL 추가
    paragraph: paragraph || '', // 본문이 없을 경우 기본값
  }));

    setContentArray(newContent);
    setTotalPages(newContent.length); 
};

  // Navigate to the autobiography page
  const handleProfileClick = () => {
    navigate('/my-autobiography');
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
    const $book = $('#book'); // jQuery로 book 요소 선택
  
    // Ensure book exists before applying turn.js
    if ($book.length && !$book.data('turn')) {
      setTimeout(() => {
        $book.turn({
          width: 800,
          height: 500,
          autoCenter: true,
          elevation: 50,
          gradients: true,
          duration: 1000,
          pages: Math.max(pages.length * 2, 6),  // 페이지 수 동적으로 설정
          when: {
            turned: function (event, page) {
              const actualPage = Math.floor((page - 2) / 2) + 1; // 실제 페이지 계산
              setCurrentPage(actualPage >= 0 ? actualPage : 0);  // 현재 페이지 상태 업데이트
            },
          },
        });
      }, 100); // Delay the initialization to ensure DOM is ready
    }

 // contentArray에서 각 contentItem을 페이지로 추가
 contentArray.forEach((contentItem, index) => {
  // pageRef 배열에서 각 페이지 참조를 설정
  const pageIndex = index + 1; // 페이지 인덱스 설정
  const pageRef = pageRefs[index] || React.createRef();
  pageRefs[index] = pageRef;  // 페이지에 대한 참조를 유지

  // 각 페이지를 $book에 추가
  if (!$book.turn('hasPage', pageIndex)) {
    $book.turn('addPage', `<div class='page-content' ref=${pageRef}>${generatePageContent(contentItem)}</div>`, pageIndex);
  }
});
// 페이지에 추가할 contentItem을 HTML로 생성하는 함수
const generatePageContent = (contentItem) => {
  return `
    <div class="page-content">
      <h1 id="editable-title">${contentItem.title}</h1>
      <h4 id="editable-subtitle">${contentItem.subtitle}</h4>
      ${contentItem.imageUrl ? `<img src="${contentItem.imageUrl}" alt="Uploaded" style="width: 60%; height: auto;" />` : ''}
      <p id="editable-paragraph">${contentItem.paragraph}</p>
    </div>
  `;
};
    return () => {
      if ($book.data('turn')) {
        $book.turn('destroy');
      }
    };
  }, [pages, pageRefs]);


  // Handle previous button click to flip the page backward
  const handlePrevious = () => {
    $('#book').turn('previous');
  };

  // Handle next button click to flip the page forward
  const handleNext = () => {
    $('#book').turn('next');
  };

  const handleOpenModifyPage = () => {
    navigate('/book-modify/:bookId');
  }

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
              <img src={edit} alt="Edit" className="icon edit-icon" onClick={handleModifyClick} />
            </li>
            <li>
              <img src={logout} alt="Logout" className="icon logout-icon" onClick={handleHomeClick} />
            </li>
          </ul>
        </nav>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
      </aside>
      {/* Book name input and category*/}
      <div className="book-info">
        <div className="book-name">
          {name}
        </div>
        <button className="modify-button" onClick={handleOpenModifyPage}>
          <img src={modifyicon} alt="수정하기 아이콘" />
        </button>
      </div>

      {/* Book content */}
      <div id="book">
        <div className="hard">
          {savedCoverImageUrl && (
            <img src={savedCoverImageUrl} alt="Book Cover" className="cover-image" />
          )}
        </div>
        <div className="hard">
        <div className = "page-content"></div>
        </div>
        
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
        
        
       
      <div className="hard">
        <div className = "page-content"></div>
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
    </div>
  );
}

export default BookContentPage;