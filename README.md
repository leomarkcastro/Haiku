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
