var express = require('express');
var router = express.Router();
var db = require('../db.js');

/**
 * @swagger
 * tags:
 *   name: Print
 *   description: 책의 컨텐츠 출력 및 정리 API
 */

/**
 * @swagger
 * /print:
 *   post:
 *     summary: 책의 컨텐츠를 조회하고, `final_input` 테이블에 데이터를 정리하여 저장
 *     tags: [Print]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: string
 *                 description: 책 ID
 *               input_count:
 *                 type: integer
 *                 description: 입력 횟수 (기본값 1)
 *               content_order:
 *                 type: integer
 *                 description: 컨텐츠 순서 (기본값 0)
 *               category:
 *                 type: string
 *                 description: 카테고리
 *     responses:
 *       200:
 *         description: 컨텐츠가 성공적으로 조회되고 정리됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                 bookId:
 *                   type: string
 *                   description: 책 ID
 *                 userId:
 *                   type: string
 *                   description: 사용자 ID
 *                 contentCount:
 *                   type: integer
 *                   description: 컨텐츠 수
 *                 contentArray:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         description: 큰 제목 (존재하지 않으면 null)
 *                       subtitle:
 *                         type: string
 *                         description: 소제목 (존재하지 않으면 null)
 *                       imageUrl:
 *                         type: string
 *                         description: 이미지 경로 (존재하지 않으면 null)
 *                       paragraph:
 *                         type: string
 *                         description: 문단 내용
 *       404:
 *         description: 지정된 조건에 맞는 컨텐츠를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// POST /api/print
router.post('/print', function (req, res) {
    console.log("Request Body:", req.body);

    const book_id = req.body.book_id;
    const user_id = req.session.nickname;
    const input_count = req.body.input_count ? req.body.input_count : 1;
    const selectedIndex = req.body.content_order ? req.body.content_order : 0;
    const category = req.body.category;

    console.log("Book ID:", book_id);
    console.log("User ID:", user_id);
    console.log("content order:", selectedIndex);
    console.log("Category:", category);
    console.log("input_count:", input_count);

    // 우선 input_count가 일치하는 데이터가 있는지 확인
    db.query(`
        SELECT content, big_title, small_title, image_path FROM final_input 
        WHERE book_id = ? AND user_id = ? AND input_count = ?
        ORDER BY content_order
    `, [book_id, user_id, input_count], function (err, finalData) {
        if (err) {
            console.error("Error querying final_input:", err);
            return res.status(500).json({ message: 'An error occurred while querying final_input' });
        }

        // 만약 input_count와 일치하는 데이터가 있으면, input_count와 관계없이 book_id와 user_id가 일치하는 모든 데이터를 가져옴
        if (finalData && finalData.length > 0) {
            db.query(`
                SELECT content, big_title, small_title, image_path FROM final_input 
                WHERE book_id = ? AND user_id = ?
                ORDER BY content_order
            `, [book_id, user_id], function (err, allFinalData) {
                if (err) {
                    console.error("Error querying all final_input:", err);
                    return res.status(500).json({ message: 'An error occurred while querying all final_input' });
                }

                const contentArray = allFinalData.map(row => ({
                    title: row.big_title || null,
                    subtitle: row.small_title || null,
                    imageUrl: row.image_path || null,
                    paragraph: row.content
                }));

                console.log("Retrieved Content from final_input:", contentArray);
                return res.status(200).json({
                    message: 'Content retrieved from final_input',
                    bookId: book_id,
                    userId: user_id,
                    contentCount: contentArray.length,
                    contentArray: contentArray
                });
            });
        } else {
            // input_count와 일치하는 데이터가 없으면 purified_input에서 데이터를 가져옴
            db.query(`
                SELECT content FROM purified_input 
                WHERE book_id = ? AND user_id = ? AND input_count = ?
            `, [book_id, user_id, input_count], function (err, purifiedData) {
                if (err) {
                    console.error("Error querying purified_input:", err);
                    return res.status(500).json({ message: 'An error occurred while querying purified_input' });
                }

                if (!purifiedData || purifiedData.length === 0) {
                    console.log("No content found in purified_input for the given criteria.");
                    return res.status(404).json({ message: 'No content found in purified_input for the given criteria.' });
                }

                const content = purifiedData[0].content;
                console.log("Retrieved Content from purified_input:", content);

                const contentArray = content.split('\n').filter(paragraph => paragraph.trim() !== '').map(paragraph => ({
                    title: null,
                    subtitle: null,
                    imageUrl: null,
                    paragraph: paragraph
                }));

                console.log("Content Array:", contentArray);

                // content_order 임시 업데이트 및 최종 업데이트를 수행
                db.query(`
                    UPDATE final_input 
                    SET content_order = content_order + 1000 
                    WHERE book_id = ? AND user_id = ? AND content_order > ?
                `, [book_id, user_id, selectedIndex], function (err, tempUpdateResult) {
                    if (err) {
                        console.error("Error with temporary content_order update:", err);
                        return res.status(500).json({ message: 'An error occurred during temporary content_order update' });
                    }

                    console.log("Temporarily updated content_order for existing records");

                    db.query(`
                        UPDATE final_input 
                        SET content_order = content_order - 1000 + ? 
                        WHERE book_id = ? AND user_id = ? AND content_order > 1000
                    `, [contentArray.length, book_id, user_id], function (err, finalUpdateResult) {
                        if (err) {
                            console.error("Error with final content_order update:", err);
                            return res.status(500).json({ message: 'An error occurred during final content_order update' });
                        }

                        console.log("Final update of content_order for existing records completed");

                        let queryCount = 0;
                        contentArray.forEach((item, i) => {
                            const content_order = selectedIndex + i + 1;

                            db.query(`
                                INSERT INTO final_input (user_id, book_id, input_count, big_title, small_title, content, content_order, category)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `, [user_id, book_id, input_count, null, null, item.paragraph, content_order, category], function (err) {
                                if (err) {
                                    console.error("Error inserting into final_input:", err);
                                    return res.status(500).json({ message: 'An error occurred while inserting into final_input' });
                                }

                                queryCount++;
                                if (queryCount === contentArray.length) {
                                    console.log("Successfully inserted all content into final_input.");

                                    db.query(`
                                        SELECT content, big_title, small_title, image_path FROM final_input 
                                        WHERE book_id = ? AND user_id = ?
                                        ORDER BY content_order
                                    `, [book_id, user_id], function (err, updatedFinalData) {
                                        if (err) {
                                            console.error("Error querying final_input after insert:", err);
                                            return res.status(500).json({ message: 'An error occurred while querying final_input after insert' });
                                        }

                                        const updatedContentArray = updatedFinalData.map(row => ({
                                            title: row.big_title || null,
                                            subtitle: row.small_title || null,
                                            imageUrl: row.image_path || null,
                                            paragraph: row.content
                                        }));

                                        return res.status(200).json({
                                            message: 'Content successfully processed and inserted into final_input table',
                                            bookId: book_id,
                                            userId: user_id,
                                            contentCount: updatedContentArray.length,
                                            contentArray: updatedContentArray
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        }
    });
});

module.exports = router;
