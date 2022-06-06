import urllib
import cv2
import numpy as np
from tensorflow import keras
import face_recognition
import requests
import sys, os
sys.path.append(os.path.abspath(".."))

from ai.drowsiness_detection_cnn import drowsiness_recognition as drowsiness_detection_cnn
from ai.drowsiness_detection_landmarks import drowsiness_recognition as drowsiness_detection_landmarks
import time
import json

from threading import Thread


username = "john"
password = "test"
lobby_name = "TestNameLobby"

def getEARValues():
    newToken = requests.post("http://localhost:3002/api/user/generateToken",
                             data={'username': username, 'password': password}).json()

    if newToken.get('token'):
        values = requests.get(
            "http://localhost:3002/api/user/getEARValues?lobbyName=", headers={'Authorization': 'Bearer ' + newToken['token']}).json()

        return values['drowsyorclosedear']


results_cnn = []
results_ear = []

cap = cv2.VideoCapture(0)

def detection_system():
    try:
        counter = 0
        earValue = getEARValues()

        print("Ready")

        while(True):
            _, frame = cap.read()


            # print(frame)
            cv2.imwrite("frame%d.jpg" % counter, frame)   
            # frame = cv2.resize(frame, (64, 64))
            # frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)

            result = drowsiness_detection_cnn(frame)

            if(result == "OPEN"):
                results_cnn.append(result)

            elif(result == "DROWSY"):
                results_cnn.append(result)


            elif(result == "Face not found"):
                print("Face not found")

            result = drowsiness_detection_landmarks(frame, earValue)

            if(result == "OPEN"):
                results_ear.append(result)

            elif(result == "DROWSY"):
                results_ear.append(result)

            elif(result == "Face not found"):
                print("Face not found")
            
            counter+= 1
            time.sleep(0.35)
    except KeyboardInterrupt:
        with open('ear_logs.txt', 'w+') as filehandle:
            json.dump(results_ear, filehandle)
        with open('cnn_logs.txt', 'w+') as filehandle:
            json.dump(results_cnn, filehandle)
        cap.release()


detection_system()