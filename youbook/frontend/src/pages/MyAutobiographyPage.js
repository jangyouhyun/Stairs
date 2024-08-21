import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAutobiographyPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';

function MyAutobiographyPage() {
  const [selectedCategory, setSelectedCategory] = useState('카테고리1');
  const [items, setItems] = useState([]); // 빈 배열로 초기화
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [searchQuery, setSearchQuery] = useState(''); // 검색어를 저장할 상태 변수

  const navigate = useNavigate();

  // 유저 정보를 서버에서 가져옴
  useEffect(() => {
    fetch('/api/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUserName(data.nickname); // 닉네임을 상태에 저장
          setProfileImagePath(data.imagePath || defaultProfileImage); // 프로필 이미지 경로를 상태에 저장
          
          // 유저 정보를 가져온 후, book_list 데이터를 가져옴
          fetchBooks(data.user_id);
        } else {
          console.error(data.message);
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  }, [navigate]);

// book_list 데이터를 가져오는 함수
const fetchBooks = () => {
  fetch('/api/get_books')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const fetchedItems = data.books.map((book, index) => {
          // 날짜를 포맷팅 (시간 제거)
          const formattedDate = new Date(book.create_date).toISOString().slice(0, 10);
          
          return {
            id: index + 1,
            category: '카테고리1', // 모든 항목의 카테고리를 '카테고리1'로 설정
            content: book.image_path || defaultProfileImage, // content 필드에 이미지 경로 설정
            title: book.title,
            date: formattedDate, // 포맷된 날짜 설정
            checked: false,
          };
        });
        setItems(fetchedItems);
      } else {
        console.error(data.message);
      }
    })
    .catch(error => {
      console.error('Error fetching books:', error);
    });
};



  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleItemClick = (id) => {
    navigate('/book', { state: { id } });
  };

  const handleCheckboxChange = async (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));

    // 아이템 삭제 API 로 전송
    try {
      const response = await fetch('/api/delete_book_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      const data = await response.json();
      console.log('Server response:', data);
    } catch (error) {
      console.error('Error:', error);
    }
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

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredItems = items
  .filter(item => item.title && item.title.includes(searchQuery)); // item.title이 존재하는지 확인


  return (
    <div className="my-autobiography-page">
      <aside className="sidebar">
        <div className="profile-section">
          <img src={profileImagePath} alt="Profile" className="profile-image" />
          <div className="profile-name">{userName}</div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li onClick={() => navigate('/home')}>유북 홈</li>
            <li className="active">나의 자서전 목록</li>
            <li onClick={() => navigate('/inquiry')}>1:1 문의 내역</li>
            <li onClick={() => navigate('/profile')}>개인정보수정</li>
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        </nav>
      </aside>
      <main className="page-content">
        <header className="header">
          <h1>나의 자서전 <span className="highlighted-number">{filteredItems.length}</span></h1>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="자서전 제목" 
              value={searchQuery} 
              onChange={handleSearch} 
            />
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
                <img 
                  src={item.content} 
                  alt={item.title} 
                  className="item-image" 
                  onError={(e) => e.target.src = defaultProfileImage} 
                />
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
