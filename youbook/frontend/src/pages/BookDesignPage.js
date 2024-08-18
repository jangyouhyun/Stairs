import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import './BookDesignPage.css';
import bookCoverImage from '../assets/images/book-cover.png';
import backArrowIcon from '../assets/images/arrow-back.png';
import searchIcon from '../assets/images/search.png';
import colorIcon from '../assets/images/color.png';
import textIcon from '../assets/images/text.png';
import imageIcon from '../assets/images/image.png';

function BookDesignPage() {
  const [imageElements, setImageElements] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [isToolsHidden, setIsToolsHidden] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동 처리
  const fileInputRef = useRef(null);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  const handleRotate = (id, deltaY) => {
    setImageElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, rotation: el.rotation + deltaY * 0.2 } : el
      )
    );
  };

  const handleResize = (id, deltaY) => {
    setImageElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id
          ? { ...el, width: Math.max(20, el.width + deltaY * -0.5) }
          : el
      )
    );
  };

  const handleTextClick = () => {
    const newTextElement = {
      id: Date.now(),
      text: "Enter text",
      x: 50,
      y: 50,
      fontSize: 20,
      rotation: 0,
    };
    setTextElements((prev) => [...prev, newTextElement]);
  };

  const handleTextChange = (id, newText) => {
    setTextElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, text: newText } : el
      )
    );
  };

  const handleTextResize = (id, deltaY) => {
    setTextElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id
          ? { ...el, fontSize: Math.max(10, el.fontSize + deltaY * -0.2) }
          : el
      )
    );
  };

  const handleTextRotate = (id, deltaY) => {
    setTextElements((prevElements) =>
      prevElements.map((el) =>
        el.id === id ? { ...el, rotation: el.rotation + deltaY * 0.2 } : el
      )
    );
  };

  const toggleTools = () => {
    setIsToolsHidden(!isToolsHidden);
  };

  const handleCompleteClick = () => {
    navigate('/my-autobiography'); // Complete 버튼 클릭 시 페이지 이동
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
              onWheel={(event) => {
                if (event.shiftKey) {
                  handleRotate(image.id, event.deltaY);
                } else {
                  handleResize(image.id, event.deltaY);
                }
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
                cursor: "move",
              }}
              onWheel={(event) => {
                if (event.shiftKey) {
                  handleTextRotate(text.id, event.deltaY);
                } else {
                  handleTextResize(text.id, event.deltaY);
                }
              }}
            >
              <input
                type="text"
                value={text.text}
                onChange={(e) => handleTextChange(text.id, e.target.value)}
                style={{
                  fontSize: "inherit",
                  border: "none",
                  background: "transparent",
                  textAlign: "center",
                }}
              />
            </div>
          </Draggable>
        ))}
      </div>

      <div className={`design-tools ${isToolsHidden ? 'hidden' : ''}`} onClick={toggleTools}>
        <button className="tool-button">
          <img src={searchIcon} alt="Search" />
        </button>
        <button className="tool-button">
          <img src={colorIcon} alt="Color" />
        </button>
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
