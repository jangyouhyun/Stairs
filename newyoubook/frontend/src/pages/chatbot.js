import React, { useState, useEffect } from 'react';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다.' },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [userId, setUserId] = useState('USER_ID'); // 실제 사용자 ID로 변경하세요
  const [initialInput, setInitialInput] = useState('나는 대한민국 서울에서 1999년 태어났어...'); // 실제 초기 데이터
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가

  // 서버와 초기 대화를 시작하는 함수
  useEffect(() => {
    const initiateChat = async () => {
      setIsLoading(true); // 로딩 상태 시작
      try {
        const response = await fetch('/api/chatbot/initiate', {
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
      } finally {
        setIsLoading(false); // 로딩 상태 종료
      }
    };
    initiateChat();
  }, [userId, initialInput]);

  // 사용자가 답변을 제출할 때 처리하는 함수
  const handleSend = async () => {
    if (inputValue.trim()) {
      const previousQuestion = messages[messages.length - 1].text;
      setMessages([...messages, { type: 'user', text: inputValue }]);
      setIsLoading(true); // 로딩 상태 시작
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
        setError('질문 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'bot', text: '질문 생성 중 오류가 발생했습니다.' }
        ]);
      } finally {
        setIsLoading(false); // 로딩 상태 종료
      }

      setInputValue(''); // 입력 필드를 비움
    }
  };

  // Enter 키를 눌렀을 때도 메시지를 전송할 수 있도록
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
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
        {isLoading && <div className="loading-indicator">로딩 중...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      <div className="chatbot-footer">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress} // Enter 키 이벤트
          placeholder="답변을 입력하세요 ..."
          disabled={isLoading} // 로딩 중에는 입력 불가
        />
        <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>전송</button> {/* 로딩 중이거나 빈 입력일 때 버튼 비활성화 */}
      </div>
    </div>
  );
}

export default Chatbot;
