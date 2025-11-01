import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../../App';
import { translations } from '../locales/translations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_CONTENT_WIDTH = 600;

const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000'
    : 'http://192.168.1.21:8000';

const Offerscreen = () => {
  const navigation = useNavigation();
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  const flatListRef = useRef();
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/advertisements/`);
        const data = await response.json();

        console.log('📢 Offers API Response:', data);

        const updatedData = data.map(item => ({
          ...item,
          image: item.image.startsWith('http')
            ? item.image
            : `${BASE_URL}${item.image}`,
        }));

        setOffers(updatedData);
      } catch (error) {
        console.error('❌ Error fetching advertisements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  useEffect(() => {
    if (offers.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, offers]);

  const handleScroll = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderOfferItem = ({ item, index }) => {
    const isActive = index === currentIndex;
    return (
      <Animated.View
        style={[styles.offerContainer, isActive && styles.activeSlide]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.offerImage}
          resizeMode="cover"
          onError={e =>
            console.log('❌ Image failed to load:', item.image, e.nativeEvent)
          }
        />
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.background,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../Images/bgimage.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <View style={styles.header}>
          <Image
            source={require('../Images/logoto.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t.offersTitle}</Text>
        </View>

        {offers.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={offers}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderOfferItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              style={{ flexGrow: 0 }}
            />

            <View style={styles.pagination}>
              {offers.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        currentIndex === index ? '#8000ff' : '#ccc',
                    },
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <Text style={{ color: '#000', fontSize: 16, marginTop: 20 }}>
            {t.noOffers || 'No offers available'}
          </Text>
        )}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('home')}
          activeOpacity={0.8}
        >
          <Text style={styles.skipText}>{t.skip}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, alignItems: 'center', paddingTop: SCREEN_HEIGHT * 0.2 },
  header: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
    marginTop: SCREEN_HEIGHT * 0.06,
    width: '90%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
  logo: {
    width: SCREEN_WIDTH * 0.3,
    maxWidth: 180,
    height: SCREEN_WIDTH * 0.3,
    maxHeight: 150,
    marginTop: -120,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.07,
    maxWidth: MAX_CONTENT_WIDTH,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginTop: 50,
  },
  offerContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.45,
    marginBottom: -40,
  },
  activeSlide: {
    transform: [{ scale: 1.02 }],
  },
  offerImage: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 400,
    height: SCREEN_HEIGHT * 0.45,
    maxHeight: 400,
    borderRadius: 22,
    borderColor: '#000',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  pagination: {
    flexDirection: 'row',
    marginVertical: SCREEN_HEIGHT * 0.025,
    justifyContent: 'center',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    marginBottom: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  skipButton: {
    borderWidth: 1.5,
    borderColor: '#000',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.25,
    maxWidth: MAX_CONTENT_WIDTH,
    borderRadius: 10,
    marginTop: SCREEN_HEIGHT * 0.01,
    backgroundColor: '#2563EB',
    alignSelf: 'center',
  },
  skipText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Offerscreen;
