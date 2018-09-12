const http = require('http');
const path = require('path');
const config = require('./config/default');
let fs = require('fs');

//mimetype
const mimeTypes = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg":"image/jpeg"
};



class SERVER {
  constructor(){
    this.port = config.port;
    this.root = config.root;
  }
  
  start() {
    http.createServer((req, res) => {
      const pathName = path.join(this.root, path.normalize(req.url));    
      console.log('pathName--------',pathName)
      const fileName = pathName.split('/').pop();
      console.log('fileName--------',fileName)
      let stream = null;
      //check 
      fs.stat((`.${pathName}`), (err, stat) => {
        if (!err) {
          stream = fs.createReadStream(`./${this.root}/${fileName}`);
        }else{
          stream = fs.createReadStream(`./${this.root}/404.html`);
        }
        let mime = this.mime(pathName);
        res.writeHead(200,{'Content-Type':mime,'Transfer-Encoding':'chunked'});
        stream.pipe(res);
        stream.on('end', function(){res.end()})
      })
      //
    }).listen(this.port, err => {
      if (err) {
          console.error(err);
          console.info('Failed to start server');
      } else {
          console.info(`Server started on port ${this.port}`);
      }
    });
  }

//文件检测
  filehandler(){

  }

//mime判断
  mime(pathName){
    let ext = path.extname(pathName);
    ext = ext.split('.').pop();
    return mimeTypes[ext] || mimeTypes['html'];
  }


}
let server = new SERVER ();
server.start();