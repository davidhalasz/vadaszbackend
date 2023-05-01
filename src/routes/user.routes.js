const userController = require('../controllers/user.controller');
const router = require('express').Router();
const { validationResult } = require('express-validator');
const loginUserValidator = require('./validators/loginUserValidator');
const createUserValidator = require('./validators/createUserValidator');

const { verifyToken } = require('../middleware/verifyJwt');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).send(errors);
      return;
    }
    next();
  };
  

router.post('/regisztracio', createUserValidator, validateRequest, userController.createUser);
router.post('/activation/:uuid', userController.activation);
router.post('/resend-email', userController.resendEmail);
router.post('/belepes', loginUserValidator, validateRequest, userController.loginUser);
router.delete('/logout', userController.logout);
router.get('/currentuser', userController.checkToken);
router.post('/uj-jelszo', userController.resetPassword);
router.post('/update-user/:uuid', verifyToken, userController.updateUser);
router.delete('/delete-user/:uuid', verifyToken, userController.deleteUser);

module.exports = router;