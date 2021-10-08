from os import closerange
import cv2
import dlib
import io
import base64
import sys
import numpy as np
from imageio import imread
from scipy.spatial import distance

detector = dlib.get_frontal_face_detector()
dlib_facelandmark = dlib.shape_predictor(
    "C:\\Users\\hrithik\\Documents\\Projects\\fyp-idea\\websocket-server\\ai\\shape_predictor_68_face_landmarks.dat")
cap = cv2.VideoCapture(0)


def calculate_EAR(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])
    ear_aspect_ratio = (A+B)/(2.0*C)
    return ear_aspect_ratio


def drowsiness_recognition(frame2):

    # print(frame2.split(',')[1])
    # im_bytes = base64.b64decode(base64.b64encode(
    #     frame2.split(',')[1].encode('utf-8')))
    # # im_arr is one-dim Numpy array
    # im_arr = np.frombuffer(im_bytes, dtype=np.uint8)
    # img = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)

    # encoded_data = frame2.split(',')[1]
    # nparr = np.fromstring(base64.b64decode(encoded_data), np.uint8)

    nparr = np.fromstring(base64.b64decode(frame2), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # img = imread(io.BytesIO(base64.b64decode(frame2.encode())), pilmode="RGB")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = detector(gray)

    if len(faces) == 0:
        return "Face not found"

    for face in faces:
        face_landmarks = dlib_facelandmark(gray, face)
        leftEye = []
        rightEye = []

        for n in range(36, 42):
            x = face_landmarks.part(n).x
            y = face_landmarks.part(n).y
            leftEye.append((x, y))
            next_point = n+1
            if n == 41:
                next_point = 36
            x2 = face_landmarks.part(next_point).x
            y2 = face_landmarks.part(next_point).y
            cv2.line(img, (x, y), (x2, y2), (0, 255, 0), 1)

        for n in range(42, 48):
            x = face_landmarks.part(n).x
            y = face_landmarks.part(n).y
            rightEye.append((x, y))
            next_point = n+1
            if n == 47:
                next_point = 42
            x2 = face_landmarks.part(next_point).x
            y2 = face_landmarks.part(next_point).y
            cv2.line(img, (x, y), (x2, y2), (0, 255, 0), 1)

        left_ear = calculate_EAR(leftEye)
        right_ear = calculate_EAR(rightEye)

        EAR = (left_ear+right_ear)/2
        EAR = round(EAR, 2)
        if EAR <= 0.12:
            return "DEAD"
        elif EAR < 0.26:
            return "DROWSY"
            cv2.putText(img, "DROWSY", (20, 100),
                        cv2.FONT_HERSHEY_SIMPLEX, 3, (0, 0, 255), 4)
            cv2.putText(img, "Are you Sleepy?", (20, 400),
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 4)
            print("Drowsy")
        return "AWAKE"
        print(EAR)
