---

# **SignatureApp**  
Application for signing files securely.  

---

# **Overview**  
The **SignatureApp** is a web application that allows users to sign their files and download them. It ensures that access is authenticated and restricted based on user permissions.  

Below are diagrams illustrating different aspects of the application:  
- **User Actions:** A use case diagram showing what users can do.  
- **System Flow:** A diagram explaining how our application works.  
- **File Structure:** An image showing how files are organized inside our application.  

---

# **Security Measures**  
The security measures implemented in this application include:  
- **Environment Variables:** Important credentials (such as API keys and database passwords) are stored securely using environment variables.  
- **User Authentication:** Users must register, and only authorized users can access the file-signing functionality.  
- **Local Signing Process:** The signing process occurs in the user's browser, ensuring that no critical information is sent to the server.  

---

# **Explanation of the Express Main `app.js` File**  
**Express.js** is a powerful framework that handles HTTP requests and responses. In our `app.js` file, we use Express to:  
- **Establish a Database Connection:** A global connection to the MongoDB Docker container is made using an environment variable.  
- **Serve Static Files:** HTML, CSS, and JavaScript files from the `public` folder are served to users.  
- **Apply Middleware:** Middleware is used to control access and ensure only authorized users can access and generate files.  

---

# **Public Folder**  
This folder contains our **HTML, CSS, and JavaScript** files that are served to the client.  
- These files are **publicly accessible** only if the user has proper authorization.  

---

# **Middlewares**  
Middleware functions handle requests before forwarding them to the appropriate route.  
- The middleware ensures that only **authorized** users can access specific features.  
- Middleware is called inside the `app.js` file to process authentication and security logic before serving requests.  

---

# **Routes**  
Routes define how users interact with the application.  
- When users click **Login** or **Register**, they send requests to specific endpoints defined in the routes.  
- All route handling is implemented inside `app.js`.  

---

# **`package.json` – Dependencies**  
The `package.json` file defines the Node.js packages required for the application to function:  
- **`mongoose`** → Manages MongoDB interactions.  
- **`jsonwebtoken`** → Generates JWT tokens for user authentication.  
- **`express`** → Handles HTTP requests and routing.  
- **`dotenv`** → Loads environment variables securely.  
- **`multer`** → Handles file uploads.  
- **`bcrypt`** → Hashes passwords before storing them and verifies them during login.  

---

# **Authentication**  
Users are authenticated using their passwords, and access is authorized using **JSON Web Tokens (JWT)**.  

---

# **Authorization**  
**JSON Web Token (JWT)** is used to manage user access to the application.  
1. The server generates a **stateless JWT token**, meaning no need to store it on the server.  
2. The token is stored in the **client's localStorage or HTTP-only cookies**.  
3. Every time the client makes a request, they include the JWT token in the `Authorization` header as `Bearer <token>`.  
4. The server verifies the token before granting access.  

This approach ensures **scalability** and is ideal for distributed systems.  

---

# **Auth Middleware for Restricting Access**  
Each request to **generate keys** or **sign files** must be authorized using a valid JWT token.  

- This is handled by the `authMiddleware.authenticateToken` function inside `auth.js`.  
- Example usage in `app.js`:  
  ```js
  app.use('/generateKeys.html', authMiddleware.authenticateToken, express.static(path.join(__dirname, 'public/generateKeys.html')));
  ```
  - If the user requests `/generateKeys.html`, the request first passes through `authMiddleware.authenticateToken`.  
  - If authentication is successful, the static file is served.  

---

# **Auth Routes for Storing and Verifying User Credentials & Generating JWT Tokens**  
- A **User Schema & Model** is defined to store user data in the MongoDB database.  
- **Database interactions:**  
  - `User.findOne({ username })` → Retrieves user data for authentication.  
  - `newUser.save()` → Saves new users to the database.  

This allows users to authenticate and receive a **JWT token** for future requests without re-entering credentials.  

---

# **Dockerization of the App**  
To make the application **easy to deploy and portable**, we use **Docker**.  

### **Dockerfile Contents:**  
- We use `node:19.9.0-alpine` for a **lightweight Node.js environment**.  
- We define a production environment variable:  
  ```dockerfile
  ENV NODE_ENV=production
  ```
- We create a working directory inside the container:  
  ```dockerfile
  WORKDIR /app
  ```
- We copy package files and install dependencies:  
  ```dockerfile
  COPY ["package.json", "package-lock.json", "./"]
  RUN npm install --${NODE_ENV}
  ```
- We then copy all other files:  
  ```dockerfile
  COPY . .
  ```
- **Why install dependencies before copying files?**  
  - Docker **uses caching layers**, meaning each instruction is a separate layer.  
  - Installing dependencies first ensures that if only code changes (not dependencies), Docker won’t reinstall packages unnecessarily.  

- We expose port **5000** for incoming requests:  
  ```dockerfile
  EXPOSE 5000
  ```
- Finally, we run the application:  
  ```dockerfile
  CMD ["node", "app.js"]
  ```

---

# **Docker-Compose for Managing App & Database Containers**  
Since our app uses **two containers** (Express.js + MongoDB), using **Docker Compose** is the best practice.  

### **Contents of `docker-compose.yml`:**  
- We define **two services**:  
  1. **MongoDB**:  
     ```yaml
     container_name: mongodb_container
     restart: always
     ports:
       - "27017:27017"
     volumes:
       - mongo_data:/data/db
     ```
     - Ensures the container **automatically restarts** if it crashes or the system reboots.  
     - Maps ports between the container and the system.  
     - Uses a **persistent volume (`mongo_data`)** to prevent data loss.  
  2. **Express.js App**:  
     ```yaml
     depends_on:
       - mongodb
     ```
     - Ensures MongoDB starts **before** the Express.js app.  

- **Volumes:**  
  ```yaml
  volumes:
    mongo_data:
  ```
  - This ensures that **database data is not lost** even if the app crashes.  

---

# **HashiCorp Vault for Secrets Management**  
We use **HashiCorp Vault** to securely store and manage application secrets.  

### **Initialize & Unseal Vault:**  
```sh
docker exec -it vault vault operator init
```
- This generates **5 unseal keys** and a **root token**.  
- You need **3 out of 5 keys** to unseal Vault:  
  ```sh
  docker exec -it vault vault operator unseal <key1>
  docker exec -it vault vault operator unseal <key2>
  docker exec -it vault vault operator unseal <key3>
  ```
- Authenticate with:  
  ```sh
  docker exec -it vault vault login root
  ```

### **Store Secrets in Vault:**  
```sh
vault kv put secret/mongodb username="admin" password="secret"
vault kv put secret/app MONGO_URI="mongodb://admin:secret@mongodb:27017/signatureapp?authSource=admin"
```

### **Verify Stored Secrets:**  
```sh
vault kv get secret/mongodb
vault kv get secret/app
```

