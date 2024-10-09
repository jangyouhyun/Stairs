var express = require('express');
var router = express.Router();
var db = require('../db.js');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// POST /book-reading/print
router.post('/print', async function (req, res) {
    try {
        const book_id = req.body.bookId ? req.body.bookId : uuidv4();
        const user_id = req.body.userId ? req.body.userId : req.session.nickname;
        const input_count = req.body.inputCount;
        const category = req.body.category;

        // purified_input 테이블에서 book_id, user_id, input_count를 기준으로 content를 선택
        const [purifiedData] = await db.query(`
            SELECT content FROM purified_input 
            WHERE book_id = ? AND user_id = ? AND input_count = ?
        `, [book_id, user_id, input_count]);

        if (!purifiedData || purifiedData.length === 0) {
            return res.status(404).json({ message: 'No content found in purified_input for the given criteria.' });
        }

        const content = purifiedData.content;

        // content를 개행 기준으로 나눕니다.
        const contentArray = content.split('\n').filter(paragraph => paragraph.trim() !== '');

        // 문단마다 content_order를 순차적으로 설정하여 final_input 테이블에 삽입합니다.
        for (let i = 0; i < contentArray.length; i++) {
            const paragraph = contentArray[i];
            const content_order = i + 1;

            // final_input 테이블에 삽입
            await db.query(`
                INSERT INTO final_input (user_id, book_id, input_count, big_title, small_title, content, content_order, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, book_id, input_count, null, null, paragraph, content_order, category]
            );
        }

        // 성공적으로 삽입되었을 때 응답
        res.status(200).json({
            message: 'Content successfully processed and inserted into final_input table',
            bookId: book_id,
            userId: user_id,
            contentCount: contentArray.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing content' });
    }
});

module.exports = router;
