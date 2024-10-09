import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import './BookDesignPage.css';
import search from '../assets/images/search2.png';
import textIcon from '../assets/images/text.png';
import imageIcon from '../assets/images/image.png';
import back from '../assets/images/exit.png';
// ColorPicker 불러오기
import { ColorPicker } from '@easylogic/colorpicker';

function BookDesignPage({ onClose }) {
  const [imageElements, setImageElements] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [fontSize, setFontSize] = useState(20);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showTextOptions, setShowTextOptions] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);

  // 뒤로 가기 네비게이션 핸들러
  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 파일 선택 창 열기
    }
  };

  // 파일 입력 처리 핸들러
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e.target.result); // 이미지 경로 출력
        // 이미지 로직 추가
      };
      reader.readAsDataURL(file);
    }
  };

  // ColorPicker 초기화
  useEffect(() => {
    if (isColorPickerVisible && colorPickerRef.current) {
      const colorPicker = new ColorPicker({
        type: 'sketch', // 스케치 스타일 ColorPicker
        color: selectedColor,
        onChange: (color) => {
          setSelectedColor(color); // 선택된 색상 업데이트
        },
      });

      colorPicker.render({
        target: colorPickerRef.current, // ColorPicker를 렌더링할 타겟 요소 설정
      });
    }
  }, [isColorPickerVisible]);

  // ColorPicker 토글
  const toggleColorPalette = () => {
    setIsColorPickerVisible(!isColorPickerVisible); // ColorPicker 보이기/숨기기
  };

  // 텍스트 추가 핸들러
  const handleTextClick = () => {
    const newTextElement = {
      id: Date.now(),
      text: "텍스트 입력",
      x: 50,
      y: 50,
      fontSize: fontSize, // 기본 폰트 크기
      rotation: 0,
      color: selectedColor, // 선택된 색상으로 텍스트 추가
    };
    setTextElements((prev) => [...prev, newTextElement]);
    setSelectedTextId(newTextElement.id); // 새 텍스트 선택 상태로 설정
    setShowTextOptions(true); // 옵션 팝업 보이기
  };

  // 텍스트 옵션 저장 핸들러
  const handleTextOptionsSave = () => {
    setTextElements((prev) =>
      prev.map((item) =>
        item.id === selectedTextId
          ? { ...item, fontSize, color: selectedColor }
          : item
      )
    );
    setShowTextOptions(false); // 팝업 닫기
  };

  const handleCompleteClick = () => {
    // 완료 후 원하는 페이지로 이동 또는 작업 수행
    navigate('/my-autobiography');  // 자서전 페이지로 이동 예시
  };

  return (
    <div className="book-design-page">
      <img src={back} alt="back" className="back-icon" onClick={onClose} />
      {/* 도구 섹션 */}
      <div className={`design-tools`}>
        <button className="tool-button">
          <img src={search} alt="Search" />
        </button>
        <div className="tool-button">
          <button className="color-button" onClick={toggleColorPalette}></button>
        </div>
        <button className="tool-button" onClick={handleTextClick}>
          <img src={textIcon} alt="Text" />
        </button>
        <button className="tool-button" onClick={handleImageClick}>
          <img src={imageIcon} alt="Image" />
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
      </div>

      {/* 책 커버 및 추가된 텍스트, 이미지 */}
      <div className="book-container">
        <div className="book-cover">
          {imageElements.map((image) => (
            <Draggable key={image.id} bounds=".book-cover">
              <img
                src={image.src}
                alt="Added"
                className="resizable-rotatable-image"
                style={{
                  width: `${image.width}px`,
                  transform: `rotate(${image.rotation}deg)`,
                }}
              />
            </Draggable>
          ))}

          {textElements.map((text) => (
            <Draggable key={text.id} bounds=".book-cover">
              <div
                style={{
                  position: "absolute",
                  fontSize: `${text.fontSize}px`,
                  transform: `rotate(${text.rotation}deg)`,
                  color: text.color,
                  cursor: "move",
                }}
                onClick={() => {
                  setSelectedTextId(text.id);
                  setFontSize(text.fontSize);
                  setSelectedColor(text.color);
                  setShowTextOptions(true); // 옵션 팝업 보이기
                }}
              >
                <input
                  type="text"
                  value={text.text}
                  style={{
                    fontSize: "inherit",
                    border: "none",
                    background: "transparent",
                    textAlign: "center",
                    color: "inherit",
                  }}
                  onChange={(e) => {
                    const updatedText = e.target.value;
                    setTextElements((prev) =>
                      prev.map((item) =>
                        item.id === text.id ? { ...item, text: updatedText } : item
                      )
                    );
                  }}
                />
{/* 파일 선택 input */}
      <input
        type="file"
        ref={fileInputRef} // ref 연결
        onChange={handleImageChange}
        style={{ display: 'none' }} // 숨김 처리
        accept="image/*" // 이미지 파일만 선택
      />
              </div>
            </Draggable>
          ))}
        </div>
      </div>

      {/* 텍스트 크기, 색상 옵션 팝업 */}
      {showTextOptions && (
        <div className="text-options-popup">
          <h3>텍스트 옵션</h3>
          <div>
            <label>크기:</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min="10"
              max="100"
            />
          </div>
          <div ref={colorPickerRef} />
          <button onClick={handleTextOptionsSave}>저장</button>
        </div>
      )}

      <div className="footer">
        <button className="complete-button" onClick={handleCompleteClick}>완료</button>
      </div>
    </div>
  );
}

export default BookDesignPage;