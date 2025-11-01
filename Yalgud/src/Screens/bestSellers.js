import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, incrementQty, decrementQty } from '../../redux/cartSlice';

const { width, height } = Dimensions.get('window');

const bestSellers = [
  {
    id: '1',
    name: 'Fresh Bread',
    price: 40,
    desc: 'Soft & fresh bread baked daily.',
    image: require('../Images/bread1.jpg'),
  },
  {
    id: '2',
    name: 'Crispy Khari',
    price: 60,
    desc: 'Crispy & crunchy khari delight.',
    image: require('../Images/khari.jpg'),
  },
  {
    id: '3',
    name: 'Pure Milk',
    price: 50,
    desc: 'Farm fresh milk every morning.',
    image: require('../Images/milk500.jpg'),
  },
];

export default function BestSellerScreen({ navigation }) {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const renderProduct = ({ item }) => {
    const quantity = cartItems[item.id]?.quantity || 0;

    return (
      <View style={styles.productCard}>
        <Image source={item.image} style={styles.productImage} />

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDesc}>{item.desc}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>₹{item.price}</Text>

            {quantity > 0 ? (
              <View style={styles.quantityBox}>
                <TouchableOpacity
                  onPress={() => dispatch(decrementQty(item.id))}
                  style={styles.qtyButton}
                >
                  <Ionicons name="remove" size={16} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => dispatch(incrementQty(item.id))}
                  style={styles.qtyButton}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => dispatch(addToCart({ product: item }))}
                style={styles.cartButton}
              >
                <Ionicons name="cart" size={18} color="#fff" />
                <Text style={styles.cartButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.badge}>
          <Ionicons name="star" size={14} color="#fff" />
          <Text style={styles.badgeText}> Best Seller</Text>
        </View>
      </View>
    );
  };

  const totalItems = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalPrice = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Best Sellers</Text>
      <Text style={styles.subtitle}>
        Yalgyud Dairy’s Fresh & Trusted Products
      </Text>

      <FlatList
        data={bestSellers}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: width * 0.04, paddingBottom: 120 }}
      />

      {totalItems > 0 && (
        <View style={styles.bottomCart}>
          <Text style={styles.bottomCartText}>
            🛒 {totalItems} item{totalItems > 1 ? 's' : ''} | ₹{totalPrice}
          </Text>
          <TouchableOpacity
            style={styles.bottomCartBtn}
            onPress={() => navigation.navigate('AddToCartScreen')}
          >
            <Text style={styles.bottomCartBtnText}>Go to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8CC3E2' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 55,
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
    marginTop: 6,
    marginLeft: 16,
    fontWeight: '500',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    position: 'relative',
  },
  productImage: {
    width: width * 0.28,
    height: height * 0.16,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  productDesc: { fontSize: 13, color: '#666', marginVertical: 4 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#FF6B6B' },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A197E8',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 25,
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A237E',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyButton: { backgroundColor: '#9F94E0', borderRadius: 50, padding: 5 },
  qtyText: {
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 10,
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6A1B9A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  bottomCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    elevation: 10,
  },
  bottomCartText: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  bottomCartBtn: {
    backgroundColor: '#1A237E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  bottomCartBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
