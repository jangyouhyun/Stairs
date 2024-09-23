import React, { useEffect } from 'react';
import './Book.css';
import $ from 'jquery';
import bookmarkIcon from '../assets/images/bookmarkicon.png'; // bookmark 이미지 임포트

function Book() {
  useEffect(() => {
    // 페이지를 추가하는 함수
    const addPage = (page, book) => {
      if (!book.turn('hasPage', page)) {
        const element = $('<div />', {
          'class': 'page ' + ((page % 2 === 0) ? 'odd' : 'even'),
          'id': 'page-' + page
        }).html('<i class="loader"></i>');

        book.turn('addPage', element, page);

        setTimeout(() => {
          element.html('<div class="data">Data for page ' + page + '</div>');
        }, 1000);
      }
    };

    $('#book').turn({
      acceleration: true,
      pages: 1000,
      elevation: 50,
      gradients: !$.isTouch,
      when: {
        turning: (e, page, view) => {
          const range = $(this).turn('range', page);
          for (let p = range[0]; p <= range[1]; p++) {
            addPage(p, $(this));
          }
        },
        turned: (e, page) => {
          $('#page-number').val(page);
        }
      }
    });

    $('#number-pages').html(1000);

    $('#page-number').keydown((e) => {
      if (e.keyCode === 13) {
        $('#book').turn('page', $('#page-number').val());
      }
    });

    $(window).bind('keydown', (e) => {
      if (e.target && e.target.tagName.toLowerCase() !== 'input') {
        if (e.keyCode === 37) {
          $('#book').turn('previous');
        } else if (e.keyCode === 39) {
          $('#book').turn('next');
        }
      }
    });

    return () => {
      $(window).unbind('keydown');
      $('#book').turn('destroy');
    };
  }, []);

  return (
    <div className="book-container">
      <header className="book-header">
        <button className="menu-button">☰</button>
        <button className="profile-button">
          <img src="../assets/images/signup-icon.png" alt="Profile" className="profile-image" />
        </button>
      </header>
      <div id="book" className="book-content">
        <div className="cover"><h1>The Bible</h1></div>
      </div>
      <div id="controls">
        <label htmlFor="page-number">Page:</label> 
        <input type="text" size="3" id="page-number" /> of <span id="number-pages"></span>
      </div>
      <div className="book-footer">
        <button className="nav-button" onClick={() => $('#book').turn('previous')}>←</button>
        <span className="page-number">{/* 페이지 번호 표시 */}</span>
        <button className="nav-button" onClick={() => $('#book').turn('next')}>→</button>
        <button className="action-button">추가하기</button>
        <button className="action-button">완료</button>
      </div>
    </div>
  );
}

export default Book;
