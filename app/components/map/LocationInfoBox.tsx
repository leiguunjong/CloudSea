import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { DailyForecast, MapMode, SlotForecast } from '../../types/map';
import { GEMSTONE_COLORS } from '../../types/map';

interface LocationInfoBoxProps {
  mode: MapMode;
  slotForecast?: SlotForecast | null;
  dailyForecast?: DailyForecast[];
}

function getWeatherIcon(weatherType?: string): keyof typeof MaterialIcons.glyphMap {
  switch (weatherType) {
    case 'clear': return 'wb-sunny';
    case 'partly-cloudy': return 'cloud-queue';
    case 'cloudy': return 'cloud';
    case 'rain': return 'water-drop';
    default: return 'wb-cloudy';
  }
}

export default function LocationInfoBox({
  mode,
  slotForecast,
  dailyForecast,
}: LocationInfoBoxProps) {
  if (mode === 'cloudsea' && slotForecast) {
    const topProb = slotForecast.maxCloudSeaProb;
    const level = slotForecast.bestSlot.cloudSeaLevel;
    const levelColor = GEMSTONE_COLORS[level];

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <MaterialIcons name="filter-drama" size={20} color={levelColor} />
          <Text style={styles.probText}>{Math.round(topProb)}%</Text>
          <MaterialIcons name="chevron-right" size={14} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={styles.arrow} />
      </View>
    );
  }

  if (mode === 'weather' && dailyForecast) {
    const today = dailyForecast[0];
    const currentHour = new Date().getHours();
    const currentPoint = today?.hourly[currentHour];

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <MaterialIcons
            name={getWeatherIcon(currentPoint?.weatherType)}
            size={20}
            color="#bdaa6e"
          />
          <Text style={styles.probText}>{currentPoint?.temperature ?? '--'}°</Text>
          <MaterialIcons name="chevron-right" size={14} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={styles.arrow} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(19,19,22,0.55)',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(189,170,110,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 77,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  probText: {
    color: '#e0d8c0',
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  arrow: {
    width: 14,
    height: 8,
    backgroundColor: 'rgba(19,19,22,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(189,170,110,0.12)',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    transform: [{ rotate: '45deg' }],
    marginTop: -5,
    marginBottom: 5,
  },
});
