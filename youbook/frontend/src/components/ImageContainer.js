import React from 'react';
import './ImageContainer.css';
import book1 from '../assets/images/book1.png';
import book2 from '../assets/images/book2.png';

function ImageContainer() {
  return (
    <div className="image-container">
      <img src={book1} alt="Book 1" className="book-image book-image-1" />
      <img src={book2} alt="Book 2" className="book-image book-image-2" />
    </div>
  );
}

export default ImageContainer;
