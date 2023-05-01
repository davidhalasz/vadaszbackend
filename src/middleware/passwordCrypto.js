const CryptoJS = require('crypto-js');

function encryptPassword(password, secretKey) {
    const encrypted = CryptoJS.AES.encrypt(password, secretKey);
    return encrypted.toString();
}

function decryptPassword(encryptedPassword, secretKey) {
    const decrypted = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
}

module.exports = {
    encryptPassword, 
    decryptPassword
}