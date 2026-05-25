import { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import type { MapMode, SlotForecast } from '../../types/map';
import { GEMSTONE_COLORS } from '../../types/map';

// --- Fixed layout constants ---
const TOTAL_SLOTS = 73;
const SLOTS_PER_DAY = 12;
const ROW_PADDING = 2;
const TRACK_HEIGHT = 4;

const PANEL_BOTTOM = 74;
const PANEL_H_PADDING = 10;
const PANEL_LEFT = 12;

const BADGE_ABOVE = 6;
const BADGE_HEIGHT = 18;

const DAY_LABELS = ['-1', '今天', '+1', '+2', '+3', '+4', '+5'];

// Base units (fixed-ratio grid):
//   7 large items × 4 = 28
//   66 small items × 2 = 132
//   6 large→small gaps × 1 = 6
//   6 small→large gaps × 1 = 6
//   60 small→small gaps × 2 = 120
//   2 × ROW_PADDING = 4
//   Total = 296
const TOTAL_BASE_UNITS = 296;

// Gap multiplier by adjacent-pair type
function gapForPair(prevIsLarge: boolean, nextIsLarge: boolean): number {
  if (prevIsLarge || nextIsLarge) return 1; // L→S or S→L
  return 2; // S→S
}

// --- Props ---
interface ForecastPanelProps {
  mode: MapMode;
  forecast: SlotForecast | null;
  visible: boolean;
  selectedIndex: number;
  onSelectSlot: (index: number) => void;
}

// --- Color helpers ---
function getBarColor(prob: number): string {
  if (prob >= 90) return GEMSTONE_COLORS[5];
  if (prob >= 75) return GEMSTONE_COLORS[4];
  if (prob >= 55) return GEMSTONE_COLORS[3];
  if (prob >= 30) return GEMSTONE_COLORS[2];
  return GEMSTONE_COLORS[1];
}

// --- Pulse ring animated component ---
function PulseRing() {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2.4, 0.8],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -4,
        left: -4,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(196,170,69,0.6)',
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

// --- Main component ---
export default function ForecastPanel({
  mode,
  forecast,
  visible,
  selectedIndex,
  onSelectSlot,
}: ForecastPanelProps) {
  const [badgeWidth, setBadgeWidth] = useState(80);
  const [panelWidth, setPanelWidth] = useState(0);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const panelHeight = screenHeight / 9;
  const barMaxHeight = panelHeight / 4;

  const initialPanelWidth = screenWidth - PANEL_LEFT - 12;

  // Precompute per-index: isLarge, item width, gap to next
  const slotMeta = useMemo(() => {
    return Array.from({ length: TOTAL_SLOTS }, (_, i) => {
      const isLarge = i % SLOTS_PER_DAY === 0;
      const nextIsLarge = (i + 1) % SLOTS_PER_DAY === 0;
      return { isLarge, itemW: isLarge ? 4 : 2, gapToNext: i < 72 ? gapForPair(isLarge, nextIsLarge) : 0 };
    });
  }, []);

  // Compute dynamic sizes from actual panel width
  const { unit, large, small, slotStarts } = useMemo(() => {
    const w = panelWidth > 0 ? panelWidth : initialPanelWidth;
    const available = w - 2 * PANEL_H_PADDING;
    const u = available / TOTAL_BASE_UNITS;

    // Precompute slot start positions (relative to row content, before ROW_PADDING)
    const starts: number[] = [];
    let pos = 0;
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      starts.push(pos);
      const meta = slotMeta[i];
      pos += meta.itemW * u + meta.gapToNext * u;
    }

    return {
      unit: u,
      large: 4 * u,
      small: 2 * u,
      slotStarts: starts,
    };
  }, [panelWidth, initialPanelWidth, slotMeta]);

  // getSlotCenterX inside the panel coordinate system (relative to panel left edge)
  const getSlotCenterX = (index: number) => {
    return PANEL_H_PADDING + ROW_PADDING * unit + slotStarts[index] + (slotMeta[index].isLarge ? large : small) / 2;
  };

  if (!visible || !forecast) return null;

  const selectedCenterX = getSlotCenterX(selectedIndex);
  const selectedSlot = forecast.slots[selectedIndex];
  const panelTop = PANEL_BOTTOM + panelHeight;

  const badgeBottom = panelTop + BADGE_ABOVE + BADGE_HEIGHT;
  const dotScreenX = PANEL_LEFT + PANEL_H_PADDING + ROW_PADDING * unit + slotStarts[selectedIndex] + (slotMeta[selectedIndex].isLarge ? large : small) / 2;

  const dtBottom = PANEL_BOTTOM - 8;

  const renderBar = (i: number) => {
    const meta = slotMeta[i];
    const slot = i < 72 ? forecast.slots[i] : null;
    const barH = slot ? (slot.cloudSeaProbability / 100) * barMaxHeight : 0;
    const color = slot ? getBarColor(slot.cloudSeaProbability) : 'transparent';
    const glow = barH >= barMaxHeight * 0.85;
    const gapRight = meta.gapToNext * unit;

    return (
      <View
        key={i}
        style={{
          width: meta.isLarge ? large : small,
          flexShrink: meta.isLarge ? 0 : 1,
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginRight: gapRight,
        }}
      >
        <View
          style={{
            width: small,
            height: Math.max(0, barH),
            backgroundColor: color,
            borderTopLeftRadius: 1,
            borderTopRightRadius: 1,
            ...(glow
              ? {
                  shadowColor: color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 2,
                }
              : {}),
          }}
        />
      </View>
    );
  };

  const renderDot = (i: number) => {
    const meta = slotMeta[i];
    const isSelected = i === selectedIndex;
    const size = meta.isLarge ? large : small;
    const borderRadius = meta.isLarge ? size / 4 : size / 2;
    const gapRight = meta.gapToNext * unit;

    return (
      <TouchableOpacity
        key={i}
        activeOpacity={0.7}
        onPress={() => onSelectSlot(i)}
        style={{
          width: size,
          height: size,
          borderRadius,
          flexShrink: meta.isLarge ? 0 : 1,
          marginRight: gapRight,
          backgroundColor: isSelected
            ? '#c4aa45'
            : meta.isLarge
              ? 'rgba(255,255,255,0.20)'
              : 'rgba(255,255,255,0.10)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && <PulseRing />}
      </TouchableOpacity>
    );
  };

  const renderLabel = (i: number) => {
    const meta = slotMeta[i];
    const dayIdx = i / SLOTS_PER_DAY;
    const gapRight = meta.gapToNext * unit;

    return (
      <View
        key={i}
        style={{
          width: meta.isLarge ? large : small,
          flexShrink: meta.isLarge ? 0 : 1,
          marginRight: gapRight,
          overflow: 'visible' as const,
        }}
      >
        {meta.isLarge && dayIdx < DAY_LABELS.length && (
          <Text style={styles.labelText} numberOfLines={1}>
            {DAY_LABELS[dayIdx]}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      {selectedSlot && (
        <View
          style={[
            styles.badge,
            {
              bottom: badgeBottom,
              left: dotScreenX - badgeWidth / 2,
            },
          ]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) setBadgeWidth(w);
          }}
        >
          <Text style={styles.badgeProb}>
            {selectedSlot.cloudSeaProbability}%
          </Text>
          <Text style={styles.badgeMode}>
            {mode === 'cloudsea' ? '云海' : '天气'}
          </Text>
          <Text style={styles.badgeLevel}>
            {selectedSlot.cloudSeaLevelName}
          </Text>
        </View>
      )}

      {selectedSlot && (
        <Text
          style={[
            styles.dateTime,
            {
              bottom: dtBottom,
              left: dotScreenX - 24,
            },
          ]}
        >
          {selectedSlot.date} {String(selectedSlot.hour).padStart(2, '0')}:00
        </Text>
      )}

      <View
        style={[styles.panel, { height: panelHeight }]}
        onLayout={(e) => setPanelWidth(e.nativeEvent.layout.width)}
      >
        {/* Bar chart */}
        <View style={[styles.barChartRow, { height: barMaxHeight, paddingHorizontal: ROW_PADDING * unit }]}>
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => renderBar(i))}
        </View>

        {/* Time track */}
        <View style={styles.trackContainer}>
          <View style={styles.baseline} />
          <View style={[styles.dotsRow, { paddingHorizontal: ROW_PADDING * unit }]}>
            {Array.from({ length: TOTAL_SLOTS }).map((_, i) => renderDot(i))}
          </View>
        </View>

        {/* Day labels */}
        <View style={[styles.labelsRow, { paddingHorizontal: ROW_PADDING * unit }]}>
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => renderLabel(i))}
        </View>
      </View>
    </>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    height: BADGE_HEIGHT,
    paddingHorizontal: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 15,
  },
  badgeProb: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  badgeMode: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
  },
  badgeLevel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
  },

  dateTime: {
    position: 'absolute',
    fontSize: 7,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.15)',
    zIndex: 15,
  },

  panel: {
    position: 'absolute',
    bottom: PANEL_BOTTOM,
    left: PANEL_LEFT,
    right: 12,
    backgroundColor: 'rgba(10,20,30,0.78)',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(189,170,110,0.08)',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: PANEL_H_PADDING,
    zIndex: 11,
  },

  barChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 2,
  },

  trackContainer: {
    height: TRACK_HEIGHT,
    justifyContent: 'center',
  },
  baseline: {
    position: 'absolute',
    top: TRACK_HEIGHT / 2,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  labelsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  labelText: {
    fontSize: 7,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.15)',
  },
});
