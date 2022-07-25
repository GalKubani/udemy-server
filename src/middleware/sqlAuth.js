const jwt = require('jsonwebtoken');
const { getConnection } = require('../utils/getConnection');

const sqlAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const connection = await getConnection();
    let queryString = `SELECT * from Users where id= ${data._id} 
       AND LOCATE('${token}', Users.tokens) > 0`;
    connection.query(queryString, (err, result) => {
      try {
        if (err || !result[0]) {
          console.log(err);
          throw new Error();
        } else {
          req.body.user = result[0];
          req.body.user.tokens = req.body.user.tokens.split(',');
          req.body.token = token;
          next();
        }
      } catch (err) {
        console.log(err);
        res.status(500).send({
          status: 500,
          message: 'authentication failed',
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: 500,
      message: 'authentication failed',
    });
  }
};
module.exports = sqlAuth;
