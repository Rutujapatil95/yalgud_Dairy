import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice'; 


const { width } = Dimensions.get('window');
const scale = size => (width / 375) * size;

const breadDataSets = [
  [
    { id: '1', name: 'Milk Bread 100gm', price: 30 },
    { id: '2', name: 'Special Bread 300gm', price: 45 },
  ],
  [
    { id: '3', name: 'Brown Bread 400gm', price: 50 },
    { id: '4', name: 'Butter Bread 250gm', price: 40 },
  ],
  [
    { id: '5', name: 'Wheat Bread 500gm', price: 60 },
    { id: '6', name: 'Fruit Bread 300gm', price: 55 },
  ],
];

const BreadListScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(0);
  const [products, setProducts] = useState(
    breadDataSets.map(set => set.map(item => ({ ...item, quantity: '' })))
  );
  const [offerMsg, setOfferMsg] = useState('');
  const [offerAnim] = useState(new Animated.Value(0));
  const [showGoToCart, setShowGoToCart] = useState(false);

  
  const showOffer = (message) => {
    setOfferMsg(message);
    Animated.sequence([
      Animated.timing(offerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(offerAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setOfferMsg(''));
  };

  const updateQuantity = (pageIndex, id, qty) => {
    const sanitizedQty = qty.replace(/[^0-9]/g, '');
    setProducts(prev =>
      prev.map((page, i) =>
        i === pageIndex
          ? page.map(item =>
              item.id === id ? { ...item, quantity: sanitizedQty } : item
            )
          : page
      )
    );

    const quantity = parseInt(sanitizedQty);
    if (quantity > 0) {
      const selectedItem = products[pageIndex].find(item => item.id === id);
      if (selectedItem) {
        const totalPrice = selectedItem.price * quantity;

        // 🔹 Offer message logic
        if (totalPrice < 100) {
          const needed = Math.ceil((100 - totalPrice) / selectedItem.price);
          showOffer(`🎁 Add ${needed} more ${needed > 1 ? 'items' : 'item'} to unlock ₹100 offer!`);
        } else {
          showOffer('🎉 Congratulations! You unlocked a special offer!');
        }

        const itemToAdd = {
          ...selectedItem,
          quantity: quantity,
        };

        // ✅ Add to Redux
        dispatch(addToCart({ product: itemToAdd, quantity }));

        // ✅ Show "Go to Cart" prompt
        setShowGoToCart(true);
      }
    } else {
      setShowGoToCart(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.itemRow}>
        <Text style={styles.productName}>{item.name}</Text>

        <View style={styles.qtyContainer}>
          <Text style={styles.qtyLabel}>Qty</Text>
          <TextInput
            style={styles.input}
            value={item.quantity}
            onChangeText={text => updateQuantity(currentPage, item.id, text)}
            keyboardType="numeric"
            maxLength={3}
            placeholder="0"
            placeholderTextColor="#999"
          />
          <Text style={styles.price}>₹ {item.price}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(22)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Bread Product List</Text>
        <View style={{ width: scale(22) }} />
      </View>

      <Text style={styles.pageIndicator}>
        Page {currentPage + 1} / {products.length}
      </Text>

      {/* Offer Message */}
      {offerMsg ? (
        <Animated.View
          style={[
            styles.offerBanner,
            {
              opacity: offerAnim,
              transform: [
                {
                  translateY: offerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="gift-outline" size={scale(18)} color="#fff" />
          <Text style={styles.offerText}>{offerMsg}</Text>
        </Animated.View>
      ) : null}

      {/* Product List */}
      <FlatList
        data={products[currentPage]}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Go to Cart Banner */}
        {showGoToCart && (
          <TouchableOpacity
            style={styles.goToCartBanner}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AddToCartScreen')}
          >
            <Ionicons name="cart-outline" size={scale(22)} color="#fff" />
            <Text style={styles.goToCartText}>Go to Cart to checkout</Text>
            <Ionicons name="arrow-forward" size={scale(20)} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Pagination Buttons */}
        <View style={styles.arrowRow}>
          <TouchableOpacity
            disabled={currentPage === 0}
            onPress={() => setCurrentPage(p => Math.max(p - 1, 0))}
            style={[styles.arrowButton, currentPage === 0 && { opacity: 0.4 }]}
          >
            <Ionicons name="chevron-back-circle" size={scale(45)} color="#056BF1" />
          </TouchableOpacity>

          <TouchableOpacity
            disabled={currentPage === products.length - 1}
            onPress={() => setCurrentPage(p => Math.min(p + 1, products.length - 1))}
            style={[styles.arrowButton, currentPage === products.length - 1 && { opacity: 0.4 }]}
          >
            <Ionicons name="chevron-forward-circle" size={scale(45)} color="#056BF1" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// =================== STYLES ===================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: Platform.OS === 'ios' ? scale(20) : scale(30),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    marginBottom: scale(10),
  },
  backButton: { padding: scale(5) },
  header: {
    fontSize: scale(22),
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
  },
  pageIndicator: {
    textAlign: 'center',
    color: '#555',
    fontSize: scale(15),
    marginBottom: scale(10),
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: scale(8),
    paddingHorizontal: scale(14),
    borderRadius: scale(12),
    marginBottom: scale(10),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
  },
  offerText: {
    color: '#fff',
    fontSize: scale(14),
    marginLeft: scale(6),
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(150),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: scale(10),
    borderColor: '#DADADA',
    borderWidth: 1,
    paddingVertical: scale(14),
    paddingHorizontal: scale(18),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    flex: 1,
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  qtyLabel: {
    fontSize: scale(14),
    color: '#444',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: scale(8),
    width: scale(55),
    height: scale(42),
    textAlign: 'center',
    fontSize: scale(14),
    backgroundColor: '#F5F6FA',
    color: '#000',
  },
  price: {
    fontSize: scale(15),
    fontWeight: '700',
    color: '#222',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: scale(10),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  goToCartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#056BF1',
    marginBottom: scale(15),
    paddingVertical: scale(10),
    paddingHorizontal: scale(18),
    borderRadius: scale(20),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  goToCartText: {
    color: '#fff',
    fontSize: scale(15),
    fontWeight: '700',
    marginHorizontal: scale(8),
  },
  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  arrowButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BreadListScreen;
