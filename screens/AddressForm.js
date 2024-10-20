import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { icons } from "../constants"; // Assuming you have icons imported
import { useDispatch } from 'react-redux';
import { clearCart } from '../ACTIONS'; // Ensure the correct import path for clearCart
import axios from 'axios';
import { API_HOST } from '../myenv';


const AddressForm = ({ navigation, route }) => {
  const { cartItems, grandTotal } = route.params; // Extracting params from navigation route
  const [cardDetails, setCardDetails] = useState(null);
  const { confirmPayment } = useStripe();

  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const dispatch = useDispatch(); // Initialize dispatch

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text.trimStart());
  };

  const handleAddressChange = (text) => {
    setAddress(text.trimStart());
  };

  const handleEmailChange = (text) => {
    setEmail(text.trim());
  };

  const validatePhoneNumber = (phone_number) => {
    const regex = /^[0-9]{11}$/;
    return regex.test(phone_number);
  };

  const validateForm = () => {
    if (!email.trim() || !phone_number.trim() || !address.trim()) {
      setError('All fields must be filled.');
      return false;
    } else if (!validatePhoneNumber(phone_number)) {
      setError('Please enter a valid phone number (11 digits).');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (validateForm()) {
      if (!cardDetails?.complete) {
        console.log('Please fill out the card details');
        return;
      }
  
      try {
        const response = await axios.post(`${API_HOST}/api/create-payment-intent`, {
          amount: grandTotal * 100,
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
  
        const { clientSecret } = response.data;
  
        const { error, paymentIntent } = await confirmPayment(clientSecret, {
          type: 'Card',
          paymentMethodType: 'Card',
        });
  
        if (error) {
          console.log('Payment confirmation error:', error.message);
          return; // Exit on payment confirmation error
        } else if (paymentIntent) {
          console.log('Payment successful', paymentIntent);
  
          const productTitles = cartItems.map(item => item.title);
          
          const orderPayload = {
            email: email,
            phone_number: phone_number,
            address: address,
            product: productTitles,
            status: 'pending',
            total: grandTotal,
          };
          console.log('Order payload:', orderPayload);
  
          try {
            const order_response = await axios.post(`${API_HOST}/api/orders`, orderPayload, {
              headers: {
                'Content-Type': 'application/json',
              }
            });
  
            console.log('Order response:', order_response.data);
  
            // Set payment success message and clear the cart
            setPaymentSuccess(true);
            dispatch(clearCart()); // Clear the shopping cart
  
          } catch (orderError) {
            console.log('Order processing failed:', orderError.response?.data || orderError.message);
  
            // Check for specific error codes or messages
            if (orderError.response?.status === 422) {
              if (orderError.response?.data?.errors?.email) {
                setError('This email has already been taken. Please use a different email.');
              } else {
                setError('Order creation failed. Please try again.');
              }
            } else {
              setError('An unexpected error occurred during order creation.');
            }
          }
  
        } else {
          console.log('Unexpected case: Neither error nor paymentIntent was returned');
        }
      } catch (err) {
        console.log("Payment or order processing failed:", err.response?.data || err.message);
      }
    }
  };
  


  return (
    <View style={styles.container}>
      <Text style={styles.totalText}>Order Details:</Text>
      {cartItems.map((item, index) => (
        <View key={index}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Total Price: Rs.{grandTotal}</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              onChangeText={handleEmailChange}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Image source={icons.email2} style={styles.email} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              onChangeText={handlePhoneNumberChange}
              value={phone_number}
              keyboardType="phone-pad"
            />
            <Image source={icons.phn} style={styles.email} />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#888"
              onChangeText={handleAddressChange}
              value={address}
            />
            <Image source={icons.loc} style={styles.email} />
          </View>
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
              expiration: 'MM/YY',
              cvc: 'CVC',
            }}
            cardStyle={{
              textColor: '#000000',
              placeholderColor: '#888888', // Explicitly set placeholder color
              borderWidth: 1,
              borderColor: '#000000',
              borderRadius: 5,
              backgroundColor: '#FFFFFF',
            }}
            style={styles.cardContainer}
            onCardChange={(cardDetails) => setCardDetails(cardDetails)}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handlePayment}>
            <Text style={styles.buttonText}>Pay</Text>
          </TouchableOpacity>
          {paymentSuccess && (
            <Text style={styles.successMessage}>Order paid successfully!</Text>
          )}
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
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontFamily: 'Roboto-Regular',
    fontSize: 14, // Adjust font size for smaller inputs if needed
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
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    color: "black"
  },
  totalText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 25,
    marginLeft: 10,
    marginTop: 20,
    color: "black"
  },
  icon: {
    width: 40,
    height: 25,
    marginLeft: 10,
  },
  email: {
    width: 24,
    height: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    borderWidth: 2,
    borderColor: 'black',
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
    backgroundColor: 'black',
    width: '100%',
    borderWidth: 2,
  },
  successMessage: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default AddressForm;
