import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAutobiographyPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';
import exit from '../assets/images/x.png';
import book from '../assets/images/book.png';
import book2 from '../assets/images/book2.png'; // 활성화 상태일 때의 이미지
import edit from '../assets/images/edit.png';
import edit2 from '../assets/images/edit2.png'; // 활성화 상태일 때의 이미지
import logout from '../assets/images/log-out.png';
import logout2 from '../assets/images/log-out2.png';
import askicon from '../assets/images/askicon.png';

function MyAutobiographyPage() {
  const [categories, setCategories] = useState([]); // State for categories
  const [selectedCategory, setSelectedCategory] = useState('');
  const [items, setItems] = useState([]); // 빈 배열로 초기화
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [searchQuery, setSearchQuery] = useState(''); // 검색어를 저장할 상태 변수
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const [isRectangleVisible, setIsRectangleVisible] = useState(false); 

  const navigate = useNavigate();
  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };

  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };

  const handleInquiryClick = () => {
    setIsRectangleVisible(!isRectangleVisible); // 클릭할 때마다 보임/숨김 토글
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
            category: book.category, // 모든 항목의 카테고리를 '카테고리1'로 설정
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

// category 데이터를 가져오는 함수
const fetchCategories = () => {
	fetch('/api/get_category')
	  .then(response => response.json())
	  .then(data => {
		if (data.success) {
		  // Accessing 'name' from the array of category objects
		  const sortedCategories = data.categorys
			.map(category => category.name) // Correctly map the 'name' property from each object
			.sort((a, b) => a.localeCompare(b));
			console.log('Sorted Categories:', sortedCategories);
  
		  // Set the sorted categories to state
		  setCategories(sortedCategories);
  
		  // Set the first category as the selected one
		  if (sortedCategories.length > 0) {
			setSelectedCategory(sortedCategories[0]);
		  }
		} else {
		  console.error(data.message);
		}
	  })
	  .catch(error => {
		console.error('Error fetching categories:', error);
	  });
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);

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
  

  const handleRenameCategory = (newName, name) => {
    if (!newName) {
        console.log('No new name provided, exiting rename function.');
        return; // Exit if no name is provided
    }

    fetch('/api/update_category', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, new_name: newName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Category renamed successfully:', data);
            fetchCategories(); // Refresh categories after renaming
            fetchBooks(); // 새롭게 업데이트된 카테고리와 관련된 북 리스트도 다시 불러오기
        } else {
            console.error('Failed to rename category:', data.message);
        }
    })
    .catch(error => {
        console.error('Error renaming category:', error);
    });
};

const handleDeleteCategory = (name) => {
    fetch('/api/delete_category', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Category deleted successfully:', data);
            fetchCategories(); // 카테고리 삭제 후 카테고리 갱신
            fetchBooks(); // 삭제된 카테고리와 관련된 북 리스트도 다시 불러오기
        } else {
            console.error('Failed to delete category:', data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting category:', error);
    });
};

const handleAddCategory = () => {
  if (categories.length >= 4) {
    window.alert('카테고리는 최대 4개까지 추가할 수 있습니다.');
  } else {
    const newCategory = prompt('새 카테고리 이름을 입력하세요'); // 사용자로부터 입력 받음
    if (!newCategory) {
      return; // 입력이 없으면 함수 종료
    }
    
    // 서버로 카테고리 추가 요청
    fetch('/api/add_category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newCategory }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // 카테고리 추가 성공 시, 카테고리 목록 갱신
          fetchCategories();
        } else {
          window.alert('중복된 이름입니다');
        }
      })
      .catch(error => {
        console.error('Error adding category:', error);
      });
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
    navigate('/main', { state: { selectedCategory } });
  }

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
          <div className="autobiography-item add-new" onClick={() => navigate('/main')}>
            <span className="plus-icon">+</span>
          </div>
          {filteredItems.map(item => (
            <div key={item.id} className="autobiography-item">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleCheckboxChange(item.id)}
              />
              {/* item content 규격(css참고) 맞춰서 이미지 요소로 수정 부탁드려요!*/}
              <div className="item-content" onClick={() => handleItemClick(item.id)}>
                <div className="item-details">
                  <div className="item-title">{item.title}</div>
                  <div className="item-date">{item.date}</div>
                </div>
              </div>
              {/* <div className="item-content" onClick={() => handleItemClick(item.id)}>
                <img 
                  src={item.content} 
                  alt={item.title} 
                  className="item-image" 
                  onError={(e) => e.target.src = profileImagePath} 
                />
                <div className="item-details">
                  <div className="item-title">{item.title}</div>
                  <div className="item-date">{item.date}</div>
                </div>
              </div> */}
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