import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {addtocart} from '../ACTIONS';
import {useSelector, useDispatch} from 'react-redux';
import SearchBar from './SearchBar';
import {COLORS, FONTS, SIZES, images, icons} from '../constants';
import axios from 'axios';
import { API_HOST } from '../myenv';


const BookScreen = ({route}) => {
  const {categoryId} = route.params;
  const [books, setBooks] = useState([]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartData = useSelector((state) => state.reducer);
  const [cartItems,setCartItems]=useState(0)
  const [addedToCart, setAddedToCart] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [booksData, setBooksData] = useState([]);

  const goToCart = () => {
    navigation.navigate('ShoppingCart');
  };

  useEffect(() => {
    // Simulate fetching books based on the selected category ID
    const filteredBooks = booksData.filter(book => book.category_id === categoryId);
    setBooks(filteredBooks);
    
    // Replace the hardcoded booksData with API call below:
    axios.get(`${API_HOST}/api/books`, {
      params: {
        category_id: categoryId
      }
    })
    .then(response => {
      const data = response.data;
      setBooks(data); // Assuming API returns an array of books similar to booksData format
    })
    .catch(error => {
      console.error("Error fetching books:", error);
      // Handle error case
    });
  }, [categoryId]); // Ensure categoryId is in the dependency array


  const navigateToBookDetail = (book) => {
    // Pass book details to BookDetail route
    navigation.navigate('BookInsight', { book });
  };


  useEffect(() => {
      if (cartData) {
       setCartItems(cartData.length);
      }
   }, [cartData]);
    useEffect(() => {
      // Initialize addedToCart state based on cartData
      if (cartData) {
        const updatedAddedToCart = {};
        cartData.forEach(item => {
          updatedAddedToCart[item.title] = true;
        });
        setAddedToCart(updatedAddedToCart);
      }
    }, [cartData]);

    const handleAddtoCart = (item) => {
      if (addedToCart[item.title]) {
        // If already added to cart, remove it
        // Dispatch action to remove item from cart
      } else {
        // If not added to cart, add it
        dispatch(addtocart(item));
        setCartItems(prevCartItems => prevCartItems + 1); // update cart items count
      }
    };

  const handleSearch = query => {
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    console.log("Query: ", query);
    console.log("Category: ",categoryId);
    axios
      .get(`${API_HOST}/api/books/search`, {
      params: {
        title: query, 
        category_id: categoryId, 
      }
      })
      .then(response => {
        const data = response.data;
        setSearchResults(data);
        setBooksData(data);
            })
        .catch(error => {
        console.error('Error searching books:', error);
        console.log('Server response:', error.response.data);
            });
        // Fallback to client-side filtering if API call fails
        const filteredBooks = books.filter(
          book =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredBooks);
        setBooksData(filteredBooks);
      };

  const getImageSource = (icon) => {
    return { uri: `${API_HOST}/storage/${icon}` }; // Adjusted to match your API structure
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookContainer} onPress={() => navigateToBookDetail(item)}>
      <View style={styles.imageContainer}>
        <Image source={getImageSource(item.path)} resizeMode="cover" style={styles.bookImage} />
      </View>
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.author}>By: {item.author}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
        {item.disc && (
              <View style={styles.discountContainer}>
                <Text style={styles.discountText}>{item.disc}%Off</Text>
              </View>
            )}
        <Button
          onPress={() => handleAddtoCart(item)}
          color='black'
          title={addedToCart[item.title] ? 'Added to Cart' : 'ADD TO CART'}
          disabled={addedToCart[item.title]}
          style={styles.addButton}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchBar style={{position: 'absolute', top: '20px'}} onSearch={handleSearch} />
      <TouchableOpacity style={{ height: 30, position: 'absolute', zIndex: 9999, top: 100,}} onPress={goToCart}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={icons.bookmark_icon}
        resizeMode="contain"
        style={{ width: 45, height: 40 }}
      />
      <Text style={{ fontFamily: 'PlayfairDisplay-Bold', color: 'black', marginRight: 10, fontSize: 15 }}>{cartItems}</Text>
    </View>
  </TouchableOpacity>
      <FlatList
        data={isSearching ? searchResults : books}
        keyExtractor={item => item.book_id.toString()}
        renderItem={renderBookItem}
        contentContainerStyle={styles.bookList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bookList: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginTop: 100,
  },
  bookContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  bookDetails: {
    flex: 1,
    marginLeft: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black', // Updated color to enhance readability
  },
  price: {
    fontSize: SIZES.body3,
    fontFamily: 'PlayfairDisplay-Bold',
    color: COLORS.black,
    marginBottom: 5,
},
  author: {
    fontSize: 14,
    color: '#666',
  },
  discountContainer: {
    position: 'absolute',
    top: 1,
    right: 5,
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
});

export default BookScreen;