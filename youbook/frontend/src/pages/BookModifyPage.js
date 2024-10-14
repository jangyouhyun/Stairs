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
import Design from './BookDesignPage.js';
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
  const [addMenuVisible5, setAddMenuVisible5] = useState(false);
  
  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 });

  const [addMenuVisible, setAddMenuVisible] = useState(false); // For add popup
  const [addMenuVisible2, setAddMenuVisible2] = useState(false);
  const [savedCoverImageUrl, setSavedCoverImageUrl] = useState(null);
  const { userId, bookId } = useParams();   // URL에서 bookId 추출
  const location = useLocation();
  const { paragraph, category: initialCategory, title, subtitle, imageUrl } = location.state || {};  // 전달된 데이터를 수신
  const [category, setCategory] = useState(initialCategory || '');
  const [contentArray, setContentArray] = useState([]);
  const [content, setContent] = useState({
    title: title || '',         // 제목 설정
    subtitle: subtitle || '',   // 부제 설정
    imageUrl: imageUrl || '',   // 이미지 URL 설정
    paragraph: paragraph || '', // 본문 설정
  });

  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // 로딩 중 상태
  const [isBiographyCreated, setIsBiographyCreated] = useState(false);
  const fileInputRef = useRef(null); // 파일 input 요소에 접근하기 위한 ref
  const [imgData, setImgData] = useState(null);
 
  const [bookContent, setBookContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const bookRef = useRef(null);
 // const [selectedCategory, setSelectedCategory] = useState(''); // 선택된 카테고리
  const selectedCategory = location.state?.selectedCategory;

  // 카테고리 목록 가져오기
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
  const [isHovered, setIsHovered] = useState(false);
  const [addPopupVisible, setAddPopupVisible] = useState(false);


  const handleHoverEnter = () => setIsHovered(true);
  const handleHoverLeave = () => setIsHovered(false);

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

  useEffect(() => {
    if (contentArray.length > 0 && contentArray[0].paragraph) {
      console.log("content::::::", contentArray[0].paragraph); // 디버깅 문장 추가
      setContent(contentArray[0]);
    } else {
      console.log("contentArray is empty or paragraph is missing");
    }
  }, [contentArray]);

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
  } catch (error) {
    console.error('Failed to fetch book content:', error);
  }
};

// 이미지 핸들러
const handleImageUpload = async (event) => {
  const file = event.target.files[0]; // 사용자가 선택한 첫 번째 파일
  if (file) {
    const formData = new FormData();
    formData.append('image', file); // 이미지 파일 추가
    formData.append('bookId', bookId); // bookId 추가
    formData.append('inputCount', 1);
    formData.append('content_order', 1);

    try {
      // 서버에 이미지 업로드 요청
      const response = await fetch('/api/update_image', {
        method: 'POST',
        body: formData, // FormData 전송
      });

      const result = await response.json();
      if (result.success) {
        setContent((prevContent) => ({
          ...prevContent,
          imageUrl: result.image_path, // 서버에서 받은 이미지 경로 설정
        }));
        alert('이미지가 성공적으로 업로드되었습니다.');
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  }
};


  //제목 삽입
  const handleTitleAdd = () => {
    setContent((prevContent) => ({ ...prevContent, title: 'Title' }));
    setIsEditable(true);
    setSubmenuVisible(false); // Close the submenu
    setAddMenuVisible(false); // Close add menu
    fetchBookContent();
  };

  //소제목 삽입
  const handleSubtitleAdd = () => {
    setContent((prevContent) => ({ ...prevContent, subitle: 'subtitle' }));
    setIsEditable(true);
    setSubmenuVisible(false); // Close the submenu
    setAddMenuVisible(false); // Close add menu
    fetchBookContent();
  };

  // Function to handle edit
  const handleEditClick = () => {
    setIsEditable(true); // Make paragraph editable
    setSubmenuVisible(false); // Close submenu
  };

  // Function to save the edited
  const handleSaveClick = async (event) => {
    var whatToChange;
    try {
      // 편집된 문단 내용을 가져와서 상태 업데이트
      const updatedContent = event.target.innerText;

          // 어떤 부분이 수정되었는지 확인 후, 각각의 상태 업데이트
    if (event.target.id === 'editable-title') {
      setContent((prevContent) => ({
        ...prevContent,
        title: updatedContent,
      }));
      whatToChange = 1;
    } else if (event.target.id === 'editable-subtitle') {
      setContent((prevContent) => ({
        ...prevContent,
        subtitle: updatedContent,
      }));
      whatToChange = 2;
    } else if (event.target.id === 'editable-paragraph') {
      setContent((prevContent) => ({
        ...prevContent,
        paragraph: updatedContent,
      }));
      whatToChange = 3;
    }
  
      // API 호출을 통해 수정된 문단 데이터를 서버에 저장
      const response = await fetch('/api/update_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          inputCount: 1, 
          content_order: 1, // 임시 값
          content: updatedContent, // 수정된 문단 내용
          cNum: whatToChange
        }),
      });
  
      if (response.ok) {
        setIsEditable(false); // 수정 모드를 비활성화
        fetchBookContent(); // 수정된 데이터를 다시 불러오기 위해 호출
      } else {
        console.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };
  
// Function to handle paragraph deletion
const handleDeleteClick = async () => {
  try {
    const response = await fetch('/api/delete_content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookId: bookId,
        inputCount: 1,  // 적절한 inputCount 값을 설정
        content_order: 1, // 삭제할 문단의 content_order
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert('문단이 성공적으로 삭제되었습니다.');
      
      // 상태를 업데이트하거나 필요한 후속 작업을 수행
      fetchBookContent(); // 삭제 후 책 내용을 다시 불러오기
    } else {
      const errorData = await response.json();
      console.error('Failed to delete content:', errorData.error);
      alert('문단 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Error during delete request:', error);
    alert('문단 삭제 중 오류가 발생했습니다.');
  }
};

  // Function to handle edit
  const handleTitleEditClick = () => {
    setIsEditable(true); // Make paragraph editable
    setSubmenuVisible3(false); // Close submenu
    setSubmenuVisible4(false); // Close submenu
    fetchBookContent();
  };

  // title 삭제
  const handleTitleDeleteClick = () => {
    setContent((prevContent) => {
      const updatedContent = { ...prevContent, title: '' };
      console.log(updatedContent); // 상태가 어떻게 변경되는지 확인
      return updatedContent;
    });
    setSubmenuVisible3(false);
    fetchBookContent();
  }
  // subtitle 삭제
  const handleSubtitleDeleteClick = () => {
    setContent((prevContent) => ({ ...prevContent, subtitle: '' })); // Clear the paragraph content
    setSubmenuVisible4(false);
    fetchBookContent();
  }
  // image 삭제
  const ImageDeleteClick = () => {
    setContent((prevContent) => ({ ...prevContent, ImageUrl: null, }));
    setAddMenuVisible5(false);
  }

  //서브 메뉴 클릭
  // Function to handle right-click on the title & subtitle
  const handleTitleRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: 30,
      y: rect.bottom + window.scrollY-100,
    });
    setSubmenuVisible3(true); // Show the submenu
  };
  const handleSubtitleRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: 30,
      y: rect.bottom + window.scrollY-100,
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
      x: 30,
      y: rect.bottom + window.scrollY-100,
    });
    setSubmenuVisible(true); // Show the submenu
  };

  //글 추가 생성
  const handleAddIconClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: 30,
      y: rect.bottom + window.scrollY-100,
    });
    setSubmenuVisible(true);
    setAddPopupVisible(!addPopupVisible); // 팝업창 열고 닫기
  };

  const handleChatbotClick = () => {
    
  };

  const handleDirectAddClick = () => {
    
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

  //데베 백 연결 필요!
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
  const handleCompleteClick = async (imageData) => {
    const coverImageUrl = imageData; // imageData to coverImageUrl
    
    try {
      const result = await fetch('/api/save_cover_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId, coverImageUrl }), // Send bookId and image URL
      });
  
      // Logic after success...
      setSavedCoverImageUrl(coverImageUrl); // Update state with cover image URL
      setIsDesignOpen(false); // Close the design popup
      alert("표지가 저장되었습니다!");
    } catch (error) {
      console.error('Error saving cover image:', error);
    }
};
  
  // 완료 버튼 클릭 시 로딩 중 팝업을 4초 동안 표시하고 자서전 생성 완료 메시지 표시 후 페이지 이동
  const handleCompleteClick2 = async () => {
    setIsLoading(true);
    // 생성 날짜 설정
    //const createdDate = new Date().toLocaleDateString();
    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          inputCount: 1,  // 적절한 inputCount 값을 설정
          title : bookName,
          category:selectedCategory,
          //createdDate : createdDate
        }),
      });
      if (response.ok) {
      } else {
        const errorData = await response.json();
        console.error('Failed to delete content:', errorData.error);
        alert('문단 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error during delete request:', error);
      alert('문단 삭제 중 오류가 발생했습니다.');
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsBiographyCreated(true);

      setTimeout(() => {
        // 페이지 이동 시 데이터를 함께 전달
        navigate('/my-autobiography', {
          state: {
            category,
            title: bookName,
            image: imgData,  // 저장된 이미지 데이터
          },
        });
      }, 2500); // 2.5초 후 페이지 이동
    }, 4000); // 4초 동안 로딩 상태 유지
  };
 
  useEffect(() => {
    const $book = $('#book'); // jQuery로 book 요소 선택
  
    // turn.js 초기화
    if ($book.length && !$book.data('turn')) {
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
    }
  
    // 페이지 업데이트 시 처리 로직
    pages.forEach((pageContent, index) => {
      const pageIndex = index + 1; // 페이지 인덱스
  
      // 개별 pageRef를 관리하기 위해 ref 배열을 사용
      const pageRef = pageRefs[index] || React.createRef();
      pageRefs[index] = pageRef;  // 각 페이지에 대한 참조 유지
  
      // 페이지가 이미 추가되어 있는지 확인하고, 추가되지 않았으면 추가
      if (!$book.turn('hasPage', pageIndex)) {
        $book.turn('addPage', pageRef.current, pageIndex);
      }
    });
  
    // 페이지가 업데이트될 때마다 총 페이지 수를 설정
    setTotalPages(Math.max(pages.length, Math.ceil($book.turn('pages') / 2)));
  
    document.addEventListener('click', handleOutsideClick);
  
    return () => {
      if ($book.data('turn')) {
        $book.turn('destroy');
      }
      document.removeEventListener('click', handleOutsideClick);
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

  const convertBookContentToContent = () => {
    const newContent = bookContent.map(paragraph => ({
      title: null,
      subtitle: null,
      imageUrl: null,
      paragraph: paragraph
    }));

    console.log('Converted bookContent to content:', newContent);
    setContentArray(newContent);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    
    // 현재 상태를 유지하면서 새 selectedCategory를 포함하여 navigate
    navigate(location.pathname, {
      state: {
        ...location.state,
        selectedCategory: newCategory, // 새로운 카테고리 값
      },
    });
  };

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
      {/* Book name input and category selection */}
      <div className="book-details">
        <div className="input-group">
        <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange} // 선택한 값으로 상태 업데이트
          >
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

        </div>
        <div className="input-group name">
        <input
          type="text"
          id="bookName"
          value={bookName}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue.length > 15) {
              alert("15자 아래로 적어주세요!");
              setBookName(""); // 책 이름 초기화
            } else {
              setBookName(inputValue); // 정상 입력 처리
            }
          }}
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
        <div className = "page-content"></div>
        </div>

        
        <div className="page">
          {/* contentArray를 순회하면서 각 요소를 화면에 표시 */}
          {contentArray.map((contentItem, index) => (
            <div className="page-content"  key={`page-${index}`} ref={index === pages.length - 1 ? pageRef : null}>
              {/*타이틀*/}
              <h1
                id="editable-title"
                contentEditable={isEditable}
                onBlur={handleSaveClick}
                suppressContentEditableWarning={true}
                onContextMenu={handleTitleRightClick}
              >
                {contentItem.title}
              </h1>
              {/*서브*/}
              <h4
                id="editable-subtitle"
                contentEditable={isEditable}
                onBlur={handleSaveClick}
                suppressContentEditableWarning={true}
                onContextMenu={handleSubtitleRightClick}
              >
                {contentItem.subtitle}
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
              {/*글*/}
              <div className = "word" onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}>
              <p
                id="editable-paragraph"
                contentEditable={isEditable}
                suppressContentEditableWarning={true}
                onContextMenu={handleParagraphRightClick}
                onBlur={handleSaveClick}
              >
                {contentItem.paragraph}
              </p>
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
            <button>Recreate</button>
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
      </div>
      ))}
        </div>
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

      {/* Footer buttons */}
      <div className="book-footer">
        <button className="footer-button save-button" onClick={handleSemiSaveClick}>임시 저장</button>
        <button className="footer-button" onClick={handleOpenDesignPage}>표지 만들기</button>
        <button className="footer-button" onClick={handleCompleteClick2}>완료</button>
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
