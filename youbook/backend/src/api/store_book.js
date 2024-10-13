var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment'); // 현재 시간 생성용
require('dotenv').config();


// final_input => book-list / real-book 에 저장하기
router.post('/store', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;
    const input_count = req.body.inputCount;
    const category = req.body.category;
    const title = req.body.title;
    //const date = req.body.createDate;

    // final_input에서 해당 book_id, user_id, input_count에 부합하는 데이터 조회
    const finalInputQuery = `
        SELECT big_title, small_title, content, content_order 
        FROM final_input 
        WHERE book_id = ? AND user_id = ? AND input_count = ?
    `;

    db.query(finalInputQuery, [book_id, user_id, input_count], function (error, finalInputResult) {
        if (error) {
            console.error('Error fetching data from final_input:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (finalInputResult.length === 0) {
            return res.status(404).json({ message: 'No data found in final_input.' });
        }

        // book_list에 데이터 삽입
        const insertBookListQuery = `
            INSERT INTO book_list (book_id, user_id, create_date, image_path, title, category) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const currentDate = moment().format('YYYY-MM-DD'); // 현재 시각 생성

        db.query(insertBookListQuery, [book_id, user_id, currentDate, null, title, category], function (error) {
            if (error) {
                console.error('Error inserting into book_list:', error);
                return res.status(500).json({ message: 'Internal server error' });
            }
            
            // real_book에 데이터 삽입
            const insertRealBookQuery = `
                INSERT INTO real_book (book_id, big_title, small_title, content, content_order) 
                VALUES (?, ?, ?, ?, ?)
            `;

            let errorOccurred = false; // 에러 발생 여부 플래그
            finalInputResult.forEach(function (row, index) {
                db.query(insertRealBookQuery, [book_id, row.big_title, row.small_title, row.content, row.content_order], function (error) {
                    if (error) {
                        errorOccurred = true;
                        console.error('Error inserting into real_book:', error);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    // 모든 데이터가 성공적으로 삽입되었을 때만 응답을 보냄
                    if (index === finalInputResult.length - 1 && !errorOccurred) {
                        res.status(200).json({ message: 'Data successfully stored in book_list and real_book.' });
                    }
                });
            });
        });
    });
});

module.exports = router;
