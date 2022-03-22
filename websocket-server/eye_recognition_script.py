import urllib
import cv2
import numpy as np
from tensorflow import keras
import face_recognition
import requests
import sys
from ai.drowsiness_detection_cnn import drowsiness_recognition as drowsiness_detection_cnn
from ai.drowsiness_detection_landmarks import drowsiness_recognition as drowsiness_detection_landmarks
import sys


# Enter username and password of account to check if user can use drowsiness detection
# Make sure lobby is occupied by the account being checked here
username = "testing"
password = "12345"
lobby_name = "Yolo"


def check():
    checkUser = requests.get(
        "http://localhost:3002/api/user/checkUser?username=" + username + "&password=" + password).json()

    if checkUser.get('id'):

        lobby = requests.get(
            "http://localhost:3002/api/lobby/get?lobbyName=" + lobby_name + "&username=" + username).json()

        if lobby.get('id'):
            results = requests.get(
                "http://localhost:3002/api/tracker/checkVacant?lobbyID=" + str(lobby['id'])).json()

            if(results['user_tracking'] == checkUser['id']):
                return lobby['id']
    return -1


def getEARValues():
    newToken = requests.post("http://localhost:3002/api/user/generateToken",
                             data={'username': username, 'password': password}).json()

    if newToken.get('token'):
        values = requests.get(
            "http://localhost:3002/api/user/getEARValues?lobbyName=", headers={'Authorization': 'Bearer ' + newToken['token']}).json()

        return values['drowsyorclosedear']


def detection_system():
    try:
        lobby_id = check()
        if lobby_id == -1:
            return

        cap = cv2.VideoCapture('http://192.168.0.78:4747/video')
        counter = 1
        captureFrame = 1

        if(sys.argv[1] == "1"):
            while(True):
                _, frame = cap.read()
                if captureFrame % 5 == 0:
                    frame = cv2.resize(frame, (128, 128))
                    frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)

                    result = drowsiness_detection_cnn(frame)

                    if(result == "OPEN"):
                        counter = 0
                        print("OPEN")
                    elif(result == "DROWSY"):
                        counter = counter + 1
                        print("DROWSY")
                        # if the counter is greater than 3, play and show alert that user is asleep
                        if counter > 1:
                            print("DROWSINESS DETECTED")
                            break
                    elif(result == "Face not found"):
                        print("Face not found")

                captureFrame += 1

            cap.release()

        elif(sys.argv[1] == "2"):
            earValue = getEARValues()

            print(earValue)

            while(True):
                _, frame = cap.read()
                if captureFrame % 5 == 0:
                    frame = cv2.resize(frame, (128, 128))
                    frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)

                    result = drowsiness_detection_landmarks(frame, earValue)

                    if(result == "OPEN"):
                        print("OPEN")
                        counter = 0
                    elif(result == "DROWSY"):
                        print("DROWSY")
                        counter += 1
                        # if the counter is greater than 2, play and show alert that user is asleep
                        if counter > 1:
                            break
                    elif(result == "Face not found"):
                        print("Face not found")

                captureFrame += 1
            cap.release()

        else:
            print("Enter valid option")
    except:
        # sys.exit()
        cap.release()


detection_system()
