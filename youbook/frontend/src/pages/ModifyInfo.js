import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModifyInfo.css';
import signupIcon from '../assets/images/signup-icon.png';
import defaultProfileImage from '../assets/images/signup-icon.png';
import search from '../assets/images/search.png';
import exit from '../assets/images/x.png';
function SignupPage() {
  
const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    pw: '',
    pw2: '',
    username: '',
    email: '',
    phone_num: '',
    birth: '',
    gender: ''
  });
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState(''); // 사용자의 이름을 저장할 상태 변수
  const [profileImagePath, setProfileImagePath] = useState(defaultProfileImage); // 프로필 이미지를 저장할 상태 변수
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    fetch('/api/get_user_info')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUserName(data.nickname); // 닉네임 저장
          setProfileImagePath(data.imagePath || defaultProfileImage); // 프로필 이미지 경로 저장
  
          // 유저 정보를 formData에 저장
          setFormData({
            id: data.id || '',  // 백엔드에서 받은 유저 ID
            pw: '', // 비밀번호는 보안 상 초기값 유지
            pw2: '', // 비밀번호 확인도 초기값 유지
            username: data.nickname || '', // 닉네임 저장
            email: data.email || '', // 이메일 저장
            phone_num: data.phone_number || '', // 전화번호 저장
            birth: data.birth || '', // 생년월일 저장
            gender: data.gender || '' // 성별 저장
          });
        } else {
          console.error(data.message);
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  }, [navigate]);
  
  
  const handleMenuClick = () => {
    setIsSidebarVisible(true);
  };

  const handleExitClick = () => {
    setIsSidebarVisible(false);
  };
  const handleBookClick = () => {
    navigate('/my-autobiography');
  };
  const handleInquiryClick = () => {
    navigate('/inquiry');
  };
  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    setProfileImage(file); // 파일 자체를 상태로 저장
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'pw') {
      validatePassword(value);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    setPasswordError(!passwordRegex.test(password));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (passwordError) {
      alert('비밀번호가 유효하지 않습니다.');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (profileImage) {
      data.append('profileImage', profileImage); // 이미지 파일 추가
    }

    fetch('/auth/register_process', {
      method: 'POST',
      body: data
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        navigate('/');
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
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


  return (
    <div className="signup-container">
        <div className="profile-container">
        <div className="menu" onClick={handleMenuClick}>
          메뉴
        </div>
      </div>

      <aside className={`sidebar ${isSidebarVisible ? 'visible' : ''}`}>
        <img src={exit} alt="Exit" className="exit" onClick={handleExitClick} />
        <img src={profileImagePath} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li onClick={handleBookClick}>나의 자서전 목록</li>
            <li onClick={handleInquiryClick}>문의하기</li>
            <li className="active">개인정보수정</li>
            <li onClick={handleLogout}>로그아웃</li>
          </ul>
        </nav>
      </aside>
      <label htmlFor="profile-image-input">
        <img src={profileImage ? URL.createObjectURL(profileImage) : profileImagePath} alt="Signup Icon" className="signup-icon" />
      </label>
      <input
        type="file"
        id="profile-image-input"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleProfileImageChange}
      />
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="input-group">
        <input 
          type="text" 
          placeholder="아이디"
          name="id" 
          value={formData.id}
          onChange={handleChange}
          className="input-field" 
          disabled // 수정 불가능하게 설정
        />
        </div>
        <input 
          type="password" 
          placeholder="비밀번호" 
          name="pw"
          value={formData.pw}
          onChange={handleChange}
          className={`input-field ${passwordError ? 'error' : ''}`} 
        />
        <span className="password-hint">*숫자, 영문 대문자 포함 8자 이상</span>
        {passwordError && <span className="error-message">비밀번호가 유효하지 않습니다.</span>}
        <input 
          type="password" 
          placeholder="비밀번호 확인" 
          name="pw2"
          value={formData.pw2}
          onChange={handleChange}
          className="input-field" 
        />
        <input 
          type="text" 
          placeholder="이름" 
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="input-field" 
        />
        <div className="gender-container">
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="여성"
              checked={formData.gender === '여성'}
              onChange={handleChange} 
            />
            여자
          </label>
          <label>
            <input 
              type="radio" 
              name="gender" 
              value="남성"
              checked={formData.gender === '남성'}
              onChange={handleChange} 
            />
            남자
          </label>
        </div>
        <input 
          type="date" 
          placeholder="생년월일" 
          name="birth"
          value={formData.birth}
          onChange={handleChange}
          className="input-field" 
        />
        <input 
          type="text" 
          placeholder="휴대폰 번호" 
          name="phone_num"
          value={formData.phone_num} // 올바른 필드 참조
          onChange={handleChange}
          className="input-field" 
        />
        <input 
          type="email" 
          placeholder="이메일" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input-field" 
        />
        <button type="submit" className="submit-button">완료</button>
      </form>
    </div>
  );
}

export default SignupPage;
