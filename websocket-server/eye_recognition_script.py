import urllib
import cv2
import numpy as np
from tensorflow import keras
import face_recognition
from playsound import playsound
from ai.drowsiness_detection_cnn import drowsiness_recognition


cap = cv2.VideoCapture('http://192.168.0.78:4747/video')
# cap.set(cv2.CV_CAP_PROP_FPS, 30)
# imports for webcam application
# import model saved above
# eye_model = keras.models.load_model("weight_model.h5")
eyes = ["left_eye", "right_eye"]
counter = 1
captureFrame = 1


def eye_cropper(frame):
    facial_features_list = face_recognition.face_landmarks(frame)

    if(len(facial_features_list) == 0):
        return "", ""

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

    return leftEye, rightEye


while(True):
    ret, frame = cap.read()
    if captureFrame % 5 == 0:
        frame = cv2.resize(frame, (128, 128))
        frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)

        result = drowsiness_recognition(frame)

        if(result == "OPEN"):
            counter = 0
        elif(result == "DROWSY"):
            counter = counter + 1
            # if the counter is greater than 3, play and show alert that user is asleep
            if counter > 1:
                break

        # # cv2.imshow('image', frame)
        # # cv2.waitKey(0)
        # # cv2.destroyAllWindows()

        # lEye, rEye = eye_cropper(frame)

        # try:
        #     lEye = lEye/255.0
        #     rEye = rEye/255.0
        # except:
        #     print("Not found")
        #     continue

        # # get prediction from model
        # lEye = eye_model.predict(lEye)
        # rEye = eye_model.predict(rEye)

        # if lEye[0][0] < 0.5 or rEye[0][0] < 0.5:
        #     counter = 0
        #     status = 'Open'
        #     print(status)

        # else:
        #     counter = counter + 1
        #     status = 'Closed'
        #     print(status)

        #     # if the counter is greater than 3, play and show alert that user is asleep
        #     if counter > 1:
        #         break
    captureFrame += 1


cap.release()
