// 登录相关路由
const express = require('express')
// 引入路由
const router = express.Router()
// 引入jwt
const jwt = require('jsonwebtoken');
const { createDatabaseConnection, SpecifyTheQuery, TablesInquire } = require('../mysql')



// 定义密钥
const secretKey = 'YanCheng120@$'


// 定义JWT
const generateToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: '10h' });
};


// 验证Token的中间件
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    // 将解码后的用户信息存储在请求中，以便后续中间件或路由可以使用
    // req.user = decoded;
    next();
  });
}


// 登录系统
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 登录系统
 *     description: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Account:
 *                 type: string
 *                 description: 用户账号
 *               Password:
 *                 type: string
 *                 description: 用户密码
 *     responses:
 *       200:
 *         description: 成功登录
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/login', (req, res) => {
  const user = req.body;
  let db = createDatabaseConnection();
  db.query(SpecifyTheQuery('Login', `username = '${user.username}'`), (err, results) => {
    if (!err) {
      if (results.length) {
        db.query(SpecifyTheQuery('Login', `password = '${user.password}'`), (err, results) => {
          if (results.length) {
            const data = { name: results.Account, id: results.id }
            res.status(200).json({ data: { token: generateToken(data), }, message: '登录成功' })
          } else {
            res.status(200).json({ message: '密码错误' })
          }
        })
      } else {
        res.status(200).json({ message: '未查询到用户' })
      }
    } else {
      res.status(500).json({ message: '查询出错' })
    }
  })
})
// 预约信息
/**
 * @swagger
 * /api/Information:
 *   get:
 *     summary: 获取所有预约信息
 *     description: 获取所有个人和团队预约信息，需要验证 token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取预约信息
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: number
 *                   username: string
 *                   userType: string
 *                   telNum: string
 *                   time: string
 *                   sex: string
 *                   age: number
 *                   cardNum: string
 *                   perNum: null 
 *               message: "成功获取预约信息"
 *       401:
 *         description: 未授权，缺少有效的身份验证令牌
 *       500:
 *         description: 服务器内部错误
 */
router.get('/Information', verifyToken, (req, res) => {
  let db = createDatabaseConnection();
  db.query(TablesInquire('Appointment', 'TeamInfo', 'PersonalInfo'), (err, results) => {
    if (!err) {
      if (results.length) {
        // 翻转 results 数组
        const reversedResults = results.reverse();
        res.status(200).json({ data: { ...reversedResults }, message: '成功获取预约信息' })
      } else {
        res.status(200).json({ data: { ...results }, message: '查询出错' })

      }
    } else {
      res.status(500).json({ message: '查询出错' })
    }
  })
})

// 添加团体预约
/**
 * @swagger
 * /OrganizationBooking:
 *   post:
 *     summary: 添加团体预约
 *     tags:
 *       - 组织预约
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               userType:
 *                 type: string
 *               perNum:
 *                 type: string
 *               time:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功响应
 *         content:
 *           application/json:
 *             example:
 *               code: 200
 *               message: 添加成功
 *       500:
 *         description: 错误响应
 *         content:
 *           application/json:
 *             example:
 *               code: 500
 *               message: 添加有问题
 */
router.post('/OrganizationBooking', (req, res) => {
  const user = req.body;
  let db = createDatabaseConnection();
  db.query(SpecifyTheQuery('Appointment', `username = '${user.username}'`), (err, results) => {
    if (results.length) {
      res.status(200).json({ code: 500, message: '请勿重复添加' })
    } else {
      const sqlStr = `INSERT INTO Appointment (username, userType, telNum, time) VALUES ('${user.username}', '${user.userType}', '${user.telNum}', '${user.time}')`
      db.query(sqlStr, (error, results) => {
        if (error) {
          console.error('Error executing INSERT:', error);
          return;
        }
        // 获取插入的自增 ID
        const insertId = results.insertId;
        console.log('Inserted record ID:', insertId);
        const sqlStr2 = `INSERT INTO TeamInfo(userId, perNum) VALUES ('${insertId}', '${user.perNum}')`
        db.query(sqlStr2, (error, results) => {
          if (!error) {
            res.status(200).json({ code: 200, message: '添加成功' })
          } else {
            res.status(500).json({ code: 500, message: '添加有问题' })
          }
        })

      })
    }
  })
})

// 个人预约
/**
 * @swagger
 * /IndividualBooking:
 *   post:
 *     summary: 创建新的个人预约
 *     tags: [IndividualBooking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               userType:
 *                 type: string
 *               telNum:
 *                 type: string
 *               time:
 *                 type: string
 *               sex:
 *                 type: string
 *               age:
 *                 type: number
 *               cardNum:
 *                 type: string
 *     responses:
 *       '200':
 *         description: 成功添加个人预约
 *       '500':
 *         description: 添加个人预约失败
 */
router.post('/IndividualBooking', (req, res) => {
  const user = req.body;
  let db = createDatabaseConnection();
  db.query(SpecifyTheQuery('Appointment', `username = '${user.username}'`), (err, results) => {
    if (results.length) {
      res.status(200).json({ code: 500, message: '请勿重复添加' })
    } else {
      const sqlStr = `INSERT INTO Appointment (username, userType, telNum, time) VALUES ('${user.username}', '${user.userType}', '${user.telNum}', '${user.time}')`
      db.query(sqlStr, (error, results) => {
        if (error) {
          console.error('Error executing INSERT:', error);
          return;
        }
        // 获取插入的自增 ID
        const insertId = results.insertId;
        const sqlStr2 = `INSERT INTO PersonalInfo(userId, sex, age, cardNum) VALUES ('${insertId}', '${user.sex}', '${user.age}', '${user.cardNum}')`;
        db.query(sqlStr2, (error, results) => {
          if (!error) {
            res.status(200).json({ code: 200, message: '添加成功' })
          } else {
            res.status(500).json({ code: 500, message: '添加有问题' })
          }
        })

      })
    }
  })
})








module.exports = router