-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2015 at 12:09 PM
-- Server version: 5.5.43-0ubuntu0.14.04.1
-- PHP Version: 5.5.9-1ubuntu4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `rc`
--
CREATE DATABASE IF NOT EXISTS `rc` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `rc`;

-- --------------------------------------------------------

--
-- Table structure for table `fbplayer`
--

CREATE TABLE IF NOT EXISTS `fbplayer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fbuid` int(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `fname` varchar(255) NOT NULL,
  `lname` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fbuid` (`fbuid`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `id` (`id`),
  KEY `email` (`email`),
  KEY `id_2` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

-- --------------------------------------------------------

--
-- Table structure for table `game`
--

CREATE TABLE IF NOT EXISTS `game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `cube_size` int(11) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `game_fk0` (`player_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=192 ;

-- --------------------------------------------------------

--
-- Table structure for table `player`
--

CREATE TABLE IF NOT EXISTS `player` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `hash` binary(60) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=73 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `fbplayer`
--
ALTER TABLE `fbplayer`
  ADD CONSTRAINT `email_constraint` FOREIGN KEY (`email`) REFERENCES `player` (`email`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `game`
--
ALTER TABLE `game`
  ADD CONSTRAINT `game_fk0` FOREIGN KEY (`player_id`) REFERENCES `player` (`id`);
