import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import bookImage from '../assets/images/book3.png';

function HomePage() {
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    navigate('/main');
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
            <input type="text" placeholder="아이디" className="input-field" />
            <input type="password" placeholder="비밀번호" className="input-field" />
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
