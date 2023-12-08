// 连接msql数据库
const mysql = require('mysql2')

// 链接数据库
const createDatabaseConnection = () => {
  const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'qwertyuiop',
    database: 'YanCheng',
  })
  return db
}
createDatabaseConnection().getConnection((err, connection) => {
  if (err) {
    console.error('未连接数据库');
  } else {
    console.log('已连接数据库');
  }
});


// 指定查询
/**
 * 
 * @param {要查询的表} table 
 * @param {要查询的数据} conditions 
 */
const SpecifyTheQuery = (table, conditions = null) => {
  const sqlStr = conditions ? `SELECT * FROM ${table} WHERE ${conditions}` : `SELECT * FROM ${table}`;
  const res = createDatabaseConnection().query(sqlStr, (err, results) => {
    return results
  })
  return res
}

// 连表查询
/**
 * 
 * @param {主表} MasterTable 
 * @param {要连表查询的表1} InquireTable1 
 * @param {要连表查询的表2} InquireTable2 
 */
const TablesInquire = (MasterTable, InquireTable1, InquireTable2) => {
  const sqlStr = `SELECT * FROM ${MasterTable} LEFT JOIN ${InquireTable1} ON ${MasterTable}.userId = ${InquireTable1}.userId  LEFT JOIN ${InquireTable2} ON ${MasterTable}.userId = ${InquireTable2}.userId`;
  const res = createDatabaseConnection().query(sqlStr, (error, results) => {
    return results
  })
  return res
}



// 检查表是否存在
const checkTableExistence = (tableName) => {
  return new Promise((resolve, reject) => {
    createDatabaseConnection().query(`SHOW TABLES LIKE '${tableName}'`, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};


// 创建表
const createTable = (sql) => {
  return new Promise((resolve, reject) => {
    createDatabaseConnection().query(sql, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// 执行 SQL 查询
const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    createDatabaseConnection().query(sql, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// 主逻辑
const main = async () => {
  try {
    // 检查 Appointment 表是否存在
    const appointmentTableExists = await checkTableExistence('Appointment');

    if (!appointmentTableExists) {
      // 创建 Appointment 表
      const Appointment = `
        CREATE TABLE Appointment (
          userId INT PRIMARY KEY AUTO_INCREMENT COMMENT '预约信息ID',
          username VARCHAR(255) COMMENT '用户名',
          userType VARCHAR(255) COMMENT '用户类型',
          telNum VARCHAR(255) COMMENT '手机号',
          time VARCHAR(255) COMMENT '参观时间'
        ) COMMENT='预约信息表';
      `;
      const PersonalInfo = `
      CREATE TABLE PersonalInfo (
        userId INT PRIMARY KEY COMMENT '用户ID',
        sex VARCHAR(255) COMMENT '性别',
        age INT COMMENT '年龄',
        cardNum VARCHAR(255) COMMENT '身份证号'
        ) COMMENT='个人信息表';`


      const TeamInfo = `
      CREATE TABLE TeamInfo (
          userId INT PRIMARY KEY COMMENT '用户ID',
          perNum INT COMMENT '团队人数'
      ) COMMENT='团队信息表';`

      const Login = `
      CREATE TABLE Login (
        userId INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
        username VARCHAR(255) COMMENT '用户名',
        password VARCHAR(255) COMMENT '密码'
      ) COMMENT='用户表';
      `

      await createTable(Appointment);
      await createTable(PersonalInfo);
      await createTable(TeamInfo);
      await createTable(Login);
      console.log('表单添加成功');

      // 更新 PersonalInfo 表的外键关系
      const updatePersonalInfoSQL = `
       ALTER TABLE PersonalInfo
       ADD FOREIGN KEY (userId) REFERENCES Appointment(userId);
      `;
      await executeQuery(updatePersonalInfoSQL);
      console.log('PersonalInfo表外键关系已更新');

      // 更新 TeamInfo 表的外键关系
      const updateTeamInfoSQL = `
      ALTER TABLE TeamInfo
      ADD FOREIGN KEY (userId) REFERENCES Appointment(userId);
      `;
      await executeQuery(updateTeamInfoSQL);
      console.log('TeamInfo表外键关系已更新');

      // 往登录表插入数据
      const sqlStr2 = `INSERT INTO Login(username, password) VALUES ('admin', '123456')`
      createDatabaseConnection().query(sqlStr2, (error, results) => {
        if (!error) {
          console.log('Login添加');
        } else {
          console.log('Login添加有问题');

        }
      })


      console.log('Appointment表已创建');
    } else {
      console.log('Appointment表已存在');
    }

    // 同样的方式检查其他表的存在性并创建

  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 关闭数据库连接
    createDatabaseConnection().end();
  }
};

// 执行主逻辑
main();


// 开放链接数据库
module.exports = {
  createDatabaseConnection,
  SpecifyTheQuery,
  TablesInquire,
};

