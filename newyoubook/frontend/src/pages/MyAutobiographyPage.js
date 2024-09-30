import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAutobiographyPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';
import exit from '../assets/images/x.png';

function MyAutobiographyPage() {
  const [selectedCategory, setSelectedCategory] = useState('카테고리1');
  const [categories, setCategories] = useState(['카테고리1', '카테고리2']); // State for categories
  const [items, setItems] = useState([]); // 빈 배열로 초기화
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [searchQuery, setSearchQuery] = useState(''); // 검색어를 저장할 상태 변수
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const navigate = useNavigate();
  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };

  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };

  const handleInquiryClick = () => {
    navigate('/inquiry');
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
            book_id: book.book_id,
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

const contextMenuRef = useRef(null); // Reference to the context menu

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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        navigate('/');  // 로그아웃 성공 후 메인 페이지로 이동
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleContextMenu = (event, category) => {
    event.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: event.pageX, y: event.pageY });
    setEditingCategory(category);
  };

  const handleRenameCategory = (newName) => {
    setCategories(categories.map(cat => (cat === editingCategory ? newName : cat)));
    setSelectedCategory(newName === selectedCategory ? newName : selectedCategory);
    setShowContextMenu(false);
  };

  const handleDeleteCategory = () => {
    const confirmed = window.confirm('정말 카테고리를 삭제하시겠습니까?');
    if (confirmed) {
      setCategories(categories.filter(cat => cat !== editingCategory));
      setItems(items.filter(item => item.category !== editingCategory));
      setSelectedCategory(categories[0]);
    }
    setShowContextMenu(false);
  };

  const handleAddCategory = () => {
    if (categories.length >= 4) {
      window.alert('카테고리는 최대 4개까지 추가할 수 있습니다.');
    } else {
      const newCategory = `카테고리${categories.length + 1}`;
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory);
    }
  };

  // Event listener to close the context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false); // Hide context menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const filteredItems = items.filter(item => item.category === selectedCategory);

  // Event listener to close the context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false); // Hide context menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="my-autobiography-page">
      <div className="profile-container">
        <div className="menu" onClick={handleMenuClick}>☰</div>
      </div>

      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
        <img src={defaultProfileImage} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">나의 자서전 목록</li>
            <li onClick={handleInquiryClick}>문의하기</li>
            <li onClick={handleModifyClick}>개인정보수정</li>
            <li onClick={handleHomeClick}>로그아웃</li>
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
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category)}
                onContextMenu={(event) => handleContextMenu(event, category)} // Right-click event
              >
                {category}
              </button>
            ))}
            <div className="category-button add-category-button" onClick={handleAddCategory}>
              +
            </div>
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
      {/* Context menu for categories */}
      {showContextMenu && (
        <div
          className="context-menu"
          ref={contextMenuRef} // Add reference for outside click detection
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
        >
          <div className="context-menu-item" onClick={() => handleRenameCategory(prompt('카테고리 이름 수정'))}>이름 수정</div>
          <div className="context-menu-item" onClick={handleDeleteCategory}>삭제</div>
        </div>
      )}
    </div>
  );
}

export default MyAutobiographyPage;