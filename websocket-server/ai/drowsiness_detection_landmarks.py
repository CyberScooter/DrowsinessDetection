from os import closerange
import cv2
import dlib
import io
import base64
import sys
import os
import numpy as np
from imageio import imread
from scipy.spatial import distance
import tensorflow as tf
import json
# import matplotlib.pyplot as plt

detector = dlib.get_frontal_face_detector()
dirname = os.path.dirname(__file__)
# dlib_facelandmark = dlib.shape_predictor(
#     "C:\\Users\\hrithik\\Documents\\FYP_CS\\Code\\websocket-server\\ai\\shape_predictor_68_face_landmarks.dat")
dlib_facelandmark = dlib.shape_predictor(os.path.join(dirname, 'shape_predictor_68_face_landmarks.dat'))

cap = cv2.VideoCapture(0)


def calculate_EAR(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    ear_aspect_ratio = (A+B)/(2.0*C)
    return ear_aspect_ratio


def drowsiness_recognition(frame, closed_or_drowsy):

    # print(frame2.split(',')[1])
    # im_bytes = base64.b64decode(base64.b64encode(
    #     frame2.split(',')[1].encode('utf-8')))
    # # im_arr is one-dim Numpy array
    # im_arr = np.frombuffer(im_bytes, dtype=np.uint8)
    # img = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)

    # encoded_data = frame2.split(',')[1]
    # nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)

    data = np.asarray(frame, np.uint8)

    # print(data)

    # nparr = np.fromstring(base64.b64decode(frame2), np.uint8)

    # img = cv2.imdecode(data, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(data, cv2.COLOR_BGR2GRAY)
    # cv2.imwrite('img.png', gray)

    # img = cv2.imdecode(nparr, cv2.IMREAD_COLOR) use this

    # img = imread(io.BytesIO(base64.b64decode(frame2.encode())), pilmode="RGB") NO

    # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # plt.imshow(vis2, cmap='gray')
    # plt.show()

    faces = detector(gray)

    if len(faces) == 0:
        return "Face not found"

    for face in faces:
        faceLandmarks = dlib_facelandmark(gray, face)
        left_eye = []
        right_eye = []

        for i in range(36, 42):
            x = faceLandmarks.part(i).x
            y = faceLandmarks.part(i).y
            left_eye.append((x, y))

        for i in range(42, 48):
            x = faceLandmarks.part(i).x
            y = faceLandmarks.part(i).y
            right_eye.append((x, y))

        left_ear = calculate_EAR(left_eye)
        right_ear = calculate_EAR(right_eye)

        EAR = (left_ear+right_ear)/2

        print(EAR)
        EAR = round(EAR, 5)
        if EAR <= closed_or_drowsy:
            return "DROWSY"
        return "OPEN"
