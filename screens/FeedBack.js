import React, { useState } from 'react';
import { ScrollView, Image, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { icons } from "../constants";
import axios from 'axios';
import { API_HOST } from '../myenv';

const FeedBack = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleFeedbackChange = (text) => {
    setMessage(text.trimStart());
  };

  const handleEmailChange = (text) => {
    setEmail(text.trimStart());
  };

  const validateEmail = (email) => {
    const regex = /\S+@gmail\.com/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (!message.trim()) {
      setError('All The Fields Must Be Filled.');
      return false;
    } else if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleForm = async () => {
    if (validateForm()) {
      try {
        const requestUrl = `${API_HOST}/api/feedbacks`;
        console.log('Request URL:', requestUrl); // Debugging log
  
        const res = await axios.post(requestUrl, {
          message: message,
          email: email
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        Alert.alert('Success', 'Feedback submitted successfully!');
        
        // Clear the fields
        setMessage('');
        setEmail('');
        setError('');
      } catch (error) {
        console.error('Axios error:', error); // Detailed error log
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={icons.logo2}
          style={styles.logo}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <Image source={icons.email2} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              onChangeText={handleEmailChange}
              value={email}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Give Your Feedback.."
              placeholderTextColor="black"
              value={message}
              onChangeText={handleFeedbackChange}
              multiline
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleForm}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    height: 180,
    width: 130,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontFamily: 'Roboto-Regular',
  },
  button: {
    backgroundColor: '#000000',
    width: '80%',
    borderRadius: 25,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default FeedBack;
