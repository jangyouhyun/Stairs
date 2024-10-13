import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MyAutobiographyPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';
import exit from '../assets/images/x.png';
import book from '../assets/images/book.png';
import edit from '../assets/images/edit.png';
import logout from '../assets/images/log-out.png';
import askicon from '../assets/images/askicon.png';

function MyAutobiographyPage() {
  const location = useLocation();
  const { category, title, date, image } = location.state || {}; 
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState([]); 
  const [userName, setUserName] = useState('');
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); 
  const [searchQuery, setSearchQuery] = useState(''); // 검색어를 저장할 상태 변수
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isRectangleVisible, setIsRectangleVisible] = useState(false); 
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

    // 메뉴 관련 핸들러들
    const handleMenuClick = () => setIsSidebarVisible(true);
    const handleExitClick = () => setIsSidebarVisible(false);
    const handleInquiryClick = () => setIsRectangleVisible(!isRectangleVisible);
    const handleModifyClick = () => navigate('/modifyinfo');
    const handleHomeClick = () => navigate('/');
    const handleItemClick = (id) => navigate('/book', { state: { id } });

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
            id: book.book_id,
            category: book.category, // 모든 항목의 카테고리를 '카테고리1'로 설정
            content: book.image_path, // content 필드에 이미지 경로 설정
            name: book.title,
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

// category 데이터를 가져오는 함수
const fetchCategories = () => {
  fetch('/api/get_category')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const sortedCategories = data.categorys.map(category => category.name).sort((a, b) => a.localeCompare(b));
        setCategories(sortedCategories);
        if (sortedCategories.length > 0) {
        setSelectedCategory(sortedCategories[0]);
        }
    }
    })
    .catch(error => {console.error('Error fetching categories:', error);});
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category) => setSelectedCategory(category);

  // 전체 선택 핸들러
  const handleSelectAll = () => {
    const allChecked = items.every(item => item.checked);
    setItems(items.map(item => ({ ...item, checked: !allChecked })));
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (id) => {
    setItems(items.map(item => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
  
    if (confirmed) {
      // checked가 true인 항목들의 id 추출
      const checkedId = items
        .filter(item => item.checked)
        .map(item => item.id); // book_id 대신 id 사용
    
      if (checkedId.length > 0) {
        console.log(checkedId); // 확인을 위해 id 배열 출력
        try {
          // API 호출: 삭제할 id 목록을 body에 포함
          const response = await fetch('/api/delete_book_list', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ book_id: checkedId }), // id들의 배열을 전송
          });
  
          if (!response.ok) {
            throw new Error('Failed to delete items');
          }
  
          const data = await response.json();
          console.log('Server response:', data);
  
          // 성공적으로 삭제된 경우 상태 업데이트
          setItems(items.filter(item => !item.checked));
        } catch (error) {
          console.error('Error:', error);
        }
      } else {
        console.log('No items selected for deletion');
      }
    }
  };
  
  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });
      if (response.ok) navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleContextMenu = (event, category) => {
    event.preventDefault();
    setShowContextMenu(true);
    setContextMenuPosition({ x: event.pageX, y: event.pageY });
    setEditingCategory(category); 
  };

  // 카테고리 이름 변경 핸들러
  const handleRenameCategory = (newName, name) => {
    if (!newName) return;
    fetch('/api/update_category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, new_name: newName }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          fetchCategories();
          fetchBooks();
        }
      })
      .catch(error => console.error('Error renaming category:', error));
  };

  // 카테고리 삭제 핸들러
  const handleDeleteCategory = (name) => {
    fetch('/api/delete_category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          fetchCategories();
          fetchBooks();
        }
      })
      .catch(error => console.error('Error deleting category:', error));
  };

  // 카테고리 추가 핸들러
  const handleAddCategory = () => {
    if (categories.length >= 4) {
      window.alert('카테고리는 최대 4개까지 추가할 수 있습니다.');
    } else {
      const newCategory = prompt('새 카테고리 이름을 입력하세요');
      if (newCategory) {
        fetch('/api/add_category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCategory }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) fetchCategories();
          })
          .catch(error => console.error('Error adding category:', error));
      }
    }
  };
  
  //검색 핸들러
  const handleSearch = (event) => {
    setSearchQuery(event.target.value); // 검색어를 업데이트
  };

  // 외부 클릭 시 컨텍스트 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 카테고리 및 책 데이터 가져오기
  useEffect(() => {
    fetch('/api/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUserName(data.nickname); 
          setProfileImagePath(data.imagePath || defaultProfileImage); 
          fetchBooks(data.user_id); 
        } else {
          navigate('/');
        }
      })
      .catch(error => console.error('Error fetching user info:', error));
  }, [navigate]);

  const handleAddNewItem = () => {
    navigate('/main', { state: { selectedCategory } });
  }

  // 아이템 검색이 반영되도록 필터 수정
  const filteredItems = items.filter(item => item.category === selectedCategory && item.title.includes(searchQuery)); // item.title이 존재하는지 확인

  return (
    <div className="my-autobiography-page">
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={profileImagePath} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
        <ul>
          <li>
            <img src={book} alt="Book" className="icon book-icon active" />
          </li>
          <li>
            <img src={edit} alt="Edit" className="icon edit-icon" onClick={handleModifyClick}/>
          </li>
          <li>
            <img src={logout} alt="Logout" className="icon logout-icon" onClick={handleLogout}/>
          </li>
        </ul>
        </nav>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
      </aside>
      <main className="page-content">
        <div className="menu-container">
          <div className="menu" onClick={handleMenuClick}style={{ fontSize: '4.0rem', color: '#CEAB93' }}>
            ☰</div>
        </div>
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
            <div className="item-content" onClick={() => navigate(`/book-content/${item.id}`, {
              state: {
                category: item.category,
                name: item.name,
                image: item.content,
                date: item.date 
              }
            })}>
              {item.content && (
                <img 
                  src={item.content} 
                  alt={item.title} 
                  className="item-image" 
                  onError={(e) => e.target.src = null} 
                />
              )}
              <div className="item-details">
                <div className="item-title">{item.name}</div>
                <div className="item-date">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <div className="fixed-inquiry-icon" onClick={handleInquiryClick}>
        <img src={askicon} alt="문의하기 아이콘" />
      </div>
      {isRectangleVisible && (
        <div className="vertical-rectangle">
          <ul>
            <li onClick={() => window.location.href = 'https://open.kakao.com/o/s9YXw5Sg'}>
              채팅 상담</li>
            <li onClick={() => navigate('/customerinquiry')}>1:1 문의</li>
          </ul>
        </div>
      )}
      {/* Context menu for categories */}
      {showContextMenu && editingCategory && (
      <div
        className="context-menu"
        ref={contextMenuRef}
        style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
      >
        <div
          className="context-menu-item"
          onClick={() => {
            const newName = prompt('카테고리 이름 수정', editingCategory); // Use editingCategory for the prompt
            if (newName) {
              handleRenameCategory(newName, editingCategory); // Rename only the editingCategory
            }
          }}
        >
          이름 수정
        </div>
        <div
          className="context-menu-item"
          onClick={() => {
            if (window.confirm('정말 카테고리를 삭제하시겠습니까?')) {
              handleDeleteCategory(editingCategory); // Delete only the editingCategory
            }
          }}
        >
          삭제
        </div>
      </div>
    )}
    </div>
  );
}

export default MyAutobiographyPage;