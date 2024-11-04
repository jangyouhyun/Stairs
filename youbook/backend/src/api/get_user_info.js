const express = require('express');
const router = express.Router();
var db = require('../db.js'); 
const path = require('path');

// 사용자 정보 가져오기
router.get('/get_user_info', (req, res) => {
	const userId = req.session.nickname;
  
	db.query(
	  'SELECT id, name, email, phone_number, birth, gender, image_path FROM user_info WHERE id = ?',
	  [userId],
	  (error, results) => {
		if (error) {
		  return res.status(500).json({ success: false, message: 'Internal server error' });
		}
		if (results.length > 0) {
		  const user = results[0];
		  res.json({
			success: true,
			id: userId, // 사용자 ID 포함
			nickname: user.name,
			email: user.email,
			phone_number: user.phone_number,
			birth: user.birth,
			gender: user.gender,
			imagePath: user.image_path || null
		  });
		} else {
		  res.json({ success: false, message: 'User not found' });
		}
	  }
	);
  });

  router.get('/get-initial-input/:bookId/:userId', function (req, res) {
    const { bookId, userId } = req.params;

    // 데이터베이스에서 bookId와 userId에 맞는, input_count가 최대인 content 조회
    const query = `
        SELECT content 
        FROM init_input 
        WHERE book_id = ? AND user_id = ? 
        ORDER BY input_count DESC 
        LIMIT 1;
    `;

    db.query(query, [bookId, userId], function (error, results) {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
        }

        if (results.length > 0) {
            // 데이터가 존재하면 content 반환
            const initialInput = results[0].content;
            res.json({ success: true, content: initialInput });
        } else {
            // 데이터가 없을 경우
            res.status(404).json({ success: false, message: '해당 초기 입력을 찾을 수 없습니다.' });
        }
    });
});


module.exports = router;
