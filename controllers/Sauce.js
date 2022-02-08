const Sauce = require('../models/Sauce');
const User = require('../models/user');
const fs = require('fs');

exports.createSauce =
(req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = 
(req, res, next) => {
  const sauceObject =
  req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }
  Sauce.findOne({ _id: req.params.id })
  .then( sauce => {
    if (req.auth.userId === sauce.userId) {
      if (req.file) {
        fs.unlink(`images/${sauce.imageUrl.split('/images/')[1]}`, () =>{})
      }
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
    } else {
      return res.status(401).json ( {message: 'utilisateur non autorisé'} )
    };
  });
};

exports.deleteSauce = 
(req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    if(!sauce) {
      return res.status(403).json ( {message: 'cette sauce n\'existe pas'} )
    }
    if (req.auth.userId === sauce.userId) {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
      .catch(error => res.status(400).json({ error }));
      });
    } else {
      return res.status(403).json ( {message: 'cette requette n\'est pas autorisé'} )
    }
  })
  .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce =
(req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => res.status(200).json(sauce))
  .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces =
(req, res, next) => {
  Sauce.find()
  .then(sauces=> res.status(200).json(sauces))
  .catch(error => res.status(400).json({ error }));
};

exports.likeSauce =
(req, res, next) => {
  const likeStatus = req.body.like;
  const userId = req.body.userId;

  User.findOne({_id: userId})
  .then(user => {
    if(!user){
      return res.status(401).json( {message: 'cette requette n\'est pas autorisé'} );
    } else {
    Sauce.findOne({ _id: req.params.id })
    .then(async(sauce) => {
      const usersLiked = sauce.usersLiked;
      const usersDisliked = sauce.usersDisliked;

      // enlève le like ou le dislike
      if( likeStatus === -1 || likeStatus === 0 || likeStatus === 1 ){
        if (likeStatus === 0) {
          if (!usersDisliked.includes(userId) && !usersLiked.includes(userId)) { //l'utilisateur n'a ni liké ni disliké la sauce
            return res.status(403).json( {message: 'cette requette n\'est pas autorisé'} );
          };
          if (usersLiked.includes(userId)) { //l'utilisateur a déjà liké la sauce
            sauce.likes -= 1;
            usersLiked.splice(usersLiked.indexOf(userId), 1);
          };
          if (usersDisliked.includes(userId)) { //l'utilisateur a déjà disliké la sauce
            sauce.dislikes -= 1;
            usersDisliked.splice(usersDisliked.indexOf(userId), 1);
          };
          await sauce.save();
          return res.status(200).json( {message: 'like/dislike enlevé'} );
        };
    
        //ajoute le like
        if(likeStatus === 1) { // L'utilisateur like la sauce
          if(usersLiked.includes(userId) || usersDisliked.includes(userId)){ //l'utilisateur a déjà liké ou disliké la sauce
            return res.status(403).json( {message: 'cette requette n\'est pas autorisé'} );
          };
          if (!usersDisliked.includes(userId) && !usersLiked.includes(userId)) { //l'utilisateur n'a ni liké ni disliké la sauce
            sauce.likes += 1;
            usersLiked.push(userId);
          };
          await sauce.save();
          return res.status(200).json( {message: 'like ajouté'} );
        };
    
        //ajoute le dislike
        if(likeStatus === -1) {
          if (usersDisliked.includes(userId) || usersLiked.includes(userId)) { //l'utilisateur a déjà disliké ou liké la sauce
            return res.status(403).json( {message: 'cette requette n\'est pas autorisé'} );
          };
          if (!usersDisliked.includes(userId) && !usersLiked.includes(userId)) { //l'utilisateur n'a ni liké ni disliké la sauce
            sauce.dislikes += 1;
            usersDisliked.push(userId);
          };
          await sauce.save();
          return res.status(200).json( {message: 'dislike ajouté'} );
        };

      } else {
        res.status(400).json( {message: 'cette requette n\'est pas autorisé'} )};
      })
    .catch(error => res.status(500).json({ error }));
    };
  });
};