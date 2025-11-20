import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = p => (SCREEN_WIDTH * p) / 100;
const hp = p => (SCREEN_HEIGHT * p) / 100;
const isTablet = SCREEN_WIDTH >= 768;
const scale = v => (isTablet ? v * 1.25 : v);

const BASE_URL = 'http://192.168.1.11:8001';

const HistoryScreen = ({ navigation }) => {
  const [agentCode, setAgentCode] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAgent = async () => {
      const savedCode = await AsyncStorage.getItem('agentCode');
      if (savedCode) {
        setAgentCode(savedCode);
        fetchOrders(savedCode);
      } else {
        setError('Agent code missing. Please login again.');
      }
    };
    loadAgent();
  }, []);

  const fetchOrders = async code => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BASE_URL}/api/orders/`, {
        agentCode: code,
      });

      if (response.data?.success && Array.isArray(response.data.data)) {
        const list = response.data.data.map(order => ({
          _id: order._id,
          orderNumber: order.orderNumber || order._id,
          status: order.status || 'Pending',
          createdAt: order.createdAt,
          totalValue:
            order.totalValue ||
            order.itemInfo.reduce(
              (sum, item) => sum + item.price * (item.quantity || 1),
              0,
            ),
          itemsCount: order.itemInfo.length,
        }));
        setOrders(list);
      } else {
        setOrders([]);
        setError('No orders found');
      }
    } catch (err) {
      setError('Failed to load orders');
    }

    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (agentCode) fetchOrders(agentCode);
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Ionicons name="receipt-outline" size={scale(22)} color="#007AFF" />
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text
            style={[
              styles.value,
              item.status === 'Delivered' ? styles.delivered : styles.pending,
            ]}
          >
            {item.status}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Items:</Text>
          <Text style={styles.value}>{item.itemsCount}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>₹{item.totalValue.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require('../Images/logoto.png')}
          style={styles.headerLogo}
        />

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Jay Bhavani Stores</Text>
          <Text style={styles.headerSub}>Kolhapur</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddToCartScreen', { agentCode })}
        >
          <Ionicons name="cart" size={scale(28)} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.screenTitle}>Your Orders</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.helpText}>Pull down to refresh</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noOrdersText}>No orders found</Text>
          <Text style={styles.helpText}>Pull down to refresh</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            padding: wp(3),
            paddingBottom: hp(12),
          }}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('home', { agentCode })}
        >
          <Ionicons name="home" size={scale(24)} color="#fff" />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="time" size={scale(24)} color="#fff" />
          <Text style={styles.footerText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('TemplateScreen', { agentCode })}
        >
          <Ionicons name="layers" size={scale(24)} color="#fff" />
          <Text style={styles.footerText}>Template</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('ProfileScreen', { agentCode })}
        >
          <Ionicons name="person" size={scale(24)} color="#fff" />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },

  header: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: hp(4),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: { width: wp(10), height: hp(5), borderRadius: scale(8) },
  headerCenter: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: scale(wp(5)), fontWeight: '700' },
  headerSub: { color: '#fff', fontSize: scale(wp(4)) },

  screenTitle: {
    fontSize: scale(wp(5)),
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: hp(1.5),
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: hp(1), color: '#007AFF' },
  errorText: { color: 'red', fontSize: scale(wp(4)) },
  noOrdersText: { color: '#666', fontSize: scale(wp(4)) },
  helpText: { color: '#777', marginTop: hp(1) },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: wp(4),
    marginBottom: hp(2),
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  orderNumber: {
    marginLeft: wp(2),
    fontSize: scale(wp(4)),
    fontWeight: '700',
    color: '#007AFF',
  },

  cardBody: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(0.8),
  },

  label: { fontSize: scale(wp(3.8)), fontWeight: '500', color: '#444' },
  value: { fontSize: scale(wp(3.8)), fontWeight: '600', color: '#007AFF' },

  delivered: { color: '#28A745' },
  pending: { color: '#FF9500' },

  footer: {
    position: 'absolute',
    bottom: 0,
    height: hp(8),
    width: '100%',
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  footerItem: { alignItems: 'center' },
  footerText: { fontSize: scale(wp(3)), color: '#fff', marginTop: hp(0.3) },
});
