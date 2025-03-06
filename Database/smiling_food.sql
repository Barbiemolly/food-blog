CREATE SCHEMA `smiling_food` ;

USE smiling_food;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    subscription ENUM('yes', 'no') NOT NULL DEFAULT 'no',
);
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cooktime INT NOT NULL COMMENT 'Time in minutes',
    image_path VARCHAR(500) COMMENT 'Path to the image file',
    region VARCHAR(255),
    ingredients TEXT NOT NULL COMMENT 'List of ingredients in a JSON or plain text format',
    instructions TEXT NOT NULL COMMENT 'Steps to prepare the recipe',
    exclusivity ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE blog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    region VARCHAR(255),
    image_path VARCHAR(500) COMMENT 'Path to the image file',
    introduction TEXT,
    main_article TEXT,
    conclusion TEXT,
    exclusivity ENUM('yes', 'no') NOT NULL DEFAULT 'no',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
SELECT * FROM smiling_food.blog;
ALTER TABLE blog DROP COLUMN region;


 