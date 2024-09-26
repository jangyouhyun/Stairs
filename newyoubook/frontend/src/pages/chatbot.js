import React, { useState, useEffect } from 'react';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다.' },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [userId, setUserId] = useState('USER_ID'); // 실제 사용자 ID로 변경하세요
  const [initialInput, setInitialInput] = useState('나는 대한민국 서울에서 1999년 태어났어...'); // 실제 초기 데이터

  useEffect(() => {
    const initiateChat = async () => {
      try {
        const response = await fetch('api/chatbot/initiate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, initialInput }),
        });

        if (!response.ok) {
          throw new Error('서버에서 초기 질문을 가져오는 데 오류가 발생했습니다.');
        }

        const data = await response.json();
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'bot', text: data.question }
        ]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'bot', text: '초기 질문을 가져오는 중 오류가 발생했습니다.' }
        ]);
      }
    };

    initiateChat();
  }, [userId, initialInput]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      const previousQuestion = messages[messages.length - 1].text;

      setMessages([...messages, { type: 'user', text: inputValue }]);

      try {
        const response = await fetch('/api/chatbot/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, userInput: inputValue, previousQuestion }),
        });

        if (!response.ok) {
          throw new Error('서버에서 질문을 생성하는 데 오류가 발생했습니다.');
        }

        const data = await response.json();

        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'bot', text: data.question }
        ]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'bot', text: '질문 생성 중 오류가 발생했습니다.' }
        ]);
      }

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