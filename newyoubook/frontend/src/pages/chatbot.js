import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import $ from 'jquery';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다.' },
  ]);

  const [inputValue, setInputValue] = useState('');
  const { bookId } = useParams();  // URL 파라미터에서 bookId 추출
  const [initialInput, setInitialInput] = useState(''); // 실제 초기 데이터
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/get_user_info'); // 서버로부터 유저 정보를 가져옴
        if (!response.ok) {
          throw new Error('사용자 정보를 가져오는 중 오류가 발생했습니다.');
        }
        const data = await response.json();
        if (data.success) {
          return data.id; // 사용자 ID 반환
        } else {
          throw new Error('사용자 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        return null; // 오류 시 null 반환
      }
    };
  
    const fetchInitialInput = async (userId) => {
      try {
        const response = await fetch(`/api/get-initial-input/${bookId}/${userId}`);
        if (!response.ok) {
          throw new Error('초기 입력을 불러오는 중 오류가 발생했습니다.');
        }
        const data = await response.json();
        return data.content;  // 서버에서 가져온 초기 content 값
      } catch (error) {
        console.error('Error fetching initial input:', error);
        return '';  // 오류 발생 시 기본 값
      }
    };
  
    const initiateChat = async () => {
      setIsLoading(true); // 로딩 상태 시작
      try {
        const userId = await fetchUserInfo(); // 사용자 ID를 가져옴
        if (!userId) {
          throw new Error('사용자 정보를 가져오는 중 오류가 발생했습니다.');
        }
        const initialInputContent = await fetchInitialInput(userId); // 초기 입력 값을 가져옴
        const response = await fetch(`/api/chatbot/initiate/${bookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initialInput: initialInputContent }),
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
  }, [bookId]);
  
  

  // 사용자가 답변을 제출할 때 처리하는 함수
  const handleSend = async () => {
    if (inputValue.trim()) {
      const previousQuestion = messages[messages.length - 1].text;
      setMessages([...messages, { type: 'user', text: inputValue }]);
      setIsLoading(true); // 로딩 상태 시작
      try {
        const response = await fetch(`/api/chatbot/ask/${bookId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: inputValue, previousQuestion }),
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
