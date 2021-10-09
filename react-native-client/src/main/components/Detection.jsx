import React, { useCallback } from 'react'
import { useState, useMemo  } from 'react';
import Camera from './Camera'
import { AppRegistry, StyleSheet, Text, Alert, TouchableOpacity, View, Button, Dimensions } from 'react-native';
import CameraTest from './CameraClass'


export default function DrowsinessDetection({props}){
    const [frameCount, setFrameCount] = useState(0);
    const [response, setResponse] = useState("")
    const [calculatedResponse, setCalculatedResponse] = useState("")
    const [camera, startCamera] = useState(true)



    const handleResponse = (e)  => {
        if(e == "DROWSY" || e == "DEAD"){
            setFrameCount(frameCount + 1)
            console.log(frameCount);
            if(frameCount == 7) console.log("ALLLLLLLLLLLLEEEEEEEEEERRRRRRRRRRRTTTTTTTTTTTTTTTTTTTTTTT")
        }else {
            setFrameCount(0)
            setCalculatedResponse(e == "undefined" ? "Cannot find face" : e)
        }
        console.log(e);
    }

    const memoChild = useMemo(() => <Camera setResponse={(e) => handleResponse(e)} startCamera={camera} />, [camera]);


    return (
        <View>
            {memoChild}
            {/* <CameraTest /> */}
        </View>
    )





}