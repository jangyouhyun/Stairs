import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './inquiryPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';
import exit from '../assets/images/x.png';

function InquiryPage() {
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const navigate = useNavigate();
  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };

  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };

  const handleBookClick = () => {
    navigate('/my-autobiography');
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
          setUserName(data.nickname); // 닉네임을 상태에 저장
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



  return (
    <div className="my-inquiry-page">
      <div className="profile-container">
        <div className="menu" onClick={handleMenuClick}>
          메뉴
        </div>
      </div>

      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
        <img src={defaultProfileImage} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li onClick={handleBookClick}>나의 자서전 목록</li>
            <li className="active">문의하기</li>
            <li onClick={handleModifyClick}>개인정보수정</li>
            <li onClick={handleHomeClick}>로그아웃</li>
          </ul>
        </nav>
      </aside>
      <main className="page-content">
        <h1>CUSTOMER CARE</h1>
        <p>상담 운영시간</p>
        <p>OPEN AM 10:00 – PM 5:00</p>
        <p>LUNCH PM 12:00 – PM 1:00</p>
        <p>SAT, SUN, HOLIDAYS OFF</p>
        <p>CALL 1566-6813</p>
  
        <div className="inquiry-buttons">
        <button onClick = {()=> navigate('/inquirychatbot')}>채팅 상담 시작하기</button>
        <button onClick={() => navigate('/customerinquiry')}>1:1 문의 남기기</button>
        </div>

      </main>
      </div>
  );
}
export default InquiryPage;