import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Dimensions,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const wp = p => (SCREEN_WIDTH * p) / 100;
const hp = p => (SCREEN_HEIGHT * p) / 100;
const isTablet = SCREEN_WIDTH >= 768;
const scale = v => (isTablet ? v * 1.3 : v);

const PRIMARY = '#2380FB';
const PAGE_BG = '#F9FAFB';
const CARD_BG = '#FFFFFF';
const GRAY = '#444';

const FOOTER_HEIGHT = hp(8);
const ITEMS_PER_PAGE = 6;

const API_URL = 'http://192.168.1.11:8001/api/newcategories';

const ProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const deptCode = route.params?.DeptCode ?? route.params?.deptCode ?? null;
  const agentCode = route.params?.AgentCode ?? route.params?.agentCode ?? null;

  const [agentType, setAgentType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [currentPage, setCurrentPage] = useState(1);

  const cartItems = useSelector(state => state.cart.items || []);
  const cartCount = cartItems.length;

  useEffect(() => {
    const fetchAgentType = async () => {
      try {
        const storedType = await AsyncStorage.getItem('agentType');
        console.log('📌 Loaded agentType:', storedType);

        setAgentType(storedType ? Number(storedType) : 0);
      } catch (err) {
        console.log('❌ Failed to load agentType:', err);
        setAgentType(0);
      }
    };

    fetchAgentType();
  }, []);

  useEffect(() => {
    console.log(' ProductScreen Params:', {
      deptCode,
      agentCode,
      agentType,
    });
  }, [deptCode, agentCode, agentType]);

  const fixImageUrl = url => {
    if (!url) return null;
    if (url.includes('localhost'))
      return url.replace('localhost', '192.168.1.11');
    return url;
  };

  const goToCategoryProducts = categoryCode => {
    navigation.navigate('CategoryProductsScreen', {
      ItemCategoryCode: categoryCode,
      DeptCode: deptCode,
      AgentCode: agentCode,
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);

      try {
        const response = await axios.get(API_URL);

        let data = [];
        if (Array.isArray(response.data)) data = response.data;
        else if (Array.isArray(response.data.categories))
          data = response.data.categories;

        if (deptCode) {
          data = data.filter(cat => String(cat.DeptCode) === String(deptCode));
        }

        setCategories(data);
      } catch (err) {
        console.log('❌ Failed to load categories:', err);
        Alert.alert('Error', 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [deptCode]);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedCategories = categories.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const renderItem = ({ item }) => {
    const firstItem = item.categoryItems?.[0];

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() =>
          firstItem && goToCategoryProducts(firstItem.ItemCategoryCode)
        }
      >
        <View style={styles.cardContent}>
          <Image
            source={{ uri: fixImageUrl(item.imagePath) }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.categoryName}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {item.description || 'No description available'}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={scale(24)} color={PRIMARY} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading || agentType === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={{ marginTop: hp(1), color: GRAY }}>
          Loading categories...
        </Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ color: GRAY, fontSize: scale(16) }}>
          No categories found.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={PRIMARY} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../Images/logoto.png')}
            style={{ width: wp(10), height: wp(10) }}
          />
          <View style={styles.storeInfoContainer}>
            <Text style={styles.storeName}>Jay Bhavani Stores</Text>
            <Text style={styles.location}>Kolhapur</Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddToCartScreen', {
                agentCode,
                deptCode,
              })
            }
            style={{ position: 'relative' }}
          >
            <Ionicons name="cart" size={scale(28)} color="#fff" />

            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* TITLE */}
      <View style={styles.titleContainer}>
        <Text style={styles.pageTitle}>Categories</Text>
        <Text style={styles.pageSubtitle}>
          Department Code: {deptCode || '-'}
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={paginatedCategories}
        renderItem={renderItem}
        keyExtractor={item =>
          item._id ? String(item._id) : Math.random().toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: FOOTER_HEIGHT + hp(6),
          paddingHorizontal: wp(3),
        }}
      />

      {/* PAGINATION */}
      <View style={styles.pagination}>
        <TouchableOpacity
          disabled={currentPage === 1}
          onPress={() => setCurrentPage(prev => prev - 1)}
          style={[
            styles.pageButton,
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <Ionicons name="chevron-back" size={scale(18)} color={PRIMARY} />
        </TouchableOpacity>

        <Text style={styles.pageText}>
          {currentPage} / {totalPages}
        </Text>

        <TouchableOpacity
          disabled={currentPage === totalPages}
          onPress={() => setCurrentPage(prev => prev + 1)}
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
        >
          <Ionicons name="chevron-forward" size={scale(18)} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        {[
          { tab: 'Home', icon: 'home' },
          { tab: 'History', icon: 'time' },
          { tab: 'Template', icon: 'albums' },
          { tab: 'Profile', icon: 'person' },
        ].map(({ tab, icon }) => (
          <TouchableOpacity
            key={tab}
            style={styles.navButton}
            onPress={() => {
              setActiveTab(tab);

              if (tab === 'Home') navigation.navigate('home');
              if (tab === 'History') navigation.navigate('HistoryScreen');
              if (tab === 'Template') navigation.navigate('TemplateScreen');
              if (tab === 'Profile') navigation.navigate('ProfileScreen');
            }}
          >
            <Ionicons
              name={icon}
              size={scale(22)}
              color={activeTab === tab ? '#000' : '#fff'}
            />
            <Text
              style={[
                styles.navText,
                { color: activeTab === tab ? '#000' : '#fff' },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default ProductScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },

  header: {
    backgroundColor: PRIMARY,
    paddingTop: hp(4.5),
    paddingBottom: hp(1.4),
    paddingHorizontal: wp(4.5),
    elevation: 5,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  storeInfoContainer: { flex: 1, alignItems: 'center' },

  storeName: {
    fontSize: scale(wp(5)),
    fontWeight: 'bold',
    color: '#fff',
  },

  location: { fontSize: scale(wp(3.5)), color: '#fff' },

  cartBadge: {
    position: 'absolute',
    right: -scale(8),
    top: -scale(6),
    backgroundColor: 'red',
    borderRadius: scale(10),
    width: scale(18),
    height: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBadgeText: {
    color: '#fff',
    fontSize: scale(wp(2.4)),
    fontWeight: 'bold',
  },

  titleContainer: { alignItems: 'center', marginVertical: hp(1.5) },

  pageTitle: {
    fontSize: scale(wp(4.8)),
    fontWeight: '700',
    color: '#0A2540',
  },

  pageSubtitle: {
    fontSize: scale(wp(3.4)),
    color: GRAY,
    marginTop: hp(0.5),
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: scale(12),
    padding: wp(3),
    marginVertical: hp(1),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  cardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },

  cardImage: {
    width: wp(18),
    height: wp(18),
    borderRadius: scale(10),
    marginRight: wp(3),
    backgroundColor: '#eee',
  },

  cardTextContainer: { flex: 1 },

  cardTitle: {
    fontSize: scale(wp(4.2)),
    fontWeight: '600',
    color: '#0A2540',
    marginBottom: hp(0.4),
  },

  cardSubtitle: {
    fontSize: scale(wp(3.6)),
    color: GRAY,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(1.2),
  },

  pageButton: { padding: wp(2) },

  pageText: {
    fontSize: scale(wp(4)),
    marginHorizontal: wp(3),
    fontWeight: '600',
    color: PRIMARY,
  },

  disabledButton: { opacity: 0.4 },

  footer: {
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: PRIMARY,
  },

  navButton: { alignItems: 'center' },

  navText: {
    fontSize: scale(wp(3.2)),
    marginTop: hp(0.4),
  },
});
