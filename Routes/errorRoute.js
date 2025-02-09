const express = require('express');
const router = express.Router();

router.get('/error', (req, res, next) => {
    // Force an error
    next(new Error("This is a test error!"));
});

module.exports = router;