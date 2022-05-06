<h3>Explanation for launching code:</h3>
<ul>
  <li>Frontend and REST API server with database server has been dockerized into containers</li>
  <li>Drowsiness detection HAS NOT been dockerized, due to performance, and therefore the python requirements for the system will be needed to be installed locally on the machine<li>
</ul>

<h3>Prerequisites:</h3>

<ul>
  <li>Make sure docker is installed on local machine and python3</li>
  <li>install cmake==3.22.2 using pip</li>
  <li>install requirements.txt in websocket-server</li>
</ul>

<h3>Procedure:</h3>

<ol>
  <li>Launch docker</li>
  <li>Edit ./docker-compose.yml file and ./react-native-client/env.js file by replacing the *LOCAL IPV4 IP* to your own local ipv4 ip</li>
  <li>RUN within the root directory in terimal "docker-compose up --build"</li>
  <li>RUN IN SEPERATE TERMINAL within the root directory "python3 ./websocket-server/flask-server.py" to run the detection server</li>
  <li>Scan QR Code from docker client terminal in expo app</li>
</ol>
