import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import leftDoorImage from '../assets/images/left-door.png';
import rightDoorImage from '../assets/images/right-door.png';
import chatbotImage from '../assets/images/chatbot1.png';

function HomePage() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [isFindIDPopupVisible, setIsFindIDPopupVisible] = useState(false); // State for Find ID popup visibility
  const [isFindPWPopupVisible, setIsFindPWPopupVisible] = useState(false); // State for Find PW popup visibility
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idForPW, setIdForPW] = useState(''); // ID for password recovery
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [userId, setUserId] = useState(null); // 아이디 찾기 API 호출 위해 추가 => 아이디 찾기 한 뒤에, 얘를 출력해주면 됨

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/auth/login_process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, pw }),
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setIsBookOpen(true);
        setIsWelcomeVisible(true);

        // 애니메이션이 끝난 후 페이지 이동 (약 1초 대기)
        setTimeout(() => {
          navigate('/my-autobiography');
        }, 2500);
      } else {
        alert(data.message); // 로그인 실패 메시지 표시
      }
    } catch (error) {
      console.error('Error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleFindIDClick = () => {
    setIsFindIDPopupVisible(true);
  };

  const handleFindPWClick = () => {
    setIsFindPWPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsFindIDPopupVisible(false);
    setIsFindPWPopupVisible(false);
  };

  // API 연결 완료 - alert 로 뜨게 해둠
  const handleFindIDSubmit = async (e) => {
    e.preventDefault();
    console.log(`Finding ID for Name: ${name}, Phone: ${phone}`);
  
    try {
      // 서버에 name과 phone 정보를 전송하여 ID를 가져오기
      const response = await fetch('/api/get_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phoneNum: phone }),
      });
      const data = await response.json();
  
      if (data.success) {
        setUserId(data.userId); // 서버에서 가져온 ID를 상태에 저장
        console.log(`User ID: ${data.userId}`);
        alert(`User ID: ${data.userId}`); // ID 직접 표시
      } else {
        console.log(`Error: ${data.message}`);
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
      alert('Error fetching user ID');
    }
  
    setIsFindIDPopupVisible(false); // 팝업 닫기
  };
  
  
  // pw 찾기 전에 유저가 맞는 정보 입력했는지 확인하는 로직 완성
  // 팝업으로 새로운 비번넣는부분 만들어주시면 -> API 연결 예정
  const handleFindPWSubmit = async (e) => {
    e.preventDefault();
    console.log(`Finding Password for ID: ${idForPW}, Name: ${name}, Phone: ${phone}`);

    try {
      // 서버에 userId, name, phone 정보를 전송하여 사용자 확인
      const response = await fetch('/api/confirm_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: idForPW, name, phoneNum: phone }),
      });
      const data = await response.json();

      if (data.success) {
        console.log("User confirmed:", data.user);
        alert("굿 ~");
        // 사용자 존재 확인 후 추가 로직
      } else {
        console.log("User not found:", data.message);
        alert("해당하는 사용자가 없습니다");
      }
    } catch (error) {
      console.error('Error confirming user:', error);
    }

    setIsFindPWPopupVisible(false);
  };


  return (
    <div className="homepage">
      <div className="login-container">
        <div className={`door-animation ${isBookOpen ? 'open' : ''}`}>
          <div className="door left-door">
            <img src={leftDoorImage} alt="Left Door" />
          </div>
          <div className="door right-door">
            <img src={rightDoorImage} alt="Right Door" />
          </div>
        </div>
        <div className="login-box">
          {!isWelcomeVisible ? (
            <div className="login-content">
              <h1 className="home-title">유북</h1>
              <form onSubmit={handleLogin} className="login-form">
                <input
                  type="text"
                  placeholder="아이디"
                  className="input-field"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="비밀번호"
                  className="input-field"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
                <button type="submit" className="login-button">로그인</button>
              </form>
              <div className="links">
                <span onClick={handleFindIDClick}>아이디 찾기</span> |
                <span onClick={handleFindPWClick}>비밀번호 찾기</span> |
                <span onClick={handleSignupClick}>회원가입</span>
              </div>
            </div>
          ) : (
            <div className="welcome-content">
              <img src={chatbotImage} alt="Chatbot" className="welcome-image" />
              <h2 className="welcome-text">유북에 오신걸 환영합니다!</h2>
            </div>
          )}
        </div>

        {/* Popup for finding ID */}
        {isFindIDPopupVisible && (
          <div className="findpopup">
            <h2>아이디 찾기</h2>
            <form onSubmit={handleFindIDSubmit}>
              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">아이디 찾기</button>
                <button type="button" onClick={handleClosePopup}>취소</button>
              </div>
            </form>
          </div>
        )}

        {/* Popup for finding Password */}
        {isFindPWPopupVisible && (
          <div className="findpopup">
            <h2>비밀번호 찾기</h2>
            <form onSubmit={handleFindPWSubmit}>
              <div className="form-group">
                <label>아이디</label>
                <input
                  type="text"
                  value={idForPW}
                  onChange={(e) => setIdForPW(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="text"
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">비밀번호 찾기</button>
                <button type="button" onClick={handleClosePopup}>취소</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;