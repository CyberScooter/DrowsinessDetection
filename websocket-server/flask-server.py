from flask import Flask, render_template
from flask_socketio import SocketIO, emit
# from flask_cors import CORS
# from ai.webcam_detection import drowsiness_detection
from ai.drowsiness_detection_landmarks import drowsiness_recognition as drowsiness_detection_landmarks


# Creating a flask app and using it to instantiate a socket object
app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*", engineio_logger=True, logger=True)
# engineio_logger=True, logger=True

# values['slider1'] and values['slider2'] store the current value of the sliders
# This is done to prevent data loss on page reload by client.
counter = 0

# Handler for a message recieved over 'connect' channel


@socketio.on('connect')
def test_connect():
    emit('connect', 'connected!')


# classifies frames based on landmarks, EAR values
@socketio.on('frame')
def value_changed(message):

    # print(message['frame'])

    emit('frameAnalysis', drowsiness_detection_landmarks(
        message['frame']))

# classifies frames through a CNN model
@socketio.on('frameCNNClassification')
def value_changed(message):

    # print(message['frame'])

    emit('frameAnalysis', drowsiness_detection_landmarks(
        message['frame']))


@socketio.on('callibrate_eyes')
def eyes_callibrate(message):
    None


# Notice how socketio.run takes care of app instantiation as well.
if __name__ == '__main__':
    socketio.run(app, port=5000)
