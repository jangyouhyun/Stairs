var express = require('express');
var router = express.Router();
var db = require('../db.js');

// 문단 삭제 또는 업데이트 API
router.post('/delete_content', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;  // 세션에서 사용자 아이디 가져옴
    const input_count = req.body.inputCount;
    const content_order = req.body.content_order;   // 처리할 레코드의 content_order
    const whatToChange = req.body.whatToChange;

    // 필수 값들이 있는지 확인
    if (!book_id || !user_id || !input_count || !content_order || !whatToChange) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // 데이터베이스 트랜잭션을 시작하여 모든 작업을 처리
    db.getConnection(function (err, connection) {
        if (err) {
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.beginTransaction(function (err) {
            if (err) {
                connection.release();
                return res.status(500).json({ error: 'Failed to start transaction' });
            }

            // whatToChange 값에 따라 처리
            let query;
            let queryParams;

            if (whatToChange == 1) {
                // whatToChange == 1: title 컬럼을 NULL로 업데이트
                query = `
                    UPDATE final_input
                    SET big_title = NULL
                    WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
                `;
                queryParams = [user_id, book_id, input_count, content_order];
            } else if (whatToChange == 2) {
                // whatToChange == 2: subtitle 컬럼을 NULL로 업데이트
                query = `
                    UPDATE final_input
                    SET small_title = NULL
                    WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
                `;
                queryParams = [user_id, book_id, input_count, content_order];
            } else if (whatToChange == 3) {
                // whatToChange == 3: 마지막 문단인지 확인 후 삭제 및 content_order 업데이트
                const checkSecondParagraphQuery = `
                    SELECT * FROM final_input WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = 2
                `;

                connection.query(checkSecondParagraphQuery, [user_id, book_id, input_count], function (err, rows) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            return res.status(500).json({ error: 'Failed to check paragraph' });
                        });
                    }

                    // 2번째 문단이 없으면 프론트엔드에 경고 메시지 전송
                    if (rows.length === 0) {
                        connection.release();
                        return res.status(200).json({ message: '마지막 내용입니다.' });
                    }

                    // 문단 삭제 쿼리
                    const deleteContentQuery = `
                        DELETE FROM final_input
                        WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
                    `;

                    connection.query(deleteContentQuery, [user_id, book_id, input_count, content_order], function (err, deleteResult) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                return res.status(500).json({ error: 'Failed to delete content' });
                            });
                        }

                        // content_order가 현재 삭제된 content_order보다 큰 값들에 대해 content_order를 -1 감소
                        const updateOrderQuery = `
                            UPDATE final_input
                            SET content_order = content_order - 1
                            WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order > ?
                        `;

                        connection.query(updateOrderQuery, [user_id, book_id, input_count, content_order], function (err, updateResult) {
                            if (err) {
                                connection.rollback(function () {
                                    connection.release();
                                    return res.status(500).json({ error: 'Failed to update content orders' });
                                });
                            }

                            // 성공적으로 삭제와 업데이트가 완료되면 커밋
                            connection.commit(function (err) {
                                if (err) {
                                    connection.rollback(function () {
                                        connection.release();
                                        return res.status(500).json({ error: 'Failed to commit transaction' });
                                    });
                                }

                                connection.release();
                                return res.status(200).json({ message: 'Content deleted successfully' });
                            });
                        });
                    });
                });

                return; // whatToChange == 3일 경우 추가 작업이 필요 없으므로 함수 종료
            } else {
                connection.release();
                return res.status(400).json({ error: 'Invalid whatToChange value' });
            }

            // whatToChange가 1 또는 2일 경우 선택한 쿼리 실행
            connection.query(query, queryParams, function (err, result) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        return res.status(500).json({ error: 'Failed to update content' });
                    });
                }

                // title 또는 subtitle을 NULL로 업데이트했을 때 커밋
                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            return res.status(500).json({ error: 'Failed to commit transaction' });
                        });
                    }

                    connection.release();
                    return res.status(200).json({ message: 'Content updated successfully' });
                });
            });
        });
    });
});

module.exports = router;
