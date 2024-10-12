import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import loadingIcon from '../assets/images/loadingicon.gif';
import chatbotImage from '../assets/images/chatbot1.png';

function BookPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [totalPages, setTotalPages] = useState(0); // Total page count
  const [bookName, setBookName] = useState(''); // Book name state
  const [isRectangleVisible, setIsRectangleVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isDesignOpen, setIsDesignOpen] = useState(false);  // 팝업 열기 상태
  const [isWarningVisible, setIsWarningVisible] = useState(false);  // 경고 창 상태
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const [submenuVisible3, setSubmenuVisible3] = useState(false);
  const [submenuVisible4, setSubmenuVisible4] = useState(false);
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

  const [addMenuVisible, setAddMenuVisible] = useState(false); // For add popup
  const [addMenuVisible2, setAddMenuVisible2] = useState(false);
  const [addMenuVisible5, setAddMenuVisible5] = useState(false);
  
  const [savedCoverImageUrl, setSavedCoverImageUrl] = useState(null);
  const { userId = '', bookId = '' } = useParams(); // URL에서 bookId 추출
  const location = useLocation();
  const { paragraph, category: initialCategory, title, subtitle, imageUrl } = location.state || {};  // 전달된 데이터를 수신
  const [category, setCategory] = useState(initialCategory || '');
  const paragraphRef = useRef(null); 
  const [content, setContent] = useState({
    title: location.state?.title || '',         // 전달받은 제목
    subtitle: location.state?.subtitle || '',   // 전달받은 부제
    imageUrl: location.state?.imageUrl || '',   // 전달받은 이미지 URL
    paragraph: location.state?.paragraph || ''  // 전달받은 본문
  });
  const [pages, setPages] = useState([{ id: 1, content: content }]); // 페이지 리스트
  const pageRef = useRef(null);

  // 페이지에서 콘텐츠가 넘칠 경우 새 페이지 생성
  const checkOverflowAndCreatePage = () => {
    const pageContent = pageRef.current;
    if (pageContent && pageContent.scrollHeight > pageContent.clientHeight) {
      // 넘친 텍스트 처리 방식 개선
      const maxCharsPerPage = 100; // 페이지당 최대 글자 수 조정
      const remainingContent = content.paragraph.slice(maxCharsPerPage); // 넘친 부분 추출
      const updatedContent = { ...content, paragraph: content.paragraph.slice(0, maxCharsPerPage) };
  
      setContent(updatedContent); // 첫 페이지 내용 업데이트
      setPages((prevPages) => [...prevPages, { id: prevPages.length + 1, content: { ...content, paragraph: remainingContent } }]); // 새 페이지 추가
    }
  };

  useEffect(() => {
    checkOverflowAndCreatePage();
  }, [content]);

  const [isHovered, setIsHovered] = useState(false);
  const [addPopupVisible, setAddPopupVisible] = useState(false);

  const handleHoverEnter = () => setIsHovered(true);
  const handleHoverLeave = () => setIsHovered(false);


  const handleAddIconClick = () => {
    setAddPopupVisible(!addPopupVisible); // 팝업창 열고 닫기
  };

  const handleChatbotClick = () => {
    
  };

  const handleDirectAddClick = () => {
    
  };

  useEffect(() => {
    if (userId) {
      // 서버 또는 API에서 사용자 ID에 따라 데이터 요청 (가상 함수)
      fetch(`/api/getUserContent?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
          setContent({
            title: data.title || '',
            subtitle: data.subtitle || '',
            imageUrl: data.imageUrl || '',
            paragraph: data.paragraph || ''
          });
        })
        .catch(error => {
          console.error("Error fetching user content:", error);
        });
    }
  }, [userId]);
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // 로딩 중 상태
  const [isBiographyCreated, setIsBiographyCreated] = useState(false);
  const fileInputRef = useRef(null); // 파일 input 요소에 접근하기 위한 ref
  const [imgData, setImgData] = useState(null);
    // 북콘텐츠 관련 백엔드 변수
  const [bookContent, setBookContent] = useState([]);
  const selectedCategory = location.state?.selectedCategory;

  //제목 삽입
  const handleTitleAdd = () => {
    setContent((prevContent) => ({ ...prevContent, title: 'Title' }));
    setIsEditable(true);
    setSubmenuVisible(false); // Close the submenu
    setAddMenuVisible(false); // Close add menu
  };

  //소제목 삽입
  const handleSubtitleAdd = () => {
    setContent((prevContent) => ({ ...prevContent, subitle: 'Subtitle' }));
    setIsEditable(true);
    setSubmenuVisible(false); // Close the submenu
    setAddMenuVisible(false); // Close add menu
  };

  // Function to handle edit
  const handleEditClick = () => {
    setIsEditable(true); // Make paragraph editable
    setSubmenuVisible(false); // Close submenu
  };

  // Function to save the edited
  const handleSaveClick = () => {
    setIsEditable(false); // Disable editing after save
  };

  // paragraph 삭제
  const handleDeleteClick = () => {
    setContent((prevContent) => ({ ...prevContent, paragraph: '' })); // Clear the paragraph content
    setSubmenuVisible(false);
  }

  // Function to handle edit
  const handleTitleEditClick = () => {
    setIsEditable(true); // Make paragraph editable
    setSubmenuVisible3(false); // Close submenu
    setSubmenuVisible4(false); // Close submenu
  };

  // title 삭제
  const handleTitleDeleteClick = () => {
    setContent((prevContent) => ({ ...prevContent, title: '' }));
    setSubmenuVisible3(false);
  }
  // subtitle 삭제
  const handleSubtitleDeleteClick = () => {
    setContent((prevContent) => ({ ...prevContent, subtitle: '' }));
    setSubmenuVisible4(false);
  }
  // image 삭제
  const ImageDeleteClick = () => {
    setContent((prevContent) => ({ ...prevContent, ImageUrl: null, }));
    setAddMenuVisible5(false);
  }
  // Function to handle right-click on the title & subtitle
  const handleTitleRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: 30,
      y: rect.bottom + window.scrollY - 120,
    });
    setSubmenuVisible3(true); // Show the submenu
  };
  const handleSubtitleRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: 30,
      y: rect.bottom + window.scrollY - 120,
    });
    setSubmenuVisible4(true); // Show the submenu
  };
  // Function to handle right-click on the Image
  const handleImageRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: 30,
      y: rect.bottom + window.scrollY - 120,
    });
    setAddMenuVisible5(true); // Show the submenu
  };
  const handleParagraphRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY,
    });
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

  // Handle "임시 저장" click event to show a popup
  const handleSemiSaveClick = () => {
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

  const handleAddClick = () => {
    setAddMenuVisible(true); // Show add menu popup
    setSubmenuVisible(false); // Hide submenu
  };

  const handleImageClick = () => {
    setAddMenuVisible2(true); // Show add menu popup
    setAddMenuVisible(false); // Hide submenu
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // 사용자가 선택한 첫 번째 파일
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setContent((prevContent) => ({
          ...prevContent,
          imageUrl: reader.result // 이미지 데이터를 base64 형식으로 변환하여 상태에 저장
        }));
      };
      reader.readAsDataURL(file); // 파일을 base64 형식으로 읽음
    }
  };

  // 버튼 클릭 시 파일 선택 창 열기
  const ImageAdd = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 숨겨진 파일 input 요소 클릭
      setAddMenuVisible2(false);
    }
  };
  const handleBackClick = () => {
    setAddMenuVisible(false); // Close add menu
  };
  const handleBackClick2 = () => {
    setAddMenuVisible2(false);
  };
  // 완료 버튼을 누를 때 경고창 없이 팝업을 닫는 함수
  const handleCompleteClick = (imageData) => {
    setSavedCoverImageUrl(imageData);
    setIsDesignOpen(false);  // 팝업 닫기
    alert("표지가 저장되었습니다!");  // 알림
  };

  // 완료 버튼 클릭 시 로딩 중 팝업을 4초 동안 표시하고 자서전 생성 완료 메시지 표시 후 페이지 이동
  const handleCompleteClick2 = () => {
    setIsLoading(true);

    // 생성 날짜 설정
    const createdDate = new Date().toLocaleDateString();

    setTimeout(() => {
      setIsLoading(false);
      setIsBiographyCreated(true);

      setTimeout(() => {
        // 페이지 이동 시 데이터를 함께 전달
        navigate('/my-autobiography', {
          state: {
            category,
            title: bookName,
            date: createdDate,
            image: imgData,  // 저장된 이미지 데이터
          },
        });
      }, 2500); // 2.5초 후 페이지 이동
    }, 4000); // 4초 동안 로딩 상태 유지
  };



  useEffect(() => {
    // Ensure the DOM is loaded before calling turn.js
    const $book = $('#book');

    // Ensure book element exists before initializing turn.js
    if ($book.length) {
      $book.turn({
        width: 800,
        height: 500,
        autoCenter: true,
        elevation: 50,
        gradients: true,
        duration: 1000,
        pages: 6,
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

  // 외부 클릭 시 팝업 닫기
useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.add-popup')) {
      setAddMenuVisible5(false);
      setAddPopupVisible(false); // 팝업 닫기
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

    // Handle previous button click to flip the page backward
    const handlePrevious = () => {
      $('#book').turn('previous');
    };
  
    // Handle next button click to flip the page forward
    const handleNext = () => {
      $('#book').turn('next');
    };

  const convertBookContentToContent = () => {
    const newContent = bookContent.map(paragraph => ({
      title: null,
      subtitle: null,
      imageUrl: null,
      paragraph: paragraph
    }));

    console.log('Converted bookContent to content:', newContent);
    setContent(newContent);
  };

  // 책 내용 불러오기 + 배열로 넣기 
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

    fetchBookContent();
  }, []);  // 초기화 시 한 번만 실행

  // bookContent가 업데이트되었을 때 convertBookContentToContent 실행
  useEffect(() => {
    if (bookContent.length > 0) { // bookContent가 업데이트된 후 실행
      console.log(bookContent); // 업데이트된 bookContent 출력
      convertBookContentToContent(); // bookContent 기반으로 content 생성
    }
  }, [bookContent]);
  
  useEffect(() => {
    if (pageRef.current) {
      // pageRef.current로 직접 DOM 조작 가능
    }
  }, []);
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
      <div id="book">
        <div className="hard">
            {savedCoverImageUrl && (
              <img src={savedCoverImageUrl} alt="Book Cover" className="cover-image" />
            )}
        </div>
        <div className="hard">
          <div className="page-content">
          </div>
        </div>
        
        <div className="page" >
          <div className="page-content">
             {/* Editable paragraph */}
            <h1
              contentEditable={isEditable}
              onBlur={handleSaveClick}
              suppressContentEditableWarning={true}
              onContextMenu={handleTitleRightClick}
              >
                {content.title}
            </h1>
            <h4
              contentEditable={isEditable}
              onBlur={handleSaveClick}
              suppressContentEditableWarning={true}
              onContextMenu={handleSubtitleRightClick}
              >
                {content.subtitle}
            </h4>
            {/* 업로드된 이미지가 있으면 화면에 표시 */}
            {content.imageUrl && (
              <img src={content.imageUrl} alt="Uploaded" 
                  style={{ width: '60%', height: 'auto' }}
                  onContextMenu={handleImageRightClick}
              />
            )}

            {/* 숨겨진 파일 업로드 input */}
            <input
              type="file"
              ref={fileInputRef} // ref를 통해 이 요소에 접근
              style={{ display: 'none' }} // 화면에 표시되지 않도록 숨김
              onChange={handleImageUpload} // 파일 선택 시 핸들러 호출
            />
            <div onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}>
            <p
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onContextMenu={handleParagraphRightClick}
                onBlur={handleSaveClick}
                
              >
                {content.paragraph}
              </p>
              {isHovered && ( // Hover 시 "+" 아이콘 표시
                <div className="add-icon" onClick={handleAddIconClick}>
                  <span>+</span>
                </div>
              )}
              </div>
          </div>
        </div>
       
        
        <div className="page" >
          <div className="page-content">
             {/* Editable paragraph */}
            <h1
              contentEditable={isEditable}
              onBlur={handleSaveClick}
              suppressContentEditableWarning={true}
              onContextMenu={handleTitleRightClick}
              >
                {content.title}
            </h1>
            <h4
              contentEditable={isEditable}
              onBlur={handleSaveClick}
              suppressContentEditableWarning={true}
              onContextMenu={handleSubtitleRightClick}
              >
                {content.subtitle}
            </h4>
            {/* 업로드된 이미지가 있으면 화면에 표시 */}
            {content.imageUrl && (
              <img src={content.imageUrl} alt="Uploaded" 
                  style={{ width: '60%', height: 'auto' }}
                  onContextMenu={handleImageRightClick}
              />
            )}

            {/* 숨겨진 파일 업로드 input */}
            <input
              type="file"
              ref={fileInputRef} // ref를 통해 이 요소에 접근
              style={{ display: 'none' }} // 화면에 표시되지 않도록 숨김
              onChange={handleImageUpload} // 파일 선택 시 핸들러 호출
            />
            {/* Add Image Delete Popup */}
            {addMenuVisible5 && (
              <div className="add-popup"
              style={{
                position: 'absolute',
                top: `${submenuPosition.y}px`,
                left: `${submenuPosition.x}px`,
              }}>
                <button onClick={ImageDeleteClick}>삭제</button>
              </div>
            )}
            <div onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}>
            <p
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onContextMenu={handleParagraphRightClick}
                onBlur={handleSaveClick}
                
              >
                {content.paragraph}
              </p>
              
              </div>
          </div>
        </div>
     
        <div className="hard">
          <div className="page-content">
          </div>
        </div>
      </div>
      {/*popup */}
      {/* main Submenu container */}
      {submenuVisible && (
              <div
                className="add-popup"
                style={{
                  position: 'absolute',
                  top: `${submenuPosition.y}px`,
                  left: `${submenuPosition.x}px`,
                }}
              >
                <button onClick={handleAddClick}>Add</button>
                <button>Chatbot</button>
                <button onClick={handleEditClick}>Edit</button>
                <button onClick={handleDeleteClick}>Delete</button>
              </div>
              )}
            {/* Add Menu Popup */}
            {addMenuVisible && (
              <div className="add-popup"
              style={{
                position: 'absolute',
                top: `${submenuPosition.y}px`,
                left: `${submenuPosition.x}px`,
              }}
              >
                <button onClick={handleTitleAdd}>Title</button>
                <button onClick={handleSubtitleAdd}>Subtitle</button>
                <button onClick={handleImageClick}>Image</button>
                <button onClick={handleBackClick}>Back</button>
              </div>
            )}
            {/* Title Submenu container */}
            {submenuVisible3 && (
              <div
                className="add-popup"
                style={{
                  position: 'absolute',
                  top: `${submenuPosition.y}px`,
                  left: `${submenuPosition.x}px`,
                }}
              >
                <button >AI 추천 받기</button>
                <button onClick={handleTitleEditClick}>Edit</button>
                <button onClick={handleTitleDeleteClick}>Delete</button>
              </div>
              )}
              {/* subtitle Submenu container */}
            {submenuVisible4 && (
              <div
                className="add-popup"
                style={{
                  position: 'absolute',
                  top: `${submenuPosition.y}px`,
                  left: `${submenuPosition.x}px`,
                }}
              > 
                <button >AI 추천 받기</button>
                <button onClick={handleTitleEditClick}>Edit</button>
                <button onClick={handleSubtitleDeleteClick}>Delete</button>
              </div>
              )}
            
            
              {isHovered && ( // Hover 시 "+" 아이콘 표시
                <div className="add-icon" onClick={handleAddIconClick}>
                  <span>+</span>
                </div>
              )}
              {/* 글 추가 버튼 클릭 */}
              {addPopupVisible && (
                <div className="add-popup"
                style={{
                  position: 'absolute',
                  top: `${submenuPosition.y}px`,
                  left: `${submenuPosition.x}px`,
                }}>
                  <button onClick={handleChatbotClick}>Chatbot</button>
                  <button onClick={handleDirectAddClick}>직접 추가</button>
                </div>
              )}
      {/* Add Image Popup */}
      {addMenuVisible2 && (
              <div className="add-popup"
              style={{
                position: 'absolute',
                top: `${submenuPosition.y}px`,
                left: `${submenuPosition.x}px`,
              }}>
                <button>AI 추천 받기</button>
                <button onClick={ImageAdd}>직접 삽입</button>
                <button onClick={handleBackClick2}>Back</button>
              </div>
            )}
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
        <button className="footer-button save-button" onClick={handleSemiSaveClick}>임시 저장</button>
        <button className="footer-button" onClick={handleOpenDesignPage}>표지 만들기</button>
        <button className="footer-button"  onClick={handleCompleteClick2}>완료</button>
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
          <Design onClose={handleCloseDesignPage}
                  onComplete={handleCompleteClick}
          />
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
      {/* 로딩 중 팝업 */}
      {isLoading && (
        <div className="loading-popup">
          <img src={loadingIcon} alt="Loading" className="loading-icon" />
        </div>
      )}

      {/* 자서전 생성 완료 메시지 팝업 */}
      {isBiographyCreated && (
        <div className="biography-created-popup">
          <img src={chatbotImage} alt="Chatbot" className="main-icon" />
          <p>자서전이 생성되었습니다!</p>
        </div>
      )}
      
    </div>

  );
}

export default BookPage;