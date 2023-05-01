const productController = require('../controllers/product.controller');
const router = require('express').Router();
const { verifyToken } = require('../middleware/verifyJwt');
const fileUpload = require('../middleware/file-upload');
const productValidator = require('./validators/productValidator');
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  };

router.get('/products', productController.getProducts);
router.get('/my-products', verifyToken, productController.getProductsByUserId);
router.post('/product', verifyToken, fileUpload.array('files'), productValidator, validateRequest, productController.createProduct);
router.patch('/product/:id', verifyToken, fileUpload.array('files'), productValidator, validateRequest,  productController.updateProduct);
router.delete('/product/:id', verifyToken, productController.deleteProductById);
router.get('/product/:id', productController.getProductById);

module.exports = router;