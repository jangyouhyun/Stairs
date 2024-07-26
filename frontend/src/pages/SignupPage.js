import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/SignupForm.css';
import signupIcon from '../assets/images/signup-icon.png';

function SignupPage() {
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  const handleProfileImageChange = (event) => {
    setProfileImage(URL.createObjectURL(event.target.files[0]));
  };

  const handleCheckButtonClick = () => {
    alert('사용 가능한 아이디입니다!');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/');
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
          <input type="text" placeholder="아이디" className="input-field" />
          <button type="button" className="check-button" onClick={handleCheckButtonClick}>중복확인</button>
        </div>
        <input type="password" placeholder="비밀번호" className="input-field" />
        <span className="password-hint">*숫자, 영문 대문자 포함 8자 이상</span>
        <input type="password" placeholder="비밀번호 확인" className="input-field" />
        <input type="text" placeholder="이름" className="input-field" />
        <div className="gender-container">
          <label>
            <input type="radio" name="gender" value="female" />
            여자
          </label>
          <label>
            <input type="radio" name="gender" value="male" />
            남자
          </label>
        </div>
        <input type="date" placeholder="생년월일" className="input-field" />
        <input type="text" placeholder="휴대폰 번호" className="input-field" />
        <input type="email" placeholder="이메일" className="input-field" />
        <button type="submit" className="submit-button">완료</button>
      </form>
    </div>
  );
}

export default SignupPage;
