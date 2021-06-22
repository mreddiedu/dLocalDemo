const express = require('express');
const router = express.Router();
const braintree = require('braintree');
var fs = require('fs');
var http = require('http');

const axios = require('axios');
const parser = require('xml2json-light');
var forwardApiResponse = '';


router.post('/', (req, res, next) => {
  const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    // Use your own credentials from the sandbox Control Panel here
    merchantId: 'mzwf7bv4zc2bjccb',
    publicKey: 'khr4zhdwd867hk9g',
    privateKey: '572cedb8c2d4359988895ad1e1e71b87'
  });

  // Use the payment method nonce here
  const nonceFromTheClient = req.body.paymentMethodNonce;
  var amount = req.body.amount;
  var invoice = req.body.invoice;
  console.log("Server received nonce: ", nonceFromTheClient);

  var ForwardAPIpayload = {
    merchant_id: "mzwf7bv4zc2bjccb",
    payment_method_nonce: nonceFromTheClient,
    debug_transformations: false,
    url: "https://sandbox.dlocal.com/api_curl/cc/sale",
    method: "POST",
    sensitive_data: {
        "secretkey": "adb6419132f21ddbb8ee7253f52375935",
        "x_login": "293a6dd971",
        "x_trans_key": "262be38487",
        "x_version": "5.0",
        "x_invoice": invoice,
        "x_amount": amount,
        "x_currency": "INR",
        "x_description": "Product123",
        "x_device_id": "54hj4h5jh46hashd",
        "x_country": "IN",
        "x_cpf": "SBUDA80030",
        "x_email": "santiago@dlocal.com",
        "x_address": "123 Bounty Drive",
        "x_city": "Mumbai",
        "x_confirm": "https://webhook.site/394187b7-cf3c-48a0-a9f3-4018cee46391",
        "x_return": "http://161.35.100.241/result"
    },
    config: {
        "name": "dlocal_charge_config",
        "methods": ["POST"],
        "url": "^https://sandbox\\.dlocal\\.com/api_curl/cc/sale$",
        "keys": [
            "616462363431393133326632316464626238656537323533663532333735393335"
        ],
        "request_format": {
            "/body": "urlencode"
        },
        "template": {
            "header": {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        },
        "types": [
            "CreditCard"
        ],

        "transformations": [
            {
                "path": "/body/x_login",
                "value": "$x_login"
            },
            {
                "path": "/body/x_trans_key",
                "value": "$x_trans_key"
            },
            {
                "path": "/body/x_version",
                "value": "$x_version"
            },
            {
                "path": "/body/x_invoice",
                "value": "$x_invoice"
            },
            {
                "path": "/body/x_amount",
                "value": "$x_amount"
            },
            {
                "path": "/body/x_currency",
                "value": "$x_currency"
            },
            {
                "path": "/body/x_description",
                "value": "$x_description"
            },
            {
                "path": "/body/x_device_id",
                "value": "$x_device_id"
            },
            {
                "path": "/body/x_country",
                "value": "$x_country"
            },
            {
                "path": "/body/x_cpf",
                "value": "$x_cpf"
            },
            {
                "path": "/body/x_name",
                "value": "$cardholder_name"
            },
            {
                "path": "/body/x_email",
                "value": "$x_email"
            },
            {
                "path": "/body/cc_number",
                "value": "$number"
            },
            {
                "path": "/body/cc_exp_month",
                "value": "$expiration_month"
            },
            {
                "path": "/body/cc_exp_year",
                "value": "$expiration_year"
            },
            {
                "path": "/body/cc_cvv",
                "value": "$cvv"
            },
            {
                "path": "/body/control",
                "value": [
                    "upcase",
                    [
                        "hex",
                        [
                            "hmac-sha256",
                            0,
                            [
                                "join",
                                "",
                                [
                                    "array",
                                    "$x_invoice",
                                    "$x_amount",
                                    "$x_currency",
                                    "$x_email",
                                    "$number",
                                    "$expiration_month",
                                    "$cvv",
                                    "$expiration_year",
                                    "$x_cpf",
                                    "$x_country"
                                ]
                            ]
                        ]
                    ]
                ]
            },
            //required parameter for Braintree - DLocal Connecton
            {
                "path": "/body/x_address",
                "value": "$x_address"
            },
            {
                "path": "/body/x_city",
                "value": "$x_city"
            },
            //optional parameter: Confirmation URL to listen for dLocal payment webhooks
            {
              "path": "/body/x_confirm",
              "value": "$x_confirm"
            },
            //optional parameter: Return URL after One Time Password verification
            {
              "path": "/body/x_return",
              "value": "$x_return"
            }
        ]
    }
  }

    //Forward HostedField payload to Braintree
    axios.post('https://forwarding.sandbox.braintreegateway.com/',
    ForwardAPIpayload, {
      auth: {
        username: 'khr4zhdwd867hk9g', //Braintree API public key - zhodupaypal@gmail.com
        password: '572cedb8c2d4359988895ad1e1e71b87' //Braintree API private key
      }
    })
      .then(response => {
       
        //console.log(response.data.body); //output XML response from dLocal
        forwardApiResponse = parser.xml2json(response.data.body); //convert XML response to JSON
        console.log('\n', "Forward Api Response: ", '\n', '\n', forwardApiResponse);
        var jsonParsed = JSON.parse(JSON.stringify(forwardApiResponse));
        var base64 = jsonParsed.response.threeDSHtmlContent;
        const buff = Buffer.from(base64, 'base64');
        const dLocalOTPcontent = buff.toString('utf-8');
        console.log('\n', "3DS Content: ", '\n', '\n', dLocalOTPcontent);

        console.log('Executed before file reading.');
        //write result to server
        fs.writeFile('./public/paymentVerification.html', dLocalOTPcontent, 'utf8', function(error){
          if(error) {
            throw error;
          } else {
            console.log('paymentVerification.html update sucess...');
          } 
        });

        console.log('Executed after file reading.');

      })
      .then(response => {
        //redirect 
        res.redirect('/paymentVerification');
      })
      .catch(errorHandler);

  function errorHandler(e) {
    if (e) {
      console.log(e.response.data.message);
      console.log("Axios promise error");
    } else {
      throw e;
    }
  }
});

module.exports = router;

/*
  const getData = () => {
    axios.get('https://reqres.in/api/users').then(response => {
      console.log(response);
    });
  };

  getData();

  const postData = () => {
    axios.post('https://reqres.in/api/users', {
      email: 'eve.holt@reqres.in',
      password: 'pistol'
    }).then(response => {
      console.log(response.status);
      console.log(response.data);
    });
  };

  postData();

  
  const ForwardAPIpayload = {
    merchant_id: "mzwf7bv4zc2bjccb",
    payment_method_nonce: nonceFromTheClient,
    url: "https://httpbin.org/post",
    method: "POST",
    config: {
      name: "inline_example",
      methods: ["POST"],
      url: "^https://httpbin\\.org/post$",
      request_format: { "/body": "urlencode" },
      types: ["CreditCard"],
      transformations: [{
        "path": "/body/card[number]",
        "value": "$number"
      }]
    }
  };
*/


/*
    const postRequest = async () => {
      const newTodo = {
        merchant_id: "mzwf7bv4zc2bjccb",
        payment_method_nonce: "fake-valid-nonce",
        url: "https://httpbin.org/post",
        method: "POST",
        config: {
          name: "inline_example",
          methods: ["POST"],
          url: "^https://httpbin\\.org/post$",
          request_format: {"/body": "urlencode"},
          types: ["CreditCard"],
          transformations: [{
            "path": "/body/card[number]",
            "value": "$number"
          }]
        }
      }
  
      try {
          const resp = await axios.post('https://forwarding.sandbox.braintreegateway.com/', newTodo);
          console.log("RESPONSEDATA: ", resp.data);
          
          console.log("STATUSS");
          console.log(resp.status);
          console.log("STATUS TEXT");
          console.log(resp.statusText);
          console.log("HEADERS");
          console.log(resp.headers);
          console.log("CONFIG");
          console.log(resp.config);
      } catch (err) {
          console.error(err);
      }
  }
  
  postRequest();

  // Create a new transaction for $10
  const newTransaction = gateway.transaction.sale({
    amount: '10.00',
    paymentMethodNonce: nonceFromTheClient,
    options: {
      // This option requests the funds from the transaction
      // once it has been authorized successfully
      submitForSettlement: true
    }
  }, (error, result) => {
    if (result) {
      res.send(result);
    } else {
      res.status(500).send(error);
    }
  });
  */

  /*

    const newTransaction = gateway.transaction.sale({
    amount: '10.00',
    paymentMethodNonce: nonceFromTheClient,
    options: {
      // This option requests the funds from the transaction
      // once it has been authorized successfully
      submitForSettlement: true
    }
  }, (error, result) => {
    if (result) {
      res.send(result);
    } else {
      res.status(500).send(error);
    }
  });
  */