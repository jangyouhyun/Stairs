var express = require('express');
var router = express.Router();
var db = require('../db.js');

// 문단 순서 변경 API
router.post('/update_order', function (req, res) {
    const book_id = req.body.bookId;
    const user_id = req.session.nickname;
    const input_count = req.body.inputCount;
    const current_order = req.body.content_order;   // 현재 content_order 값
    const new_order = req.body.content_order_move;  // 새롭게 옮길 위치
    
    if (!book_id || !user_id || !input_count || !current_order || !new_order) {
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

            // 1. 먼저 현재 위치에 해당하는 레코드를 삭제
            const deleteCurrentOrderQuery = `
                DELETE FROM final_input
                WHERE user_id = ? AND book_id = ? AND input_count = ? AND content_order = ?
            `;

            connection.query(deleteCurrentOrderQuery, [user_id, book_id, input_count, current_order], function (err, deleteResult) {
                if (err) {
                    connection.rollback(function () {
                        connection.release();
                        return res.status(500).json({ error: 'Failed to delete current record' });
                    });
                }

                // 2. 다른 레코드들의 content_order 업데이트
                let updateOrderQuery = '';

                // 2-1. 앞으로 이동 (new_order < current_order)
                if (current_order > new_order) {
                    updateOrderQuery = `
                        UPDATE final_input
                        SET content_order = content_order + 1
                        WHERE user_id = ? AND book_id = ? AND input_count = ?
                        AND content_order >= ? AND content_order < ?
                    `;
                }
                // 2-2. 뒤로 이동 (new_order > current_order)
                else if (current_order < new_order) {
                    updateOrderQuery = `
                        UPDATE final_input
                        SET content_order = content_order - 1
                        WHERE user_id = ? AND book_id = ? AND input_count = ?
                        AND content_order > ? AND content_order <= ?
                    `;
                }

                connection.query(updateOrderQuery, [user_id, book_id, input_count, Math.min(current_order, new_order), Math.max(current_order, new_order)], function (err, updateResults) {
                    if (err) {
                        connection.rollback(function () {
                            connection.release();
                            return res.status(500).json({ error: 'Failed to update other records' });
                        });
                    }

                    // 3. 삭제한 레코드를 새롭게 삽입
                    const insertCurrentRecordQuery = `
                        INSERT INTO final_input (user_id, book_id, input_count, big_title, small_title, content, content_order, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    // 새로 삽입할 레코드 데이터는 삭제 전에 가져와서 임시로 저장해둔 값을 사용
                    // 여기서 필요한 데이터들은 삭제 전에 저장한 값으로 설정
                    const big_title = req.body.big_title;
                    const small_title = req.body.small_title;
                    const content = req.body.content;
                    const category = req.body.category;

                    connection.query(insertCurrentRecordQuery, [user_id, book_id, input_count, big_title, small_title, content, new_order, category], function (err, insertResults) {
                        if (err) {
                            connection.rollback(function () {
                                connection.release();
                                return res.status(500).json({ error: 'Failed to insert new record' });
                            });
                        }

                        // 모든 쿼리가 성공하면 커밋
                        connection.commit(function (err) {
                            if (err) {
                                connection.rollback(function () {
                                    connection.release();
                                    return res.status(500).json({ error: 'Failed to commit transaction' });
                                });
                            }

                            connection.release();
                            return res.status(200).json({ message: 'Content order updated and record inserted successfully' });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
