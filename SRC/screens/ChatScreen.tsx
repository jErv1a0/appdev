import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';

export default function ChatScreen() {
  const [msg, setMsg] = useState('');

  return (
    <View style={localStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={localStyles.header}>
        <View>
          <Text style={localStyles.protocolLabel}>Channel Open</Text>
          <Text style={localStyles.title}>Secure Chat</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={localStyles.chatArea}>
        <View style={localStyles.systemNotice}>
          <Text style={localStyles.systemNoticeText}>Session Established</Text>
        </View>
      </ScrollView>

      <View style={localStyles.inputArea}>
        <TextInput
          placeholder="Enter your message..."
          placeholderTextColor="#999"
          style={localStyles.input}
          value={msg}
          onChangeText={setMsg}
        />
        <TouchableOpacity style={localStyles.sendButton}>
          <Text style={localStyles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  protocolLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1.5,
  },
  chatArea: {
    flexGrow: 1,
    padding: 20,
  },
  systemNotice: {
    backgroundColor: '#000000',
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'center',
    borderRadius: 0,
  },
  systemNoticeText: {
    color: '#FFD700',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1.5,
    borderTopColor: '#000000',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  sendButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 11,
  },
});
