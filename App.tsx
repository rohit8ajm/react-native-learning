import Icon from '@react-native-vector-icons/fontawesome6';
import React, { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const translateY = useRef(new Animated.Value(0)).current;

  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      const newMessage: Message = { id: Date.now().toString(), text: message, type: 'user', timestamp };

      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      setMessages([newMessage, ...messages]);
      setMessage('');
    }
  };

  const handleCheckboxChange = (index: number) => {
    const newSelectedImages = new Set(selectedImages);
    if (newSelectedImages.has(index)) {
      newSelectedImages.delete(index);
    } else {
      newSelectedImages.add(index);
    }
    setSelectedImages(newSelectedImages);
  };

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

  // Simulate bot reply with carousel images when a user sends a message
  useEffect(() => {
    if (messages && messages[0] && messages[0].type === 'user' && messages[0].text.toLowerCase().includes("image")) {
      const timestamp = new Date().toLocaleTimeString();
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
      setMessages(prevMessages => [botMessage, ...prevMessages]);
    } else if(messages && messages[0] && messages[0].type === 'user'){
      const timestamp = new Date().toLocaleTimeString();
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Bot: ${messages[0].text}`,
        type: 'bot',
        timestamp,

      };
      setMessages(prevMessages => [botMessage, ...prevMessages]);
    }
  }, [messages]);

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
            style={[styles.messageContainer, item.type === 'bot' ? styles.botMessage : styles.userMessage]}
          >
            <Text style={[styles.senderText, item.type === 'user' && styles.rightAlignText]}>
              {item.type === 'user' ? 'You' : 'Bot'}
            </Text>
            <Text style={[styles.messageText, item.type === 'user' && styles.rightAlignText]}>
              {item.text}
            </Text>

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
                keyExtractor={(item, index) => `${index}`} // Stable key based on index
                style={styles.carouselList}
              />
            )}

            <Text style={[styles.timestampText, item.type === 'user' && styles.rightAlignText]}>
              {item.timestamp}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        inverted
      />

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
    elevation: 3,
  },
  userMessage: {
    backgroundColor: '#0066cc',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  botMessage: {
    backgroundColor: '#e521e5',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
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
  carouselList: {
    maxHeight: 150, // Ensure carousel images don't elongate the message
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
    padding: 10,
    borderRadius: 20,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckbox: {
    backgroundColor: 'rgba(0, 255, 0, 0.5)',
  },
  checkboxText: {
    fontSize: 18,
    color: 'black',
  },
});

export default App;
