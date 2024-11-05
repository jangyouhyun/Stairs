var express = require('express'); 
var router = express.Router(); 

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     tags: [Auth]
 *     description: 세션을 파기하고 로그아웃 처리. 로그아웃 후 쿠키 삭제.
 *     responses:
 *       200:
 *         description: 성공적으로 로그아웃되었거나 세션이 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 로그아웃 결과 메시지
 *       500:
 *         description: 로그아웃 처리 중 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 오류 메시지
 */
router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.status(200).json({ message: 'No session to log out' });
    }
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
    });
});



module.exports = router;