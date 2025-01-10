import Icon from '@react-native-vector-icons/fontawesome6';
import React, { useState, useRef } from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Image,
  TouchableOpacity,
} from 'react-native';

interface Message {
  id: string;
  text: string;
  type: string;
  timestamp: string;
  images?: string[]; // Optional property to hold image URLs
}

interface CarouselItemProps {
  item: string;
  index: number;
  onCheckboxChange: (index: number) => void; // Callback to handle checkbox change
  isSelected: boolean;
}

function App(): React.JSX.Element {
  // State to store messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set()); // Track selected images
  const translateY = useRef(new Animated.Value(0)).current; // Initial position (no translation)

  // Function to handle sending a message
  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString(); // Get current timestamp

      const newMessage: Message = { id: Date.now().toString(), text: message, type: 'user', timestamp };

      // Animate the user message bubble (slide in from the input area)
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10, // Slight upward slide
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0, // Return to final position
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setMessages([newMessage, ...messages]);  // Prepend message to the list
      setMessage('');  // Clear input field

      setTimeout(() => {
        // Simulate bot reply with carousel images
        const botMessage: Message = {
          id: Date.now().toString(),
          text: `Bot: Here's a carousel of images for you!`,
          type: 'bot',
          timestamp,
          images: [
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmCy16nhIbV3pI1qLYHMJKwbH2458oiC9EmA&s',
            'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=600',
            'https://gratisography.com/wp-content/uploads/2024/11/gratisography-cool-sphere-1170x780.jpg',
          ],
        };
        setMessages(prevMessages => [botMessage, ...prevMessages]); // Prepend bot message
      }, 1000);
    }
  };

  // Function to handle checkbox state change
  const handleCheckboxChange = (index: number) => {
    const newSelectedImages = new Set(selectedImages);
    if (newSelectedImages.has(index)) {
      newSelectedImages.delete(index); // If image is already selected, unselect it
    } else {
      newSelectedImages.add(index); // Otherwise, select it
    }
    setSelectedImages(newSelectedImages); // Update selected images state
  };

  // Function to render carousel item (image)
  const renderCarousel = ({ item, index, onCheckboxChange, isSelected }: CarouselItemProps) => {
    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => onCheckboxChange(index)}>
          <Image source={{ uri: item }} style={styles.carouselImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkbox, isSelected && styles.selectedCheckbox]}
          onPress={() => onCheckboxChange(index)}
        >
          <Text style={styles.checkboxText}>{isSelected ? '✔' : ''}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar animated={true} backgroundColor="blue" />

      <View style={styles.headerView}>
        <Icon name="bars" iconStyle="solid" size={20} color="#fff" />
        <Text style={styles.headerText}>Chat Application!</Text>
        <Icon name="share" iconStyle="solid" size={20} color="#fff" />
      </View>

      <FlatList
        style={{ paddingLeft: 5, paddingRight: 5 }}
        data={messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.type === 'bot' ? styles.botMessage : styles.userMessage,
            ]}
          >
            <Text style={[styles.senderText, item.type === 'user' && styles.rightAlignText]}>
              {item.type === 'user' ? 'You' : 'Bot'}
            </Text>
            <Text style={[styles.messageText, item.type === 'user' && styles.rightAlignText]}>
              {item.text}
            </Text>

            {/* Render image carousel for bot messages */}
            {item.type === 'bot' && item.images && (
            <FlatList
              data={item.images}
              renderItem={({ item, index }) =>
                renderCarousel({
                  item,
                  index,
                  onCheckboxChange: handleCheckboxChange,
                  isSelected: selectedImages.has(index),
                })
              }
              horizontal={true}
              key={Math.random()}
            />)}

            <Text style={[styles.timestampText, item.type === 'user' && styles.rightAlignText]}>
              {item.timestamp}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        inverted // To show the latest message at the bottom
      />

      {/* Input field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          multiline={true}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f4f4f9',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingLeft: 10,
    marginRight: 10,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 25,
    maxWidth: '80%',
    marginTop: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  userMessage: {
    backgroundColor: '#0066cc',
    alignSelf: 'flex-end', // Align user messages to the right
    borderTopRightRadius: 0, // Create a modern rounded effect
  },
  botMessage: {
    backgroundColor: '#e521e5',
    alignSelf: 'flex-start', // Align bot messages to the left
    borderTopLeftRadius: 0, // Modernize bot bubbles
  },
  messageText: {
    fontSize: 16,
    color: '#fff', // Change text color for visibility
    marginVertical: 5,
  },
  senderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.8,
  },
  timestampText: {
    fontSize: 10,
    color: '#ccc',
    textAlign: 'right',
    marginTop: 5,
  },
  rightAlignText: {
    textAlign: 'right', // Align text to the right
  },
  carouselContainer: {
    marginTop: 10,
  },
  carouselImage: {
    width: 150,
    height: 150,
    marginRight: 10,
    borderRadius: 10,
  },
  headerView: {
    backgroundColor: '#007bff',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  checkbox: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10, // Fixed padding to prevent squeezing
    borderRadius: 20,
    width: 24, // Fixed width
    height: 24, // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    backgroundColor: 'rgba(0, 255, 0, 0.5)', // Highlight when selected
  },
  checkboxText: {
    fontSize: 18,
    color: 'black',
  },
});

export default App;
