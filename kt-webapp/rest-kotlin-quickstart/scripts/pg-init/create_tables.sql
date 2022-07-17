CREATE TABLE message
(
    id   SERIAL primary key,
    text varchar(255)
);

INSERT INTO message (text)
VALUES ('Hello'),
       ('World');