import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

function LoginForm() {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = async () => {
    try {
      const response = await fetch('/auth/login_process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, pw: password })
      });
  
      // 응답 상태 코드 확인
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (result.success) {
        navigate('/main');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };
  

  return (
    <form className="login-form" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder="아이디"
        className="input-field"
        name="id"
        onChange={(e) => setId(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        className="input-field"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="button-container">
        <button type="button" className="login-button" onClick={handleLoginClick}>로그인</button>
        <button type="button" className="signup-button" onClick={() => navigate('/signup')}>회원가입</button>
      </div>
    </form>
  );
}

export default LoginForm;
