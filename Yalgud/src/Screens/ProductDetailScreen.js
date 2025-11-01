import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;

const fallbackImage = 'https://via.placeholder.com/300x250.png?text=No+Image';

// ✅ Toast Component
const Toast = ({ visible, message, opacity }) => {
  if (!visible) return null;
  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const ProductDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { product } = route.params;

  const productTypes = [
    {
      id: 'f1',
      name: 'Mango Shrikhand',
      image: product.thumbnail
        ? { uri: product.thumbnail }
        : { uri: fallbackImage },
      variants: [
        { id: 'v1', size: '25g', price: 20, mrp: 25 },
        { id: 'v2', size: '50g', price: 35, mrp: 40 },
        { id: 'v3', size: '100g', price: 60, mrp: 70 },
      ],
    },
    {
      id: 'f2',
      name: 'Elaichi Shrikhand',
      image: product.thumbnail
        ? { uri: product.thumbnail }
        : { uri: fallbackImage },
      variants: [
        { id: 'v4', size: '25g', price: 22, mrp: 28 },
        { id: 'v5', size: '50g', price: 38, mrp: 45 },
        { id: 'v6', size: '100g', price: 65, mrp: 75 },
      ],
    },
    {
      id: 'f3',
      name: 'Kesar Shrikhand',
      image: product.thumbnail
        ? { uri: product.thumbnail }
        : { uri: fallbackImage },
      variants: [
        { id: 'v7', size: '25g', price: 30, mrp: 35 },
        { id: 'v8', size: '50g', price: 55, mrp: 65 },
      ],
    },
  ];

  // ✅ Manage quantities
  const [quantities, setQuantities] = useState({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ Toast logic
  const showToast = message => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 2000);
    });
  };

  // ✅ Handle Qty Input
  const onChangeQty = (id, val) => {
    const filtered = val.replace(/[^0-9]/g, '');
    let qtyNum = parseInt(filtered, 10);

    if (filtered === '') {
      setQuantities(prev => ({ ...prev, [id]: '' }));
      return;
    }
    if (isNaN(qtyNum) || qtyNum < 1) qtyNum = 1;
    if (qtyNum > 999) qtyNum = 999;

    setQuantities(prev => ({ ...prev, [id]: qtyNum.toString() }));

    if (qtyNum === 10) {
      showToast(`🎉 Offer unlocked for 10+ packs!`);
    }
  };

  // ✅ Cancel Action
  const handleCancel = () => {
    Alert.alert('Clear All?', 'This will reset all selections.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          setQuantities({});
          setSelectedItem(null);
          setModalVisible(false);
          showToast('❌ Selections cleared');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: scale(120) }}>
        {/* ✅ Main Product */}
        <Image
          source={{ uri: product.thumbnail || fallbackImage }}
          style={styles.mainImage}
        />
        <Text style={styles.mainTitle}>{product.name?.en || 'Shrikhand'}</Text>

        {/* ✅ Types + Variants */}
        {productTypes.map(type => (
          <View key={type.id}>
            <Text style={styles.sectionTitle}>{type.name}</Text>
            {type.variants.map(variant => {
              const qtyStr = quantities[variant.id] || '';
              const qtyNum = parseInt(qtyStr, 10) || 0;
              const itemSavings = qtyNum * (variant.mrp - variant.price);
              const isSelected = selectedItem?.id === variant.id;

              return (
                <TouchableOpacity
                  key={variant.id}
                  onPress={() => {
                    setSelectedItem({ ...variant, parent: type });
                    setModalVisible(true);
                  }}
                  style={[
                    styles.card,
                    isSelected && { borderColor: '#2563EB', borderWidth: 2 },
                  ]}
                >
                  <Image source={type.image} style={styles.image} />
                  <View style={styles.infoSection}>
                    <View style={styles.topRow}>
                      <Text style={styles.name}>
                        {variant.size} – ₹{variant.price}
                      </Text>
                      {qtyNum >= 1 && (
                        <View style={styles.greenPill}>
                          <Text style={styles.greenPillText}>
                            ₹{itemSavings}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={styles.label}>Qty:</Text>
                      <TextInput
                        keyboardType="number-pad"
                        value={qtyStr}
                        onChangeText={val => onChangeQty(variant.id, val)}
                        style={styles.qtyInput}
                        maxLength={3}
                        placeholder="0"
                        placeholderTextColor="#999"
                      />
                      <Text style={styles.priceText}>
                        ₹{qtyNum * variant.price} / {variant.mrp} ₹
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* ✅ Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        opacity={toastOpacity}
      />

      {/* ✅ Bottom Buttons */}
      <View style={styles.bottomButtonRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.cancelBtn]}
          onPress={handleCancel}
        >
          <Text style={styles.actionButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.saveBtn]}
          onPress={() => showToast('✅ Saved selections!')}
        >
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Modal Preview */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Image
                  source={selectedItem.parent.image}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>
                  {selectedItem.parent.name} – {selectedItem.size}
                </Text>
                <Text style={styles.modalPrice}>
                  Price: ₹
                  {(parseInt(quantities[selectedItem.id], 10) || 0) *
                    selectedItem.price}
                </Text>
                <Text style={styles.modalMRP}>MRP: {selectedItem.mrp} ₹</Text>
                <Text style={styles.modalSave}>
                  Savings: ₹
                  {(parseInt(quantities[selectedItem.id], 10) || 0) *
                    (selectedItem.mrp - selectedItem.price)}
                </Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  mainImage: {
    width: SCREEN_WIDTH * 0.9,
    height: 250,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginLeft: 16,
    color: '#222',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: scale(16),
    borderRadius: scale(12),
    padding: scale(12),
    alignItems: 'flex-start',
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  image: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(6),
    resizeMode: 'contain',
  },
  infoSection: { flex: 1, marginLeft: scale(12) },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: scale(16), fontWeight: 'bold', flex: 1, color: '#111' },
  greenPill: {
    backgroundColor: '#15803D',
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    borderRadius: scale(20),
    marginRight: scale(6),
  },
  greenPillText: { color: '#fff', fontWeight: '600', fontSize: scale(12) },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(10),
  },
  label: { fontSize: scale(14), fontWeight: '600', marginRight: scale(4) },
  qtyInput: {
    borderWidth: 1,
    borderColor: '#999',
    width: scale(60),
    height: scale(36),
    paddingHorizontal: scale(8),
    borderRadius: scale(8),
    fontSize: scale(16),
    color: '#222',
    textAlign: 'center',
    marginRight: scale(12),
  },
  priceText: { fontSize: scale(15), fontWeight: 'bold', color: '#333' },
  toastContainer: {
    position: 'absolute',
    bottom: scale(130),
    left: scale(40),
    right: scale(40),
    backgroundColor: '#111827',
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    borderRadius: scale(25),
    alignItems: 'center',
    zIndex: 100,
    elevation: 5,
  },
  toastText: { color: '#FBBF24', fontSize: scale(15), fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: scale(16),
    padding: scale(20),
    width: '80%',
    alignItems: 'center',
  },
  modalImage: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(8),
    marginBottom: scale(10),
  },
  modalTitle: { fontSize: scale(18), fontWeight: 'bold', marginBottom: 6 },
  modalPrice: { fontSize: scale(16), color: '#051f9a', marginBottom: 4 },
  modalMRP: { fontSize: scale(14), color: '#5e6172', marginBottom: 4 },
  modalSave: { fontSize: scale(14), color: '#439512', marginBottom: 10 },
  closeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: scale(8),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
  },
  bottomButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: scale(20),
    paddingHorizontal: scale(12),
  },
  actionButton: {
    flex: 1,
    marginHorizontal: scale(5),
    paddingVertical: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    elevation: 4,
  },
  saveBtn: { backgroundColor: '#2563EB' },
  cancelBtn: { backgroundColor: '#d9534f' },
  actionButtonText: { color: '#fff', fontSize: scale(15), fontWeight: 'bold' },
});

export default ProductDetailScreen;
