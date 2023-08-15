const lib = require("./lib");
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 5213;

var jsonParser = bodyParser.json();

app.post("/", jsonParser, (req, res) => {
  const access_token = req.body.access_token;
  const api_base_url = req.body.api_base_url;
  const client_id = req.body.client_id;
  const signing_key_id = req.body.signing_key_id;
  const signing_key = req.body.signing_key;
  const utc_now = new Date().toISOString();
  const trace_id = uuidv4();
  const body = {
    totalAmount: 3.77,
    currencyCode: "HKD",
    effectiveDuration: 600,
    notificationUri:
      "https://webhook.site/a8355331-d748-4951-bf6b-7e02f6fce605",
    appSuccessCallback: "www.example.com/success",
    appFailCallback: "www.example.com/failure",
    merchantData: {
      orderId: "ID12345678",
      orderDescription: "Description displayed to customer",
      additionalData: "Arbitrary additional data - logged but not displayed",
      shoppingCart: [
        {
          category1: "General categorization",
          category2: "More specific categorization",
          category3: "Highly specific categorization",
          quantity: 1,
          price: 1,
          name: "Item 1",
          sku: "SKU987654321",
          currencyCode: "HKD",
        },
        {
          category1: "General categorization",
          category2: "More specific categorization",
          category3: "Highly specific categorization",
          quantity: 2,
          price: 1,
          name: "Item 2",
          sku: "SKU678951234",
          currencyCode: "HKD",
        },
      ],
    },
  };
  const raw = JSON.stringify(body);
  const digest = lib.computedDigest(raw);
  const config = lib.getConfig(signing_key_id, signing_key);
  const headerHash = lib.headerHash(raw, utc_now, trace_id, access_token);
  const signature = lib.computeHttpSignature(config, headerHash);
  var myHeaders = new Headers();
  myHeaders.append("Api-Version", "0.12");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Accept-Language", "en-US");
  myHeaders.append("Trace-Id", trace_id);
  myHeaders.append("Request-Date-Time", utc_now);
  myHeaders.append("Signature", signature);
  myHeaders.append("Digest", digest);
  myHeaders.append("Authorization", "Bearer " + access_token);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(api_base_url + "/payments/paymentrequests", requestOptions)
    .then((response) => response.text())
    .then((result) => res.json(JSON.parse(result)))
    .catch((error) => console.log("error", error));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function test() {}
