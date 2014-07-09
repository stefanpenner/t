var express = require('express');

module.exports = function(app) {
  var fooRouter = express.Router();
  fooRouter.get('/', function(req, res) {
    res.send({foo:[]});
  });
  app.use('/api/foo', fooRouter);
};
