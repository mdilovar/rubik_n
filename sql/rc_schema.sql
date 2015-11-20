-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2015 at 09:15 PM
-- Server version: 5.5.43-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `rubik_n`
--
CREATE DATABASE IF NOT EXISTS `rubik_n` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `rubik_n`;

-- --------------------------------------------------------

--
-- Table structure for table `fbuid`
--
-- Creation: Nov 16, 2015 at 06:45 PM
--

DROP TABLE IF EXISTS `fbuid`;
CREATE TABLE IF NOT EXISTS `fbuid` (
  `player_id` int(11) NOT NULL,
  `fbuid` int(15) NOT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `fbuid` (`fbuid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- RELATIONS FOR TABLE `fbuid`:
--   `player_id`
--       `player` -> `player_id`
--

-- --------------------------------------------------------

--
-- Table structure for table `game`
--
-- Creation: Nov 16, 2015 at 06:45 PM
--

DROP TABLE IF EXISTS `game`;
CREATE TABLE IF NOT EXISTS `game` (
  `game_id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `cube_size` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`game_id`),
  KEY `game_fk0` (`player_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=192 ;

--
-- RELATIONS FOR TABLE `game`:
--   `player_id`
--       `player` -> `player_id`
--

-- --------------------------------------------------------

--
-- Table structure for table `password`
--
-- Creation: Nov 16, 2015 at 06:45 PM
--

DROP TABLE IF EXISTS `password`;
CREATE TABLE IF NOT EXISTS `password` (
  `player_id` int(11) NOT NULL,
  `hash` binary(60) NOT NULL,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- RELATIONS FOR TABLE `password`:
--   `player_id`
--       `player` -> `player_id`
--

-- --------------------------------------------------------

--
-- Table structure for table `player`
--
-- Creation: Nov 16, 2015 at 06:45 PM
--

DROP TABLE IF EXISTS `player`;
CREATE TABLE IF NOT EXISTS `player` (
  `player_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=79 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `fbuid`
--
ALTER TABLE `fbuid`
  ADD CONSTRAINT `fbuid_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `player` (`player_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `game`
--
ALTER TABLE `game`
  ADD CONSTRAINT `game_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `player` (`player_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `password`
--
ALTER TABLE `password`
  ADD CONSTRAINT `password_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `player` (`player_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
