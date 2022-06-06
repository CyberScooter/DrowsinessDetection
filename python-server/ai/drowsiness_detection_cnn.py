from os import closerange
import cv2
import dlib
import io
import base64
import sys
import numpy as np
import os
from imageio import imread
from scipy.spatial import distance
from tensorflow import keras
import face_recognition
# import matplotlib.pyplot as plt

dirname = os.path.dirname(__file__)
# eye_model = keras.models.load_model(
#     "C:\\Users\\hrithik\\Documents\\FYP_CS\\Code\\websocket-server\\ai\\model1.h5")
eye_model = keras.models.load_model(os.path.join(dirname, 'model1.h5'))

eyes = ["left_eye", "right_eye"]

def drowsiness_recognition(frame):
    data = np.asarray(frame, np.uint8)

    facial_features_list = face_recognition.face_landmarks(data)

    if(len(facial_features_list) == 0):
        return "Face not found"

    leftEye, rightEye, x_range, y_range = None, None, None, None

    for i in eyes:
        eye = facial_features_list[0][i]

        x_max = max([coordinate[0] for coordinate in eye])
        x_min = min([coordinate[0] for coordinate in eye])
        y_max = max([coordinate[1] for coordinate in eye])
        y_min = min([coordinate[1] for coordinate in eye])

        if(x_range is None):
            x_range, y_range = x_max - x_min, y_max - y_min

        if x_range > y_range:
            right = round(.5*x_range) + x_max
            left = x_min - round(.5*x_range)
            bottom = round((((right-left) - y_range))/2) + y_max
            top = y_min - round((((right-left) - y_range))/2)
        else:
            bottom = round(.5*y_range) + y_max
            top = y_min - round(.5*y_range)
            right = round((((bottom-top) - x_range))/2) + x_max
            left = x_min - round((((bottom-top) - x_range))/2)

        if(i == "left_eye"):
            leftEye = data[top:(bottom + 1), left:(right + 1)]
            continue
        rightEye = data[top:(bottom + 1), left:(right + 1)]

    leftEye = cv2.resize(leftEye, (96, 96))
    leftEye = leftEye.reshape(-1, 96, 96, 3)/255.0

    rightEye = cv2.resize(rightEye, (96, 96))
    rightEye = rightEye.reshape(-1, 96, 96, 3)/255.0

    # get prediction from model
    lEye, rEye = np.argmax(eye_model.predict(leftEye), axis=1), np.argmax(eye_model.predict(rightEye), axis=1)

    if lEye[0] == 0 or rEye[0] == 0:
        return "OPEN"
    else:
        return "DROWSY"
