var express = require('express');
var router = express.Router();
var db = require('../db.js');
const { v4: uuidv4 } = require('uuid');
var moment = require('moment'); // 현재 시간 생성용
require('dotenv').config(); 

router.post('/store', async function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;
    const input_count = req.body.inputCount;
    const category = req.body.category;

    try {
        // 1. final_input에서 해당 book_id, user_id, input_count에 부합하는 데이터 조회
        const finalInputQuery = `
            SELECT big_title, small_title, content, content_order 
            FROM final_input 
            WHERE book_id = ? AND user_id = ? AND input_count = ? AND category = ?
        `;
        const finalInputResult = await db.query(finalInputQuery, [book_id, user_id, input_count, category]);

        if (finalInputResult.length === 0) {
            return res.status(404).json({ message: 'No data found in final_input.' });
        }

        // 2. book_list에 데이터 삽입
        const insertBookListQuery = `
            INSERT INTO book_list (book_id, user_id, create_date, image_path, title, category) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const currentDate = moment().format('YYYY-MM-DD'); // 현재 시각을 생성
        await db.query(insertBookListQuery, [book_id, user_id, currentDate, null, 'HELLO', category]);

        // 3. real_book에 final_input의 데이터를 삽입
        const insertRealBookQuery = `
            INSERT INTO real_book (book_id, big_title, small_title, content, content_order) 
            VALUES (?, ?, ?, ?, ?)
        `;

        for (const row of finalInputResult) {
            await db.query(insertRealBookQuery, [
                book_id,
                row.big_title,
                row.small_title,
                row.content,
                row.content_order
            ]);
        }

        res.status(200).json({ message: 'Data successfully stored in book_list and real_book.' });
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
