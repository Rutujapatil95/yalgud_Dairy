import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
  BackHandler,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';

const ORDER_BASE_URL = 'http://192.168.1.11:8001';
const TEMPLATE_BASE_URL = 'http://192.168.1.11:8001';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = percent => (SCREEN_WIDTH * percent) / 100;
const hp = percent => (SCREEN_HEIGHT * percent) / 100;

const responsiveFont = f => {
  const scale = SCREEN_WIDTH / 375;
  const newSize = Math.round(f * scale);
  return Math.max(12, newSize);
};

const CheckoutScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { selectedItems = [] } = route.params || {};

  const [agentCode, setAgentCode] = useState(null);
  const [deptCode, setDeptCode] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCodes = async () => {
      try {
        const storedAgent = await AsyncStorage.getItem('agentCode');
        const storedDept = await AsyncStorage.getItem('deptCode');

        console.log('📥 Loaded Agent:', storedAgent);
        console.log('📥 Loaded Dept:', storedDept);

        setAgentCode(storedAgent || null);
        setDeptCode(storedDept || null);
      } catch (error) {
        console.log('❌ AsyncStorage Load Error:', error);
      }
    };

    loadCodes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const handleBack = () => {
        navigation.navigate('CategoryProductsScreen');
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBack,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const grandTotal = Number(
    selectedItems
      .reduce(
        (acc, item) =>
          acc + parseFloat(item.total || item.price * item.quantity || 0),
        0,
      )
      .toFixed(2),
  );

  const handleFinalOrder = async () => {
    if (!agentCode) {
      Alert.alert('Missing Agent', 'Agent Code not found in storage!');
      return;
    }

    if (!deptCode) {
      Alert.alert('Missing Dept', 'Dept Code not found in storage!');
      return;
    }

    setLoading(true);

    const items = selectedItems.map(i => ({
      itemCode: i.ItemCode?.toString(),
      quantity: i.quantity,
      itemName: i.ItemNameEnglish || i.ItemName,
      price: parseFloat(i.price),
      totalPrice: i.total || i.price * i.quantity,
      acceptedQuantity: i.quantity,
      status: 'Accepted',
    }));

    const payload = {
      agentCode,
      deptCode,
      route: deptCode,
      items,
      TotalOrder: grandTotal,
      status: 'Pending',
    };

    console.log(' FINAL ORDER PAYLOAD:', payload);

    try {
      await axios.post(`${ORDER_BASE_URL}/api/orders`, payload);

      setLoading(false);
      setShowPopup(false);

      Alert.alert(
        'Order Placed ✓',
        `Your order of ₹${grandTotal} has been placed.`,
        [
          {
            text: 'OK',
            onPress: () => {
              dispatch(clearCart());
              navigation.navigate('home', { agentCode, deptCode });
            },
          },
        ],
      );
    } catch (error) {
      setLoading(false);
      console.log('Order error:', error.response?.data || error);
      Alert.alert('Error', 'Failed to place order.');
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    if (!agentCode) {
      Alert.alert('Missing Agent', 'Agent Code not found.');
      return;
    }

    setLoading(true);

    const items = selectedItems.map(i => ({
      itemCode: i.ItemCode?.toString(),
      itemName: i.ItemNameEnglish || i.ItemName || 'Unknown',
      quantity: i.quantity,
      price: i.price,
    }));

    let resolvedType = 'template';
    if (templateName.toLowerCase().startsWith('add on')) {
      resolvedType = 'add on';
    }

    const payload = {
      agentCode,
      templateName: templateName.trim(),
      templateType: resolvedType,
      items,
    };

    console.log('📝 TEMPLATE SAVE PAYLOAD:', payload);

    try {
      await axios.post(`${TEMPLATE_BASE_URL}/api/templates/`, payload);

      setLoading(false);
      setShowPopup(false);

      Alert.alert('Template Saved ✓', `"${templateName}" saved successfully.`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('TemplateScreen', { agentCode }),
        },
      ]);
    } catch (error) {
      setLoading(false);
      console.log('Template error:', error.response?.data || error);
      Alert.alert('Error', 'Failed to save template.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#007AFF" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
        <Text style={styles.headerSubtitle}>
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.headerLine} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedItems.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.lineOne}>
              <Text style={styles.itemName}>{item.ItemNameEnglish}</Text>
              <Text style={styles.itemCode}>Code: {item.ItemCode}</Text>
            </View>
            <Text style={styles.marathiName}>{item.ItemNameMarathi}</Text>

            <View style={styles.lineTwo}>
              <Text style={styles.qty}>
                Qty: {item.quantity} × ₹{item.price}
              </Text>
              <Text style={styles.itemTotal}>
                ₹ {(item.total || item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Grand Total:</Text>
          <Text style={styles.totalValue}>₹ {grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={() => setShowPopup(true)}
        >
          <Ionicons
            name="checkmark-done-outline"
            size={responsiveFont(20)}
            color="#fff"
            style={{ marginRight: wp(2) }}
          />
          <Text style={styles.placeOrderText}>Place Order • ₹{grandTotal}</Text>
        </TouchableOpacity>
      </View>

      {/* POPUP MODAL */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Template or Place Order</Text>

            <TextInput
              placeholder="Template Name"
              value={templateName}
              onChangeText={setTemplateName}
              style={styles.inputField}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSaveTemplate}
            >
              <Text style={styles.modalButtonText}>Save Template</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#28A745' }]}
              onPress={handleFinalOrder}
            >
              <Text style={styles.modalButtonText}>Place Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPopup(false)}
              style={[styles.modalButton, { backgroundColor: 'gray' }]}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },

  scrollContent: {
    paddingHorizontal: wp(3),
    paddingBottom: hp(12),
  },

  header: {
    backgroundColor: '#fff',
    paddingVertical: hp(1.6),
    borderRadius: wp(3),
    elevation: 3,
    alignItems: 'center',
    marginTop: hp(6),
    marginHorizontal: wp(3),
  },
  headerTitle: {
    fontSize: responsiveFont(20),
    fontWeight: '700',
    color: '#007AFF',
  },
  headerSubtitle: { fontSize: responsiveFont(13), color: '#666' },
  headerLine: {
    width: wp(16),
    height: hp(0.45),
    backgroundColor: '#007AFF',
    borderRadius: wp(1),
    marginTop: hp(0.6),
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3),
    marginVertical: hp(0.7),
    elevation: 5,
    borderColor: '#E0E0E0',
    borderWidth: 0.6,
  },
  lineOne: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: {
    fontSize: responsiveFont(13),
    fontWeight: '700',
    color: '#333',
    flex: 1,
    paddingRight: wp(2),
  },
  itemCode: { fontSize: responsiveFont(12), color: '#007AFF' },
  marathiName: {
    fontSize: responsiveFont(13),
    color: '#666',
    marginTop: hp(0.6),
  },
  lineTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(0.8),
  },
  qty: { fontSize: responsiveFont(13), color: '#444' },
  itemTotal: {
    fontSize: responsiveFont(14),
    fontWeight: '700',
    color: '#28A745',
  },

  bottomBar: {
    position: 'absolute',
    bottom: hp(1.6),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1.2),
    elevation: 4,
  },
  totalLabel: {
    fontSize: responsiveFont(15),
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: responsiveFont(17),
    fontWeight: '700',
    color: '#007AFF',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: wp(10),
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(6),
    marginBottom: hp(2),
  },
  placeOrderText: {
    color: '#fff',
    fontSize: responsiveFont(15),
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: wp(3),
    padding: wp(4),
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: responsiveFont(18),
    fontWeight: '700',
    marginBottom: hp(1.6),
    color: '#333',
  },
  inputField: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.1),
    marginBottom: hp(1.2),
    fontSize: responsiveFont(15),
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: hp(1.1),
    borderRadius: wp(2),
    width: '100%',
    alignItems: 'center',
    marginVertical: hp(0.6),
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: responsiveFont(15),
  },
});

export default CheckoutScreen;
