# Test Website Application

## About the Stack

This would try to implement a full stack MERN website.

 - **NodeJS** would be the language for *Backend Server*.
   - **Express** would be used as a server 'manager?'
   - **MongoDB** woud be used as the database. Transactioned with **Mongoose**.
   - We would use the help of **multer** to handle the file transactions
   - We would use **JWT** and **Passport** as the *Authentication method through
     Bearer Tokens*.
   - For *logging* of events in server *to file*, we would use **Winston**.
   - To provide *live-logging feedback*, we would use **node-discord-logger**.
   - We use **bcrypt** to *hash and verify* our password of users.
   - We would use *environment variables via .env files*. (Implemented by
     **dotenv**)
   - We use **express-rate-limiter** to avoid users on spamming requests 

 - **Ionic** would serve as a React framework for the *Front-End Website*
   - **Axios** would be used to *initiate requests* between the client and the
     server. Maybe we can also try **React-Axios**
   - **Redux** would be used for *state management and Bearer Token Storage*
   - I tried to use **Formik** as a library for form validation.


This application should be able to operate as a micro social media where people
can register and account, store it in database, login with that account, view
their information, create a post and view it in dashboard where the first 30
posts would be displayed.

Based on this tasks, this would be the main task to be watched for while working
for this project.

## Tasks:

- [x] **CORE Initializations**
   
  - [x] *Initialize the MongoDB Server*
    - [x] Name it Haiku
    - [x] Create it a replicaSet server consisting of 3 servers : hosted as
      2345, 3456, 4567
    
  - [x] *Initialize the ExpressJS Server Core*
    - [x] Save it as a snippet for future use
    - [x] Install Dependencies - *npm i express mongoose jsonwebtoken passport passport-jwt 
      passport-local dotenv node-discord-logger winston
      winston-daily-rotate-file cors multer cors bcrypt*
    - [x] Install Developer Dependency - *npm i nodemon --save-dev*
    - [x] Host it as 7654
  
  - [x] *Initialize the Ionic App*
    - [x] Install the Dependencies

- [x] **BACKEND Server Essentials**

  - [x] Connect Server to ExpressJS using Mongoose
  - [x] Initialize the Logger and Discord Live Logger Watch
  - [x] Initialize the Authentication Service with JWT and Password
  - [x] Add CORS to the Server

- [x] **DATA STRUCTURE Planning**

  - [x] *Plan the User Schema*
    - [x] User Schema will refer to a list of Post Schema
  
  - [x] Plan the Post Schema
  - [x] Implement the Schema on Mongoose Models

- [x] **BACKEND Setup File Flow + FormData**

  - [x] Setup Multer

- [x] **BACKEND Accounts and Authentication**
  
  - [x] *Create an API Route to send requests of account creation*
   - [x] This should return a success or fail status

  - [x] *Create an API Route to receive request for login*
    - [x] Login through checking the database server
    - [x] Return a token tag when login is success

  - [x] Create a dev route to read JWT tokens
  
- [x] **BACKEND Post Making and Viewing**

  - [x] *Create a route that will receive form data*
    - [x] Store the form data in a Post Class and the User Posts List

  - [x] Create a route that will delete post by ID

  - [x] Create a route that will update post data by ID
  
  - [x] Create a route that will return the latest posts


- [ ] **FRONTEND Core**

  - [ ] Create the Login/Register Page
  - [ ] Create the Dashboard/Posts Page
  - [ ] Create the "Create Post" Page
  - [ ] Create the Account Page