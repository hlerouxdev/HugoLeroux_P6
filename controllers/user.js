const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const security = require('../security/secret');
const validator = require('validator');

exports.signup =
(req, res, next) => {
  if(!validator.isEmail(req.body.email)){
    return res.status(400).json({ message: 'l\'adresse mail que vous avez entrée n\'est pas une addresse mail valide' })
  };
  if(!validator.isLength(req.body.password, 8)){
    return res.status(400).json({ message: 'votre mot de passe doit contenir au moins 8 charactères' })
  };
  if(!/(?=.*?[0-9])(?=.*?[A-Za-z]).+/.test(req.body.password)){
    return res.status(400).json({ message: 'votre mot de passe doit contenir au moins une lettre et un chiffre' })
  }
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash,
      passCheck: 0
    });
    user.save()
      .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
      .catch(error => res.status(400).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
  .then(user => {
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé !' });
    }
    bcrypt.compare(req.body.password, user.password)
    .then(valid => {
      if (!valid) {
        return res.status(401).json({ message: `Mot de passe incorrect !` })
      } else {
        res.status(200).json({
          userId: user._id,
          token: jwt.sign(
            { userId: user._id },
            security.secretToken,
            { expiresIn: '12h' }
          )
        });
      };
    })
    .catch(error => res.status(500).json({ error }));
  })
  .catch(error => res.status(500).json({ error }));
};