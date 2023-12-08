//导包(引入模块)
const express = require('express')

//导包(解决跨域)
const cors = require('cors')

// 引入路由
const userRouter = require('./route/Login')

//创建服务对象
const app = express();

// 引入管理接口文档 
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 使用swagger管理接口文档 
const options = {
  swaggerDefinition: {
    openapi: '3.0.3',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'API 文档',
    },
    // components: {
    //     securitySchemes: {
    //         JWT: {
    //             type: 'apiKey',
    //             in:'header',
    //             name:'authorization'
    //         }
    //     }
    // },
    basePath: '/',
  },
  apis: ['app.js', './route/Login.js'], // 包含 API 文件的路径
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//解决跨域
app.use(cors())

// 解析JSON
app.use(express.json())

// 使用路由
app.use('/api', userRouter)

app.listen(5555, () => {
  console.log('5555端口监听开始');
})