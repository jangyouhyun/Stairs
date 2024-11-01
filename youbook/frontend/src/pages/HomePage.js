import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import bookImage from '../assets/images/book3.png';

function HomePage() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [isFindIDPopupVisible, setIsFindIDPopupVisible] = useState(false); // State for Find ID popup visibility
  const [isFindPWPopupVisible, setIsFindPWPopupVisible] = useState(false); // State for Find PW popup visibility
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idForPW, setIdForPW] = useState(''); // ID for password recovery

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/auth/login_process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, pw }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        navigate('/my-autobiography');
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

  const handleFindIDClick = () => {
    setIsFindIDPopupVisible(true);
  };

  const handleFindPWClick = () => {
    setIsFindPWPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsFindIDPopupVisible(false);
    setIsFindPWPopupVisible(false);
  };

  const handleFindIDSubmit = (e) => {
    e.preventDefault();
    // Logic for finding ID based on name and phone
    console.log(`Finding ID for Name: ${name}, Phone: ${phone}`);
    setIsFindIDPopupVisible(false);
  };

  const handleFindPWSubmit = (e) => {
    e.preventDefault();
    // Logic for finding password based on ID, name, and phone
    console.log(`Finding Password for ID: ${idForPW}, Name: ${name}, Phone: ${phone}`);
    setIsFindPWPopupVisible(false);
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
            <span onClick={handleFindIDClick}>아이디 찾기</span> | 
            <span onClick={handleFindPWClick}>비밀번호 찾기</span> | 
            <span onClick={handleSignupClick}>회원가입</span>
          </div>
        </div>
      </div>

      {/* Popup for finding ID */}
      {isFindIDPopupVisible && (
        <div className="popup-overlay">
          <div className="findpopup">
            <h2>아이디 찾기</h2>
            <form onSubmit={handleFindIDSubmit}>
              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">아이디 찾기</button>
                <button type="button" onClick={handleClosePopup}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup for finding Password */}
      {isFindPWPopupVisible && (
        <div className="popup-overlay">
          <div className="findpopup">
            <h2>비밀번호 찾기</h2>
            <form onSubmit={handleFindPWSubmit}>
              <div className="form-group">
                <label>아이디</label>
                <input
                  type="text"
                  value={idForPW}
                  onChange={(e) => setIdForPW(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">비밀번호 찾기</button>
                <button type="button" onClick={handleClosePopup}>취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;