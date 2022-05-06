import React, { useEffect, useCallback } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import {restAPIURL} from '../../env'
import { saveJWT } from './services/deviceStorage'
import axios from 'axios'

export default function Register ({navigation}) {



  const { register, handleSubmit, setValue, reset} = useForm();
  const [apiResponse, setApiResponse] = React.useState("")


  const onSubmit = useCallback(async formData => {
    if(formData.username && formData.password && formData.confirmPassword && formData.email) {
        if (formData.password != formData.confirmPassword) {
            setApiResponse("Password does not match")
            return
        }

        const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        if(!regex.test(formData.email)) {
            setApiResponse("Email not in correct format")
            return
        }

        try{

            let {data} = await axios.post(`${restAPIURL}/api/user/register`, {username: formData.username.toLowerCase(), email: formData.email.toLowerCase(), password: formData.password.toLowerCase()})

            if(data.error){
                setApiResponse(data.error)
            }else {
                await saveJWT("jwtKey", data.token)
                navigation.navigate("Home")
            }
        }catch(e){
            console.log(e);
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
    register('email')
    register('password');
    register('confirmPassword')
  }, [register]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Registration</Text>
        <View style={styles.input}>
            <TextInput
                placeholder="Enter username"
                onChangeText={onChangeField('username')}

            />
        </View>
        <View style={styles.input}>
            <TextInput
                placeholder="Enter email"
                onChangeText={onChangeField('email')}

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
        <View style={styles.input}>
            <TextInput
                secureTextEntry
                autoCompleteType="password"
                placeholder="Retype Password"
                onChangeText={onChangeField('confirmPassword')}
            />
        </View>

    <Button title="Register" onPress={handleSubmit(onSubmit)} />
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
  
