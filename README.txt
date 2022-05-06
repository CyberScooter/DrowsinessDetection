Explanation for launching code:
- Frontend and REST API server with database server has been dockerized into containers
- Drowsiness detection HAS NOT been dockerized, due to performance, and therefore the python requirements for the system 
  will be needed to be installed locally on the machine

Prerequisites:

- Make sure docker is installed on local machine and python3
- install cmake==3.22.2 using pip
- install requirements.txt in websocket-server

Procedure:

1) Launch docker
2) Edit ./docker-compose.yml file and ./react-native-client/env.js file by replacing the *LOCAL IPV4 IP* to your own local ipv4 ip
3) RUN within the root directory in terimal "docker-compose up --build"
4) RUN IN SEPERATE TERMINAL within the root directory "python3 ./websocket-server/flask-server.py" to run the detection server
5) Scan QR Code from docker client terminal in expo app