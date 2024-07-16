import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONTS, SIZES } from "../constants";
import axios from "axios";
import { API_HOST } from "../myenv";

const BookDetail = ({ route, navigation }) => {
  const { book_id, booksData } = route.params; // Receive booksData from route params
  const [book, setBook] = useState(null);
  const [content, setContent] = useState(null);
  

  useEffect(() => {
    // Convert book_id to number (if necessary, ensure it's in the correct type)
    const parsedBookId = parseInt(book_id);
    console.log(parsedBookId);

    // Uncomment the following block and replace with API fetch for book details
    axios.get(`${API_HOST}/api/books/${parsedBookId}/content`)
    .then(response => {
      const data = response.data;
      setBook(data); // Set the fetched book to state

    // Assuming the API response structure is similar to fetchedContent below
    const fetchedContent = {
      book_id: parsedBookId,
      description: data.description, 
    };
    setContent(fetchedContent);
  })
  .catch(error => {
    console.error("Error fetching book details:", error);
    // Handle error case
  });

  }, [book_id]);

  // Function to navigate to PreviewScreen
  const handleShowPreview = () => {
    navigation.navigate('PreviewScreen', { content_id: book.content_id });
  };

  function renderBookDescription() {
    if (!book || !content) return null;

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{content.description}</Text>
        {/* Additional content details or actions */}
        <TouchableOpacity
          onPress={handleShowPreview}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            marginTop: 20,
            backgroundColor: COLORS.primary,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: COLORS.white, ...FONTS.body2 }}>Show Preview</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {renderBookDescription()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray4,
    padding: SIZES.padding * 2,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  descriptionTitle: {
    ...FONTS.h2,
    marginBottom: SIZES.padding,
  },
  descriptionText: {
    ...FONTS.body3,
    marginBottom: SIZES.padding * 2,
  },
});

export default BookDetail;
