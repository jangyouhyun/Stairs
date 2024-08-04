import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAutobiographyPage.css';
import profileImage from '../assets/images/signup-icon.png'; // 예시 프로필 이미지

function MyAutobiographyPage() {
  const [selectedCategory, setSelectedCategory] = useState('카테고리1');
  const [items, setItems] = useState([
    { id: 1, category: '카테고리1', content: 'Item 1' },
    { id: 2, category: '카테고리1', content: 'Item 2' },
    { id: 3, category: '카테고리2', content: 'Item 3' },
    { id: 4, category: '카테고리2', content: 'Item 4' },
  ]);

  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleItemClick = () => {
    navigate('/book-reading'); // BookReadingPage로 이동
  };

  const filteredItems = items.filter(item => item.category === selectedCategory);

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
        <header className="header">
          <h1>나의 자서전 <span className="highlighted-number">3</span></h1>
          <div className="search-bar">
            <input type="text" placeholder="자서전 제목" />
            <button>검색</button>
          </div>
        </header>
        <div className="categories-container">
          <div className="categories">
            <button className={`category-button ${selectedCategory === '카테고리1' ? 'active' : ''}`} onClick={() => handleCategoryClick('카테고리1')}>카테고리1</button>
            <button className={`category-button ${selectedCategory === '카테고리2' ? 'active' : ''}`} onClick={() => handleCategoryClick('카테고리2')}>카테고리2</button>
          </div>
          <div class="category-line"></div>
        </div>
        <div className="selection">
          <div className="selection-left">
            <input type="checkbox" id="select-all" />
            <label htmlFor="select-all">전체 선택</label>
          </div>
          <div className="selection-right">
            <button className="delete-button">영구 삭제</button>
            <button className="download-button">다운로드</button>
          </div>
        </div>
        <div className="autobiography-list">
          <div className="autobiography-item add-new">
            <span className="plus-icon">+</span>
          </div>
          {filteredItems.map(item => (
            <div key={item.id} className="autobiography-item" onClick={handleItemClick}>
              <input type="checkbox" />
              {item.content}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MyAutobiographyPage;
