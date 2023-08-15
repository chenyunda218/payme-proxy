var CryptoJS = require("crypto-js");

function computeHttpSignature(config, headerHash) {
  var template =
      'keyId="${keyId}",algorithm="${algorithm}",headers="${headers}",signature="${signature}"',
    sig = template;

  // compute sig here
  var signingBase = "";
  config.headers.forEach(function (h) {
    if (signingBase !== "") {
      signingBase += "\n";
    }
    signingBase += h.toLowerCase() + ": " + headerHash[h];
  });

  var hashf = (function () {
    switch (config.algorithm) {
      case "hmac-sha1":
        return CryptoJS.HmacSHA1;
      case "hmac-sha256":
        return CryptoJS.HmacSHA256;
      case "hmac-sha512":
        return CryptoJS.HmacSHA512;
      default:
        return null;
    }
  })();

  var hash = hashf(signingBase, config.secretkey);
  var signatureOptions = {
    keyId: config.keyId,
    algorithm: config.algorithm,
    headers: config.headers,
    signature: CryptoJS.enc.Base64.stringify(hash),
  };

  // build sig string here
  Object.keys(signatureOptions).forEach(function (key) {
    var pattern = "${" + key + "}",
      value =
        typeof signatureOptions[key] != "string"
          ? signatureOptions[key].join(" ")
          : signatureOptions[key];
    sig = sig.replace(pattern, value);
  });
  return sig;
}

var targetUrl = "/payments/paymentrequests";
var method = "post";

function computedDigest(data) {
  var sha256digest = CryptoJS.SHA256(data);
  var base64sha256 = CryptoJS.enc.Base64.stringify(sha256digest);
  var computedDigest = "SHA-256=" + base64sha256;
  return computedDigest;
}

function headerHash(data, utc_now, trace_id, access_token) {
  return {
    "Request-Date-Time": utc_now,
    "Api-Version": "0.12",
    "Trace-Id": trace_id,
    Authorization: "Bearer " + access_token,
    Digest: computedDigest(data),
    "(request-target)": method + " " + targetUrl,
  };
}

function getConfig(signing_key_id, signing_key) {
  var config = {
    algorithm: "hmac-sha256",
    keyId: signing_key_id,
    secretkey: CryptoJS.enc.Base64.parse(signing_key),
    headers: [
      "(request-target)",
      "Api-Version",
      "Request-Date-Time",
      "Trace-Id",
      "Authorization",
      "Digest",
    ],
  };
  return config;
}
module.exports = {
  computeHttpSignature,
  computedDigest,
  headerHash,
  getConfig,
};
// pm.environment.set("signature", computeHttpSignature(getConfig, headerHash));
// pm.environment.set("digest", computedDigest);
