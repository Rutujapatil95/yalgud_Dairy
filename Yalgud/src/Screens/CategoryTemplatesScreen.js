import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = p => (SCREEN_WIDTH * p) / 100;
const hp = p => (SCREEN_HEIGHT * p) / 100;
const scale = size => (SCREEN_WIDTH / 375) * size;
const scaleFont = size => (SCREEN_WIDTH / 375) * size;

const headerBackgroundColor = '#4A90E2';

const CategoryTemplatesScreen = ({ route }) => {
  const { templates = [], templateName = 'Templates' } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const cartItems = useSelector(state => state.cart?.items || []);
  const cartCount = cartItems.length;

  const [activeTab, setActiveTab] = useState('Template');

  const flattened = templates.flatMap(t => {
    if (t.item)
      return [{ ...t.item, templateId: t._id, templateName: t.templateName }];
    if (Array.isArray(t.items))
      return t.items.map(it => ({
        ...it,
        templateId: t._id,
        templateName: t.templateName,
      }));
    return [];
  });

  const [items, setItems] = useState(
    flattened.map(it => ({
      ...it,
      quantity: it.quantity || 1,
      price: it.price || 0,
      selected: false,
      total: (it.price || 0) * (it.quantity || 1),
    })),
  );

  useEffect(() => {
    setItems(
      flattened.map(it => ({
        ...it,
        quantity: it.quantity || 1,
        price: it.price || 0,
        selected: false,
        total: (it.price || 0) * (it.quantity || 1),
      })),
    );
  }, [route.params]);

  const toggleSelect = index => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const selectAll = () => {
    const allSelected = items.every(it => it.selected);
    setItems(items.map(it => ({ ...it, selected: !allSelected })));
  };

  const handleQuantityChange = (index, value) => {
    const qty = parseInt(value, 10) || 0;
    setItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: qty, total: qty * (item.price || 0) }
          : item,
      ),
    );
  };

  const grandTotal = items.reduce(
    (sum, it) => sum + (it.selected ? it.total : 0),
    0,
  );

  const handleAddToCart = () => {
    const selected = items.filter(it => it.selected);
    if (!selected.length)
      return Alert.alert('Select items', 'Please select at least one item.');

    selected.forEach(it =>
      dispatch(
        addToCart({
          ItemCode: it.itemCode || Math.random().toString(),
          ItemNameEnglish: it.itemName,
          price: it.price,
          Qty: it.quantity,
          total: it.total,
          templateName,
        }),
      ),
    );

    Alert.alert('Added', `${selected.length} item(s) added.`, [
      {
        text: 'Go to Cart',
        onPress: () => navigation.navigate('AddToCartScreen'),
      },
      { text: 'OK' },
    ]);
  };

  const handleBuyNow = () => {
    const selected = items.filter(it => it.selected);
    if (!selected.length)
      return Alert.alert('Select items', 'Please select at least one item.');

    navigation.navigate('CheckoutScreen', {
      selectedItems: selected,
      templateName,
    });
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <TouchableOpacity
          onPress={() => toggleSelect(index)}
          style={[
            styles.selectCircle,
            item.selected && styles.selectCircleActive,
          ]}
        >
          {item.selected && (
            <Ionicons name="checkmark" size={scale(15)} color="#fff" />
          )}
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: wp(4) }}>
          <Text style={[styles.itemName, { fontSize: scaleFont(17) }]}>
            {item.itemName}
          </Text>

          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.itemDetail, { fontSize: scaleFont(14) }]}>
                Qty:
              </Text>
              <TextInput
                style={styles.qtyInput}
                value={String(item.quantity)}
                onChangeText={text => handleQuantityChange(index, text)}
                keyboardType="numeric"
              />
            </View>

            <Text style={[styles.itemPrice, { fontSize: scaleFont(16) }]}>
              ₹{item.price.toFixed(2)}
            </Text>
          </View>

          <Text style={styles.totalText}>Total: ₹{item.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const FooterButton = ({ icon, label, onPress, isActive }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.navButton, isActive && styles.navActive]}
    >
      <Ionicons
        name={icon}
        size={scale(23)}
        color={isActive ? '#fff' : '#B0C4DE'}
      />
      <Text style={[styles.navText, isActive && { color: '#fff' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        backgroundColor={headerBackgroundColor}
        barStyle="light-content"
      />

      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Image
            source={require('../Images/logoto.png')}
            style={{
              width: wp(10),
              height: wp(10),
              resizeMode: 'contain',
            }}
          />

          <View style={styles.storeInfoContainer}>
            <Text style={[styles.storeName, { fontSize: scaleFont(20) }]}>
              Jay Bhavani Stores
            </Text>
            <Text style={[styles.location, { fontSize: scaleFont(14) }]}>
              Kolhapur
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddToCartScreen')}
          >
            <Ionicons name="cart" size={scale(26)} color="#fff" />
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

      <View style={styles.selectAllBox}>
        <TouchableOpacity onPress={selectAll} style={styles.selectAllBtn}>
          <Text
            style={{
              color: '#fff',
              fontSize: scaleFont(14),
              fontWeight: '700',
            }}
          >
            Select All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i, idx) => idx.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: hp(20) }}
      />

      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Selected Total:</Text>
          <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.addToCartBtn}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={scale(20)} color="#fff" />
            <Text style={styles.btnText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
            <Ionicons name="flash-outline" size={scale(20)} color="#fff" />
            <Text style={styles.btnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.footer, { height: hp(8) }]}>
        <FooterButton
          icon="home"
          label="Home"
          onPress={() => {
            setActiveTab('Home');
            navigation.navigate('home');
          }}
          isActive={activeTab === 'Home'}
        />
        <FooterButton
          icon="time"
          label="History"
          onPress={() => {
            setActiveTab('History');
            navigation.navigate('HistoryScreen');
          }}
          isActive={activeTab === 'History'}
        />
        <FooterButton
          icon="document"
          label="Template"
          onPress={() => {
            setActiveTab('Template');
            navigation.navigate('TemplateScreen');
          }}
          isActive={activeTab === 'Template'}
        />
        <FooterButton
          icon="person"
          label="Profile"
          onPress={() => {
            setActiveTab('Profile');
            navigation.navigate('ProfileScreen');
          }}
          isActive={activeTab === 'Profile'}
        />
      </View>
    </SafeAreaView>
  );
};

export default CategoryTemplatesScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF4FF' },

  headerContainer: {
    backgroundColor: headerBackgroundColor,
    paddingVertical: hp(3),
    paddingHorizontal: wp(6),
    elevation: 4,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(2),
  },

  storeInfoContainer: { alignItems: 'center' },
  storeName: { color: '#fff', fontWeight: '700' },
  location: { color: '#fff' },

  cartBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: 'red',
    borderRadius: wp(3),
    width: wp(6),
    height: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontWeight: 'bold' },

  selectAllBox: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: wp(5),
    marginVertical: hp(1),
  },

  selectAllBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: scale(10),
  },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: scale(14),
    padding: wp(1),
    marginHorizontal: wp(5),
    marginVertical: hp(1),
    elevation: 3,
  },

  itemRow: {
    flexDirection: 'row',
  },

  selectCircle: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(3),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCircleActive: {
    backgroundColor: headerBackgroundColor,
    borderColor: headerBackgroundColor,
  },

  itemName: { fontWeight: '600', color: '#333' },
  itemDetail: { color: '#666' },

  qtyInput: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: scale(10),
    width: wp(12),
    height: hp(4),
    textAlign: 'center',
    marginLeft: wp(2),
    fontSize: scaleFont(14),
    color: '#000',
  },

  itemPrice: { fontWeight: '700', color: '#007AFF' },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
  },

  totalText: {
    marginTop: hp(1),
    fontWeight: '600',
    color: '#4A90E2',
    fontSize: scaleFont(13),
  },

  bottomBar: {
    position: 'absolute',
    bottom: hp(8.5),
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingVertical: hp(1.5),
    alignItems: 'center',
    elevation: 10,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.9,
  },

  totalLabel: { color: '#444', fontWeight: '600' },
  totalValue: { color: '#007AFF', fontWeight: '700' },

  btnRow: {
    marginTop: hp(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.9,
  },

  addToCartBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: hp(1.6),
    borderRadius: scale(12),
  },

  buyNowBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: hp(1.6),
    borderRadius: scale(12),
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: wp(2),
  },

  footer: {
    width: SCREEN_WIDTH,
    backgroundColor: headerBackgroundColor,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navButton: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.22,
    paddingVertical: hp(0.5),
  },

  navText: {
    color: '#fff',
    marginTop: hp(0.5),
    fontWeight: '600',
    fontSize: scaleFont(11),
  },

  navActive: {
    backgroundColor: '#357ABD',
    borderRadius: scale(12),
  },
});
