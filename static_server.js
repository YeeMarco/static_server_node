const http = require('http');
const path = require('path');
const config = require('./config/default');
const os = require('os');
const querystring = require('querystring');
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
      let pathName = path.join(this.root, path.normalize(req.url));    
      //platform
      let fileName = null;
      if(os.platform() === 'win32'){
        console.log('win')
        fileName = pathName.split('\\').pop();
      }else {
        console.log('linux')
        fileName = pathName.split('/').pop();
      }
      console.log(req.url)
      if (req.url.includes('/jsonp')) {
        //jsonp处理逻辑   
        let str = req.url;
        str = str.slice((str.indexOf('?')+1));
        let obj = querystring.parse(str,'&','=');
        console.log(obj)
        let data = this.jsonphandler(str);
        res.writeHead(200,{'Content-Type':'application/json;charset=utf-8'})
        res.end(data)
      } else{
        //静态文件处理逻辑
        this.filehandler(pathName,fileName,req,res)
      }

    }).listen(this.port, err => {
      if (err) {
        console.error('Failed to start server',err);
      } else {
        console.info(`Server started on port ${this.port}`);
      }
    });
  }
//jsonp处理
 jsonphandler(url){
    console.log('this is jsonp handler');
    return `var data = {"name": "Monkey"};s.handler(data)`
 }
//文件处理
  filehandler(pathName,fileName,req,res){
    // console.log('pathName---->',pathName,'fileName---->',fileName)
    let stream = null;
    if(fileName === ''){
      stream = fs.createReadStream(`./${this.root}/404.html`);
      res.writeHead(200,{'Content-Type':"text/html",'Transfer-Encoding':'chunked'});
      stream.pipe(res);
      stream.on('end', function(){res.end()})
    } else {
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
    }
    
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