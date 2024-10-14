var express = require('express');
var router = express.Router();
var db = require('../db.js');

router.post('/delete_book_list', function (request, response) {
  const bookIds = request.body.book_id; // request.body.book_id에서 배열 추출

  console.log("북아이디리스트: ", bookIds);
  if (!bookIds || !Array.isArray(bookIds)) {
    return response.status(400).json({ error: 'book_id must be an array' });
  }

  // 데이터베이스에서 book_id에 해당하는 책들 삭제
  db.query('DELETE FROM init_input WHERE book_id IN (?)', [bookIds], function (error, result) {
    if (error) {
      console.error('Error deleting book:', error);
      return response.status(500).json({ error: 'Failed to delete books' });
    }

    if (result.affectedRows === 0) {
      return response.status(404).json({ error: 'No books found to delete' });
    }

    // 삭제 성공 시 응답
    response.status(200).json({ message: 'Books deleted successfully' });
  });
});

module.exports = router;
