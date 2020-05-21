const express = require('express');
const app = express();
const compression = require('compression')

// 开启gzip配置,一定要写在托管静态资源之前
app.use(compression);
// 托管静态资源
app.use(express.static('./dist'))

app.listen(80,()=>{
    console.log('server running at http://127.0.0.1')
})