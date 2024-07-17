import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

function LoginForm() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/main'); // 메인 페이지로 이동
  };

  return (
    <form className="login-form">
      <input type="text" placeholder="아이디" className="input-field" />
      <input type="password" placeholder="비밀번호" className="input-field" />
      <div className="button-container">
        <button type="button" className="login-button" onClick={handleLoginClick}>로그인</button>
        <button type="button" className="signup-button" onClick={() => navigate('/signup')}>회원가입</button>
      </div>
    </form>
  );
}

export default LoginForm;
