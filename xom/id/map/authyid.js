exports = module.exports = function() {
  
  return function authyID(user, cb) {
    return cb(null, user.authyID);
  };
};

exports['@singleton'] = true;
exports['@require'] = [];
