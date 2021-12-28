from os import closerange
import cv2
import dlib
import io
import base64
import sys
import numpy as np
from imageio import imread
from scipy.spatial import distance
from tensorflow import keras
import face_recognition
import matplotlib.pyplot as plt

detector = dlib.get_frontal_face_detector()
dlib_facelandmark = dlib.shape_predictor(
    "C:\\Users\\hrithik\\Documents\\Projects\\fyp-idea\\websocket-server\\ai\\shape_predictor_68_face_landmarks.dat")
cap = cv2.VideoCapture(0)

eye_model = keras.models.load_model(
    "C:\\Users\\hrithik\\Documents\\Projects\\fyp-idea\\websocket-server\\ai\\weight_model.h5")
eyes = ["left_eye", "right_eye"]


def drowsiness_recognition(frame):
    facial_features_list = face_recognition.face_landmarks(frame)

    if(len(facial_features_list) == 0):
        return "Face not found"

    leftEye = None
    rightEye = None

    x_range = None
    y_range = None

    for i in eyes:
        eye = facial_features_list[0][i]

        x_max = max([coordinate[0] for coordinate in eye])
        x_min = min([coordinate[0] for coordinate in eye])
        y_max = max([coordinate[1] for coordinate in eye])
        y_min = min([coordinate[1] for coordinate in eye])

        if(x_range is None):
            x_range = x_max - x_min
            y_range = y_max - y_min

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
            leftEye = frame[top:(bottom + 1), left:(right + 1)]
            continue
        rightEye = frame[top:(bottom + 1), left:(right + 1)]

    leftEye = cv2.resize(leftEye, (64, 64))
    # leftEye = cv2.cvtColor(leftEye, cv2.COLOR_BGR2GRAY)
    leftEye = leftEye.reshape(-1, 64, 64, 3)

    rightEye = cv2.resize(rightEye, (64, 64))
    # rightEye = cv2.cvtColor(rightEye, cv2.COLOR_BGR2GRAY)
    rightEye = rightEye.reshape(-1, 64, 64, 3)

    rightEye = rightEye/255.0
    leftEye = leftEye/255.0

    # get prediction from model
    lEye = eye_model.predict(leftEye)
    rEye = eye_model.predict(rightEye)

    if lEye[0][0] < 0.5 or rEye[0][0] < 0.5:
        return "OPEN"
    else:
        return "DROWSY"
