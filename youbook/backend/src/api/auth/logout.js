var express = require('express'); 
var router = express.Router(); 

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