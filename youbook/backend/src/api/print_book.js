var express = require('express');
var router = express.Router();
var db = require('../db.js');
var bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

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

    // Query final_input table
    db.query(`
        SELECT content, big_title, small_title, image_path FROM final_input 
        WHERE book_id = ? AND user_id = ? AND input_count = ?
        ORDER BY content_order
    `, [book_id, user_id, input_count], function (err, finalData) {
        if (err) {
            console.error("Error querying final_input:", err);
            return res.status(500).json({ message: 'An error occurred while querying final_input' });
        }

        // If data exists in final_input
        if (finalData && finalData.length > 0) {
            const contentArray = finalData.map(row => ({
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
        }

        // If no data in final_input, query purified_input
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

            // Split content by line breaks to form an array
            const contentArray = content.split('\n').filter(paragraph => paragraph.trim() !== '').map(paragraph => ({
                title: null,          // No title from purified_input
                subtitle: null,       // No subtitle from purified_input
                imageUrl: null,       // No image from purified_input
                paragraph: paragraph  // Actual content
            }));

            console.log("Content Array:", contentArray);

            // Step 1: Temporarily update content_order by adding a large offset to avoid duplication
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

                // Step 2: Perform the final update by adding the desired offset to content_order
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

                    // Insert content into final_input
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

                                // Query the entire final_input table again to return the updated contentArray
                                db.query(`
                                    SELECT content, big_title, small_title, image_path FROM final_input 
                                    WHERE book_id = ? AND user_id = ?
                                    ORDER BY content_order
                                `, [book_id, user_id, input_count], function (err, updatedFinalData) {
                                    if (err) {
                                        console.error("Error querying final_input after insert:", err);
                                        return res.status(500).json({ message: 'An error occurred while querying final_input after insert' });
                                    }

                                    // Create the final contentArray from updated final_input data
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
    });
});

module.exports = router;
