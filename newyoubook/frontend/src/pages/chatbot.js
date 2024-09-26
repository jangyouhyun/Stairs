import React, { useState } from 'react';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다.' },
    { type: 'bot', text: '어린시절에 겪은 학업의 어려움에 대해서 조금더 자세히 묘사해주실 수 있나요? (예 : 과목정보)' },
    { type: 'user', text: '초등학교 2학년때 구구단을 외우는데, 너무너무 어려웠어. 그때부터 수학이 어려웠던 것 같아.' },
  ]);

  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { type: 'user', text: inputValue }]);
      setInputValue('');
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="progress-bar">
          <span>인터뷰 진행중 ...</span>
        </div>
      </div>
      <div className="chatbot-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-footer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="답변을 입력하세요 ..."
        />
        <button onClick={handleSend}>전송</button>
      </div>
    </div>
  );
}

export default Chatbot;