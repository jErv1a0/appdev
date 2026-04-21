import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function ChatScreen() {
  const [msg, setMsg] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with Owner</Text>

      <TextInput
        placeholder="Type message"
        style={styles.input}
        value={msg}
        onChangeText={setMsg}
      />

      <TouchableOpacity style={styles.buttonPrimary}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}