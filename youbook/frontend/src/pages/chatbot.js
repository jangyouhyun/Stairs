import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // useNavigate로 수정
import './chatbot.css';
import chatbotImage from '../assets/images/chatbot1.png';
import back from '../assets/images/exit.png';

function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 유북 챗봇입니다. 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다. 대화를 마치고 싶다면 종료라고 말씀해주세요!' },
  ]);

  const [inputValue, setInputValue] = useState('');
  const { bookId } = useParams(); // URL 파라미터에서 bookId 추출
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가
  const [isConversationEnded, setIsConversationEnded] = useState(false); // 대화 종료 상태 추가
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate

  // API 호출 로직 (유저 정보 및 초기 질문 가져오기)
  useEffect(() => {
    // 생략된 API 호출 코드
  }, [bookId]);

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

        // 종료 메시지 처리
        if (inputValue.toLowerCase() === '종료') {
          setMessages(prevMessages => [
            ...prevMessages,
            { type: 'bot', text: '대화가 종료되었습니다. 감사합니다!' }
          ]);

          // 종료 상태 설정
          setIsConversationEnded(true);

          // 자서전 저장 API 호출
          try {
            const writeResponse = await fetch('/api/write_process/book_reading', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: "", // 내용을 비우거나 필요에 따라 조정
                bookId: bookId,
              }),
            });
            if (!writeResponse.ok) {
              throw new Error('book 데이터를 처리하는 데 오류가 발생했습니다.');
            }

            // 성공적으로 처리되면 페이지 이동
            navigate(`/book-reading/${bookId}`);
          } catch (error) {
            console.error('Error:', error);
            setError('book_reading 데이터를 처리하는 중 오류가 발생했습니다.');
          } finally {
            setIsLoading(false); // 로딩 상태 종료
          }

          return;  // 종료 시 이후 로직을 실행하지 않음
        }

        // 새로운 질문을 받았을 때
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
    }
  };

  // 대화 종료 후 '자서전 만들기' 및 '내용 새로 추가' 처리 함수
  const handleCreateBook = () => {
    navigate(`/book-reading/${bookId}`); // 자서전 페이지로 이동
  };

  const handleAddContent = () => {
    navigate(`/main/${bookId}`); // 자서전 내용 추가 페이지로 이동
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
        <img src={back} alt="back" className="back-icon" onClick={onClose} />
        <div className="progress-bar"></div>
      </div>
      <div className="chatbot-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.type}`}>
            {msg.type === 'bot' && (
              <img src={chatbotImage} alt="Chatbot" className="chatbot-profile" />
            )}
            <div className={`message ${msg.type}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="loading-indicator">로딩 중...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
      {/* 대화 종료 시 버튼을 표시 */}
      {isConversationEnded && (
        <div className="conversation-end-buttons">
          <button onClick={handleCreateBook}>대화 내용 바탕으로 자서전 만들기</button>
          <button onClick={handleAddContent}>자서전 내용 새로 추가하기</button>
        </div>
      )}
      {!isConversationEnded && (
        <div className="chatbot-footer">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress} // Enter 키 이벤트
            placeholder="답변을 입력하세요 ..."
            disabled={isLoading} // 로딩 중에는 입력 불가
          />
          <button onClick={handleSend} disabled={isLoading || !inputValue.trim()}>
            전송
          </button>
        </div>
      )}
    </div>
  );
}

export default Chatbot;