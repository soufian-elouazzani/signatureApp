# signatureApp
application for signing files

# Overview 
The SignatureApp is an application that allow you to sign you files and donwload them making sure that your access is  authentized and have the access to different part.
this use case diagram ilustrate what the user can do :

and this diagrame ilustrate how our application works:


and this is the image ilustrate how our files inside our application:



# security mesures
the measures for security we took in this app are :
we use environment variables to store our important informations like API credentials or passwords, 
the users should regiseter and only authorized users can access to sign files 
the signing process is running in local browser of the users so no critical informations are sent to the server

## explaination of the express main app.js file
express is a powerfull framework that handle http requests and make response to the users, that what we had used in our app.js file,
and also it make one global connection to mongoDB docker container using the URL that is the enviroment varaible , the other functions that is serves the static files HTML/CSS and js to the users that exist in the public folder, and to add control to the requests we are using middlewares 
to ensure only the authorized users can acces and generate thier 

## public folder
this folder containe our html/css and js files that will be served to the client and they will be publicly aaccesable if you have the autorization to them

## middlewares
the middleware where our app will handle the request before it git forwarded and the call for middlewares is in app.js file
## routes
here we difined routes for our application so the users will asks for , for example the user can click login or register by that the are requestion an endpoint that should already declared in this file, also the using for routes is already done in app.js file
## package.json 
this file tells nodejs what are the packages we need so our app can run, for example we need mongoose to Manages MongoDB interactions and jsonwebtoken to generate JWT tokens for user authentication and express to Handles routing for the authentication API and dotenv to use our environment variables and multer to help us handling our files and bcrypt to hash passwords before storing them and to verify them during login
# authentication
the users are authenticate with thier password and autorize access with json web token 

# authorization 
json web token is responsible to give the access to the users to the app with the help of a token, jwt allows users to the server to verify the users and who they claim are, fisrt the server generate this stateless token means no need to store it on the server, after that the token is stored in localStorage or httpOnly cookies of the client and for each request the client makes he add this jwt token in Bearer <token> to check if it valid it allow access. this most effecient approach to make our application scalable and wokrs with distributed systems for future if we want to make our app bigger

# auth middleware for resrecting access
for each request of access to generateKeys or sign the user should be authorized with valid jwt that where our auth.js files comes to play so in app.js when we do app.use('/generateKeys.html', authMiddleware.authenticateToken, express.static(path.join(__dirname, 'public/generateKeys.html'))); means if the user requested  /generateKeys.html path the request should pass first with the auth that exist in authMiddleware.authenticateToken and if that was valid the request is sent to  express.static(path.join(__dirname, 'public/generateKeys.html')) that serves the static demanded file.

# auth routes to store or verify the user credencial and generate a jwt for more access without credential
this part of the app makes a userschema and model to store our users inside our database that we already connected to in the app.js file, so when we do User.findOne({ username }) or newUser.save() means we interacte with the databse and we save of retreive data for authentication purposes.

# Dockertization the app :
to make our app easy to deploy and portable we used docker for more easy to maintaine approach, this is the contenent of our docker file :

we used node:19.9.0-alpine for a slim version for node, after that we creation a variable for production to costumize our workfllow ENV NODE_ENV=production, after that we created and sited inside WORKDIR /app a diroctory to store our files inside the container , and we coppied COPY ["package.json", "package-lock.json", "./"] our files to the container RUN npm install --${NODE_ENV} and then we runned npm install to install our packages , and then we make COPY . . to copy all other files , why we didn't copy all our files from the bigenning right ? the because some docker uses called cashing layers so each instruction is a docker layer for example when we type  WORKDIR /app it's a docker layer and when ever docker image get built if there no changes in some layer docker will just move to more up layers, so we often will change just some of our code in some particlue files and we will note need to install the packages each time we make just some small changes for that , it's a good practice to make the install of the packages first and then copy the remaining files.
after that we did EXPOSE 5000 to expose our container to listen in this port for upcoming requests and after that we run our app with CMD ["node", "app.js"] so start our server .


# docker-compose file to handle the app and the database containers :
since our app is using two containers so the best practice is to use docker compose and declaire all our services that responsible for building docker cotainers and connecting then, better than tayping each time the same command for building the images , 
in this docker compose we have two services the fisrt is mongodb that is responsible for making the image and set it up, and after that we give it a name   container_name: mongodb_container we called mognodb_container and we making sure the container is restart if the container is crashed or the system reboot's     restart: always and after that we have and we maps the ports between the container and the system using the declaration ports: - "27017:27017" and after that we set up a persisten volume to store the data that Uses a Docker volume (mongo_data) to persist database data. and for the second service we have depends_on: - mongodb → that Ensures the MongoDB container starts before the Express.js app.
and we did a volumes:volumes: mongo_data: to store the data even if the app is crashed the data will not be lost

# hashicop vault docker image
this image handles the secrets of our application Initialize & Unseal Vault :
    docker exec -it vault vault operator init
This will generate 5 unseal keys and a root token. You need 3 out of 5 keys to unseal Vault. Unseal with:
    docker exec -it vault vault operator unseal <key1>
    docker exec -it vault vault operator unseal <key2>
    docker exec -it vault vault operator unseal <key3>
Then, authenticate with:
    docker exec -it vault vault login root
Store Secrets in Vault:
    vault kv put secret/mongodb username="admin" password="secret"
    vault kv put secret/app MONGO_URI="mongodb://admin:secret@mongodb:27017/signatureapp?authSource=admin"
You can verify:
    vault kv get secret/mongodb
    vault kv get secret/app