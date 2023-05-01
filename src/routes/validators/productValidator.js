const {body} = require('express-validator');

module.exports = [
    body('title', 'A termék nevének legalább 5 karakterből kell állnia!').isLength({min: 5}).trim().escape(),
    body('desc', 'A leírásnak legalább 5 karakterből kell állnia!').isLength({min: 5}).trim().escape(),
    body('category', 'A mező megadása kötelező!').not().isEmpty().isLength({max: 30}).trim().escape(),
    body('price', 'Az ár megadása kötelező').isNumeric().not().isEmpty(),
    body('subCategory').optional({checkFalsy: true ,nullable: true}).isLength({max: 30}).trim().escape(),
    body('condition').optional({checkFalsy: true ,nullable: true}).isLength({max: 30}).trim().escape(),
    body('madeYear', "Nem megfelelo formatum").optional({checkFalsy: true ,nullable: true}).isNumeric().isLength({min: 4, max: 4}),
]