import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import axios from 'axios';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const wp = p => (width * p) / 100;
const hp = p => (height * p) / 100;

const scaleFont = size => (width / 375) * size;

const scale = size => (width / 375) * size;

const headerBackgroundColor = '#4A90E2';
const BASE_URL = 'http://192.168.1.11:8001/api/templates';

const TemplateScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [agentCode, setAgentCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState([]);
  const [addOns, setAddOns] = useState([]);

  const cartItems = useSelector(state => state.cart?.items || []);
  const cartCount = cartItems.length;

  useEffect(() => {
    const loadAgentCode = async () => {
      try {
        const savedCode = await AsyncStorage.getItem('agentCode');
        if (savedCode) setAgentCode(savedCode);
      } catch (err) {
        console.log('Error loading agentCode:', err);
      }
    };
    loadAgentCode();
  }, []);

  useEffect(() => {
    if (agentCode && isFocused) {
      fetchTemplates();
    }
  }, [agentCode, isFocused]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}?agentCode=${agentCode}`);
      const templatesData = res.data || {};

      setPopular(templatesData.Popular || []);
      setAddOns(templatesData.AddOn || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch templates.');
    } finally {
      setLoading(false);
    }
  };

  const onPressTemplate = t => {
    navigation.navigate('CategoryTemplatesScreen', {
      templates: [t],
      templateName: t.templateName,
      templateType: t.templateType,
    });
  };

  const renderTemplateCard = (t, style) => (
    <View key={t._id} style={style}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPressTemplate(t)}>
        <Text style={[styles.categoryText, { fontSize: scaleFont(18) }]}>
          {t.templateName}
        </Text>
      </TouchableOpacity>
    </View>
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
            <Text style={[styles.location, { fontSize: scaleFont(13) }]}>
              Kolhapur
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddToCartScreen')}
          >
            <Ionicons name="cart" size={scaleFont(24)} color="#fff" />
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

      <ScrollView contentContainerStyle={{ paddingBottom: scale(100) }}>
        {loading || !agentCode ? (
          <ActivityIndicator
            size="large"
            color={headerBackgroundColor}
            style={{ marginTop: scale(60) }}
          />
        ) : (
          <>
            <View style={{ marginHorizontal: scale(20), marginTop: scale(18) }}>
              <Text style={{ fontSize: scaleFont(20), fontWeight: '700' }}>
                Best Sellers
              </Text>
            </View>

            {popular.length === 0 ? (
              <View
                style={{ marginHorizontal: scale(20), marginTop: scale(20) }}
              >
                <Text style={{ color: '#888', fontSize: scaleFont(16) }}>
                  No popular templates yet.
                </Text>
              </View>
            ) : (
              popular.map(t =>
                renderTemplateCard(t, {
                  ...styles.categoryCard,
                  marginTop: scale(18),
                  paddingVertical: scale(18),
                  paddingHorizontal: scale(18),
                }),
              )
            )}

            <View style={{ marginHorizontal: scale(20), marginTop: scale(18) }}>
              <Text style={{ fontSize: scaleFont(18), fontWeight: '700' }}>
                Add-Ons & Extras
              </Text>
            </View>

            {addOns.length === 0 ? (
              <View
                style={{ marginHorizontal: scale(20), marginTop: scale(20) }}
              >
                <Text style={{ color: '#888', fontSize: scaleFont(16) }}>
                  No add-ons saved.
                </Text>
              </View>
            ) : (
              addOns.map(t =>
                renderTemplateCard(t, {
                  ...styles.addOnCard,
                  paddingVertical: scale(14),
                  paddingHorizontal: scale(16),
                }),
              )
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { height: scale(60) }]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('home')}
        >
          <Ionicons name="home" size={scaleFont(20)} color="#fff" />
          <Text style={[styles.navText, { fontSize: scaleFont(12) }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('HistoryScreen')}
        >
          <Ionicons name="time" size={scaleFont(20)} color="#fff" />
          <Text style={[styles.navText, { fontSize: scaleFont(12) }]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('Template')}
        >
          <Ionicons name="albums" size={scaleFont(20)} color="#000" />
          <Text
            style={[styles.navText, { color: '#000', fontSize: scaleFont(12) }]}
          >
            Template
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('ProfileScreen', { agentCode })}
        >
          <Ionicons name="person" size={scaleFont(20)} color="#fff" />
          <Text style={[styles.navText, { fontSize: scaleFont(12) }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TemplateScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#EAF4FF',
  },

  headerContainer: {
    backgroundColor: headerBackgroundColor,
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    paddingTop: scale(45),
    elevation: 6,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  storeInfoContainer: {
    alignItems: 'center',
    flex: 1,
  },

  storeName: {
    color: '#fff',
    fontWeight: '800',
  },

  location: {
    color: '#DCEBFF',
  },

  cartBadge: {
    position: 'absolute',
    right: -4,
    top: -6,
    backgroundColor: '#E53935',
    borderRadius: 12,
    minWidth: scale(18),
    paddingHorizontal: scale(5),
    paddingVertical: scale(1),
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: scale(12),
    width: width - scale(30),
    alignSelf: 'center',
    marginTop: scale(14),
    paddingVertical: scale(20),
    paddingHorizontal: scale(20),
    borderLeftWidth: scale(6),
    borderLeftColor: '#4A90E2',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  addOnCard: {
    backgroundColor: '#fff',
    borderRadius: scale(12),
    width: width - scale(30),
    alignSelf: 'center',
    marginTop: scale(12),
    paddingVertical: scale(16),
    paddingHorizontal: scale(18),
    borderLeftWidth: scale(4),
    borderLeftColor: '#4A90E2',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  categoryText: {
    fontWeight: '700',
    color: '#1C1C1C',
  },

  footer: {
    height: scale(70),
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 8,

    paddingBottom: 5,
  },

  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.22,
    paddingVertical: scale(4),
  },

  navText: {
    marginTop: scale(4),
    color: '#fff',
    fontWeight: '600',
  },
});
