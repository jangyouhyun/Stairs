import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다.' },
  ]);

  const [inputValue, setInputValue] = useState('');
  const { bookId } = useParams();  // URL 파라미터에서 bookId 추출
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

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

        // 종료 키워드가 있는 경우 메시지를 보여주고 종료 처리
        if (data.message === '대화가 종료되었습니다. 감사합니다!') {
          setMessages(prevMessages => [
            ...prevMessages,
            { type: 'bot', text: data.message }
          ]);

          // 여기서 요약 API 호출 및 데이터 처리
          try {
            // 요약된 content를 가져오는 API 호출
            const summaryResponse = await fetch(`/api/chatbot/summary`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookId: bookId,
                inputCount: 1, // 메시지 수를 inputCount로 사용
              }),
            });
            if (!summaryResponse.ok) {
              throw new Error('요약 데이터를 가져오는 데 오류가 발생했습니다.');
            }

            const summaryData = await summaryResponse.json();

            // 요약된 데이터를 들고 book_reading API로 전송
            const writeResponse = await fetch('/api/write_process/book_reading', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: summaryData.content, // 요약된 content 사용
                bookId: data.bookId, // 서버에서 반환된 bookId 사용
              }),
            });
            if (!writeResponse.ok) {
              throw new Error('book 데이터를 처리하는 데 오류가 발생했습니다.');
            }

            // 성공적으로 처리되면 페이지 이동
            navigate('/book-reading');
          } catch (error) {
            console.error('Error:', error);
            setError('book_reading 데이터를 처리하는 중 오류가 발생했습니다.');
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
