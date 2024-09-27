import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyAutobiographyPage.css';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';

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
  
// book_list 데이터를 가져오는 함수
const fetchBooks = () => {
  fetch('/api/get_books')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const fetchedItems = data.books.map((book, index) => {
          // 날짜 포맷팅 -> 시간 제거
          const formattedDate = new Date(book.create_date).toISOString().slice(0, 10);
          
          return {
            id: index + 1,
            category: book.category,
            book_id: book.book_id,
            content: book.image_path || defaultProfileImage,
            title: book.title,
            date: formattedDate,
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

const handleRenameCategory = (newName, name) => {
	if (!newName) {
	  console.log('No new name provided, exiting rename function.');
	  return; // Exit if no name is provided
	}
  
	console.log('Attempting to rename category from', name, 'to', newName);
  
	fetch('/api/update_category', {
	  method: 'POST',
	  headers: { 
		'Content-Type': 'application/json' // Ensure the Content-Type is correct
	  },
	  body: JSON.stringify({ name: name, new_name: newName }) // Check that this is properly formatted
	})
	  .then(response => {
		console.log('Response:', response); // Log response to check if it’s a 200
		return response.json();
	  })
	  .then(data => {
		console.log('Response data:', data); // Log the data from the response
		if (data.success) {
		  console.log('Category renamed successfully:', data);
		  fetchCategories(); // Refresh categories after renaming
		} else {
		  console.error('Failed to rename category:', data.message);
		}
	  })
	  .catch(error => {
		console.error('Error renaming category:', error);
	  });
  };
  
  const handleDeleteCategory = (name) => {
	console.log('Attempting to delete category:', name);
  
	fetch('/api/delete_category', {
	  method: 'POST',
	  headers: { 
		'Content-Type': 'application/json' // Ensure the Content-Type is correct
	  },
	  body: JSON.stringify({ name: name }) // Check that this is properly formatted
	})
	  .then(response => {
		console.log('Response:', response); // Log response to check if it’s a 200
		return response.json();
	  })
	  .then(data => {
		console.log('Response data:', data); // Log the data from the response
		if (data.success) {
		  console.log('Category deleted successfully:', data);
		  fetchCategories(); // Refresh categories after deletion
		} else {
		  console.error('Failed to delete category:', data.message);
		}
	  })
	  .catch(error => {
		console.error('Error deleting category:', error);
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
		<div className="context-menu" ref={contextMenuRef} // Add reference for outside click detection
		style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}>
			{categories.map((category, index) => (
			<div key={index} className="context-menu-item-group">
				<div
				className="context-menu-item" ref={contextMenuRef} // Add reference for outside click detection
				style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
				onClick={() => {
					const newName = prompt('카테고리 이름 수정', category); // Default to current category name
					if (newName) { // Ensure newName is not null or empty
					console.log('New name entered:', newName); // Log for debugging
					handleRenameCategory(newName, category);
					} else {
					console.log('No name provided or prompt was canceled');
					}
				}}
				>
				이름 수정
				</div>
				<div
				className="context-menu-item"
				onClick={() => {
					if (window.confirm('정말 카테고리를 삭제하시겠습니까?')) {
					console.log('Deleting category:', category); // Debug log
					handleDeleteCategory(category);
					}
				}}
				>
				삭제
				</div>
			</div>
			))}
		</div>
		)}
    </div>
  );
}

export default MyAutobiographyPage;