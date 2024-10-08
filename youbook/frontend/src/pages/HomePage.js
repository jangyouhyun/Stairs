import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import bookImage from '../assets/images/book3.png';

function HomePage() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/auth/login_process', { // 경로 수정
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, pw }),
        credentials: 'include' // 세션 정보를 포함하여 요청
      });

      const data = await response.json();
      if (data.success) {
        navigate('/main');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="book-image-container">
          <img src={bookImage} alt="Book" className="book-image" />
        </div>
        <div className="login-content">
          <h1 className="title">유북</h1>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="text"
              placeholder="아이디"
              className="input-field"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <input
              type="password"
              placeholder="비밀번호"
              className="input-field"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <button type="submit" className="login-button">로그인</button>
          </form>
          <div className="links">
            <span>아이디 찾기</span> | <span>비밀번호 찾기</span> | <span onClick={handleSignupClick}>회원가입</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
