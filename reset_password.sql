USE mysql;
UPDATE user SET authentication_string = '' WHERE User = 'root';
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Tanishk183109';
FLUSH PRIVILEGES; 