'use strict';

const app = require('koa')();
const router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const parse = require('co-busboy');

var middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

middlewares.forEach(function (middleware) {
  app.use(require('./middlewares/' + middleware));
});

router
  .get('/', function* (next) {
    this.body = '<h1>Выберите изображение для загрузки</h1>' +
      '<form action="/upload" enctype="multipart/form-data" method="post">' +
      '<!--<input type="text" name="title"><br>-->' +
      '<input type="file" name="upload" multiple="multiple"><br>' +
      '<input type="submit" value="Upload">' +
      '</form>';
    yield next;
  })

  .get('/view/:filename', function* (next) {
    let filename = this.params.filename;
    //this.body = `<div>${filename}</div><img src="/${filename}" alt="image">`;

    let page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">

  <title>Face Detection</title>
  <link href="/css/style.css" rel="stylesheet">

  <script src="/dist/jquery/jquery.min.js"></script>
  <script src="/dist/jquery.facedetection/jquery.facedetection.min.js"></script>


</head>
<body>


<img class="logo" src="http://jaysalvat.github.io/jquery.facedetection/assets/logo.svg">

<div class="picture-container">
  <img id="picture" class="picture"
       src="/images/${filename}">
</div>

<a id="try-it" href="#">
  <img class="button-try" src="http://jaysalvat.github.io/jquery.facedetection/assets/button.svg">
</a>


<a href="/" class="repeat-link"><h1>Еще раз</h1></a>


<script src="/js/script.js"></script>

</body>
</html>`;

    this.body = page;


    yield next;
  });


app
  .use(function* (next) {
    // the body isn't multipart, so busboy can't parse it
    if (!this.request.is('multipart/*')) return yield next;
    let msg;
    let fileName;

    if (this.url !== '/upload') {
      msg = 'upload url not found';
      var err = new Error(msg);
      err.status = 404;
      this.body = msg;
      return err;
    }

    var parts = parse(this, {
      // only allow upload `.jpg` files
      checkFile: function (fieldname, file, filename) {
        fileName = filename;
        let exts = ['.jpg', '.jpeg'];
        let ext = path.extname(filename);
        console.log('ext = ' + ext);
        if ( exts.indexOf(ext) < 0 ) {
          msg = 'invalid jpg image';
          var err = new Error(msg);
          err.status = 400;
          return err;
        }
      }
    });
    var part;
    while (part = yield parts) {
      if (part.length) {
        // arrays are busboy fields
        console.log('key: ' + part[0]);
        console.log('value: ' + part[1]);
      } else {
        // otherwise, it's a stream
        console.log('stream...');
        part.pipe(fs.createWriteStream('./public/images/' + fileName));
        msg = `<div>ГОТОВО!</div><a href="/view/${fileName}">Посмотреть</a>`;
        this.body = msg;
      }
    }

    //console.log('and we are done parsing the form!');
    //console.log(parts);
  })
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);