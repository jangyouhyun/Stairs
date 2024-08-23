var express = require('express'); 
var router = express.Router(); 

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.clearCookie('connect.sid'); // 세션 쿠키를 제거합니다.
        res.status(200).json({ message: 'Logged out successfully' });
    });
});


module.exports = router;