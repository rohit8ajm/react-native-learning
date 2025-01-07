
import Icon from '@react-native-vector-icons/fontawesome6';
import React, { useState } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  type: string;
}

function App(): React.JSX.Element {

  // State to store messages
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState<string>('');

  // Function to handle sending a message
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = { id: Date.now().toString(), text: message, type: "user" };
      setMessages([newMessage, ...messages]);  // Prepend message to the list
      setMessage('');  // Clear input field

      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Bot: ${message}`, // Bot echoes user message
          type: 'bot'
        };
        setMessages(prevMessages => [botMessage, ...prevMessages]); // Prepend bot message
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        animated={true}
        backgroundColor="blue"
      />

      <View style={styles.headerView}>
        <Icon name='bars' iconStyle='solid' size={20} color="#fff" />
        <Text style={styles.headerText}>Chat Application!</Text>
        <Icon name='share' iconStyle='solid' size={20} color="#fff" />
      </View>

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.type === "bot" ? styles.botMessage : styles.userMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={item => item.id}
        inverted // To show the latest message at the bottom
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingLeft: 10,
    marginRight: 10,
  },
  messageContainer: {
    padding: 10,
    marginBottom: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#d1e7fd',
    alignSelf: 'flex-end', // Align user messages to the right
  },
  botMessage: {
    backgroundColor: '#e5e5e5',
    alignSelf: 'flex-start', // Align bot messages to the left
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    flexWrap: 'wrap'
  },
  headerView: {
    backgroundColor: 'blue',
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerText: {
    color: "white",
    fontWeight: 'bold',
    fontSize: 15
  },
});

export default App;
