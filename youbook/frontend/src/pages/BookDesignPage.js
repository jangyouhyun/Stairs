import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import './BookDesignPage.css';
import html2canvas from 'html2canvas';
import textIcon from '../assets/images/text.png';
import imageIcon from '../assets/images/image.png';
import back from '../assets/images/exit.png';

function BookDesignPage({ onClose, onComplete }) {
  const navigate = useNavigate();
  const bookCoverRef = useRef(null);
  const [addImageMenuVisible, setAddImageMenuVisible] = useState(false); // 팝업 상태
  const [ImgSubmenuPosition, setImgSubmenuPosition] = useState({ x: 0, y: 0 });
  const [addTextMenuVisible, setAddTextMenuVisible] = useState(false); // 팝업 상태
  const [TextSubmenuPosition, setTextSubmenuPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [showPopup, setShowPopup] = useState(false); // 팝업 상태
  const [textStyle, setTextStyle] = useState({ fontSize: 16, color: '#000000' }); // 텍스트 스타일
  const [showColorPicker, setShowColorPicker] = useState(false); // 색상 선택 팝업창 표시 여부
  const [bookCoverColor, setBookCoverColor] = useState('#E3CAA5'); // 기본 책 커버 색상
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 150, height: 150 });
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletePopupPosition, setDeletePopupPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  // 책 표지 이미지로 저장하는 함수
  const saveBookCoverAsImage = () => {
    const bookCover = bookCoverRef.current;

    html2canvas(bookCover).then((canvas) => {
      const imageData = canvas.toDataURL('image/png'); // 이미지 데이터를 Base64로 변환

      // 서버로 이미지 전송
      fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }), // Base64 이미지를 서버로 전송
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Image saved successfully:', data);
        })
        .catch((error) => {
          console.error('Error saving image:', error);
        });
    });
    onComplete();
  };

  // 팝업창 열기/닫기 토글 함수
  const toggleColorPalette = () => {
    setShowColorPicker((prev) => !prev);
  };

  // 색상 선택 핸들러
  const handleColorChange = (event) => {
    setBookCoverColor(event.target.value);
  };


  // 버튼 클릭 시 텍스트 추가 함수
  const handleTextClick = () => {
    const newTextElement = {
      id: Date.now(),
      text: "텍스트를 입력하세요", // 기본 텍스트
      x: 50, // 초기 위치 X
      y: 50, // 초기 위치 Y
      fontSize: 16, // 기본 폰트 크기
    };

    setTextElements((prev) => [...prev, newTextElement]); // 새로운 텍스트 추가
  };

  // 텍스트 수정 핸들러
  const handleTextChange = (id, event) => {
    const updatedText = event.target.innerText; // 수정된 텍스트 값
    setTextElements((prev) =>
      prev.map((textElement) =>
        textElement.id === id ? { ...textElement, text: updatedText } : textElement
      )
    );
  };
  // 텍스트 클릭 시 팝업 열기
  const handleTextClickForEditing = (id) => {
    setSelectedTextId(id);
    const selectedText = textElements.find((textElement) => textElement.id === id);
    setTextStyle({ fontSize: selectedText.fontSize, color: selectedText.color });
    setShowPopup(true);
  };

  // 폰트 크기 변경 핸들러
  const handleFontSizeChange = (event) => {
    setTextStyle((prev) => ({ ...prev, fontSize: parseInt(event.target.value, 10) }));
  };

  // 스타일 저장 핸들러
  const handleSaveStyle = () => {
    setTextElements((prev) =>
      prev.map((textElement) =>
        textElement.id === selectedTextId
          ? { ...textElement, fontSize: textStyle.fontSize, color: textStyle.color }
          : textElement
      )
    );
    setShowPopup(false); // 팝업 닫기
  };

  // 이미지 버튼 클릭 시 팝업을 여는 함수
  const handleImageClick = () => {
    setAddImageMenuVisible(true); // 팝업창 열기
    setImgSubmenuPosition({ x: 350, y: 150 }); // 팝업 위치 설정 (임의로 설정)
  };

  // 팝업창 닫기 함수 (Back 버튼 클릭 시)
  const handleImgBackClick = () => {
    setAddImageMenuVisible(false); // 팝업 닫기
  };
  // 이미지 파일 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0]; // 첫 번째 파일 선택
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result); // base64 이미지 데이터 설정
      };
      reader.readAsDataURL(file);
    }
  };
  // 이미지 크기 조정 핸들러
  const handleResize = (id, event, { size }) => {
    setImageSize(size);
  };
 // 이미지 삭제 팝업창 열기
 const handleRightClick = (e) => {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  setDeletePopupPosition({
    x: rect.right + window.scrollX + 10,
    y: rect.bottom + window.scrollY + 10, 
  });
  setShowDeletePopup(true);
};

// 이미지 삭제
const handleDelete = () => {
  setImageSrc(null); // 이미지 삭제
  setShowDeletePopup(false); // 팝업 닫기
};

// 외부 클릭 시 팝업 닫기
const handleClickOutside = (e) => {
  if (imageRef.current && !imageRef.current.contains(e.target)) {
    setShowDeletePopup(false);
  }
};

// 마운트 시 이벤트 리스너 추가, 언마운트 시 제거
useEffect(() => {
  document.addEventListener('click', handleClickOutside);
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, []);

  // 팝업창 닫기 함수 (Back 버튼 클릭 시)
  const handleTextBackClick = () => {
    setAddTextMenuVisible(false); // 팝업 닫기
  };
  return (
    <div className="book-design-page">
      <img src={back} alt="back" className="back-icon" onClick={onClose} />
      {/* 도구 섹션 */}
      <div className={`design-tools`}>
        <div className="tool-button">
          <button className="color-button" onClick={toggleColorPalette} style={{ backgroundColor: bookCoverColor }}></button>
        </div>
        <button className="tool-button" onClick={handleTextClick}>
          <img src={textIcon} alt="Text" />
        </button>
        <button className="tool-button" onClick={handleImageClick}>
          <img src={imageIcon} alt="Image" />
        </button>
      </div>
      {/* 색상 선택 팝업창 */}
        {showColorPicker && (
          <div className="color-palette">
            <label>색상을 선택하세요:</label>
            <input
              type="color"
              value={bookCoverColor}
              onChange={handleColorChange} // 색상 변경 시 호출
            />
          </div>
        )}
      {/* 텍스트 팝업창 */}
      {addTextMenuVisible && (
          <div className="add-popup"
            style={{
              position: 'absolute',
              top: `${TextSubmenuPosition.y}px`,
              left: `${TextSubmenuPosition.x}px`,
            }}>
            <button onClick={handleTextBackClick}>Back</button>
          </div>
        )}
        {/* 텍스트 편집 팝업창 */}
        {showPopup && (
          <div className="text-options-popup">
            <h3>텍스트 옵션</h3>
            <div>
              <label>폰트 크기:</label>
              <input
                type="number"
                value={textStyle.fontSize}
                onChange={handleFontSizeChange}
                min="10"
                max="100"
              />
            </div>
            <div>
              <label>색상 선택:</label>
              <input type="color" value={textStyle.color} onChange={handleColorChange} />
            </div>
            <button onClick={handleSaveStyle}>저장</button>
          </div>
        )}
      {/* 이미지 팝업창 */}
      {addImageMenuVisible && (
          <div className="add-popup"
            style={{
              position: 'absolute',
              top: `${ImgSubmenuPosition.y}px`,
              left: `${ImgSubmenuPosition.x}px`,
            }}>
            <button>AI 추천 받기</button>
            <button onClick={() => fileInputRef.current.click()}>직접 삽입</button>
            {/* 파일 선택 버튼 */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <button onClick={handleImgBackClick}>Back</button>
          </div>
        )}
        
        <div className = "book-container">
        <div className="book-cover"
              ref={bookCoverRef} 
              style={{ backgroundColor: bookCoverColor }}>
            {textElements.map((textElement) => (
              <Draggable
                key={textElement.id}
                defaultPosition={{ x: textElement.x, y: textElement.y }}
                bounds=".book-cover"
              >
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onBlur={(event) => handleTextChange(textElement.id, event)}
                  onClick={() => handleTextClickForEditing(textElement.id)}
                  style={{
                    position: 'absolute',
                    fontSize: `${textElement.fontSize}px`,
                    color: textElement.color,
                    padding: '5px',
                    border: '1px dashed #ccc',
                    cursor: 'move',
                  }}
                >
                  {textElement.text}
                </div>
              </Draggable>
            ))}
          </div>
          {/* 이미지 추가 */}
          {imageSrc && (
            <Draggable bounds=".book-container">
              <Resizable
                width={imageSize.width}
                height={imageSize.height}
                onResize={handleResize}
                minConstraints={[100, 100]}
                maxConstraints={[400, 400]}
              >
                <div
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                    position: 'relative',
                  }}
                  onContextMenu={handleRightClick} // 오른쪽 클릭 시 삭제 팝업 열기
                  ref={imageRef} // 이미지에 대한 참조 설정
                >
                  <img
                    src={imageSrc}
                    alt="Selected"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </Resizable>
            </Draggable>
          )}
      </div>
      {/* 삭제 팝업창 */}
      {showDeletePopup  && (
          <div
            className="popup"
            style={{
              position: 'absolute',
              top: `${popupPosition.y}px`,
              left: `${popupPosition.x}px`,
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              padding: '10px',
              zIndex: 1000,
            }}
          >
            <button onClick={handleDelete}>삭제</button>
          </div>
        )}
      <div className="footer">
        <button className="complete-button"onClick={saveBookCoverAsImage}>완료</button>
      </div>
    </div>
  );
}

export default BookDesignPage;