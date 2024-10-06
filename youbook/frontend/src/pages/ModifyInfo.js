import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/SignupForm.css';
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
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      //body: JSON.stringify(formData),
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

  const checkIdAvailability = async () => {
    if (!formData.id) {
      alert('아이디를 입력하세요');
      return;
    }
    try {
      const response = await fetch('/auth/check_id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: formData.id })
      });

      const data = await response.json();
      alert(data.message);
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
        <img src={defaultProfileImage} alt="Profile" className="profile-image2" />
        <div className="profile-name">{userName}</div>
        <nav className="sidebar-nav">
          <ul>
            <li onClick={handleBookClick}>나의 자서전 목록</li>
            <li onClick={handleInquiryClick}>문의하기</li>
            <li className="active">개인정보수정</li>
            <li onClick={handleHomeClick}>로그아웃</li>
          </ul>
        </nav>
      </aside>
      <label htmlFor="profile-image-input">
        <img src={profileImage ? URL.createObjectURL(profileImage) : signupIcon} alt="Signup Icon" className="signup-icon" />
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
          />
          <button type="button" className="check-button" onClick={checkIdAvailability}>중복확인</button>
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
          value={formData.phone_num}
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
