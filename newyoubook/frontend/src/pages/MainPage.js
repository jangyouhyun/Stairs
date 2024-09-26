import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import chatbotImage from '../assets/images/chatbot1.png'; // 이미지 경로 수정

function MainPage() {
  const [text, setText] = useState('');

  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); 

  const navigate = useNavigate();

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
      body: JSON.stringify({ content: text })
    })
    .then(response => {
      navigate('/chatbot');
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  // 자서전 바로 만들기 버튼 클릭 시 동작
  const handleCreateBook = () => {
    fetch('/api/write_process/nochatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text })
    })
    .then(response => {
      navigate('/book-reading')}
    )
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <button className="menu-button">☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={profileImagePath} alt="Profile" className="profile-image" />
        </button>
      </header>
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