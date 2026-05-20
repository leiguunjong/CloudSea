import { View, StyleSheet } from "react-native";
import { MapView } from "expo-gaode-map";

export default function MapPage() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialCameraPosition={{
          target: {
            latitude: 39.91095,
            longitude: 116.37296,
          },
          zoom: 11,
        }}
        myLocationEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});