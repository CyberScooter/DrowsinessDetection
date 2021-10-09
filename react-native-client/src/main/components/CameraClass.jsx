import React, { Component } from 'react';
import { Camera } from 'expo-camera';
import { cameraWithTensors, fetch, decodeJpeg, bundleResourceIO, renderToGLView } from '@tensorflow/tfjs-react-native';
import { View, Text, StyleSheet, Platform } from 'react-native'
import SocketIOClient from 'socket.io-client';
import io from 'socket.io-client'

import * as jpeg from 'jpeg-js';
import * as tf from '@tensorflow/tfjs';

// import { Worker } from 'react-native-workers';

if (!window.location) {
    // App is running in simulator
    window.navigator.userAgent = 'ReactNative';
}

const socket = io("http://ded7-86-24-137-183.ngrok.io");

const TensorCamera = cameraWithTensors(Camera);
const DEF_DELAY = 1000;

// let tempImgBase64;
// let imgBase64;

class CameraTester2 extends Component {

    constructor(props) {
        super(props)
        // this.socket = SocketIOClient("http://748a-86-24-137-183.ngrok.io", {reconnection: false})

    }

    async componentDidMount() {
        await tf.ready();
        console.log("runn2");
        const camera = await Camera.requestPermissionsAsync()
        if (camera.status !== 'granted') {
            Alert.alert('Access denied')
        }

        
        socket.on("connect", (e) => { console.log(e) });

        // setSocketInit(true)

        socket.addEventListener("frameAnalysis", function (event) {
            console.log(event);
            // if (event === undefined) {
            //   setResponse("")
            // }else {
            //   if (event == "DROWSY" || event == "DEAD") {
            //     setResponse("DROWSY/DEAD")
            //   }
            // }
        })


    }

    // componentWillUnmount(){
    //     worker.terminate()
    // }

    handleCameraStream(imageAsTensors, updatePreview, gl) {
        const loop = async () => {
            let tensor = await imageAsTensors.next().value

            const data = await tensor.array()

            socket.emit("frame", {
                frame: data
            });

            

            updatePreview();
            gl.endFrameEXP();

            tf.dispose(tensor);


            await new Promise(resolve => setTimeout(resolve, 500 || DEF_DELAY));

            requestAnimationFrame(loop);
            

        }

        loop();
        // setInterval(async () => {
        //     const tensor = imageAsTensors.next().value

        //     if(!!tensor){
        //         const [height, width] = tensor.shape
        //         const data = new Buffer(
        //         // concat with an extra alpha channel and slice up to 4 channels to handle 3 and 4 channels tensors
        //         tf.concat([tensor, tf.ones([height, width, 1]).mul(255)], [-1])
        //             .slice([0], [height, width, 4])
        //             .dataSync(),
        //         )

        //         const rawImageData = {data, width, height};
        //         const jpegImageData = jpeg.encode(rawImageData, 200);

        //         let tempImgBase64 = tf.util.decodeString(jpegImageData.data, "base64")

        //         // if(tempImgBase64 == imgBase64){
        //         // repeat = true;
        //         // }


        //         // imgBase64 = tempImgBase64
                

        //         // console.log(imgBase64);
        //         // console.log(socket);
        //         socket.emit("frame", {
        //         frame: tempImgBase64,
        //         });


        //         // setTimeout(() => setBase64(imgBase64), 500)
                
        //         // updatePreview();
        //         // gl.endFrameEXP();


        //         // await tf.nextFrame()
        //         // console.log(encoded);
        //         tf.dispose(tensor);



        //         // let items = nextImageTensor.filter((item) => item !== 0 )
        //         // console.log(items.length);
        //         // const encoded = base64.encodeFromByteArray(nextImageTensor);
        //         // console.log(encoded);
        //         // await getPrediction(nextImageTensor);

        //         // await sleep(1000)
        //     }
        
        // }, 1000)
    }


    sleep = (ms) => {
        
    } 

    render() {

        let textureDims;
        if (Platform.OS === 'ios') {
        textureDims = {
            height: 1920,
            width: 1080,
        };
        } else {
        textureDims = {
            height: 1200,
            width: 1600,
        };
        }

        return <View>
        <TensorCamera
            // Standard Camera props
            style={styles.preview}
            type={Camera.Constants.Type.front}
            // Tensor related props
            cameraTextureHeight={textureDims.height}
            cameraTextureWidth={textureDims.width}
            resizeHeight={80}
            resizeWidth={72}
            zoom={0.65}
            resizeDepth={3}
            onReady={this.handleCameraStream}
            autorender={false}
        >

            {/* 120 80 */}
        </TensorCamera>
        </View>
        

    }

}

const styles = StyleSheet.create({
    preview: {
        justifyContent: 'flex-end',
        alignSelf: 'center',
        width: 700/2,
        height: 800/2,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default CameraTester2;