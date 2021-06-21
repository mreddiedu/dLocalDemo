const express = require('express');
const router = express.Router();
const braintree = require('braintree');
const axios = require('axios');
const parser = require('xml2json-light');
var forwardApiResponse = '';
var fs = require('fs');
var http = require('http');
var redirectURL = '';

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

  const getData = () => {
    axios.get('https://reqres.in/api/users').then(response => {
      console.log(response);
    });
  };

  //getData();

  const postData = () => {
    axios.post('https://reqres.in/api/users', {
      email: 'eve.holt@reqres.in',
      password: 'pistol'
    }).then(response => {
      console.log(response.status);
      console.log(response.data);
    });
  };

  //postData();

  /*
  const payload = {
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

  const payload = {
    merchant_id: "mzwf7bv4zc2bjccb",
    payment_method_nonce: "fake-valid-nonce",
    debug_transformations: false,
    url: "https://sandbox.dlocal.com/api_curl/cc/sale",
    method: "POST",
    sensitive_data: {
        "secretkey": "adb6419132f21ddbb8ee7253f52375935",
        "x_login": "293a6dd971",
        "x_trans_key": "262be38487",
        "x_version": "5.0",
        "x_invoice": "Invoice1234",
        "x_amount": "100.95",
        "x_currency": "INR",
        "x_description": "Product123",
        "x_device_id": "54hj4h5jh46hasjd",
        "x_country": "IN",
        "x_cpf": "SBUDA80030",
        "x_name": "Ivan Lolivier",
        "x_email": "santiago@dlocal.com",
        "cc_number": "4111111111111111",
        "cc_exp_month": "02",
        "cc_exp_year": "2023",
        "cc_cvv": "123",
        "x_address": "123 Bounty Drive",
        "x_city": "Mumbai",
        "x_confirm": "https://webhook.site/c608e51e-7631-4f44-bcf9-65d03d0e4637",
        "x_return": "http://161.35.100.241/result"
    },
    config: {
        "name": "dlocal_charge_config",
        "methods": [
            "POST"
        ],
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
                "value": "$x_name"
            },
            {
                "path": "/body/x_email",
                "value": "$x_email"
            },
            {
                "path": "/body/cc_number",
                "value": "$cc_number"
            },
            {
                "path": "/body/cc_exp_month",
                "value": "$cc_exp_month"
            },
            {
                "path": "/body/cc_exp_year",
                "value": "$cc_exp_year"
            },
            {
                "path": "/body/cc_cvv",
                "value": "$cc_cvv"
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
                                    "$cc_number",
                                    "$cc_exp_month",
                                    "$cc_cvv",
                                    "$cc_exp_year",
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

  const forwardRequest = () => {
    axios.post('https://forwarding.sandbox.braintreegateway.com/',
      payload, {
      auth: {
        username: 'khr4zhdwd867hk9g',
        password: '572cedb8c2d4359988895ad1e1e71b87'
      }
    })
      .then(response => {
        
        console.log(response.data.body);
        forwardApiResponse = parser.xml2json(response.data.body);
        console.log('\n', "forwardApiResponse in JSON: ", '\n', '\n', forwardApiResponse);
        var jsonParsed = JSON.parse(JSON.stringify(forwardApiResponse));
        var base64 = jsonParsed.response.threeDSHtmlContent;
        const buff = Buffer.from(base64, 'base64');
        const str = buff.toString('utf-8');
        redirectURL = str;
        console.log(str);

        console.log('Executed before file reading.');

        fs.writeFile('./public/paymentVerification.html', str, 'utf8', function(error){
          if(error) {
            throw error;
          } else {
            console.log('paymentVerification.html update sucess...');
          } 
          
        });

        console.log('Executed after file reading.');

      })
      .then(response => {
        
        console.log("2nd promise");
        
        res.redirect('/paymentVerification');
        //res.send({url: redirectURL});
      })
      .catch(error => {
        if(error) throw error;
      });
  };
 
  forwardRequest();
});

module.exports = router;



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