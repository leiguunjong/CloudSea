import { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MapView, Marker, MapType } from 'expo-gaode-map';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import type { MapViewRef } from 'expo-gaode-map';

import { SearchOverlay, LocationInfoBox, ForecastPanel } from '../components/map';
import type { MapMode, PlaceResult, DailyForecast, SlotForecast } from '../types/map';
import { searchPlaces, getForecast, getSlotForecast } from '../services/map-api';

export default function MapPage() {
  const mapRef = useRef<MapViewRef>(null);
  const [mode, setMode] = useState<MapMode>('cloudsea');
  const [searchResult, setSearchResult] = useState<PlaceResult | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[] | null>(null);
  const [slotForecast, setSlotForecast] = useState<SlotForecast | null>(null);
  const [bearing, setBearing] = useState(0);

  // Default selected slot: current hour's 2h slot within today (slots 12-23)
  const now = new Date();
  const currentSlot = Math.floor(now.getHours() / 2) + 12;
  const [selectedIndex, setSelectedIndex] = useState(currentSlot);

  const handleSearch = useCallback(async (query: string) => {
    const coordMatch = query.match(/^(-?\d+\.?\d*)\s*[,，]\s*(-?\d+\.?\d*)$/);
    let place: PlaceResult;

    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      place = {
        id: 'coord',
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        address: '',
        latitude: lat,
        longitude: lng,
      };
    } else {
      const results = await searchPlaces(query);
      if (results.length === 0) return;
      place = results[0];
    }

    setSearchResult(place);

    mapRef.current?.moveCamera(
      {
        target: { latitude: place.latitude, longitude: place.longitude },
        zoom: 13,
      },
      600,
    );

    const [daily, slots] = await Promise.all([
      getForecast(place.latitude, place.longitude),
      getSlotForecast(place.latitude, place.longitude),
    ]);
    setDailyForecast(daily);
    setSlotForecast(slots);
    setSelectedIndex(currentSlot);
  }, [currentSlot]);

  const handleLocate = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    mapRef.current?.moveCamera(
      {
        target: { latitude, longitude },
        zoom: 15,
      },
      600,
    );
  }, []);

  const handleCompassPress = useCallback(() => {
    mapRef.current?.moveCamera({ bearing: 0 }, 300);
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={MapType.Night}
        initialCameraPosition={{
          target: { latitude: 39.91095, longitude: 116.37296 },
          zoom: 11,
        }}
        myLocationEnabled
        compassEnabled={false}
        onCameraMove={(e) => {
          setBearing(e.nativeEvent.cameraPosition.bearing ?? 0);
        }}
      >
        {searchResult && (
          <Marker
            position={{
              latitude: searchResult.latitude,
              longitude: searchResult.longitude,
            }}
          >
            <LocationInfoBox
              mode={mode}
              slotForecast={slotForecast}
              dailyForecast={dailyForecast || []}
            />
          </Marker>
        )}
      </MapView>

      <SearchOverlay
        onSearch={handleSearch}
        mode={mode}
        onModeChange={setMode}
        searchResult={searchResult}
      />

      <TouchableOpacity
        style={[
          styles.compassBtn,
          { transform: [{ rotate: `${bearing}deg` }] },
        ]}
        onPress={handleCompassPress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="near-me" size={16} color="rgba(255,255,255,0.6)" />
      </TouchableOpacity>

      <ForecastPanel
        mode={mode}
        forecast={slotForecast}
        visible
        selectedIndex={selectedIndex}
        onSelectSlot={setSelectedIndex}
      />

      <TouchableOpacity
        style={styles.locateBtn}
        onPress={handleLocate}
        activeOpacity={0.8}
      >
        <MaterialIcons name="my-location" size={22} color="#e5e1e6" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locateBtn: {
    position: 'absolute',
    right: 16,
    bottom: '33%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 27, 30, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(116, 115, 155, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBtn: {
    position: 'absolute',
    top: 60 + 38 + 6,
    left: 20,
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(28, 27, 30, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
