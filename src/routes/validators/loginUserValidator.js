const { body } = require('express-validator');

module.exports = [
    body('email', 'Nem megfeleló email cím').isEmail(),
    body('password', 'A jelszó mező üres').isLength({min: 1}),
]