const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const security = require('../security/secret');
const validator = require('validator');

exports.signup =
(req, res, next) => {
  if(!validator.isEmail(req.body.email)){ //vérifie l'adresse mail
    return res.status(400).json({ message: 'l\'adresse mail que vous avez entrée n\'est pas une addresse mail valide' })
  };
  if(!validator.isLength(req.body.password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})){ //vérifie que le mdp fasse plus de 8 charactères et contienne bien plusieurs charactères différents
    return res.status(400).json({ message: 'votre mot de passe doit contenir au moins 8 charactères, au moins une lettre minuscule, une majuscule, un chiffre et un charctère spécial' })
  };
  bcrypt.hash(req.body.password, 10) //hash le mdp 10 fois
  .then(hash => {
    const user = new User({ //créé le nouvel utilisateur 
      email: req.body.email,
      password: hash
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
    bcrypt.compare(req.body.password, user.password) //vérifie le hash du mdp
    .then(valid => {
      if (!valid) {
        return res.status(401).json({ message: `Mot de passe incorrect !` })
      } else {
        res.status(200).json({
          userId: user._id,
          token: jwt.sign( //créé le token
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