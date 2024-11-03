var express = require('express');
var router = express.Router();
var db = require('../db.js');
var moment = require('moment'); // 현재 시간 생성용
require('dotenv').config();

router.post('/semi-save', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;
    const title = req.body.bookTitle ? req.body.bookTitle : "제목없는 자서전";
    const image_path = req.body.coverImg;

    // 현재 시간 생성 (DATETIME 형식)
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // 해당 book_id와 user_id로 기존 데이터가 있는지 확인하는 쿼리
    db.getConnection(function (err, connection) {
        if (err) {
            console.error('DB connection error:', err);
            return res.status(500).json({ status: 500, message: 'DB connection error' });
        }

        // 기존 레코드 조회
        connection.query(
            'SELECT * FROM semisave WHERE book_id = ? AND user_id = ?',
            [book_id, user_id],
            function (error, results) {
                if (error) {
                    connection.release();
                    console.error('Error querying semisave table:', error);
                    return res.status(500).json({ status: 500, message: 'Error querying semisave table' });
                }

                // 기존 레코드가 있는 경우 업데이트, 없는 경우 삽입
                if (results.length > 0) {
                    // 기존 레코드 업데이트
                    connection.query(
                        'UPDATE semisave SET title = ?, image_path = ?, create_date = ? WHERE book_id = ? AND user_id = ?',
                        [title, image_path, currentTime, book_id, user_id],
                        function (updateError) {
                            connection.release();
                            if (updateError) {
                                console.error('Error updating semisave table:', updateError);
                                return res.status(500).json({ status: 500, message: 'Error updating semisave table' });
                            }
                            return res.status(200).json({ status: 200, message: 'Record updated successfully' });
                        }
                    );
                } else {
                    // 새로운 레코드 삽입
                    connection.query(
                        'INSERT INTO semisave (book_id, user_id, title, image_path, create_date) VALUES (?, ?, ?, ?, ?)',
                        [book_id, user_id, title, image_path, currentTime],
                        function (insertError) {
                            connection.release();
                            if (insertError) {
                                console.error('Error inserting into semisave table:', insertError);
                                return res.status(500).json({ status: 500, message: 'Error inserting into semisave table' });
                            }
                            return res.status(201).json({ status: 201, message: 'Record inserted successfully' });
                        }
                    );
                }
            }
        );
    });
});

router.get('/saved-articles', function (req, res) { 
    const user_id = req.session.nickname; // 세션에서 user_id 가져오기

    db.getConnection(function (err, connection) {
        if (err) {
            console.error('DB connection error:', err);
            return res.status(500).json({ status: 500, message: 'DB connection error' });
        }

        // user_id를 기준으로 semisave 테이블에서 데이터 조회
        connection.query(
            'SELECT title, create_date FROM semisave WHERE user_id = ?',
            [user_id],
            function (error, results) {
                connection.release();
                if (error) {
                    console.error('Error querying semisave table:', error);
                    return res.status(500).json({ status: 500, message: 'Error querying semisave table' });
                }

                // 조회된 결과를 원하는 형식으로 변환
                const articles = results.map(row => ({
                    title: row.title,
                    savedAt: moment(row.create_date).format('YYYY/MM/DD HH:mm') // 예쁜 형식으로 변환
                }));

                // 결과 반환
                res.status(200).json({ status: 200, articles: articles });
            }
        );
    });
});

module.exports = router;
