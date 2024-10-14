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
  const [resizeColor, setResizeColor] = useState('#000');
  const [images, setImages] = useState([]);
  const imageRef = useRef(null);
  const [showResizeInput, setShowResizeInput] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [resizeEnabled, setResizeEnabled] = useState(false); // 크기 조정 활성화 상태
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 열림 상태 관리
  const [imageRequest, setImageRequest] = useState(''); // 입력받은 이미지 요청 데이터
  const [showResizePopup, setShowResizePopup] = useState(false);
  const handleCreateImage = () => {
    console.log('Requested image:', imageRequest);
  };
  const ImageAIAdd = () => {
    setIsPopupOpen(true);
    setAddTextMenuVisible(false);
  };
  // 이미지 크기 조정 핸들러
  const handleResize = (id, newSize) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, width: newSize.width, height: newSize.height } : img
      )
    );
  };
//외부 클릭시 팝업 닫힘
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.popup')) {
        setShowDeletePopup(false);
      }
      if (!event.target.closest('.add-popup')) {
        setShowResizePopup(false);
      }
      if (!event.target.closest('.dalle-popup-content')) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // 책 표지 이미지로 저장하는 함수
const saveBookCoverAsImage = () => {
  const bookCover = bookCoverRef.current;

  const width = bookCover.offsetWidth;
  const height = bookCover.offsetHeight;

  // html2canvas로 book-cover 요소 캡처
  html2canvas(bookCover, {
    useCORS: true, // 외부 이미지를 사용할 경우 CORS 설정
    allowTaint: false, // 외부 리소스 허용 설정
    logging: true, // 디버깅을 위한 로그 출력
    scale: 2, // 해상도 향상을 위해 배율 설정
  })
    .then((canvas) => {
      const imageData = canvas.toDataURL("image/png"); // 이미지 데이터를 Base64로 변환
      onComplete(imageData); // 이미지 URL을 onComplete 콜백으로 전달
    })
    .catch((error) => {
      console.error("Error capturing the book cover:", error);
    });
};
  // 팝업창 열기/닫기 토글 함수
  const toggleColorPalette = () => {
    setShowColorPicker((prev) => !prev);
  };

  // 색상 선택 핸들러
  const handleColorChange = (event) => {
    setBookCoverColor(event.target.value);
  };

  // 텍스트 색상 선택 핸들러
  const handleColorChange2 = (event) => {
    setTextStyle((prev) => ({ ...prev, color: event.target.value })); // 텍스트 색상 설정
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
    setShowResizePopup(false);
    setImgSubmenuPosition({ x: 350, y: 150 }); // 팝업 위치 설정 (임의로 설정)
  };

  // 팝업창 닫기 함수 (Back 버튼 클릭 시)
  const handleImgBackClick = () => {
    setAddImageMenuVisible(false); // 팝업 닫기
  };
  // 이미지 파일 업로드 핸들러
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          id: Date.now(),
          src: reader.result,
          x: 50,
          y: 50,
          width: 150,
          height: 150,
        };
        setImages((prevImages) => [...prevImages, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };
// 이미지 드래그 후 위치 업데이트
const handleDragStop = (id, e, data) => {
  const bookCoverRect = bookCoverRef.current.getBoundingClientRect();
  const { x, y } = data;

  // book-cover의 좌표를 기준으로 이미지 좌표 조정
  const adjustedX = x - bookCoverRect.left; // book-cover의 left 값을 빼줌
  const adjustedY = y - bookCoverRect.top;  // book-cover의 top 값을 빼줌

  setImages((prevImages) =>
    prevImages.map((img) =>
      img.id === id ? { ...img, x: adjustedX, y: adjustedY } : img
    )
  );
};

// 이미지 클릭 시 크기 조정 팝업 표시
const handleImageClickForEditing = (id) => {
  const selectedImage = images.find((img) => img.id === id);
  if (selectedImage) {
    setSelectedImageId(id); // 선택된 이미지 ID 저장
    setImageSize({ width: selectedImage.width, height: selectedImage.height }); // 선택된 이미지 크기 저장
    setShowResizePopup(true); // 크기 조절 팝업 표시
  }
};

// 이미지 크기 조정 핸들러 (입력 필드에서 수동으로 크기 조정)
const handleWidthChange = (e) => {
  setImageSize((prevSize) => ({
    ...prevSize,
    width: parseInt(e.target.value, 10),
  }));
  updateImageSize(selectedImageId, { width: parseInt(e.target.value, 10) });
};

const handleHeightChange = (e) => {
  setImageSize((prevSize) => ({
    ...prevSize,
    height: parseInt(e.target.value, 10),
  }));
  updateImageSize(selectedImageId, { height: parseInt(e.target.value, 10) });
};

// 선택된 이미지의 크기를 업데이트
const updateImageSize = (id, newSize) => {
  setImages((prevImages) =>
    prevImages.map((img) =>
      img.id === id ? { ...img, ...newSize } : img
    )
  );
};

// 오른쪽 클릭 시 삭제 팝업 표시
const handleRightClick = (e, id) => {
  e.preventDefault(); // 기본 오른쪽 클릭 동작 막기
  //setSelectedImageId(id); // 선택된 이미지 ID 저장
  setPopupPosition({ x: e.pageX, y: e.pageY }); // 팝업 위치 설정
  setShowDeletePopup(true); // 삭제 팝업 표시
  setShowResizeInput(false); // 크기 조절 입력창 닫기
  setShowDeletePopup(true);
};


  // 이미지 삭제 핸들러
  const handleDelete = () => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== selectedImageId));
    setShowDeletePopup(false);
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
            <label>색상을 선택하세요</label>
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
              position: 'relative',
              top: `${TextSubmenuPosition.y}px`,
              left: `${TextSubmenuPosition.x}px`,
            }}>
            <button onClick={handleTextBackClick}>Back</button>
          </div>
        )}
        {/* 텍스트 편집 팝업창 */}
        {showPopup && (
          <div className="text-options-popup"
          style={{
            position: 'absolute',
            top: `${TextSubmenuPosition.y+130}px`,
            left: `${TextSubmenuPosition.x+400}px`,
            }}>
            <h3>텍스트 옵션</h3>
            <div>
              <label>폰트 크기 </label>
              <input
                type="number"
                value={textStyle.fontSize}
                onChange={handleFontSizeChange}
                min="10"
                max="100"
              />
            </div>
            <div>
              <label>색상 선택 </label>
              <input type="color" value={textStyle.color} onChange={handleColorChange2} />
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
              left: `${ImgSubmenuPosition.x+100}px`,
            }}>
            <button onClick = {ImageAIAdd} >AI 추천 받기</button>
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
        
        
        <div className="book-cover"
              ref={bookCoverRef} 
              style={{ backgroundColor: bookCoverColor }}>
            {textElements.map((textElement) => (
              <Draggable
                key={textElement.id}
                defaultPosition={{ x: textElement.x, y: textElement.y }}
                bounds="parent"
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
                    cursor: 'move',
                  }}
                >
                  {textElement.text}
                </div>
              </Draggable>
            ))}
          
          {/* 이미지 추가 */}
          {images.map((image) => (
          <Draggable 
                  key={image.id} 
                  bounds= 'parent'
                  defaultPosition={{ x: image.x, y: image.y }}
                  onStop={(e, data) => handleDragStop(image.id, e, data)}
                  >
          <Resizable
            width={image.width}
            height={image.height}
            onResize={(event, data) => handleResize(image.id, event, data)}
            minConstraints={[50, 50]}
            maxConstraints={[600, 600]}
          >
            <div
              onClick={() => handleImageClickForEditing(image.id)} // 왼쪽 클릭 이벤트로 크기 조정 팝업 표시
              onContextMenu={(e) => handleRightClick(e, image.id)} // 오른쪽 클릭 이벤트로 삭제 팝업 표시
              style={{
                width: image.width,
                height: image.height,
                position: 'relative',
              }}
            >
              <img
                src={image.src}
                alt={`Image-${image.id}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                crossorigin="anonymous"
              />
            </div>
          </Resizable>
        </Draggable>
        ))}
        </div>
      {/*이미지 크기 입력창*/}
      {showResizePopup && selectedImageId &&(
        <div className = "popup"
        style={{
          position: 'absolute',
          top: `${popupPosition.y}px`,
          left: `${popupPosition.x-300}px`,
        }}>
          {/* 이미지 크기 입력 필드 */}
          {images.find((img) => img.id === selectedImageId) && (
            <div className="image-size-controls">
              <label>
                가로 크기:
                <input
                  type="number"
                  value={imageSize.width}
                  onChange={handleWidthChange}
                  min="50"
                  max="600"
                />
              </label>
              <label>
                세로 크기:
                <input
                  type="number"
                  value={imageSize.height}
                  onChange={handleHeightChange}
                  min="50"
                  max="600"
                />
              </label>
            </div>
          )}
        </div>
      )}
      {/* 삭제 팝업창 */}
      {showDeletePopup  && (
          <div
            className="popup"
            style={{
              position: 'absolute',
              top: `${popupPosition.y-50}px`,
              left: `${popupPosition.x-300}px`,
              width : '80px',
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <button onClick={handleDelete}>삭제</button>
          </div>
      )}
      {/* 달리 팝업 창 */}
      {isPopupOpen && (
          <div className="dalle-popup">
            <div className="dalle-popup-content">
              <p>원하는 이미지를 알려주세요!</p>
              <textarea
                className = "dalle-text"
                value={imageRequest}
                onChange={(e) => setImageRequest(e.target.value)}
                placeholder="이미지 설명을 입력하세요"
              />
              <button onClick={handleCreateImage} className = "dalle-button">만들기</button>
            </div>
          </div>
        )}
      <div className="footer">
        <button className="complete-button"onClick={saveBookCoverAsImage}>완료</button>
      </div>
    </div>
  );
}
export default BookDesignPage;