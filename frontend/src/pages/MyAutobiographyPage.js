import React from 'react';
import './MyAutobiographyPage.css';
import profileImage from '../assets/images/signup-icon.png'; // 예시 프로필 이미지

function MyAutobiographyPage() {
  return (
    <div className="my-autobiography-page">
      <aside className="sidebar">
        <div className="profile-section">
          <img src={profileImage} alt="Profile" className="profile-image" />
          <div className="profile-name">김이화</div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>유북 홈</li>
            <li className="active">나의 자서전 목록</li>
            <li>1:1 문의 내역</li>
            <li>개인정보수정</li>
            <li>로그아웃</li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <header className="main-header">
          <h1>나의 자서전 <span className="highlighted-number">3</span></h1>
          <div className="search-bar">
            <input type="text" placeholder="자서전 제목" />
            <button>검색</button>
          </div>
        </header>
        <div className="categories">
          <button className="category-button active">카테고리1</button>
          <button className="category-button">카테고리2</button>
        </div>
        <div className="selection">
          <input type="checkbox" id="select-all" />
          <label htmlFor="select-all">전체 선택</label>
          <button className="delete-button">영구 삭제</button>
          <button className="download-button">다운로드</button>
        </div>
        <div className="autobiography-list">
          <div className="autobiography-item add-new">
            <span className="plus-icon">+</span>
          </div>
          <div className="autobiography-item"></div>
          <div className="autobiography-item"></div>
          <div className="autobiography-item"></div>
        </div>
      </main>
    </div>
  );
}

export default MyAutobiographyPage;
