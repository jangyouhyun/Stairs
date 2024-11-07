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
import defaultcover from "../assets/images/default.png";

function BookPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const userId = localStorage.getItem('userId') || 'defaultUserId';  // userId를 로컬 스토리지에서 가져오기
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage);
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
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 열림 상태 관리
  const [imageRequest, setImageRequest] = useState(''); // 입력받은 이미지 요청 데이터

  const [savedCoverImageUrl, setSavedCoverImageUrl] = useState(null);
  const { bookId } = useParams();   // URL에서 bookId 추출
  const location = useLocation();
  const { paragraph, category: initialCategory, title, subtitle, imageUrl } = location.state || {};  // 전달된 데이터를 수신
  const [category, setCategory] = useState(initialCategory || '');
  const [contentArray, setContentArray] = useState([]);

  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  // 로딩 중 상태
  const [isBiographyCreated, setIsBiographyCreated] = useState(false);
  const fileInputRef = useRef(null); // 파일 input 요소에 접근하기 위한 ref
  const [imgData, setImgData] = useState(null);

  const [bookContent, setBookContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const bookRef = useRef(null);
  const selectedCategory = location.state.selectedCategory;
  var printIndex = location.state.selectedIndex ? location.state.selectedIndex : 0;
  const input_count = location.state.input_count? location.state.input_count : 0;
  const [selectedIndex, setSelectedIndex] = useState();
  const [titleClickStatus, setTitleClickStatus] = useState(false);
  const [subTitleClickStatus, setSubTitleClickStatus] = useState(false);
  // 책 내용을 로드하는 동안 로딩 상태 표시를 위한 상태
const [isArrayLoading, setIsArrayLoading] = useState(true);

  // 카테고리 및 책 데이터 가져오기
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

  useEffect(() => {
    if (contentArray.length > 0) {
      console.log(bookContent);
      setTotalPages(contentArray.length);
    }
  }, [contentArray]);

  const fetchBookContent = async () => {
    setIsArrayLoading(true);
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookId,
          input_count: input_count,
          category: selectedCategory,
          content_order: printIndex,
        }),
      });
  
      const data = await response.json();
      let newContentArray = [];
      
      data.contentArray.forEach((contentItem, originalIndex) => {
        let paragraph = contentItem.paragraph;
        const maxHeight = 500; // 페이지의 최대 높이 (px 기준으로 조정 필요)
  
        // 임시 div 생성 후 높이 측정
        let tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.width = '100%';
        tempDiv.style.height = 'auto';
        tempDiv.style.maxHeight = `${maxHeight}px`;
        tempDiv.innerText = paragraph;
        document.body.appendChild(tempDiv);
  
        // 문장을 분할할 필요가 있는지 확인
        if (tempDiv.scrollHeight > maxHeight) {
          let sentences = paragraph.split('.'); // 문장을 기준으로 분할
          let currentParagraph = '';
          let tempItems = []; // 나뉜 항목들을 임시 저장
  
          sentences.forEach(sentence => {
            // 문장을 추가하고 임시 div로 높이 체크
            let testParagraph = currentParagraph + sentence + '.';
            tempDiv.innerText = testParagraph;
  
            // 새 줄이 최대 높이를 넘지 않으면 문장 추가
            if (tempDiv.scrollHeight <= maxHeight) {
              currentParagraph = testParagraph;
            } else {
              // 나뉜 contentItem을 tempItems 배열에 추가
              tempItems.push({ ...contentItem, paragraph: currentParagraph.trim() });
              currentParagraph = sentence + '.'; // 다음 페이지에 남은 문장을 추가
            }
          });
  
          // 마지막 문단이 있으면 추가
          if (currentParagraph) {
            tempItems.push({ ...contentItem, paragraph: currentParagraph.trim() });
          }
  
          // 원래 위치에 분할된 항목들을 삽입
          newContentArray.splice(originalIndex, 0, ...tempItems);
        } else {
          // 문단이 길지 않으면 그대로 추가
          newContentArray.push(contentItem);
        }
  
        // 임시 div 제거
        document.body.removeChild(tempDiv);
      });
  
      setContentArray(newContentArray); // 새로 생성된 contentArray 설정
    } catch (error) {
      console.error('Failed to fetch book content:', error);
    } finally {
      setIsArrayLoading(false);
    }
  };


  const handleAIimageUpload = async (image_path) => {
    const formData = new FormData();
    formData.append('image_path', image_path); // 이미지 파일 추가

    // 추가 데이터 설정
    formData.append('bookId', bookId);
    formData.append('inputCount', input_count);
    formData.append('content_order', selectedIndex);
    formData.append('whatData', 2);
    try {
      // 서버에 이미지 업로드 요청
      const response = await fetch('/api/update_image', {
        method: 'POST',
        body: formData, // FormData 전송
      });

      const result = await response.json();
      if (result.success) {
        alert('이미지가 성공적으로 업로드되었습니다.');
        // Fetch the updated book content
        await fetchBookContent(); // Call fetchBookContent to reload contentArray
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류가 발생했습니다:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  }

  const handleImageUpload = async (event) => {
    const formData = new FormData();
    const file = event.target.files[0];
    formData.append('image', file);
    formData.append('bookId', bookId);
    formData.append('inputCount', 1);
    formData.append('content_order', selectedIndex);
    formData.append('whatData', 1); 

    try {
      const response = await fetch('/api/update_image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('이미지가 성공적으로 업로드되었습니다.');

        await fetchBookContent();
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 중 오류가 발생했습니다:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };


  // AI로 이미지 생성하는 함수
  const handleAIimagecreate = async (promptData) => {
    try {
      // DALL-E API를 호출하여 이미지 생성
      const dalleResponse = await fetch('/api/create-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData), // 선택한 문단 내용 전달
      });

      const dalleData = await dalleResponse.json();

      if (dalleData.path) {
        // 생성된 이미지 경로가 있으면 이미지 업로드 함수로 넘김
        handleAIimageUpload(dalleData.path);
      } else {
        alert('이미지 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error creating AI image:', error);
      alert('AI 이미지 생성 중 오류가 발생했습니다.');
    }
  };


  //제목 삽입
  const handleTitleAdd = () => {
    setIsEditable(true);
    setSubmenuVisible(false); // Close the submenu
    setAddMenuVisible(false); // Close add menu
    fetchBookContent();
  };

  //소제목 삽입
  const handleSubtitleAdd = () => {
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

  const handleSaveClick = async (event, index) => {
    var whatToChange;
    try {
      const updatedContent = event.target.innerText;
      if (event.target.id === 'editable-title') {
        whatToChange = 1;
      } else if (event.target.id === 'editable-subtitle') {
        whatToChange = 2;
      } else if (event.target.id === 'editable-paragraph') {
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
          content_order: index + 1,
          content: updatedContent, // 수정된 문단 내용
          cNum: whatToChange
        }),
      });

      if (response.ok) {
        setIsEditable(false); // 수정 모드를 비활성화
        fetchBookContent();
      } else {
        console.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  // Function to handle paragraph deletion
  const handleDeleteClick = async (whatToChange = 3) => {
    try {
      const response = await fetch('/api/delete_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          inputCount: 1,  // 적절한 inputCount 값을 설정
          content_order: selectedIndex, // 삭제할 문단의 content_order
          whatToChange: whatToChange,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.message === '마지막 내용입니다.') {
          alert(data.message);
        } else {
          alert('성공적으로 삭제되었습니다.');
        }

        fetchBookContent(); // 삭제 후 책 내용을 다시 불러오기
      } else {
        const errorData = await response.json();
        console.error('Failed to delete content:', errorData.error);
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error during delete request:', error);
      alert('삭제 중 오류가 발생했습니다.');
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
    setSubmenuVisible3(false);
    handleDeleteClick(1);  // whatToChange를 1로 설정하여 title 삭제
    fetchBookContent();
  };

  // subtitle 삭제
  const handleSubtitleDeleteClick = () => {
    setSubmenuVisible4(false);
    handleDeleteClick(2);  // whatToChange를 2로 설정하여 subtitle 삭제
    fetchBookContent();
  };

  // image 삭제
  const ImageDeleteClick = () => {
    setAddMenuVisible5(false);
  }

  //서브 메뉴 클릭
  const handleTitleRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect(); // Get the bounding box of the paragraph
    setSubmenuPosition({
      x: rect.left + window.scrollX, // 요소의 x 위치 (스크롤 위치 보정)
      y: rect.top + window.scrollY   // 요소의 y 위치 (스크롤 위치 보정)
    });
    setSubmenuVisible3(true); // Show the submenu
    //setTitleClickStatus(true);
  };
  
  const handleSubtitleRightClick = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    const rect = event.target.getBoundingClientRect();
    setSubmenuPosition({
      x: rect.left + window.scrollX, // 요소의 x 위치 (스크롤 위치 보정)
      y: rect.top + window.scrollY   // 요소의 y 위치 (스크롤 위치 보정)
    });
    setSubmenuVisible4(true); // Show the submenu
    //setSubTitleClickStatus(true);
  };
  
 // Function to handle right-click on the Image
 const handleImageRightClick = (event) => {
  event.preventDefault(); // Prevent the default browser right-click menu
  const rect = event.target.getBoundingClientRect();
  setSubmenuPosition({
      x: rect.left + window.scrollX, // 요소의 x 위치 (스크롤 위치 보정)
      y: rect.top + window.scrollY   // 요소의 y 위치 (스크롤 위치 보정)
    });
  setAddMenuVisible5(true); // Show the submenu
};

  const handleParagraphRightClick = (event, index) => {
    event.preventDefault(); // 기본 우클릭 메뉴를 막음
    const rect = event.target.getBoundingClientRect();
    setSubmenuPosition({
      x: rect.left + window.scrollX, // 요소의 x 위치 (스크롤 위치 보정)
      y: rect.top + window.scrollY   // 요소의 y 위치 (스크롤 위치 보정)
    });
    setSubmenuVisible(true); // 팝업을 표시
    setSelectedIndex(index + 1);
  };

  //(글 추가 생성시 다른 표시 해서 원래의 content 배열에 추가하는 로직 필요)
  const handleAddIconClick = (event, index) => {
    navigate('/main2', { state : {selectedCategory:selectedCategory, bookId:bookId, selectedIndex:index}});
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
  const handleSemiSaveClick = async () => {
    try {
      // API 호출을 통해 수정된 문단 데이터를 서버에 저장
      const response = await fetch('/api/semi-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          bookTitle:bookName,
          coverImg:savedCoverImageUrl,
        }),
      });

      if (response.ok) {
        alert('임시 저장되었습니다');
        navigate('/my-autobiography');
      } else {
        console.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
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

  const handleRecreateClick = async () => {
    try {
      const response = await fetch('/api/recreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentArray[selectedIndex - 1].paragraph,
          bookId: bookId,
          inputCount: 1,  // 적절한 inputCount 값을 설정
          content_order: selectedIndex, // 삭제할 문단의 content_order
        }),
      });

      if (response.ok) {
        alert('문단이 성공적으로 재생성되었습니다');
        fetchBookContent(); // 삭제 후 책 내용을 다시 불러오기
      } else {
        const errorData = await response.json();
        console.error('Failed to delete content:', errorData.error);
        alert('문단 재생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error during delete request:', error);
      alert('문단 재생성 중 오류가 발생했습니다.');
    }
  }

  const handleImageClick = () => {
    setAddMenuVisible2(true); // Show add menu popup
    setAddMenuVisible(false); // Hide submenu
  };

  const ImageAdd = () => {
    if (fileInputRef.current) {
      console.log("File input found, triggering click");
      fileInputRef.current.click();
      setAddMenuVisible2(false); // Hide the popup after triggering
    } else {
      console.error("File input reference is not set correctly.");
    }
  };

  const ImageAIAdd = (index) => {
    setIsPopupOpen(true); // Open the popup
    setAddMenuVisible2(false); // Hide any other menus if necessary
  };


  const handleCreateImage = () => {
    const promptData = {
      prompt: `다음은 내 삶의 자서전의 한 문단입니다. 이를 보고, ${imageRequest}이 요청에 알맞은 이미지를 생성해 주세요. : ${contentArray[selectedIndex - 1].paragraph}`, // 문단 내용을 DALL-E로 전송
    };

    console.log('Prompt Data:', promptData);
    handleAIimagecreate(promptData); // Pass the stored index
  };


  const handleBackClick = () => {
    setAddMenuVisible(false); // Close add menu
  };
  const handleBackClick2 = () => {
    setAddMenuVisible2(false);
  };
  const handleCompleteClick = async (imageData) => {
    try {
      const base64Data = imageData.split(',')[1]; // base64 인코딩된 데이터만 추출
      const payload = { image: base64Data }; // base64 데이터를 payload로 설정

      // 서버로 이미지 데이터 전송
      const response = await fetch('/api/upload_base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        // 이미지 경로를 상태로 저장
        setSavedCoverImageUrl(data.path);
        console.log("이미지 경로: ", data.path);
        alert("표지가 성공적으로 저장되었습니다!");
      } else {
        alert("이미지 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsDesignOpen(false); // 팝업 닫기
    }
  };

  const handleCompleteClick2 = async () => {
    setIsLoading(true);
    // 생성 날짜 설정
    //const createdDate = new Date().toLocaleDateString();
    console.log("이미지데이터! : ", savedCoverImageUrl)
    try {
      const response = await fetch('/api/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: bookId,
          inputCount: 1,  // 적절한 inputCount 값을 설정
          title: bookName,
          category: selectedCategory,
          image_path: savedCoverImageUrl
          //createdDate : createdDate
        }),
      });
      if (response.ok) {
      } else {
        const errorData = await response.json();
        console.error('Failed to delete content:', errorData.error);
        alert('자서전 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error during delete request:', error);
      alert('저장 중 오류가 발생했습니다.');
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

    // 책이 초기화되지 않았다면 초기화
    if ($book.length && !$book.data('turn')) {
      setTimeout(() => {
        $book.turn({
          width: 800,
          height: 500,
          autoCenter: true,
          duration: 1000,
          pages: Math.max(pages.length * 2, 6),
          when: {
            turned: (event, page) => {
              const actualPage = Math.floor((page - 2) / 2) + 1;
              setCurrentPage(actualPage >= 0 ? actualPage : 0);
            },
          },
        });
      }, 100);
    }

    // 페이지에 대한 참조 유지 및 동적 추가
    contentArray.forEach((contentItem, index) => {
      const pageIndex = index + 1; // 페이지 인덱스 설정
      const pageRef = pageRefs[index] || React.createRef();
      pageRefs[index] = pageRef;  // 페이지에 대한 참조를 유지

      // 페이지가 이미 추가되어 있는지 확인하고 없으면 추가
      if (!$book.turn('hasPage', pageIndex)) {
        const pageContent = generatePageContent(contentItem); // 페이지 컨텐츠 생성 함수 호출
        const pageElement = `<div class='page-content' ref=${pageRef}>${pageContent}</div>`;
        $book.turn('addPage', pageElement, pageIndex);
      }
    });

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
        setAddPopupVisible(false);
      }
      if (!event.target.closest('.dalle-popup-content')) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRecommendSubClick = async () => {
    try {
      const response = await fetch('/api/recommend-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content:contentArray[selectedIndex - 1].paragraph,
          bookId:bookId,
          index:selectedIndex,
          title:false
        }),
      });
      if (response.ok) {
        setSubmenuVisible3(false); // Close submenu
        setSubmenuVisible4(false); // Close submenu
        fetchBookContent();
        alert('AI 추천에 성공했습니다');
      } else {
        alert('AI 추천에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  }

  const handleRecommendBigClick = async () => {
    try {
      const response = await fetch('/api/recommend-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content:contentArray[selectedIndex - 1].paragraph,
          bookId:bookId,
          index:selectedIndex,
          title:true
        }),
      });
      if (response.ok) {
        setSubmenuVisible3(false); // Close submenu
        setSubmenuVisible4(false); // Close submenu
        fetchBookContent();
        alert('AI 추천에 성공했습니다');
      } else {
        alert('AI 추천에 실패했습니다.');
      }
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  }

  return (
    <div className="book-page">
      {/* Header */}
      <header className="main-header">
        <button className="menu-button" onClick={handleMenuClick}>☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={profileImagePath} alt="Profile" className="profile-image2" />
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
            onChange={handleCategoryChange}
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
                setBookName("");
              } else {
                setBookName(inputValue);
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
            <img src={savedCoverImageUrl || defaultcover} alt="Book Cover" className="cover-image" />
          )}
        </div>
        <div className="hard">
          <div className="page-content"></div>
        </div>
        {contentArray.map((contentItem, index) => (
          <div className="page" key={`page-${index}`}>
            <div className="page-content">
              <h1
                id="editable-title"
                contentEditable={isEditable}
                onBlur={(e) => handleSaveClick(e, index)}
                suppressContentEditableWarning={true}
                onContextMenu={(e) => handleTitleRightClick(e, index)}
              >
                {contentItem.title}
              </h1>
              <h4
                id="editable-subtitle"
                contentEditable={isEditable}
                onBlur={(e) => handleSaveClick(e, index)}
                suppressContentEditableWarning={true}
                onContextMenu={(e) => handleSubtitleRightClick(e, index)}
              >
                {contentItem.subtitle}
              </h4>
              {contentItem.imageUrl && (
                <img
                  src={contentItem.imageUrl}
                  alt="Uploaded"
                  style={{ width: '60%', height: 'auto' }}
                  onContextMenu={(e) => handleImageRightClick(e, index)}
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e, index)}
              />
              {addMenuVisible5 && (
                <div className="add-popup"
                  style={{
                    position: 'absolute',
                    top: `${submenuPosition.y - 600}px`,
                    left: `${submenuPosition.x - 600}px`,
                  }}>
                  <button onClick={(e) => ImageDeleteClick(e, index)}>삭제</button>
                </div>
              )}
              <div className="word" onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}>
                <p
                  id="editable-paragraph"
                  contentEditable={isEditable}
                  suppressContentEditableWarning={true}
                  onContextMenu={(e) => handleParagraphRightClick(e, index)}
                  onBlur={(e) => handleSaveClick(e, index)}
                >
                  {contentItem.paragraph}
                </p>
                {isHovered && (
                  <div className="add-icon" onClick={(e) => handleAddIconClick(e, index + 1)}>
                    <span>+</span>
                  </div>
                )}
                {addPopupVisible && (
                  <div className="add-popup"
                    style={{
                      position: 'absolute',
                      top: `${submenuPosition.y - 600}px`,
                      left: `${submenuPosition.x - 600}px`,
                    }}>
                    <button onClick={handleChatbotClick}>Chatbot</button>
                    <button onClick={handleDirectAddClick}>직접 추가</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="hard">
          <div className="page-content"></div>
        </div>
      </div>

      {/* Popup containers */}
      <div className="popup-container">
        {submenuVisible && (
          <div
            className="add-popup"
            style={{
              position: 'absolute',
              top: `${submenuPosition.y - 600}px`,
              left: `${submenuPosition.x - 600}px`,
            }}
          >
            <button onClick={handleAddClick}>Add</button>
            <button onClick={handleRecreateClick}>Recreate</button>
            <button onClick={handleEditClick}>Edit</button>
            <button onClick={handleDeleteClick}>Delete</button>
          </div>
        )}
        {addMenuVisible && (
          <div className="add-popup"
            style={{
              position: 'absolute',
              top: `${submenuPosition.y - 600}px`,
              left: `${submenuPosition.x - 600}px`,
            }}
          >
            <button onClick={handleTitleAdd}>Title</button>
            <button onClick={handleSubtitleAdd}>Subtitle</button>
            <button onClick={handleImageClick}>Image</button>
            <button onClick={handleBackClick}>Back</button>
          </div>
        )}
        {submenuVisible3 && (
          <div
            className="add-popup"
            style={{
              position: 'absolute',
              top: `${submenuPosition.y - 600}px`,
              left: `${submenuPosition.x - 600}px`,
            }}
          >
            <button onClick={handleRecommendBigClick}>AI 추천 받기</button>
            <button onClick={handleTitleEditClick}>Edit</button>
            <button onClick={handleTitleDeleteClick}>Delete</button>
          </div>
        )}
        {submenuVisible4 && (
          <div
            className="add-popup"
            style={{
              position: 'absolute',
              top: `${submenuPosition.y - 600}px`,
              left: `${submenuPosition.x - 600}px`,
            }}
          >
            <button onClick={handleRecommendSubClick}>AI 추천 받기</button>
            <button onClick={handleTitleEditClick}>Edit</button>
            <button onClick={handleSubtitleDeleteClick}>Delete</button>
          </div>
        )}
        {addMenuVisible2 && (
          <div className="add-popup"
            style={{
              position: 'absolute',
              top: `${submenuPosition.y - 600}px`,
              left: `${submenuPosition.x - 600}px`,
            }}>
            <button onClick={ImageAIAdd}>AI 추천 받기</button>
            <button onClick={ImageAdd}>직접 삽입</button>
            <button onClick={handleBackClick2}>Back</button>
          </div>
        )}
      </div>

      {/* Page navigation */}
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
            <li onClick={() => window.location.href = 'https://open.kakao.com/o/s9YXw5Sg'}>채팅 상담</li>
            <li onClick={() => navigate('/qaboard')}>문의</li>

          </ul>
        </div>
      )}
      {isDesignOpen && (
        <div className="design-popup">
          <Design onClose={handleCloseDesignPage} onComplete={handleCompleteClick} />
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
      {isLoading && (
        <div className="loading-popup">
          <img src={loadingIcon} alt="Loading" className="loading-icon" />
        </div>
      )}
      {isBiographyCreated && (
        <div className="biography-created-popup">
          <img src={chatbotImage} alt="Chatbot" className="main-icon" />
          <p>자서전이 생성되었습니다!</p>
        </div>
      )}
      {isPopupOpen && (
        <div className="dalle-popup">
          <div className="dalle-popup-content">
            <p>원하는 이미지를 알려주세요!</p>
            <textarea
              value={imageRequest}
              onChange={(e) => setImageRequest(e.target.value)}
              placeholder="이미지 설명을 입력하세요"
            />
            <button onClick={handleCreateImage} className="dalle-button">만들기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookPage;