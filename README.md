# Mobile application of Drowsiness Detection with Precise Location Tracking

### Full-stack drowsy detection alert mobile app that uses closed/drowsy eyes to notify multiple users the longitude and latitude of the drowsy driver.
## Explanation for launching code

* Frontend and REST API server with database server has been dockerized into containers
* Drowsiness detection server HAS NOT been dockerized, due to performance, and therefore the python requirements for the system 
  will be needed to be installed locally on the machine

## Prerequisites

1. At least one Android device running with OS version >= 9.0
2. Make sure docker is installed on local machine and python3
3. install `cmake==3.22.2` using pip3 then install requirements.txt in `/python-server` directory
4. extra real Android device will be needed to track drowsy driver because of the dockerized expo app

## Instructions

1. Launch docker
2. Edit [docker-compose](./docker-compose.yml) file and [env.js](./react-native-client/env.js) file by replacing *LOCAL IPV4 IP* to your own machine local ipv4 ip that is running docker and python server
3. `RUN docker-compose up --build` in the root project directory in the terminal
4. `RUN python3 ./python-server/flask-server.py` IN SEPERATE TERMINAL within the root directory of project to run the detection server. 
    if `python` command defaults to `python3` then use `python` instead</li>
5. Scan QR Code from docker client terminal in expo app (two devices for drowsy detection and tracking or one for drowsy detection only)
6. To exit, stop docker containers and server through `CTRL + C` or GUI for docker
