CREATE TABLE user_info (
id VARCHAR(255) PRIMARY KEY NOT NULL,
pw VARCHAR(255) NOT NULL,
name VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
phone_number VARCHAR(255) NOT NULL,
birth DATE NOT NULL,
gender VARCHAR(255) NOT NULL,
image_path VARCHAR(255)
);

CREATE TABLE category(
user_id VARCHAR(255),
name VARCHAR(255),
INDEX idx_user_id(user_id),
INDEX idx_category (name),
PRIMARY KEY (user_id, name),
FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE
);

CREATE TABLE init_input (
user_id VARCHAR(255) NOT NULL,
book_id VARCHAR(255) NOT NULL,
input_count INT NOT NULL,
content TEXT NOT NULL,
category VARCHAR(255),
INDEX idx_user_id (user_id),
INDEX idx_book_id (book_id),
INDEX idx_input_count (input_count),
PRIMARY KEY (user_id, book_id, input_count),
FOREIGN KEY (category) REFERENCES category(name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE chatbot_data(
user_id VARCHAR(255) NOT NULL,
book_id VARCHAR(255) NOT NULL,
input_count INT NOT NULL,
quest_num INT NOT NULL,
question TEXT NOT NULL,
response TEXT,
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (user_id, book_id, input_count, quest_num),
FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE,
FOREIGN KEY (book_id) REFERENCES init_input(book_id) ON DELETE CASCADE
);

CREATE TABLE chatbot_summary(
user_id VARCHAR(255) NOT NULL,
book_id VARCHAR(255) NOT NULL,
input_count INT NOT NULL,
content TEXT,
PRIMARY KEY (user_id, book_id, input_count),
FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE,
FOREIGN KEY (book_id) REFERENCES init_input(book_id) ON DELETE CASCADE,
FOREIGN KEY (input_count, user_id, book_id) REFERENCES init_input(input_count, user_id, book_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE purified_input (
user_id VARCHAR(255) NOT NULL,
book_id VARCHAR(255) NOT NULL,
input_count INT NOT NULL,
content TEXT NOT NULL,
category VARCHAR(255),
PRIMARY KEY (user_id, book_id, input_count),
FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE,
FOREIGN KEY (book_id) REFERENCES init_input(book_id) ON DELETE CASCADE,
FOREIGN KEY (category) REFERENCES category(name) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (input_count, user_id, book_id) REFERENCES init_input(input_count, user_id, book_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE final_input (
user_id VARCHAR(255) NOT NULL,
book_id VARCHAR(255) NOT NULL,
input_count INT NOT NULL,
big_title VARCHAR(255),
small_title VARCHAR (255),
image_path VARCHAR(255),
content TEXT NOT NULL,
content_order int NOT NULL,
category VARCHAR(255),
PRIMARY KEY (user_id, book_id, input_count, content_order),
FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE,
FOREIGN KEY (book_id) REFERENCES init_input(book_id) ON DELETE CASCADE,
FOREIGN KEY (category) REFERENCES category(name) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (input_count, user_id, book_id) REFERENCES init_input(input_count, user_id, book_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE book_list (
book_id VARCHAR(255) NOT NULL,
user_id  VARCHAR(255) NOT NULL,
create_date DATE,
image_path VARCHAR(255),
title VARCHAR(255),
category VARCHAR(255),
PRIMARY KEY (book_id, user_id),
FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE,
FOREIGN KEY (category) REFERENCES category(name) ON DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (book_id) REFERENCES init_input(book_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE real_book (
book_id VARCHAR(255) NOT NULL,
big_title VARCHAR(255),
small_title VARCHAR (255),
image_path VARCHAR(255),
content TEXT NOT NULL,
content_order int NOT NULL,
PRIMARY KEY (book_id, content_order),
FOREIGN KEY (book_id) REFERENCES init_input(book_id) ON DELETE CASCADE
);

CREATE TABLE semisave
    book_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    create_date DATETIME NOT NULL,
    image_path VARCHAR(255) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    category VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (book_id, user_id)
);
