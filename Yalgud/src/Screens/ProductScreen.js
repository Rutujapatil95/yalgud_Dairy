import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { BASE_URL } from '../Screens/home';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375; // Reference design width
const BASE_HEIGHT = 812; // Reference design height
const scale = size => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = size => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

const ITEMS_PER_PAGE = 8;

const ProductScreen = ({ route }) => {
  const { DeptCode, Status, ItemType } = route.params || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('📦 Fetching products for:', {
          DeptCode,
          Status,
          ItemType,
        });

        const response = await axios.post(`${BASE_URL}/api/items/filter`, {
          DeptCode,
          Status,
          ItemType,
        });

        const productData = response.data?.data || [];

        const productsWithPrices = await Promise.all(
          productData.map(async item => {
            try {
              const priceResponse = await axios.post(
                `${BASE_URL}/api/data/filter?collection=SalesRateChart`,
                {
                  ItemCode: item.ItemCode,
                  EntryNo: 1,
                },
              );

              const salesData = priceResponse.data?.data?.[0];
              const agentRate = salesData?.AgentRate || 0;
              const salesRate = salesData?.SalesRate || 0;
              const finalRate =
                agentRate && agentRate !== 0 ? agentRate : salesRate || 'N/A';

              return { ...item, price: finalRate, quantity: 0 };
            } catch (error) {
              console.warn(
                `⚠️ Error fetching price for ItemCode ${item.ItemCode}:`,
                error.message,
              );
              return { ...item, price: 'N/A', quantity: 0 };
            }
          }),
        );

        setProducts(productsWithPrices);
      } catch (err) {
        console.error('❌ Error fetching products:', err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [DeptCode, Status, ItemType]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const toggleSelectItem = item => {
    setSelectedItems(prev => {
      const exists = prev.find(p => p.ItemCode === item.ItemCode);
      if (exists) {
        return prev.filter(p => p.ItemCode !== item.ItemCode);
      } else {
        return [...prev, { ...item }];
      }
    });
  };

  const updateQuantity = (item, qty) => {
    let updatedQty = parseInt(qty);
    if (isNaN(updatedQty) || updatedQty < 0) updatedQty = 0;

    setProducts(prev =>
      prev.map(p =>
        p.ItemCode === item.ItemCode ? { ...p, quantity: updatedQty } : p,
      ),
    );

    setSelectedItems(prev => {
      const exists = prev.find(p => p.ItemCode === item.ItemCode);
      if (exists) {
        return prev.map(p =>
          p.ItemCode === item.ItemCode ? { ...p, quantity: updatedQty } : p,
        );
      } else {
        return [...prev];
      }
    });
  };

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = item.quantity || 0;
      return acc + price * qty;
    }, 0);
  }, [selectedItems]);

  const goToCheckout = () => {
    const validItems = selectedItems.filter(
      item => item.quantity > 0 && item.price !== 'N/A',
    );

    if (validItems.length === 0) {
      Alert.alert(
        'Alert',
        'Please select items with valid quantity and price.',
      );
      return;
    }

    navigation.navigate('CheckoutScreen', { selectedItems: validItems });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No products found for this department.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.some(p => p.ItemCode === item.ItemCode);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.card,
          isSelected && {
            borderLeftColor: '#28A745',
            backgroundColor: '#E8F5E9',
          },
        ]}
        onPress={() => toggleSelectItem(item)}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.itemCode}>Item Code: {item.ItemCode}</Text>
          <Text style={styles.itemPrice}>
            ₹ {item.price !== 'N/A' ? item.price : '--'}
          </Text>
        </View>

        <Text style={styles.itemNameEnglish}>
          {item.ItemNameEnglish || 'N/A'}
        </Text>
        <Text style={styles.itemNameMarathi}>{item.ItemName || 'N/A'}</Text>

        <View style={styles.qtyContainer}>
          <Text style={styles.qtyLabel}>Qty:</Text>
          <TextInput
            style={styles.qtyInput}
            keyboardType="numeric"
            value={String(item.quantity)}
            onChangeText={text => updateQuantity(item, text)}
          />
        </View>

        <Text style={styles.totalText}>
          Total: ₹{' '}
          {item.price !== 'N/A'
            ? (item.price * item.quantity).toFixed(2)
            : '--'}
        </Text>

        {isSelected && <Text style={styles.selectedText}>✔ Selected</Text>}
        <View style={styles.divider} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Product List</Text>
      <Text style={styles.headerSubtitle}>Department Code: {DeptCode}</Text>
      <Text style={styles.pageIndicator}>
        Page {currentPage} / {totalPages}
      </Text>

      <FlatList
        data={paginatedProducts}
        keyExtractor={(item, index) => `${item.ItemCode}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: scale(120) }}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.arrowContainer}>
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={currentPage === 1}
            style={[
              styles.arrowButton,
              currentPage === 1 && styles.disabledArrow,
            ]}
          >
            <Ionicons
              name="chevron-back-circle"
              size={scale(44)}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
            style={[
              styles.arrowButton,
              currentPage === totalPages && styles.disabledArrow,
            ]}
          >
            <Ionicons
              name="chevron-forward-circle"
              size={scale(44)}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.totalAmountText}>
          Total Amount: ₹ {totalAmount.toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={goToCheckout}
          activeOpacity={0.9}
        >
          <Text style={styles.checkoutText}>
            Go to Checkout ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(20),
  },
  headerTitle: {
    fontSize: scale(22),
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: scale(14),
    color: '#777',
    marginBottom: verticalScale(8),
  },
  pageIndicator: {
    textAlign: 'center',
    fontSize: scale(16),
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: verticalScale(8),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: scale(14),
    padding: scale(11),
    marginVertical: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.12,
    shadowRadius: scale(4),
    elevation: 3,
    borderLeftWidth: scale(4),
    borderLeftColor: '#007AFF',
  },
  itemCode: { fontSize: scale(14), fontWeight: 'bold', color: '#007AFF' },
  itemNameEnglish: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginTop: verticalScale(6),
  },
  itemNameMarathi: {
    fontSize: scale(14),
    color: '#666',
    marginTop: verticalScale(2),
  },
  itemPrice: { fontSize: scale(16), fontWeight: 'bold', color: '#28A745' },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  qtyLabel: {
    fontSize: scale(15),
    fontWeight: '500',
    color: '#333',
    marginRight: scale(10),
  },
  qtyInput: {
    width: scale(50),
    height: verticalScale(46),
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: scale(8),
    textAlign: 'center',
    fontSize: scale(16),
    color: '#000',
    backgroundColor: '#F8FAFF',
  },
  totalText: {
    color: '#000',
    fontWeight: '600',
    marginTop: verticalScale(8),
    fontSize: scale(15),
  },
  selectedText: {
    color: '#28A745',
    fontWeight: 'bold',
    marginTop: verticalScale(6),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: verticalScale(8),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: verticalScale(10),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  checkoutButton: {
    backgroundColor: '#28A745',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(30),
    borderRadius: scale(25),
    elevation: 4,
    marginTop: verticalScale(10),
  },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: scale(16) },
  totalAmountText: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#007AFF',
    marginTop: verticalScale(8),
  },
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.8,
  },
  arrowButton: {
    backgroundColor: '#007AFF',
    borderRadius: scale(50),
    elevation: 5,
    padding: scale(4),
  },
  disabledArrow: { backgroundColor: '#A0AEC0' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: verticalScale(10),
    color: '#555',
    fontSize: scale(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
  },
  emptyText: { color: '#666', fontSize: scale(16) },
});

export default ProductScreen;
