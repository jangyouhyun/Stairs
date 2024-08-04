import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import chatbotImage from '../assets/images/chatbot1.png'; // 이미지 경로 수정
import signupIcon from '../assets/images/signup-icon.png'; // signup-icon 이미지 임포트

function MainPage() {
  const [text, setText] = useState('');

  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/my-autobiography');
  };

  const handleSubmit = () => {
    fetch('/write/write_process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: text }),
    })
    .then(response => {
      if (response.ok) {
        alert('글이 성공적으로 저장되었습니다!');
      } else {
        alert('글 저장에 실패했습니다.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <button className="menu-button">☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={signupIcon} alt="Profile" className="profile-image" />
        </button>
      </header>
      <div className="main-content">
        <div className="title-image-container">
          <img src={chatbotImage} alt="Chatbot" className="main-image" />
          <h1 className="main-title">자서전에 들어갔으면 하는 내용을 적어주세요!</h1>
        </div>
        <button className="question-button">입력내용으로 질문받기</button>
        <textarea className="main-textarea" placeholder="내 인생의 사건에 대해서 적어주세요..."></textarea>
      </div>
    </div>
  );
}

export default MainPage;
