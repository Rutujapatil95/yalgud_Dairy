// Home.js
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const headerBackgroundColor = '#4A90E2';
const footerHeight = 60;

export const BASE_URL = 'http://192.168.1.5:8000';

const Home = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <ExploreContent navigation={navigation} />;
      default:
        return (
          <View style={styles.centered}>
            <Text>{activeTab} Screen</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        backgroundColor={headerBackgroundColor}
        barStyle="light-content"
      />

      {/* Header */}
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: headerBackgroundColor },
        ]}
      >
        <View style={styles.headerRow}>
          <Ionicons name="menu" size={28} color="#fff" />
          <View style={styles.storeInfoContainer}>
            <Text style={styles.storeName}>Jay Bhavani Stores</Text>
            <Text style={styles.location}>Kolhapur</Text>
          </View>
          <Ionicons name="cart" size={28} color="#fff" />
        </View>
      </View>

      {/* Main Content */}
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {['Home', 'History', 'Profile'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.navButton}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={
                tab === 'Home' ? 'home' : tab === 'Profile' ? 'person' : 'time'
              }
              size={24}
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
    </View>
  );
};

const ExploreContent = ({ navigation }) => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Static category map for each DeptCode
  const STATIC_CATEGORY_MAP = {
    3: [
      {
        id: 1,
        name: 'Breads',
        itemCategoryCodes: [4, 5, 8, 6, 9, 11, 12],
      },
      { id: 2, name: 'Cakes', itemCategoryCodes: [42] },
      { id: 3, name: 'Cookies', itemCategoryCodes: [43] },
    ],
    16: [
      { id: 1, name: 'Biscuits & Cakes', itemCategoryCodes: [44] },
      { id: 2, name: 'Accessories', itemCategoryCodes: [45] },
      { id: 3, name: 'Flowers', itemCategoryCodes: [46] },
      { id: 4, name: 'Toys & Gifts', itemCategoryCodes: [47] },
      { id: 5, name: 'Greeting Cards', itemCategoryCodes: [48] },
    ],
    20: [
      { id: 1, name: 'Snacks', itemCategoryCodes: [49] },
      { id: 2, name: 'Namkeen', itemCategoryCodes: [50] },
      { id: 3, name: 'Wafers', itemCategoryCodes: [51] },
    ],
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/categories`);
        const categories = Array.isArray(response.data) ? response.data : [];

        const grouped = categories.reduce((acc, item) => {
          const titleEnglish = item.groupTitleEnglish || 'Other';
          const titleMarathi = item.groupTitleMarathi || '';

          const category = {
            _id: item._id,
            nameEnglish: item.nameEnglish,
            nameMarathi: item.nameMarathi,
            descriptionEnglish: item.descriptionEnglish,
            descriptionMarathi: item.descriptionMarathi,
            image: item.image?.startsWith('http')
              ? item.image
              : `${BASE_URL}/${item.image}`,
            DeptCode: item.DeptCode,
          };

          const existing = acc.find(g => g.titleEnglish === titleEnglish);
          if (existing) existing.data.push(category);
          else acc.push({ titleEnglish, titleMarathi, data: [category] });
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
        style={{ marginTop: 50 }}
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
          onPress={() => {
            console.log('🧾 Navigating with:', {
              DeptCode: item.DeptCode,
              Status: 0,
              ItemType: 2,
            });

            navigation.navigate('ProductScreen', {
              DeptCode: item.DeptCode,
              Status: 0,
              ItemType: 2,
            });
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.cardTitle}>{item.nameEnglish}</Text>
            <Text style={styles.cardTitle}>{item.nameMarathi}</Text>
            <Text style={styles.cardDesc}>{item.descriptionEnglish}</Text>
            <Text style={styles.cardDesc}>{item.descriptionMarathi}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 10, paddingBottom: footerHeight + 20 }}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    paddingTop: height * 0.05,
    paddingBottom: height * 0.015,
    paddingHorizontal: width * 0.05,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeInfoContainer: { flex: 1, alignItems: 'center' },
  storeName: { fontSize: width * 0.05, fontWeight: 'bold', color: '#fff' },
  location: { fontSize: width * 0.035, color: '#fff' },
  footer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#2380FB',
    height: footerHeight,
    justifyContent: 'space-around',
  },
  navButton: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navText: { fontSize: width * 0.03, fontWeight: 'bold', marginTop: 2 },
  sectionHeader: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 8,
    marginTop: 15,
  },
  sectionHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.042,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardImage: {
    width: width * 0.35,
    height: height * 0.18,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  cardTitle: { fontWeight: 'bold', fontSize: width * 0.043 },
  cardDesc: { fontSize: width * 0.037, color: '#555' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default Home;
