-- =====================================================
-- To-Do Task Management Application
-- File: backend/database/schema.sql
-- Database: To-do-app
-- MySQL 8+
-- =====================================================

CREATE DATABASE IF NOT EXISTS `To-do-app`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `To-do-app`;

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TASKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT NULL,

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    priority ENUM('low', 'medium', 'high')
        NOT NULL DEFAULT 'medium',

    due_date DATE NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_tasks_user_id (user_id),

    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;