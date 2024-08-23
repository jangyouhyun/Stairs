var express = require('express');
var router = express.Router();
var db = require('../db.js');

router.post('/delete_book_list', async function (request, response) {
  const { book_id } = request.body; // request.body에서 book_id를 추출

  if (!book_id) {
    return response.status(400).json({ error: 'book_id is required' });
  }

  try {
    // 데이터베이스에서 book_id에 해당하는 책을 삭제
    const result = await db.query('DELETE FROM book_list WHERE book_id = ?', [book_id]);

    if (result.affectedRows === 0) {
      return response.status(404).json({ error: 'Book not found' });
    }

    response.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    response.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
