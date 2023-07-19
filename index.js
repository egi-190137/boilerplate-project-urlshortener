require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

const urlEncoder = bodyParser.urlencoded({ extended: false });

const urlArray = []

let short_url = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/api/shorturl', urlEncoder);
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) =>  {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  console.log(/(^http:\/\/|^https:\/\/).+(\.com|\.org|\.net|\.biz|\.info).*/.test(original_url));
  let result;
  if (/(^http:\/\/|^https:\/\/).+/.test(original_url)) {
    const hostname = original_url.split(/\/+/i)[1];

    dns.lookup(hostname, (error, address, family) => {
      if (error) {
        result = { error : "invalid url"};
        res.json(result);
      } else {
        result = { original_url, short_url } ;
        res.json(result);
        urlArray.push(result);
        short_url++;
      }
    })
  } else {
    result = { error : "invalid url"};
    res.json(result);
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;

  let original_url;
  urlArray.forEach((item) => {
    if (item.short_url == short_url) {
      original_url = item.original_url;
    }
  })
  if (original_url === undefined) {
    res.json({"error":"No short URL found for the given input"});
  } else {
    res.redirect(original_url);
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
