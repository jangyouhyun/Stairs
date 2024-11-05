var express = require('express');
var router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: Book
 *   description: 책 리스트 삭제 API
 */

/**
 * @swagger
 * /delete_book_list:
 *   post:
 *     summary: 다수의 책 ID를 받아서 해당 책들을 삭제
 *     tags: [Book]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 삭제할 책들의 ID 배열
 *     responses:
 *       200:
 *         description: 선택한 책들이 성공적으로 삭제됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *       400:
 *         description: 요청 데이터가 유효하지 않음 (book_id가 배열이 아닌 경우)
 *       404:
 *         description: 삭제할 책을 찾을 수 없음
 *       500:
 *         description: 데이터베이스 오류 또는 서버 오류
 */

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
