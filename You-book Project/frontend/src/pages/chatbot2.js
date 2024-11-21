import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './chatbot.css';
import chatbotImage from '../assets/images/chatbot1.png';
import back from '../assets/images/exit.png';
import BooksIcon from '../assets/images/books.gif';


function Chatbot({ onClose, bookId, selectedCategory, selectedIndex }) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '안녕하세요! 유북 챗봇입니다. 작성해주신 내용을 바탕으로 몇 가지 질문드리겠습니다. 대화를 마치고 싶다면 종료라고 말씀해주세요!' },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const [error, setError] = useState(null); // 에러 상태 추가
  const [isConversationEnded, setIsConversationEnded] = useState(false); // 대화 종료 상태 추가
  const [isFinalLoading, setIsFinalLoading] = useState(false);
  const navigate = useNavigate(); // 페이지 이동을 위한 hook
  const location = useLocation();
  const messagesEndRef = useRef(null); // 스크롤을 제어할 참조 추가
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [inputCount, setInputCount] = useState(1);

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

  // 새로운 메시지가 추가될 때 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom(); // 메시지가 업데이트될 때 스크롤을 자동으로 이동
  }, [messages]);

  // 사용자가 답변을 제출할 때 처리하는 함수
  const handleSend = async () => {
    if (inputValue.trim() && !isConversationEnded) { // 종료 상태에서 handleSend 실행 막기
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

        // 대화 종료 메시지를 받으면 종료 상태로 설정
        if (data.message === '대화가 종료되었습니다. 감사합니다!') {
          setMessages(prevMessages => [
            ...prevMessages,
            { type: 'bot', text: data.message }
          ]);

          setIsConversationEnded(true); // 종료 상태 설정
          setIsCreatingBook(true);  // 로딩 팝업 표시

          // 요약 및 자서전 생성 로직 호출
          try {
            const summaryResponse = await fetch(`/api/chatbot/summary2`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookId: bookId
              }),
            });
            if (!summaryResponse.ok) {
              throw new Error('요약 데이터를 가져오는 데 오류가 발생했습니다.');
            }

            const summaryData = await summaryResponse.json();

            // 요약된 데이터가 빈 문자열일 경우 경고 메시지와 리디렉션
            if (!summaryData.content || summaryData.content.trim() === '') {
              alert("자서전을 생성하기에 내용이 너무 적습니다! 다시 생성해주세요");
              navigate('/main2');
              window.location.reload(); // 페이지 새로고침
              return;
            }

            // 요약된 데이터를 book_reading API로 전송
            const writeResponse = await fetch('/api/write_process/book_reading2', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                content: summaryData.content,
                bookId: data.bookId,
                isChatbot: true,
                isChatbotPurified: true
              }),
            });
            if (!writeResponse.ok) {
              throw new Error('book 데이터를 처리하는 데 오류가 발생했습니다.');
            }

            // book_reading2 API 응답에서 inputCount 값을 받아서 설정
            const writeData = await writeResponse.json();
            if (writeData.inputCount !== undefined) {
              setInputCount(writeData.inputCount);
            }

          } catch (error) {
            console.error('Error:', error);
            setError('book_reading 데이터를 처리하는 중 오류가 발생했습니다.');
          } finally {
            setIsFinalLoading(true);
            setIsCreatingBook(false);  // 로딩 팝업 숨기기
          }

          return; // 종료 후 handleSend 이후 로직 실행 중지
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
        setInputValue('');
      }
    }
  };

  // 대화 종료 후 '자서전 만들기' 및 '내용 새로 추가' 처리 함수
  const handleCreateBook = () => {
    setIsCreatingBook(true);
    navigate(`/book-reading/${bookId}`, { state: { selectedCategory: selectedCategory, selectedIndex: selectedIndex, input_count : inputCount} }); // 자서전 페이지로 이동
    setIsCreatingBook(false);
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

  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prevCount) => (prevCount % 3) + 1); // 1에서 3까지 순환
    }, 500); // 0.5초마다 dotCount 변경

    // 컴포넌트가 언마운트될 때 interval 정리
    return () => clearInterval(interval);
  }, []);

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
              {msg.text === '대화가 종료되었습니다. 감사합니다!' && isFinalLoading && (
                <div className="conversation-end-buttons">
                  <button onClick={handleCreateBook}>대화 내용 바탕으로 자서전 만들기</button>
                  <button onClick={handleAddContent}>자서전 내용 새로 추가하기</button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div> {/* 스크롤을 이동시키기 위한 참조 */}
        {(isLoading) && <div className="loading-indicator">로딩 중{'.'.repeat(dotCount)}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
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
      {/* 자서전 생성 중일 때만 로딩 팝업 표시 */}
      {isCreatingBook && (
        <div className="loading-popup" id="firstmake">
          <img src={BooksIcon} alt="Loading" className="loading-icon" />
          <div className="loading-text">자서전이 만들어지고 있습니다...</div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;