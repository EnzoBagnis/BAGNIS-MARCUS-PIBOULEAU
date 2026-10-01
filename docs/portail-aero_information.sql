-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql-portail-aero.alwaysdata.net
-- Generation Time: Jun 15, 2026 at 11:39 AM
-- Server version: 11.4.12-MariaDB
-- PHP Version: 8.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `portail-aero_information`
--

-- --------------------------------------------------------

--
-- Table structure for table `MEDIA`
--

CREATE TABLE `MEDIA` (
  `id` int(11) NOT NULL,
  `titre` varchar(150) NOT NULL,
  `type` enum('image','video','texte') NOT NULL,
  `url_fichier` varchar(255) DEFAULT NULL,
  `contenu_texte` text DEFAULT NULL,
  `duree_sec` int(11) DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `date_ajout` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PLAYLIST`
--

CREATE TABLE `PLAYLIST` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PLAYLIST_MEDIA`
--

CREATE TABLE `PLAYLIST_MEDIA` (
  `playlist_id` int(11) NOT NULL,
  `media_id` int(11) NOT NULL,
  `ordre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `MEDIA`
--
ALTER TABLE `MEDIA`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_media_actif` (`actif`);

--
-- Indexes for table `PLAYLIST`
--
ALTER TABLE `PLAYLIST`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_playlist_active` (`active`);

--
-- Indexes for table `PLAYLIST_MEDIA`
--
ALTER TABLE `PLAYLIST_MEDIA`
  ADD PRIMARY KEY (`playlist_id`,`media_id`),
  ADD KEY `fk_pm_media` (`media_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `MEDIA`
--
ALTER TABLE `MEDIA`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `PLAYLIST`
--
ALTER TABLE `PLAYLIST`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `PLAYLIST_MEDIA`
--
ALTER TABLE `PLAYLIST_MEDIA`
  ADD CONSTRAINT `fk_pm_media` FOREIGN KEY (`media_id`) REFERENCES `MEDIA` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pm_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `PLAYLIST` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
