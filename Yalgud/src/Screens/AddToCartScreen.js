import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const wp = p => (width * p) / 100;
const hp = p => (height * p) / 100;

const headerBackgroundColor = '#4A90E2';
const footerHeight = hp(7.5);

const AddToCartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const paramAgent = route.params?.agentCode;
  const paramDept = route.params?.deptCode;

  const [agentCode, setAgentCode] = useState(paramAgent || null);
  const [deptCode, setDeptCode] = useState(paramDept || null);

  useEffect(() => {
    const saveParams = async () => {
      try {
        if (paramAgent) {
          await AsyncStorage.setItem('agentCode', String(paramAgent));
          setAgentCode(String(paramAgent));
        }
        if (paramDept) {
          await AsyncStorage.setItem('deptCode', String(paramDept));
          setDeptCode(String(paramDept));
        }
      } catch (error) {
        console.log('Error saving params:', error);
      }
    };
    saveParams();
  }, [paramAgent, paramDept]);

  useEffect(() => {
    const loadStored = async () => {
      try {
        const storedAgent = await AsyncStorage.getItem('agentCode');
        const storedDept = await AsyncStorage.getItem('deptCode');

        if (!agentCode && storedAgent) setAgentCode(storedAgent);
        if (!deptCode && storedDept) setDeptCode(storedDept);
      } catch (error) {
        console.log('Async load error:', error);
      }
    };

    loadStored();
  }, []);

  const cartItems = useSelector(state =>
    (state.cart.items || []).filter(
      i => Number(i.Qty) >= 1 && Number(i.Rate) > 0,
    ),
  );

  const handleStartFresh = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'No items to clear.');
      return;
    }

    Alert.alert('Start Fresh', 'Do you want to remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => dispatch(clearCart()),
      },
    ]);
  };

  const grandTotal = cartItems.reduce(
    (sum, i) => sum + i.Qty * (i.Rate || 0),
    0,
  );

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before checkout.');
      return;
    }

    const selectedItems = cartItems.map(i => ({
      ItemCode: i.ItemCode,
      ItemNameEnglish: i.ItemNameEnglish,
      quantity: i.Qty,
      price: i.Rate,
      total: i.Qty * i.Rate,
    }));

    navigation.navigate('CheckoutScreen', {
      selectedItems,
      agentCode: agentCode || '0',
      deptCode: deptCode || '0',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.ItemNameEnglish}</Text>
        <Text style={styles.rate}>₹{item.Rate}</Text>
      </View>

      <View style={styles.qtyDisplayBox}>
        <Text style={styles.qtyDisplayText}>Qty: {item.Qty}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={headerBackgroundColor}
        barStyle="light-content"
      />

      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={hp(3)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Your Cart</Text>

          <TouchableOpacity onPress={handleStartFresh}>
            <Text style={styles.startFreshText}>Clear cart</Text>
          </TouchableOpacity>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={hp(12)} color="#bbb" />
          <Text style={styles.emptyText}>Your cart is empty!</Text>

          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('home')}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: wp(4), paddingBottom: hp(13) }}
        />
      )}

      {cartItems.length > 0 && (
        <View style={styles.checkoutBar}>
          <View>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder}>
            <Ionicons name="checkmark-circle" size={hp(3)} color="#fff" />
            <Text style={styles.placeText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        {[
          { label: 'Home', icon: 'home', screen: 'home' },
          { label: 'History', icon: 'time', screen: 'HistoryScreen' },
          { label: 'Template', icon: 'albums', screen: 'TemplateScreen' },
          { label: 'Profile', icon: 'person', screen: 'ProfileScreen' },
        ].map(({ label, icon, screen }) => (
          <TouchableOpacity
            key={label}
            style={styles.navButton}
            onPress={() =>
              navigation.navigate(screen, {
                agentCode: agentCode || '0',
                deptCode: deptCode || '0',
              })
            }
          >
            <Ionicons name={icon} size={hp(2.6)} color="#fff" />
            <Text style={styles.navText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default AddToCartScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  headerContainer: {
    backgroundColor: headerBackgroundColor,
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    elevation: 4,
    marginTop: 44,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: hp(2.3), color: '#fff', fontWeight: '700' },

  startFreshText: {
    color: '#fff',
    fontSize: hp(1.6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.6),
    borderRadius: 8,
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#777', fontSize: hp(2.2), marginTop: hp(1) },

  shopNowButton: {
    marginTop: hp(2),
    backgroundColor: '#4A90E2',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: 10,
  },
  shopNowText: { color: '#fff', fontSize: hp(2), fontWeight: '700' },

  card: {
    flexDirection: 'row',
    padding: wp(2),
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    marginBottom: hp(1.5),
  },

  itemName: {
    fontSize: hp(1.5),
    fontWeight: '700',
    color: '#333',
  },
  rate: { marginTop: hp(0.5), fontSize: hp(1.7), color: '#000' },

  qtyDisplayBox: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    borderRadius: 8,
    justifyContent: 'center',
  },
  qtyDisplayText: {
    fontSize: hp(1.6),
    fontWeight: '700',
    color: '#1a4db3',
  },

  checkoutBar: {
    position: 'absolute',
    bottom: footerHeight + hp(0.2),
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: wp(1),
    elevation: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: { fontSize: hp(1.8), color: '#555' },
  totalValue: { fontSize: hp(1.8), fontWeight: '700', color: '#000' },

  placeBtn: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: 10,
    alignItems: 'center',
  },
  placeText: {
    color: '#fff',
    fontSize: hp(1.8),
    fontWeight: '700',
    marginLeft: wp(1),
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: footerHeight,
    backgroundColor: '#2380FB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp(1),
  },
  navButton: { alignItems: 'center', flex: 1 },
  navText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: hp(1.4),
    marginTop: hp(0.3),
  },
});
