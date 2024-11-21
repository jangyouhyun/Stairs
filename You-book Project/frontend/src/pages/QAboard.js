import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultProfileImage from '../assets/images/signup-icon.png';
import book from '../assets/images/book.png';
import edit from '../assets/images/edit.png';
import logout from '../assets/images/log-out.png';
import exit from '../assets/images/x.png';
import './QAboard.css';

function QABoard() {
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); 
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isRectangleVisible, setIsRectangleVisible] = useState(false);
  const [userName, setUserName] = useState(''); 
  const [questions, setQuestions] = useState([
    { id: 1, title: '2024년 입고정보게시판 신설',  date: '2021-01-26', isPinned: true },
    { id: 2, title: '표지 디자인 추천 받고 싶어요',  date: '2021-01-26', isPinned: false },
    { id: 3, title: '카테고리 몇개 만들 수 있어요?',  date: '2021-01-26', isPinned: false },
    { id: 4, title: '사진 넣는거 제한 있나요?',  date: '2021-01-26', isPinned: false },
    { id: 5, title: '새로운 기능 요청합니다',  date: '2021-01-26', isPinned: false },
    { id: 6, title: '로그인 오류 문의',  date: '2021-01-26', isPinned: false },
    { id: 7, title: '회원 탈퇴 방법 문의',  date: '2021-01-26', isPinned: false },
    { id: 8, title: '비밀번호 재설정 방법',  date: '2021-01-26', isPinned: false },
    { id: 9, title: '서비스 개선 요청',  date: '2021-01-26', isPinned: false },
    { id: 10, title: '디자인 변경 관련',  date: '2021-01-26', isPinned: false },
    { id: 11, title: '개인정보 수정 문의',  date: '2021-01-26', isPinned: false },
    { id: 12, title: '1:1 문의 기능 추가 요청',  date: '2021-01-26', isPinned: false },
   ]);
   const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 8;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };


  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const navigate = useNavigate();


  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };
  const handleProfileClick = () => {
    navigate('/my-autobiography');
  };
  const handleModifyClick = () => {
    navigate('/modifyinfo');
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
  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };
  
  return (
    
    <div className="qa-board">
      <header className="main-header">
        <button className="menu-button" onClick={handleMenuClick}>☰</button>
        <button className="profile-button" onClick={handleProfileClick}>
          <img src={profileImagePath} alt="Profile" className="profile-image"
           />
        </button>
      </header>
      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={profileImagePath} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
        <ul>
          <li>
            <img src={book} alt="Book" className="icon book-icon" onClick={handleProfileClick} />
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
      <h1 className="qa-title">Q&A</h1>
      <table className="qa-table">
        <thead>
          <tr>
            <th>No</th>
            <th>제목</th>
            <th>작성시간</th>
          </tr>
        </thead>
        <tbody>
          {currentQuestions.map((question) => (
            <tr key={question.id} className={question.isPinned ? 'pinned' : ''}>
              <td>{question.isPinned ? <span>📌</span> : question.id}</td>
              <td>{question.title}</td>
              <td>{question.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>◀</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>▶</button>
      </div>
      <div className="qa-footer">
        <input type="text" placeholder="Search" className="qa-search" />
        <button onClick={() => navigate('/customerinquiry')} className="qa-write-button">글쓰기</button>
      </div>
      {isRectangleVisible && (
        <div className="vertical-rectangle">
          <ul>
            <li onClick={() => window.location.href = 'https://open.kakao.com/o/s9YXw5Sg'}>
              채팅 상담</li>
            <li onClick={() => navigate('/qaboard')}>문의</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default QABoard;