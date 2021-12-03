import React, { useEffect, useCallback } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import {restAPIURL} from '../../env'
import { saveJWT } from './services/deviceStorage'
import axios from 'axios'

export default function NewLobbyForm ({navigation}) {



  const { register, handleSubmit, setValue, reset} = useForm();
  const [apiResponse, setApiResponse] = React.useState("")


  const onSubmit = useCallback(async formData => {
    if(formData.username && formData.password) {
        
        let {data} = await axios.post(`${restAPIURL}/api/user/login`, {username: formData.username.toLowerCase(), password: formData.password.toLowerCase()})

        if(data.error){
            setApiResponse(data.error)
        }else {
            await saveJWT("jwtKey", data.token)
            navigation.navigate("Home")
        }
    }


  }, []);


  const onChangeField = useCallback(
    name => text => {
      setValue(name, text);
    },
    []
  );

  useEffect(() => {
    register('username')
    register('password');
  }, [register]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.input}>
            <TextInput
                placeholder="Enter username"
                onChangeText={onChangeField('username')}

            />
        </View>
        <View style={styles.input}>
            <TextInput
                secureTextEntry
                autoCompleteType="password"
                placeholder="Enter Password"
                onChangeText={onChangeField('password')}
            />
        </View>

    <Button title="Login" onPress={handleSubmit(onSubmit)} />
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
  
