import numpy as np
import cv2 as cv
import base64


def retrieve_frame():
    wCap = cv.VideoCapture(0)

    if(wCap.isOpened()):
        ret, frame = wCap.read();

        retval, img = cv.imencode('.jpg', frame)

        # print(base64.b64encode(img))
        
        encoded =  base64.b64encode(img.tostring())

        return encoded.decode("utf-8")
    else:
        return "Webcam not found"


retrieve_frame()
