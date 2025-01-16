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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

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
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set()); // Track selected items
  const [quantity, setQuantity] = useState<string>(''); // State for tracking quantity input
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [instructions, setInstructions] = useState<string>(''); // State for additional instructions
  const translateY = useRef(new Animated.Value(0)).current;

  // Function to send messages to the bot
  const sendMessage = () => {
    if (quantity.trim()) {
      const timestamp = new Date().toLocaleTimeString();
      const newMessage: Message = { id: Date.now().toString(), text: quantity, type: 'user', timestamp };

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
      setQuantity('');
    }
  };

  // Function to handle selecting products from the carousel
  const handleCheckboxChange = (index: number) => {
    const newSelectedImages = new Set(selectedImages);
    if (newSelectedImages.has(index)) {
      newSelectedImages.delete(index);
    } else {
      newSelectedImages.add(index);
    }
    setSelectedImages(newSelectedImages);
  };

  // Function to handle user replies
  const handleQuickReply = (reply: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const botMessage: Message = {
      id: Date.now().toString(),
      text: `Bot: You selected "${reply}"`,
      type: 'bot',
      timestamp,
    };
    setMessages(prevMessages => [botMessage, ...prevMessages]);

    if (reply.toLowerCase() === 'create order') {
      const botMessageForItems = {
        id: Date.now().toString(),
        text: 'Bot: Here are some items you can order. Please select one.',
        type: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmCy16nhIbV3pI1qLYHMJKwbH2458oiC9EmA&s',
          'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=600',
          'https://gratisography.com/wp-content/uploads/2024/11/gratisography-cool-sphere-1170x780.jpg',
        ],
      };
      setMessages(prevMessages => [botMessageForItems, ...prevMessages]);
    }
  };

  // Function to handle order steps (quantity, date, instructions, etc.)
  const handleOrder = (step: string, response: string) => {
    const timestamp = new Date().toLocaleTimeString();

    if (step === 'quantity') {
      setOrderDetails({ ...orderDetails, quantity: response });
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Bot: You selected a quantity of ${response}. Do you have a preferred delivery date?`,
        type: 'bot',
        timestamp,
      };
      setMessages(prevMessages => [botMessage, ...prevMessages]);
    } else if (step === 'date') {
      setOrderDetails({ ...orderDetails, deliveryDate: response });
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Bot: You selected ${response} for delivery. Any special instructions?`,
        type: 'bot',
        timestamp,
      };
      setMessages(prevMessages => [botMessage, ...prevMessages]);
    } else if (step === 'instructions') {
      setOrderDetails({ ...orderDetails, instructions: response });
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Bot: You added the following instructions: "${response}". Confirm your order: ${orderDetails.quantity} of selected items for delivery on ${orderDetails.deliveryDate}.`,
        type: 'bot',
        timestamp,
      };
      setMessages(prevMessages => [botMessage, ...prevMessages]);
    }
  };

  // Function to handle the date change from the DateTimePicker
  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString();
      handleOrder('date', formattedDate);
    }
  };

  // Function to render product images as a carousel with checkboxes
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

  useEffect(() => {
    if (messages.length === 0) {
      const initialMessage = {
        id: Date.now().toString(),
        text: 'Bot: Hi! How can I help you today? Do you want to create an order or check order status?',
        type: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([initialMessage]);
    }
  }, [messages]);

  // Effect to handle the flow once the product is selected and the user has been prompted to enter quantity
  useEffect(() => {
    if (selectedImages.size > 0 && messages.length > 0 && messages[0].text.includes('select one')) {
      const quantityPromptMessage = {
        id: Date.now().toString(),
        text: 'Bot: Please select the quantity of the selected item(s).',
        type: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prevMessages => [quantityPromptMessage, ...prevMessages]);
    }
  }, [selectedImages]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar animated={true} backgroundColor="blue" />

      <View style={styles.headerView}>
        <Icon name="bars" iconStyle="solid" size={20} color="#fff" />
        <Text style={styles.headerText}>Order System</Text>
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

            {/* Show dropdown for quantity selection inside bot message */}
            {item.type === 'bot' && item.text.includes('quantity') && (
              <View>
                <Picker
                  selectedValue={quantity}
                  onValueChange={(itemValue) => setQuantity(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                  <Picker.Item label="4" value="4" />
                  <Picker.Item label="5" value="5" />
                </Picker>
              </View>
            )}

            {/* Show carousel images if present */}
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
                keyExtractor={(index) => `image-${index}`}
                style={styles.carouselList}
              />
            )}

            <Text style={[styles.timestampText, item.type === 'user' && styles.rightAlignText]}>
              {item.timestamp}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id + '-' + item.timestamp + '-' + new Date().getMilliseconds()}  // Make the key unique by combining id and timestamp
        inverted
      />

      <View style={styles.quickReplies}>
        <TouchableOpacity onPress={() => handleQuickReply('Create Order')}>
          <View style={styles.quickReplyButton}>
            <Text style={styles.quickReplyText}>Create Order</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleQuickReply('Check Order Status')}>
          <View style={styles.quickReplyButton}>
            <Text style={styles.quickReplyText}>Check Order Status</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        {/* Additional Instructions Input */}
        <TextInput
          style={styles.input}
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Enter additional instructions"
        />
        <Button title="Send" onPress={() => handleOrder('instructions', instructions)} />
        <Button title="Pick Delivery Date" onPress={() => setShowDatePicker(true)} />
      </View>

      {/* Date Time Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          is24Hour={true}
          onChange={handleDateChange}
        />
      )}
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
  picker: {
    // height: 150,  // Increase the height for better visibility
    width: '100%', // Full width of the screen
    backgroundColor: '#fff', // Add background color to make it visible
    borderRadius: 10,  // Optional: add rounded corners for style
    marginTop: 10,
  },
  quickReplies: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  quickReplyButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 25,
  },
  quickReplyText: {
    color: 'white',
    fontSize: 16,
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
    textAlign: 'right',
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
