import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAutobiographyPage.css';
import profileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';

function MyAutobiographyPage() {
  const [selectedCategory, setSelectedCategory] = useState('카테고리1');
  const [items, setItems] = useState([
    { id: 1, category: '카테고리1', content: 'Item 1', title: '제목 1', date: '2023-08-10', checked: false },
    { id: 2, category: '카테고리1', content: 'Item 2', title: '제목 2', date: '2023-08-11', checked: false },
    { id: 3, category: '카테고리2', content: 'Item 3', title: '제목 3', date: '2023-08-12', checked: false },
    { id: 4, category: '카테고리2', content: 'Item 4', title: '제목 4', date: '2023-08-13', checked: false },
  ]);

  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleItemClick = (id) => {
    navigate('/book', { state: { id } });
  };

  const handleCheckboxChange = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleSelectAll = () => {
    const allChecked = items.every(item => item.checked);
    setItems(items.map(item => ({ ...item, checked: !allChecked })));
  };

  const handleDelete = () => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (confirmed) {
      setItems(items.filter(item => !item.checked));
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleAddNewItem = () => {
    const newItem = {
      id: items.length + 1,
      category: selectedCategory,
      content: `New Item ${items.length + 1}`,
      title: `제목 ${items.length + 1}`,
      date: new Date().toISOString().slice(0, 10),
      checked: false,
    };
    setItems([...items, newItem]);
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
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        </nav>
      </aside>
      <main className="page-content">
        <header className="header">
          <h1>나의 자서전 <span className="highlighted-number">3</span></h1>
          <div className="search-bar">
            <input type="text" placeholder="자서전 제목" />
            <img src={search} alt="Search" className="search-image" />
          </div>
        </header>
        <div className="categories-container">
          <div className="categories">
            <button className={`category-button ${selectedCategory === '카테고리1' ? 'active' : ''}`} onClick={() => handleCategoryClick('카테고리1')}>카테고리1</button>
            <button className={`category-button ${selectedCategory === '카테고리2' ? 'active' : ''}`} onClick={() => handleCategoryClick('카테고리2')}>카테고리2</button>
          </div>
          <div className="category-line"></div>
        </div>
        <div className="selection">
          <div className="selection-left">
            <input type="checkbox" id="select-all" onChange={handleSelectAll} />
            <label htmlFor="select-all">전체 선택</label>
          </div>
          <div className="selection-right">
            <button className="delete-button" onClick={handleDelete}>영구 삭제</button>
            <button className="download-button">다운로드</button>
          </div>
        </div>
        <div className="autobiography-list">
          <div className="autobiography-item add-new" onClick={handleAddNewItem}>
            <span className="plus-icon">+</span>
          </div>
          {filteredItems.map(item => (
            <div key={item.id} className="autobiography-item">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleCheckboxChange(item.id)}
              />
              <div className="item-content" onClick={() => handleItemClick(item.id)}>
                {item.content}
                <div className="item-details">
                  <div className="item-title">{item.title}</div>
                  <div className="item-date">{item.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MyAutobiographyPage;
