import React, { useRef, useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_CONTENT_WIDTH = 650;

const BASE_URL = 'http://192.168.1.11:8001';

const wp = p => SCREEN_WIDTH * (p / 100);
const hp = p => SCREEN_HEIGHT * (p / 100);

const isTablet = SCREEN_WIDTH >= 768;

const scale = value => {
  if (isTablet) return value * 1.35;
  return value;
};

const Offerscreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const flatListRef = useRef();0
  const [offers, setOffers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const { agentCode } = route.params || {};

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/advertisements/`);
        const data = await response.json();

        const updatedData = data.map(item => ({
          ...item,
          image: item.image.startsWith('http')
            ? item.image
            : `${BASE_URL}${item.image}`,
        }));

        setOffers(updatedData);
      } catch (error) {
        console.log('❌ Error fetching advertisements:', error);
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
        style={[
          styles.offerContainer,
          isActive && { transform: [{ scale: 1.05 }] },
        ]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.offerImage}
          resizeMode="cover"
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
          <Text style={styles.title}>Yalgud Dairy</Text>
        </View>

        {offers.length > 0 ? (
          <>
            <FlatList
              ref={flatListRef}
              data={offers}
              keyExtractor={(_, i) => i.toString()}
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
          <Text style={styles.noOfferText}>No offers available</Text>
        )}

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('home', { agentCode })}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(12),
  },

  header: {
    alignItems: 'center',
    marginBottom: hp(3),
    marginTop: hp(5),
    width: '90%',
    maxWidth: MAX_CONTENT_WIDTH,
  },

  logo: {
    width: wp(35),
    height: wp(35),
    marginTop: -hp(9),
  },

  title: {
    fontSize: scale(wp(7)),
    fontWeight: '700',
    color: '#000',
    marginTop: hp(4),
    textAlign: 'center',
  },

  offerContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(45),
  },

  offerImage: {
    width: wp(80),
    height: hp(45),
    borderRadius: scale(22),
    backgroundColor: '#f0f0f0',
  },

  pagination: {
    flexDirection: 'row',
    marginVertical: hp(2.5),
    justifyContent: 'center',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },

  dot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    marginHorizontal: scale(5),
  },

  skipButton: {
    borderWidth: 1.5,
    borderColor: '#000',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(25),
    borderRadius: scale(10),
    backgroundColor: '#2563EB',
  },

  skipText: {
    color: '#fff',
    fontSize: scale(wp(4)),
    fontWeight: '600',
    textAlign: 'center',
  },

  noOfferText: {
    color: '#000',
    fontSize: wp(4.5),
    marginTop: hp(2),
  },
});

export default Offerscreen;
