# E-commerce-
E-Commerce Website with User & Admin Modules using Node.js and MongoDB

🛠 Tech Stack

Frontend:
HTML
CSS
JavaScript

Backend:
Node.js
Express.js
Database:
MongoDB
Mongoose ODM

🗄 Database Details
MongoDB Server:
mongodb://127.0.0.1:27017
Database Name:
ecommerce_demo
Collections Used:
users
products
orders

👨‍💼 Admin Login Details
To add products or manage orders, login using the admin account.
Add this document into the users collection (via MongoDB Compass):
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "1234",
  "phone": "9999999999",
  "role": "admin"
}

Admin Login Credentials:
Email: admin@test.com
Password: 1234


Once logged in, open:
admin.html

Admin can:
Add Products
View All Products
Delete Products
View All Orders
