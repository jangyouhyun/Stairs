import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/SignupForm.css';
import signupIcon from '../assets/images/signup-icon.png';

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

  const handleProfileImageChange = (event) => {
    setProfileImage(URL.createObjectURL(event.target.files[0]));
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

    fetch('/auth/register_process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
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
      <label htmlFor="profile-image-input">
        <img src={profileImage || signupIcon} alt="Signup Icon" className="signup-icon" />
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
