-- ============================================================
-- Leave Management System — Production MySQL Schema
-- Compatible with: mysql2 (Node.js)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `railway`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `railway`;

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100)     NOT NULL,
  `email`      VARCHAR(255)     NOT NULL,
  `password`   VARCHAR(255)     NOT NULL,
  `role`       ENUM('Principal','HOD','Professor','Student') NOT NULL,
  `isApproved` TINYINT(1)       NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  INDEX `idx_users_role`       (`role`),
  INDEX `idx_users_isApproved` (`isApproved`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: leaves
-- ============================================================

CREATE TABLE IF NOT EXISTS `leaves` (
  `id`            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED  NOT NULL,
  `reason`        TEXT          NOT NULL,
  `from_date`     DATE          NOT NULL,
  `to_date`       DATE          NOT NULL,
  `status`        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `approver_role` ENUM('Principal','HOD','Professor')   NOT NULL,
  `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  CONSTRAINT `fk_leaves_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX `idx_leaves_user_id`      (`user_id`),
  INDEX `idx_leaves_status`       (`status`),
  INDEX `idx_leaves_approver_role`(`approver_role`),
  INDEX `idx_leaves_created_at`   (`created_at`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CONSTRAINT: to_date must be >= from_date
-- ============================================================

ALTER TABLE `leaves`
  ADD CONSTRAINT `chk_leaves_dates`
  CHECK (`to_date` >= `from_date`);
