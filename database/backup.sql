-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 28 juin 2026 à 01:18
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `photo-album`
--

-- --------------------------------------------------------

--
-- Structure de la table `album`
--

CREATE TABLE `album` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` date NOT NULL,
  `visibility` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `album`
--

INSERT INTO `album` (`id`, `name`, `created_at`, `visibility`, `description`) VALUES
(10, 'kj', '0000-00-00', 'public', 'dfghjcxqedqedgc45555'),
(13, 'teste avec rr', '0000-00-00', 'public', NULL),
(14, 'test', '0000-00-00', 'private', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `album_photo`
--

CREATE TABLE `album_photo` (
  `album_id` int(11) NOT NULL,
  `photo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `album_photo`
--

INSERT INTO `album_photo` (`album_id`, `photo_id`) VALUES
(10, 10);

-- --------------------------------------------------------

--
-- Structure de la table `comment`
--

CREATE TABLE `comment` (
  `id` int(11) NOT NULL,
  `content` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comment`
--

INSERT INTO `comment` (`id`, `content`) VALUES
(4, 'Je suis le premier commentaire !');

-- --------------------------------------------------------

--
-- Structure de la table `comment_user`
--

CREATE TABLE `comment_user` (
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comment_user`
--

INSERT INTO `comment_user` (`comment_id`, `user_id`) VALUES
(4, 4);

-- --------------------------------------------------------

--
-- Structure de la table `photo`
--

CREATE TABLE `photo` (
  `id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `alt` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `caption` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `photo`
--

INSERT INTO `photo` (`id`, `file_path`, `alt`, `date`, `caption`) VALUES
(1, '', '/uploads/img_6a352bd4aa95f2.86727577.jpg', '2026-06-19', ''),
(2, '', '/uploads/img_6a38fac30853e0.12104383.jpg', '2026-06-22', ''),
(10, '', '/uploads/img_6a3e4bac3bcdd9.29299567.png', '2026-06-26', '');

-- --------------------------------------------------------

--
-- Structure de la table `photo_comment`
--

CREATE TABLE `photo_comment` (
  `photo_id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `photo_comment`
--

INSERT INTO `photo_comment` (`photo_id`, `comment_id`) VALUES
(10, 0),
(10, 4);

-- --------------------------------------------------------

--
-- Structure de la table `photo_tag`
--

CREATE TABLE `photo_tag` (
  `photo_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tag`
--

CREATE TABLE `tag` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `pronoun` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `name`, `profile_picture`, `pronoun`, `email`, `password`) VALUES
(1, 'ff', NULL, 'il', 'ff.ff@ff.ff', '$2y$10$/nT/TMCEjA7Y3m6/QN2yIOw/bcylkHqNZ1KwdJo4VlezcsJvUjQ/O'),
(2, 'kk', NULL, 'elle', 'kk.kk@kk.kk', '$2y$10$BCYBkjlAd/QloIChg.XlwOqECN42.FkouzBwZjezhLWb9Y8GFxUB.'),
(3, 'jj', NULL, 'il', 'jj.jj@jj.jj', '$2y$10$EFiBujKFZQpTCnEls.udveTgLHZZCZO9gi5KRYsVgqQBk6GuFQn8G'),
(4, 'rr', NULL, 'il', 'rr.rr@rr.rr', '$2y$10$Hd05/R/8WIrkmo6Lj7A5wuAqKAIT43yVxhLEkVmqxRJrMvYc15oFW');

-- --------------------------------------------------------

--
-- Structure de la table `user_album`
--

CREATE TABLE `user_album` (
  `user_id` int(11) NOT NULL,
  `album_id` int(11) NOT NULL,
  `permission` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user_album`
--

INSERT INTO `user_album` (`user_id`, `album_id`, `permission`) VALUES
(4, 10, 10),
(3, 10, 3),
(2, 13, 10),
(4, 13, 5),
(2, 10, 1),
(1, 14, 10);

-- --------------------------------------------------------

--
-- Structure de la table `user_friend`
--

CREATE TABLE `user_friend` (
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user_friend`
--

INSERT INTO `user_friend` (`user_id`, `friend_id`, `status`) VALUES
(1, 2, 1),
(2, 1, 1),
(2, 3, 1),
(4, 2, 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `album`
--
ALTER TABLE `album`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `album_photo`
--
ALTER TABLE `album_photo`
  ADD KEY `album_id` (`album_id`),
  ADD KEY `photo_id` (`photo_id`);

--
-- Index pour la table `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `comment_user`
--
ALTER TABLE `comment_user`
  ADD KEY `comment_user` (`comment_id`),
  ADD KEY `user_comment` (`user_id`);

--
-- Index pour la table `photo`
--
ALTER TABLE `photo`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `photo_comment`
--
ALTER TABLE `photo_comment`
  ADD KEY `photo_id` (`photo_id`),
  ADD KEY `comment_id` (`comment_id`);

--
-- Index pour la table `photo_tag`
--
ALTER TABLE `photo_tag`
  ADD KEY `photo_id` (`photo_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Index pour la table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `user_album`
--
ALTER TABLE `user_album`
  ADD KEY `user_id` (`user_id`),
  ADD KEY `album_id` (`album_id`);

--
-- Index pour la table `user_friend`
--
ALTER TABLE `user_friend`
  ADD PRIMARY KEY (`user_id`,`friend_id`),
  ADD KEY `friend_id` (`friend_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `album`
--
ALTER TABLE `album`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `comment`
--
ALTER TABLE `comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `photo`
--
ALTER TABLE `photo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `album_photo`
--
ALTER TABLE `album_photo`
  ADD CONSTRAINT `album_photo` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`),
  ADD CONSTRAINT `photo_album` FOREIGN KEY (`photo_id`) REFERENCES `photo` (`id`);

--
-- Contraintes pour la table `comment_user`
--
ALTER TABLE `comment_user`
  ADD CONSTRAINT `comment_user` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`),
  ADD CONSTRAINT `user_comment` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `photo_comment`
--
ALTER TABLE `photo_comment`
  ADD CONSTRAINT `comment_photo` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`),
  ADD CONSTRAINT `photo_comment` FOREIGN KEY (`photo_id`) REFERENCES `photo` (`id`);

--
-- Contraintes pour la table `photo_tag`
--
ALTER TABLE `photo_tag`
  ADD CONSTRAINT `photo_tag` FOREIGN KEY (`photo_id`) REFERENCES `photo` (`id`),
  ADD CONSTRAINT `tag_photo` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`);

--
-- Contraintes pour la table `user_album`
--
ALTER TABLE `user_album`
  ADD CONSTRAINT `album_user` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_album` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Contraintes pour la table `user_friend`
--
ALTER TABLE `user_friend`
  ADD CONSTRAINT `user_friend_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_friend_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
