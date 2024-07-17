import React from 'react';
import './ImageContainer.css';
import bookImage from '../assets/images/book1.png';

function ImageContainer() {
  return (
    <div className="image-container">
      <img src={bookImage} alt="Book 1" className="book-image" />
    </div>
  );
}

export default ImageContainer;
