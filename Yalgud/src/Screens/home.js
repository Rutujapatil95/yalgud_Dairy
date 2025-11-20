import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  SectionList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

export const BASE_URL = 'http://192.168.1.11:8001';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const wp = p => SCREEN_WIDTH * (p / 100);
const hp = p => SCREEN_HEIGHT * (p / 100);
const isTablet = SCREEN_WIDTH >= 768;

const scale = num => (isTablet ? num * 1.35 : num);

const headerBackgroundColor = '#4A90E2';
const footerHeight = hp(8);

const Home = () => {
  const cartItems = useSelector(state => state.cart.items || []);
  const cartCount = cartItems.length;

  const navigation = useNavigation();
  const route = useRoute();
  const agentCode = route?.params?.agentCode || 0;

  return (
    <View style={styles.safeArea}>
      <StatusBar
        backgroundColor={headerBackgroundColor}
        barStyle="light-content"
      />

      <View style={[styles.headerContainer]}>
        <View style={styles.headerRow}>
          <Image
            source={require('../Images/logoto.png')}
            style={{ width: wp(12), height: wp(12) }}
          />

          <View style={styles.storeInfoContainer}>
            <Text style={styles.storeName}>Jay Bhavani Stores</Text>
            <Text style={styles.location}>Kolhapur</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('AddToCartScreen')}
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

      <ExploreContent agentCode={agentCode} />

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
              if (tab === 'Template')
                navigation.navigate('TemplateScreen', { agentCode });
              else if (tab === 'History')
                navigation.navigate('HistoryScreen', { agentCode });
              else if (tab === 'Profile')
                navigation.navigate('ProfileScreen', { agentCode });
              else if (tab === 'Home') navigation.navigate('Home');
            }}
          >
            <Ionicons name={icon} size={scale(24)} color="#fff" />
            <Text style={styles.navText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Home;

const ExploreContent = ({ agentCode = 0 }) => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const getImageUrl = url => url.replace('localhost', '192.168.1.11');

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {

        const response = await axios.get(`${BASE_URL}/api/categories/`);
        console.log('📦 Fetched Categories:', response.data);
        const categories = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('📦 Categories Array:', categories);

        const grouped = categories.reduce((acc, item) => {
          const titleEnglish = item.groupTitleEnglish || 'Other';
          const titleMarathi = item.groupTitleMarathi || '';

          const cat = {
            _id: item._id,
            nameEnglish: item.nameEnglish,
            nameMarathi: item.nameMarathi,
            descriptionEnglish: item.descriptionEnglish,
            descriptionMarathi: item.descriptionMarathi,
            image: item.image.startsWith('http')
              ? item.image
              : `${BASE_URL}/${item.image}`,
            DeptCode: item.DeptCode,
          };

          const existingGroup = acc.find(g => g.titleEnglish === titleEnglish);

          existingGroup
            ? existingGroup.data.push(cat)
            : acc.push({
                titleEnglish,
                titleMarathi,
                data: [cat],
              });

          return acc;
        }, []);

        if (isMounted) setGroupedData(grouped);
      } catch (err) {
        console.error('❌ Error fetching categories:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => (isMounted = false);
  }, []);

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#4A90E2"
        style={{ marginTop: hp(5) }}
      />
    );

  return (
    <SectionList
      sections={groupedData}
      keyExtractor={item => item._id || Math.random().toString()}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>
            {section.titleEnglish} / {section.titleMarathi}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('ProductScreen', {
              DeptCode: item.DeptCode,
              AgentCode: agentCode,
              Status: 0,
              ItemType: 2,
            })
          }
        >
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.cardImage}
          />
          <View style={{ flex: 1, paddingLeft: wp(3) }}>
            <Text style={styles.cardTitle}>{item.nameEnglish}</Text>
            <Text style={styles.cardTitle}>{item.nameMarathi}</Text>
            <Text style={styles.cardDesc}>{item.descriptionEnglish}</Text>
            <Text style={styles.cardDesc}>{item.descriptionMarathi}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{
        padding: wp(3),
        paddingBottom: footerHeight + hp(2),
      }}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  headerContainer: {
    paddingTop: hp(5),
    paddingBottom: hp(1.5),
    paddingHorizontal: wp(5),
    backgroundColor: headerBackgroundColor,
    elevation: 4,
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

  location: {
    fontSize: scale(wp(3.5)),
    color: '#fff',
  },

  footer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#2380FB',
    height: footerHeight,
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navButton: { flex: 1, alignItems: 'center' },
  navText: {
    fontSize: scale(wp(3)),
    color: '#fff',
    fontWeight: 'bold',
    marginTop: hp(0.5),
  },

  sectionHeader: {
    backgroundColor: '#4A90E2',
    padding: hp(1.2),
    borderRadius: scale(8),
    marginTop: hp(2),
  },

  sectionHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: scale(wp(4)),
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: scale(12),
    padding: wp(3),
    marginBottom: hp(1.5),
    elevation: 2,
  },

  cardImage: {
    width: wp(35),
    height: hp(17),
    borderRadius: scale(10),
    backgroundColor: '#eee',
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: scale(wp(4.3)),
  },

  cardDesc: {
    fontSize: scale(wp(3.7)),
    color: '#555',
  },

  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -5,
    backgroundColor: 'red',
    borderRadius: scale(10),
    width: scale(18),
    height: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: scale(10),
    fontWeight: 'bold',
  },
});
