import React, { useState, useEffect } from 'react';
import './CustomerInquiryPage.css';

const CustomerInquiryPage = () => {
    
  const [formData, setFormData] = useState({
    category: '배송문의',
    subject: '',
    email: '',
    message: '',
    privacyAgree: false,
    visibility: 'public',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('문의가 제출되었습니다.');
    // 실제 데이터 전송 처리 추가
  };
  
  return (
    <div className = "inquiry-page">
      <div className="inquiry-container">
      <h1>ASK</h1>
      <p>
        문의하신 내용에 대한 답변은 이메일 혹은 ACCOUNT 페이지의 내 게시물에서 확인해주세요.
      </p>
      <form className="inquiry-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="subject">제목</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">문의 내용</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <div className="group">
          <label>비공개 </label>
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={formData.visibility === 'private'}
            onChange={handleInputChange}
          />
          <label>공개 </label>
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={formData.visibility === 'public'}
            onChange={handleInputChange}
          />
        </div>

        <div className="group">
          <label>개인정보 수집 동의 개인정보 처리방침에 동의합니다.</label>
          <input
            type="checkbox"
            id="privacyAgree"
            name="privacyAgree"
            checked={formData.privacyAgree}
            onChange={handleCheckboxChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">등록</button>
      </form>
    </div>
    </div>
  );
}

export default CustomerInquiryPage;