import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';

const AddToCartScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  const item = route?.params?.item || {};
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const handleQuantityChange = value => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) setQuantity(num);
  };

  const total = (item?.SalesRate || 0) * quantity;

  const handleAddToCart = () => {
    if (!item || !item.ItemCode) {
      Alert.alert('Error', 'Item details not found!');
      return;
    }

    dispatch(addToCart({ product: { ...item }, quantity }));

    // 🔔 Show confirmation modal
    setShowModal(true);
  };

  const handleYes = () => {
    setShowModal(false);
    navigation.navigate('TemplateScreen', { product: item });
  };

  const handleNo = () => {
    setShowModal(false);
    Alert.alert('Saved', 'Item added to cart successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add to Cart</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ===== ITEM CARD ===== */}
      <TouchableOpacity style={styles.card} onPress={() => setShowModal(true)}>
        <Text style={styles.itemName}>{item?.ItemNameEnglish || 'N/A'}</Text>
        <Text style={styles.itemSub}>{item?.ItemName || ''}</Text>
        <Text style={styles.itemCode}>Code: {item?.ItemCode || '-'}</Text>
        <Text style={styles.itemRate}>
          Sales Rate: ₹{item?.SalesRate?.toFixed(2) || '0.00'}
        </Text>
      </TouchableOpacity>

      {/* ===== QUANTITY INPUT ===== */}
      <View style={styles.qtyContainer}>
        <Text style={styles.qtyLabel}>Enter Quantity:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity.toString()}
          onChangeText={handleQuantityChange}
        />
      </View>

      {/* ===== TOTAL BOX ===== */}
      <View style={styles.totalBox}>
        <Text style={styles.totalText}>Total: ₹{total.toFixed(2)}</Text>
      </View>

      {/* ===== ADD BUTTON ===== */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <Ionicons name="cart-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>

      {/* ===== CONFIRMATION MODAL ===== */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="save-outline" size={45} color="#4A90E2" />
            <Text style={styles.modalTitle}>Save as a Template?</Text>
            <Text style={styles.modalMessage}>
              Do you want to save this item as a reusable template?
            </Text>

            <View style={styles.modalButtonRow}>
              <Pressable style={[styles.modalButton, styles.noButton]} onPress={handleNo}>
                <Text style={styles.noText}>No</Text>
              </Pressable>

              <Pressable style={[styles.modalButton, styles.yesButton]} onPress={handleYes}>
                <Text style={styles.yesText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },

  header: {
    height: 60,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 50,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 15,
    padding: 15,
    elevation: 3,
  },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  itemSub: { fontSize: 15, color: '#666', marginTop: 2 },
  itemCode: { fontSize: 13, color: '#007AFF', marginTop: 5 },
  itemRate: { fontSize: 15, color: '#2E7D32', fontWeight: '600', marginTop: 6 },

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
  },
  qtyLabel: { fontSize: 16, color: '#333', fontWeight: '600', flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    width: 80,
    fontSize: 16,
    textAlign: 'center',
  },
  totalBox: {
    margin: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32' },
  addButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    borderRadius: 10,
    paddingVertical: 12,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },

  // ===== MODAL STYLES =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  yesButton: { backgroundColor: '#4A90E2' },
  noButton: { backgroundColor: '#E0E0E0' },
  yesText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  noText: { color: '#333', fontWeight: '600', fontSize: 16 },
});

export default AddToCartScreen;
