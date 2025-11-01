// ✅ CheckoutScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';

const CheckoutScreen = ({ route }) => {
  const { selectedItems = [] } = route.params || {};

  const grandTotal = selectedItems
    .reduce(
      (acc, i) => acc + parseFloat(i.total || i.price * i.quantity || 0),
      0,
    )
    .toFixed(2);

  const handlePlaceOrder = () => {
    Alert.alert(
      '✅ Order Placed',
      `Your order of ₹${grandTotal} has been placed successfully!`,
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}> Checkout</Text>

        {selectedItems.map((item, idx) => {
          const itemPrice = parseFloat(item.price) || 0;
          const itemQty = parseInt(item.quantity) || 1;
          const itemTotal = parseFloat(item.total) || itemPrice * itemQty;

          return (
            <View key={idx} style={styles.card}>
              <View style={styles.lineOne}>
                <Text style={styles.itemName}>{item.ItemNameEnglish}</Text>
                <Text style={styles.itemCode}>Code: {item.ItemCode}</Text>
              </View>

              <Text style={styles.marathiName}>{item.ItemNameMarathi}</Text>

              <View style={styles.lineTwo}>
                <Text style={styles.qty}>
                  Qty: {itemQty} × ₹{itemPrice.toFixed(2)}
                </Text>
                <Text style={styles.itemTotal}>₹ {itemTotal.toFixed(2)}</Text>
              </View>
            </View>
          );
        })}

        {/* Space so bottom bar won't cover content */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Fixed Bottom Total Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Grand Total:</Text>
          <Text style={styles.totalValue}>₹ {grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Place Order • ₹{grandTotal}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F6FA' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 35,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 7,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 15,
    elevation: 3,
    marginTop: 5,
  },
  lineOne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  itemCode: { fontSize: 13, color: '#777', marginLeft: 8 },
  marathiName: { fontSize: 14, color: '#555', marginTop: 4 },
  lineTwo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qty: { fontSize: 15, color: '#333' },
  itemTotal: { fontSize: 16, fontWeight: '700', color: '#28A745' },

  bottomBar: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    padding: 14,
    elevation: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#333' },
  totalValue: { fontSize: 20, fontWeight: '700', color: '#007AFF' },
  placeOrderBtn: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  placeOrderText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

export default CheckoutScreen;
