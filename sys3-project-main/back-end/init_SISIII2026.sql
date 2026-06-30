-- Initialization SQL for SISIII2026_89221066
-- file that it was used initially to make the db based on the reminar report
-- the live database differs from this initial version

USE `SISIII2026_89221066`;

-- Drop any existing tables from older imports so the schema can be recreated cleanly.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `History`;
DROP TABLE IF EXISTS `Schedule`;
DROP TABLE IF EXISTS `Expenses`;
DROP TABLE IF EXISTS `ServiceProvider`;
DROP TABLE IF EXISTS `Task`;
DROP TABLE IF EXISTS `Car`;
DROP TABLE IF EXISTS `User`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS `User` (
  userId INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(10) NOT NULL UNIQUE,
  zipcode INT(11),
  email VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Car` (
  carId INT(11) NOT NULL AUTO_INCREMENT,
  userId INT(11) NOT NULL,
  year INT(11) NOT NULL,
  model VARCHAR(255) NOT NULL,
  style VARCHAR(255),
  mileage INT(11) DEFAULT 0,
  make VARCHAR(255) NOT NULL,
  scheduled TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (carId),
  KEY idx_car_user (userId),
  CONSTRAINT fk_car_user FOREIGN KEY (userId) REFERENCES `User`(userId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Task` (
  taskId INT(11) NOT NULL AUTO_INCREMENT,
  item VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  cost FLOAT,
  description TEXT,
  priority VARCHAR(255),
  carId INT(11) NOT NULL,
  userId INT(11) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (taskId),
  KEY idx_task_car (carId),
  KEY idx_task_user (userId),
  CONSTRAINT fk_task_car FOREIGN KEY (carId) REFERENCES `Car`(carId) ON DELETE CASCADE,
  CONSTRAINT fk_task_user FOREIGN KEY (userId) REFERENCES `User`(userId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ServiceProvider` (
  providerId INT(11) NOT NULL AUTO_INCREMENT,
  provider VARCHAR(255) NOT NULL,
  priceRange VARCHAR(255),
  rating FLOAT,
  location VARCHAR(255),
  hours VARCHAR(255),
  zipcode INT(11),
  item VARCHAR(255),
  action VARCHAR(255),
  taskId INT(11),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (providerId),
  UNIQUE KEY uq_serviceprovider_provider (`provider`),
  KEY idx_provider_task (taskId),
  CONSTRAINT fk_provider_task FOREIGN KEY (taskId) REFERENCES `Task`(taskId) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Schedule` (
  scheduleId INT(11) NOT NULL AUTO_INCREMENT,
  scheduledAt TIMESTAMP NULL,
  item VARCHAR(255),
  action VARCHAR(255),
  description TEXT,
  provider VARCHAR(255),
  providerId INT(11),
  taskId INT(11),
  carId INT(11),
  userId INT(11),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (scheduleId),
  KEY idx_schedule_task (taskId),
  KEY idx_schedule_provider (providerId),
  KEY idx_schedule_car (carId),
  KEY idx_schedule_user (userId),
  CONSTRAINT fk_schedule_task FOREIGN KEY (taskId) REFERENCES `Task`(taskId) ON DELETE SET NULL,
  CONSTRAINT fk_schedule_provider FOREIGN KEY (providerId) REFERENCES `ServiceProvider`(providerId) ON DELETE SET NULL,
  CONSTRAINT fk_schedule_car FOREIGN KEY (carId) REFERENCES `Car`(carId) ON DELETE CASCADE,
  CONSTRAINT fk_schedule_user FOREIGN KEY (userId) REFERENCES `User`(userId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `History` (
  historyId INT(11) NOT NULL AUTO_INCREMENT,
  item VARCHAR(255),
  action VARCHAR(255),
  nextService DATE,
  provider VARCHAR(255),
  serviceAt TIMESTAMP NULL,
  scheduleId INT(11),
  taskId INT(11),
  carId INT(11),
  userId INT(11),
  providerId INT(11),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (historyId),
  KEY idx_history_schedule (scheduleId),
  KEY idx_history_task (taskId),
  KEY idx_history_car (carId),
  KEY idx_history_user (userId),
  KEY idx_history_provider (providerId),
  CONSTRAINT fk_history_schedule FOREIGN KEY (scheduleId) REFERENCES `Schedule`(scheduleId) ON DELETE SET NULL,
  CONSTRAINT fk_history_task FOREIGN KEY (taskId) REFERENCES `Task`(taskId) ON DELETE SET NULL,
  CONSTRAINT fk_history_car FOREIGN KEY (carId) REFERENCES `Car`(carId) ON DELETE CASCADE,
  CONSTRAINT fk_history_user FOREIGN KEY (userId) REFERENCES `User`(userId) ON DELETE CASCADE,
  CONSTRAINT fk_history_provider FOREIGN KEY (providerId) REFERENCES `ServiceProvider`(providerId) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Expenses` (
  expenseId INT(11) NOT NULL AUTO_INCREMENT,
  amount FLOAT NOT NULL,
  type VARCHAR(255),
  date DATE,
  carId INT(11),
  userId INT(11),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (expenseId),
  KEY idx_expense_car (carId),
  KEY idx_expense_user (userId),
  CONSTRAINT fk_expense_car FOREIGN KEY (carId) REFERENCES `Car`(carId) ON DELETE CASCADE,
  CONSTRAINT fk_expense_user FOREIGN KEY (userId) REFERENCES `User`(userId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `ServiceProvider` (`provider`, `priceRange`, `rating`, `location`)
VALUES ('Example Auto Service', 'Medium', 4.5, '123 Main St');
