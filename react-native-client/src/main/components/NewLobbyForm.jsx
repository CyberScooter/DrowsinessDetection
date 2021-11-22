import React, { useEffect, useCallback } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import {restAPIURL} from '../../../env'
import axios from 'axios'

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.BhcT-kWzUAwZzQ55XGnUpGZKuMf2dlWL3u9jvgfhWss"

export default function NewLobbyForm ({navigation}) {
  const { register, handleSubmit, setValue } = useForm();
  const [apiResponse, setApiResponse] = React.useState("")

  const onSubmitJoin = useCallback( async formData => {
    if(formData.lobbyJoinCode) {
        console.log("ran");
        let res = await axios.post(`${restAPIURL}/api/lobby/join`, {joinCode: formData.lobbyJoinCode, userID: 1},{
            headers: {
              Authorization: 'Bearer ' + token //the token is a variable which holds the token
            }
        })


        if(res.data.error){
            setApiResponse(res.data.error)
        }

        // console.log(formData.lobbyName);
    }
    navigation.navigate("Lobby")

  }, []);

  const onSubmitCreate = useCallback(async formData => {
    if(formData.lobbyName) {
        let res = await axios.post(`${restAPIURL}/api/lobby/create`, {lobbyName: formData.lobbyName, userID: 1},{
            headers: {
              Authorization: 'Bearer ' + token //the token is a variable which holds the token
            }
        })

        if(res.data.error){
            setApiResponse(res.data.error)
        }

        console.log(formData.lobbyName);
    }

    navigation.navigate("Lobby")
  }, []);


  const onChangeField = useCallback(
    name => text => {
      setValue(name, text);
    },
    []
  );

  useEffect(() => {
    // register('email');
    register('lobbyName')
    register('lobbyJoinCode')
    // register('password');
  }, [register]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Create new lobby</Text>
        <View style={styles.input}>
            <TextInput
            placeholder="Enter lobby name"
            onChangeText={onChangeField('lobbyName')}
            />
        </View>
      {/* <TextInput
        secureTextEntry
        autoCompleteType="password"
        placeholder="Password"
        onChangeText={onChangeField('password')}
      /> */}
        <Button title="Create lobby" onPress={handleSubmit(onSubmitCreate)} />
        <Text style={styles.title}>Join lobby</Text>
        <View style={styles.input}>
            <TextInput
            placeholder="Enter join code"
            onChangeText={onChangeField('lobbyJoinCode')}
            />
        </View>
        <Button title="Join lobby" onPress={handleSubmit(onSubmitJoin)} />
        <Text style={styles.response}>{apiResponse}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
    input: {
        padding: 20,
        marginTop: 10,
        marginBottom: 10,
        height: 60,
        backgroundColor: '#ffffff',
        paddingLeft: 15,
        paddingRight: 15

      
    },
    title: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 20,
        textAlign: 'center'
    },
    container: {
        marginTop: 50,
        marginLeft: 15,
        marginRight: 15
    },
    response: {
        marginTop: 10,
        fontSize: 18,
        color: 'red'
    }
  });
  
