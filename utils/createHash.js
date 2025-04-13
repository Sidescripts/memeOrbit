const crypto = require('crypto');


const hashString = (string) =>{
    crypto.createHash('md5').update(string).digest('hex');
}


module.exports = hashString;
// "production": {
  //   "username": "u1y8rtzutofew04s",
  //   "password": "QOZd31eLnOno6rFjYtWX",
  //   "port": 3306,
  //   "database": "bghtrd5f1anskvvzlrmo",
  //   "host": "bghtrd5f1anskvvzlrmo-mysql.services.clever-cloud.com",
  //   "dialect": "mysql"
  // },