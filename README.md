Bonjour, je tiens à m'excuser si je n'ai pas finis le projet, par manque de 
temps dut à mes 25h/semaines en restauration. J'ai tout de même fait de mon 
mieux

Pour que le site marche il faut
-ouvrir via Xamp une instance d'Apache et Mysql
-sur un terminal ouvrir le serveur côté backend en se positionnant dans le
dossier du backend en entier puis dans public, taper la commande `php -S localhost:8000 index.php`
-de même pour le frontend avec la commande `php -S localhost:3000` dans le
dossier dédié.

RACINE DU PROJET
├── .env # Variables d'environnement (identifiants, secrets)
├── .htaccess # Configuration du serveur Apache (réécriture d'URL)
├── config.js # Fichier de configuration global
├── index.php # Point d'entrée principal (ou de secours) du backend
├── README.md # Documentation technique du projet
│
├── backend/ # STRATE SERVEUR (API PHP)
│ ├── controllers/ # Contrôleurs de l'API (Routage et logique métier)
│ │ ├── AlbumController.php
│ │ ├── AuthController.php
│ │ ├── CommentController.php
│ │ ├── PhotoController.php
│ │ └── UserController.php
│ ├── core/ # Cœur du système backend
│ │ ├── AbstractController.php
│ │ ├── Autoloader.php # Chargement automatique des classes PHP
│ │ ├── Database.php # Instance PDO et connexion SQL
│ │ ├── Logger.php # Système de journalisation des erreurs
│ │ └── Router.php # Intercepteur et distributeur de requêtes
│ ├── logs/ # Fichiers de suivi des erreurs du serveur
│ ├── manager/ # Couche d'abstraction (Requêtes SQL complexes)
│ │ ├── AlbumManager.php
│ │ ├── CommentManager.php
│ │ ├── PhotoManager.php
│ │ ├── TagManager.php
│ │ └── UserManager.php
│ ├── models/ # Représentation des entités de la base de données
│ │ ├── Album.php
│ │ ├── Comment.php
│ │ ├── Photo.php
│ │ ├── Tag.php
│ │ └── User.php
│ └── public/ # Fichiers backend accessibles publiquement
│
├── database/ # STRATE DONNÉES
│ └── backup.sql # Sauvegarde et schéma de la base de données
│
├── docs/ # DOCUMENTATION
│ └── data_base.png # Diagramme conceptuel de la base de données
│
├── frontend/ # STRATE CLIENT (Single Page Application - JS Vanilla)
│ ├── assets/ # Ressources statiques
│ │ ├── css/
│ │ │ └── style.css # Feuille de style globale
│ │ └── images/ # Médias de l'interface
│ ├── src/ # Code source de l'application
│ │ ├── controllers/ # Logique de contrôle des vues client
│ │ │ ├── AlbumController.js
│ │ │ ├── AuthController.js
│ │ │ ├── DashboardController.js
│ │ │ └── PhotoController.js
│ │ ├── core/ # Moteurs et utilitaires système
│ │ │ ├── ApiClient.js # Gestionnaire central des requêtes Fetch
│ │ │ ├── BaseView.js # Classe parente des vues
│ │ │ ├── DropZone.js # Mécanique de glisser-déposer (Upload)
│ │ │ ├── NavSearch.js # Mécanique de la barre de recherche
│ │ │ ├── Permission.js # Évaluateur scalaire des droits d'accès
│ │ │ ├── ProfileMenu.js # Gestionnaire de l'interface de session
│ │ │ ├── Router.js # Routeur asynchrone côté client
│ │ │ └── sanitize.js # Fonction d'échappement XSS
│ │ ├── models/ # Appels API asynchrones
│ │ │ ├── AlbumModel.js
│ │ │ ├── AuthModel.js
│ │ │ ├── PhotoModel.js
│ │ │ └── UserModel.js
│ │ ├── views/ # Construction du DOM (Rendu visuel)
│ │ │ ├── partials/ # Fragments HTML réutilisables
│ │ │ │ ├── footer.html
│ │ │ │ └── header.html
│ │ │ └── templates/ # Vues modulaires orientées objet
│ │ │ ├── AccessManagerView.js
│ │ │ ├── AlbumCreateView.js
│ │ │ ├── AlbumDetailView.js
│ │ │ ├── AlbumListView.js
│ │ │ ├── AlbumView.js
│ │ │ ├── AuthView.js
│ │ │ ├── DashboardView.js
│ │ │ ├── GalleryPhotoView.js
│ │ │ ├── notFound.js
│ │ │ └── PhotoView.js
│ │ └── config.js # Configuration interne au frontend (URLs, constantes)
│ ├── index.html # Fichier racine de la SPA (conteneur d'injection)
│ └── index.js # Point d'amorçage du JavaScript
│
└── public/ # Point d'exposition du serveur web (uploads utilisateurs)
