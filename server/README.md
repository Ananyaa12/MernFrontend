Server README

Recommended commands (PowerShell):

# install dependencies
npm install

# start server (production-style)
npm start

# development (requires nodemon)
# install nodemon globally:
# npm install -g nodemon
# or install as dev dependency:
# npm install --save-dev nodemon
npm run dev

Notes:
- The server will use the PORT environment variable if set; otherwise it defaults to 4000.
- If the preferred port is busy, the server will automatically fall back to a free random port and print which port it is using.
- The server reads MongoDB connection string from the .env variable MONGO_URI. Example: MONGO_URI=mongodb://localhost:27017/petAdoptionDB

Troubleshooting:
- To find which process is using a port on Windows:
  netstat -a -n -o | findstr :4000
  taskkill /PID <pid> /F
