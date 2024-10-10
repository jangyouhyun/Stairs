var express = require('express');
var router = express.Router();
var db = require('../db.js');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// POST /api/print
router.post('/print', function (req, res) {
    // Request body에서 가져오는 정보들을 콘솔에 출력
    console.log("Request Body:", req.body);

    const book_id = req.body.book_id;
    const user_id = req.session.nickname;
    const input_count = req.body.input_count;
    const category = req.body.category;

    console.log("Book ID:", book_id);
    console.log("User ID:", user_id);
    console.log("Input Count:", input_count);
    console.log("Category:", category);

    // purified_input 테이블에서 book_id, user_id, input_count를 기준으로 content를 선택
    db.query(`
        SELECT content FROM purified_input 
        WHERE book_id = ? AND user_id = ? AND input_count = ?
    `, [book_id, user_id, input_count], function (err, purifiedData) {
        if (err) {
            console.error("Error querying purified_input:", err);
            return res.status(500).json({ message: 'An error occurred while querying purified_input' });
        }

        if (!purifiedData || purifiedData.length === 0) {
            console.log("No content found for the given criteria.");
            return res.status(404).json({ message: 'No content found in purified_input for the given criteria.' });
        }

        const content = purifiedData[0].content;

        console.log("Retrieved Content:", content);

        // content를 개행 기준으로 나눕니다.
        const contentArray = content.split('\n').filter(paragraph => paragraph.trim() !== '');

        console.log("Content Array:", contentArray);

        // 문단마다 content_order를 순차적으로 설정하여 final_input 테이블에 삽입
        let queryCount = 0;
        contentArray.forEach((paragraph, i) => {
            const content_order = i + 1;

            db.query(`
                INSERT INTO final_input (user_id, book_id, input_count, big_title, small_title, content, content_order, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, book_id, input_count, null, null, paragraph, content_order, category],
                function (err) {
                    if (err) {
                        console.error("Error inserting into final_input:", err);
                        return res.status(500).json({ message: 'An error occurred while inserting into final_input' });
                    }

                    queryCount++;
                    if (queryCount === contentArray.length) {
                        console.log("Successfully inserted all content into final_input.");
                        res.status(200).json({
                            message: 'Content successfully processed and inserted into final_input table',
                            bookId: book_id,
                            userId: user_id,
                            contentCount: contentArray.length,
                            contentArray // contentArray 반환
                        });
                    }
                });
        });
    });
});

module.exports = router;
