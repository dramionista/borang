const path = require('path');

const express = require('express');
const axios = require('axios').default;

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

// New form
app.post('/form', async (req, res) => {
  const url = req.body.url;

  // Get form from Google
  let htmlData = await (await axios.get(url)).data;

  // const beautify = require('js-beautify').html;
  // htmlData = beautify(htmlData, { indent_size: 2 });

  res.send(htmlData);
});

app.post('/submit', async (req, res) => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let body = req.body;
  const formUrl = body.url;

  if (!formUrl) {
    res.send(
      'Something went wrong. If you are using mobile, please use desktop.'
    );
    return;
  }
  console.log(formUrl);

  let counter = +body.counter || 1;
  counter = counter > 100 ? 100 : counter;

  // Send response immediately so connection can be closed
  res.header('Connection', 'close');
  res.send(`${counter} form(s) sent`);

  delete body.url;
  delete body.counter;

  body = new URLSearchParams(body).toString();

  const promises = [];
  for (let i = 0; i < counter; i++) {
    await wait(6);
    promises.push(
      axios({
        method: 'POST',
        url: formUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: body,
      })
    );
  }
  Promise.all(promises).catch(() => {
    console.error('Server at Google hangup');
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
