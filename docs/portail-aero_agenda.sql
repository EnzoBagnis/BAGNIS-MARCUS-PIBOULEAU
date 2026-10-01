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
-- Database: `portail-aero_agenda`
--

-- --------------------------------------------------------

--
-- Table structure for table `CLASSE`
--

CREATE TABLE `CLASSE` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `MACHINE`
--

CREATE TABLE `MACHINE` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `disponible` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PROFESSEUR`
--

CREATE TABLE `PROFESSEUR` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `RESERVATION`
--

CREATE TABLE `RESERVATION` (
  `id` int(11) NOT NULL,
  `debut` datetime NOT NULL,
  `fin` datetime NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `professeur_id` int(11) NOT NULL,
  `classe_id` int(11) NOT NULL,
  `machine_id` int(11) NOT NULL
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CLASSE`
--
ALTER TABLE `CLASSE`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `MACHINE`
--
ALTER TABLE `MACHINE`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `PROFESSEUR`
--
ALTER TABLE `PROFESSEUR`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `RESERVATION`
--
ALTER TABLE `RESERVATION`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_resa_prof` (`professeur_id`),
  ADD KEY `fk_resa_classe` (`classe_id`),
  ADD KEY `idx_resa_dates` (`debut`,`fin`),
  ADD KEY `idx_resa_machine` (`machine_id`,`debut`,`fin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CLASSE`
--
ALTER TABLE `CLASSE`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `MACHINE`
--
ALTER TABLE `MACHINE`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `PROFESSEUR`
--
ALTER TABLE `PROFESSEUR`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `RESERVATION`
--
ALTER TABLE `RESERVATION`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `RESERVATION`
--
ALTER TABLE `RESERVATION`
  ADD CONSTRAINT `fk_resa_classe` FOREIGN KEY (`classe_id`) REFERENCES `CLASSE` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_resa_machine` FOREIGN KEY (`machine_id`) REFERENCES `MACHINE` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_resa_prof` FOREIGN KEY (`professeur_id`) REFERENCES `PROFESSEUR` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
