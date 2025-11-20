import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';

import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.11:8001';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = p => (SCREEN_WIDTH * p) / 100;
const hp = p => (SCREEN_HEIGHT * p) / 100;
const scale = size => (SCREEN_WIDTH / 375) * size;
const scaleFont = size => (SCREEN_WIDTH / 375) * size;

const PRIMARY = '#2380FB';
const PAGE_BG = '#F9FAFB';
const CARD_BG = '#FFFFFF';
const FOOTER_HEIGHT = hp(8);

const CategoryProductsScreen = ({ route }) => {
  const { ItemCategoryCode, DeptCode, AgentCode } = route.params || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [agentType, setAgentType] = useState(null);

  const [entryNo, setEntryNo] = useState(1);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const cartItems = useSelector(state => state.cart.items || []);
  const cartCount = cartItems.length;

  useEffect(() => {
    const loadLocalStorageValues = async () => {
      try {
        const storedAgentType = await AsyncStorage.getItem('agentType');
        const storedEntryNo = await AsyncStorage.getItem(
          'SalesRateChartEntryNo',
        );

        setAgentType(storedAgentType ? Number(storedAgentType) : 0);
        setEntryNo(storedEntryNo ? Number(storedEntryNo) : 1);

        console.log(' Loaded agentType:', storedAgentType);
        console.log('Loaded SalesRateChartEntryNo:', storedEntryNo);
      } catch (err) {
        console.log(' Error:', err);
        setAgentType(0);
        setEntryNo(1);
      }
    };

    loadLocalStorageValues();
  }, []);

  useEffect(() => {
    if (!ItemCategoryCode || agentType === null || entryNo === null) return;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const res = await axios.get(
          `${BASE_URL}/api/items/category/${ItemCategoryCode}`,
        );

        const items = (res.data || []).filter(item => item.Status === 0);

        const processed = await Promise.all(
          items.map(async item => {
            try {
              const priceRes = await axios.post(
                `${BASE_URL}/api/data/filter?collection=SalesRateChart`,
                { ItemCode: item.ItemCode },
              );

              const row = (priceRes?.data?.data || []).find(
                r => r.EntryNo === entryNo,
              );

              let rate = 0;

              if (row) {
                if (agentType === 0) {
                  rate = row.AgentRate;
                } else if (agentType === 1) {
                  rate =
                    row.AgentRate1 && row.AgentRate1 > 0
                      ? row.AgentRate1
                      : row.AgentRate;
                } else {
                  rate = row.AgentRate;
                }
              }

              return { ...item, Rate: rate, Qty: 0, Total: 0 };
            } catch (err) {
              return { ...item, Rate: 0, Qty: 0, Total: 0 };
            }
          }),
        );

        setProducts(processed);
      } catch (e) {
        console.log('❌ Product Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [ItemCategoryCode, agentType, entryNo]);

  const handleQtyChange = (item, val) => {
    const qty = parseFloat(val) || 0;

    const updated = products.map(p =>
      p.ItemCode === item.ItemCode
        ? { ...p, Qty: qty, Total: qty * p.Rate }
        : p,
    );

    setProducts(updated);

    if (selectedItems.some(s => s.ItemCode === item.ItemCode)) {
      const updatedSel = selectedItems.map(s =>
        s.ItemCode === item.ItemCode
          ? { ...s, Qty: qty, Total: qty * s.Rate }
          : s,
      );
      setSelectedItems(updatedSel);
      calculateGrandTotal(updatedSel);
    }
  };

  const calculateGrandTotal = items => {
    const sum = items.reduce((a, b) => a + (b.Total || 0), 0);
    setGrandTotal(sum);
  };

  const toggleSelect = item => {
    const exists = selectedItems.find(s => s.ItemCode === item.ItemCode);

    if (exists) {
      const filtered = selectedItems.filter(s => s.ItemCode !== item.ItemCode);
      setSelectedItems(filtered);
      calculateGrandTotal(filtered);
    } else {
      const newItem = { ...item, Total: item.Qty * item.Rate };
      const updated = [...selectedItems, newItem];
      setSelectedItems(updated);
      calculateGrandTotal(updated);
    }
  };

  const handleAddAllToCart = () => {
  if (selectedItems.length === 0) {
    Alert.alert('No items selected');
    return;
  }

  // Add items to Redux Cart
  selectedItems.forEach(item => dispatch(addToCart(item)));

  // Auto go back to previous screen
  navigation.goBack();
};


  if (loading || agentType === null || entryNo === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={scale(25)} color="#fff" />
          </TouchableOpacity>

          <View style={styles.storeInfoContainer}>
            <Text style={[styles.storeName, { fontSize: scaleFont(18) }]}>
              Jay Bhavani Stores
            </Text>
            <Text style={[styles.location, { fontSize: scaleFont(13) }]}>
              Kolhapur
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddToCartScreen', {
                agentCode: AgentCode,
                deptCode: DeptCode,
              })
            }
          >
            <Ionicons name="cart" size={scale(24)} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text
                  style={[styles.cartBadgeText, { fontSize: scaleFont(10) }]}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerTitleContainer}>
        <Text style={[styles.title, { fontSize: scaleFont(18) }]}>
          Category: {ItemCategoryCode}
        </Text>
        <Text style={[styles.subtitle, { fontSize: scaleFont(13) }]}>
          {products.length} products
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.ItemCode.toString()}
        contentContainerStyle={{ paddingBottom: hp(15) }}
        renderItem={({ item }) => {
          const selected = selectedItems.some(
            s => s.ItemCode === item.ItemCode,
          );

          return (
            <TouchableOpacity
              style={[styles.card, selected && styles.selectedCard]}
              onPress={() => toggleSelect(item)}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { fontSize: scaleFont(12) }]}>
                    {item.ItemNameEnglish}
                  </Text>
                  <Text style={[styles.sub, { fontSize: scaleFont(13) }]}>
                    {item.ItemName}
                  </Text>

                  <View style={styles.infoRow}>
                    <Text style={[styles.rate, { fontSize: scaleFont(12) }]}>
                      Rate: ₹{Number(item.Rate) || 0}
                    </Text>

                    <Text style={[styles.total, { fontSize: scaleFont(13) }]}>
                      Total: ₹{(item.Total || 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.qtyContainer}>
                    <Text
                      style={[styles.qtyLabel, { fontSize: scaleFont(14) }]}
                    >
                      Qty:
                    </Text>
                    <TextInput
                      style={[
                        styles.qtyInput,
                        {
                          fontSize: scaleFont(14),
                          height: hp(5),
                          width: wp(18),
                        },
                      ]}
                      value={item.Qty ? item.Qty.toString() : ''}
                      placeholder="0"
                      keyboardType="numeric"
                      onChangeText={val => handleQtyChange(item, val)}
                    />
                  </View>
                </View>

                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={scale(30)}
                    color="#4CAF50"
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={[styles.bottomBar, { bottom: FOOTER_HEIGHT + hp(1) }]}>
        <View>
          <Text style={[styles.totalLabel, { fontSize: scaleFont(14) }]}>
            Grand Total
          </Text>
          <Text style={[styles.totalAmount, { fontSize: scaleFont(18) }]}>
            ₹{grandTotal.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addAllButton, { paddingVertical: hp(1.4) }]}
          onPress={handleAddAllToCart}
        >
          <Text style={[styles.addAllText, { fontSize: scaleFont(14) }]}>
            Add to Cart ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { height: FOOTER_HEIGHT }]}>
        {[
          { tab: 'home', icon: 'home' },
          { tab: 'HistoryScreen', icon: 'time' },
          { tab: 'TemplateScreen', icon: 'albums' },
          { tab: 'ProfileScreen', icon: 'person' },
        ].map(({ tab, icon }) => (
          <TouchableOpacity
            key={tab}
            style={styles.navButton}
            onPress={() =>
              navigation.navigate(tab, {
                agentCode: AgentCode,
                deptCode: DeptCode,
              })
            }
          >
            <Ionicons name={icon} size={scale(21)} color="#fff" />
            <Text style={[styles.navText, { fontSize: scaleFont(10) }]}>
              {tab.replace('Screen', '')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: PRIMARY,
    paddingTop: hp(5),
    paddingBottom: hp(1.5),
    paddingHorizontal: wp(5),
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  storeInfoContainer: { flex: 1, alignItems: 'center' },
  storeName: { fontWeight: 'bold', color: '#fff' },
  location: { color: '#fff' },

  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: 'red',
    borderRadius: wp(2),
    width: wp(5),
    height: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  headerTitleContainer: { alignItems: 'center', marginVertical: hp(1.5) },
  title: { fontWeight: '700', color: '#0A2540' },
  subtitle: { color: '#777' },

  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: wp(3),
    marginVertical: hp(0.5),
    padding: wp(2),
    borderRadius: scale(10),
    elevation: 2,
  },
  selectedCard: { borderWidth: 2, borderColor: '#4CAF50' },

  row: { flexDirection: 'row', justifyContent: 'space-between' },

  name: { fontWeight: '700', color: '#111' },
  sub: { color: '#666' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(0.5),
  },
  rate: { color: '#007AFF', fontWeight: '600' },
  total: { fontWeight: '600' },

  qtyContainer: { flexDirection: 'row', marginTop: hp(1) },
  qtyLabel: { marginRight: wp(1) },

  qtyInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: scale(6),
    paddingHorizontal: wp(2),
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: wp(3),
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderColor: '#ccc',
    marginBottom: hp(-1),
  },

  totalLabel: { color: '#777' },
  totalAmount: { fontWeight: '700' },

  addAllButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: wp(5),
    borderRadius: scale(10),
  },
  addAllText: { color: '#fff', fontWeight: '700', paddingHorizontal: wp(3) },

  footer: {
    width: SCREEN_WIDTH,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp(0.6),
  },

  navButton: { alignItems: 'center', flex: 1 },
  navText: { color: '#fff', fontWeight: '700' },
});
