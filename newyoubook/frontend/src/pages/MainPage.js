import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import chatbotImage from '../assets/images/chatbot1.png'; // 이미지 경로 수정
import exit from '../assets/images/x.png';

function MainPage() {
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [text, setText] = useState('');
  
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };

  const handleBookClick = () => {
    navigate('/my-autobiography');
  };

  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };

  const handleInquiryClick = () => {
    navigate('/inquiry');
  };
  const handleModifyClick = () => {
    navigate('/modifyinfo');
  };
  const handleHomeClick = () => {
    navigate('/');
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

  const handleProfileClick = () => {
    navigate('/my-autobiography');
  };

  const handleSubmit = () => {
    fetch('/api/write_process/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text }),
    })
    .then(response => {
      navigate('/chatbot');
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const handleCreateBook = () => {
    fetch('/api/write_process/book_reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text }),  // 'text' 변수에 담긴 내용을 'content'로 전송
    })
    .then(response => response.json())
    .then(data => {
      console.log('API response:', data);  // 서버 응답 확인
      if (data.status === 200) {
        const bookId = data.bookId;
        navigate(`/book-reading/${bookId}`);
      }
    })
    
    .catch(error => {
      console.error('Error:', error);
      alert('저장 중 오류가 발생했습니다.');
    });
  };  

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        navigate('/');  // 로그아웃 성공 후 메인 페이지로 이동
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  return (
    <div className="main-page">
      <header className="main-header">
        <button className="menu-button" onClick={handleMenuClick}>☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>

      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
        <img src={profileImagePath} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li onClick={handleBookClick}>나의 자서전 목록</li>
            <li onClick={handleInquiryClick}>문의하기</li>
            <li onClick={handleModifyClick}>개인정보수정</li>
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        </nav>
      </aside>

      <div className="main-content">
        <div className="title-image-container">
          <img src={chatbotImage} alt="Chatbot" className="main-image" />
          <h1 className="main-title">자서전에 들어갔으면 하는 내용을 적어주세요!</h1>
        </div>
        <button className="question-button" onClick={handleSubmit}>입력내용으로 질문받기</button>
        <textarea
          className="main-textarea"
          placeholder="내 인생의 사건에 대해서 적어주세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>

        {/* 자서전 바로 만들기 버튼 추가 */}
        <div className="button-container">
          <button className="create-book-button" onClick={handleCreateBook}>
            자서전 바로 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;