var SHA256 = require("crypto-js/sha256");
var CryptoJS = require("crypto-js");
var sha256digest = SHA256(process.argv[2]);
var base64sha256 = CryptoJS.enc.Base64.stringify(sha256digest);
console.log(base64sha256);
