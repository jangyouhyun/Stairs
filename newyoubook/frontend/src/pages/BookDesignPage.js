import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import './BookDesignPage.css';
import bookCoverImage from '../assets/images/book-cover.png';
import backArrowIcon from '../assets/images/arrow-back.png';
import searchIcon from '../assets/images/search.png';
import textIcon from '../assets/images/text.png';
import imageIcon from '../assets/images/image.png';

// ColorPicker 불러오기
import { ColorPicker } from '@easylogic/colorpicker';

function BookDesignPage() {
  const [imageElements, setImageElements] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [isToolsHidden, setIsToolsHidden] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false); // ColorPicker visibility
  const [selectedColor, setSelectedColor] = useState("#000000");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null); // Reference for the ColorPicker container

  // 뒤로 가기 네비게이션 핸들러
  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  // 이미지 추가 핸들러
  const handleImageClick = () => {
    fileInputRef.current.click(); // 파일 선택 창 열기
  };

  // 이미지 파일 처리
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImageElement = {
          id: Date.now(),
          src: e.target.result,
          width: 100,
          rotation: 0,
        };
        setImageElements((prev) => [...prev, newImageElement]);
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
      fontSize: 20,
      rotation: 0,
      color: selectedColor, // 선택된 색상으로 텍스트 추가
    };
    setTextElements((prev) => [...prev, newTextElement]);
  };

  // 작업 완료 버튼 클릭 시
  const handleCompleteClick = () => {
    navigate('/my-autobiography'); // 자서전 페이지로 이동
  };

  return (
    <div className="book-design-page">
      <header className="book-design-header">
        <button className="back-button" onClick={handleBackClick}>
          <img src={backArrowIcon} alt="Back" />
        </button>
      </header>

      <div className={`book-container ${isToolsHidden ? 'expanded' : ''}`}>
        <img src={bookCoverImage} alt="Book Cover" className="book-cover" />
        {imageElements.map((image) => (
          <Draggable key={image.id}>
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
          <Draggable key={text.id}>
            <div
              style={{
                position: "absolute",
                fontSize: `${text.fontSize}px`,
                transform: `rotate(${text.rotation}deg)`,
                color: text.color,
                cursor: "move",
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
              />
            </div>
          </Draggable>
        ))}
      </div>

      {/* 도구 섹션 */}
      <div className={`design-tools`} >
        <button className="tool-button">
          <img src={searchIcon} alt="Search" />
        </button>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            className="tool-button color-button" 
            onClick={toggleColorPalette} 
            style={{ backgroundColor: selectedColor }}
          ></button>
          {isColorPickerVisible && (
            <div id="color-picker" ref={colorPickerRef} className="color-picker-popup"></div>
          )}
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

      <div className="footer">
        <button className="complete-button" onClick={handleCompleteClick}>완료</button>
      </div>
    </div>
  );
}

export default BookDesignPage;