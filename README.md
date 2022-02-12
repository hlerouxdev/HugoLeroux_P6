# HugoLeroux_P6
partie backend "Piiquante"

Pour la connexion à Mongo Atlas et l'utilisation de jwt il faut créer un dossier "security" et y mettre un fichier "secret.js" avec les informations suivantes dedans:

const security = {
     mongooseUser: 'username:password',
     mongooseUri: 'collection adress',
     secretToken: 'your-token'
}

module.exports = security;
