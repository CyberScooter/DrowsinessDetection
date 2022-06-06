from os import closerange
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
# from flask_cors import CORS
# from ai.webcam_detection import drowsiness_detection
from ai.drowsiness_detection_landmarks import drowsiness_recognition as drowsiness_detection_landmarks
from ai.drowsiness_detection_cnn import drowsiness_recognition as drowsiness_detection_cnn
from ai.ear_value_calculator import calculator


# Creating a flask app and using it to instantiate a socket object
app = Flask(__name__)

app.debug = True

socketio = SocketIO(app, cors_allowed_origins="*",
                    engineio_logger=True, logger=True, async_handlers=False)
# engineio_logger=True, logger=True

# values['slider1'] and values['slider2'] store the current value of the sliders
# This is done to prevent data loss on page reload by client.
# counter = 0

@socketio.on('connect')
def test_connect():
    emit('connect', 'connected!')


@app.route('/earValue', methods=['POST'])
def home():
    data = request.get_json()
    if data['drowsy']:
        val = calculator(data['drowsy'])
        return jsonify({'response': val})
    else:
        return jsonify({'error': "Could not complete request"})

# classifies frames based on landmarks, EAR values
@socketio.on('frameFaceCallibrated')
def value_changed(message):

    emit('frameAnalysis', drowsiness_detection_landmarks(
        message['frame'], message['closed_or_drowsy']))

    
# classifies frames through a CNN model
@socketio.on('frameCNNClassification')
def value_changed(message):

    emit('frameAnalysis', drowsiness_detection_cnn(
        message['frame']))


# Notice how socketio.run takes care of app instantiation as well.
if __name__ == '__main__':
    socketio.run(app, port=5000, host="0.0.0.0")
