import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { MapMode, PlaceResult } from '../../types/map';

const MODE_OPTIONS: { mode: MapMode; icon: string; label: string }[] = [
  { mode: 'cloudsea', icon: 'filter-drama', label: '云海' },
  { mode: 'weather', icon: 'wb-cloudy', label: '常规' },
];

type SearchState = 'default' | 'loading' | 'result';

interface SearchOverlayProps {
  onSearch: (query: string) => void;
  onFavoritePress?: () => void;
  mode: MapMode;
  onModeChange: (mode: MapMode) => void;
  searchResult: PlaceResult | null;
  searchState?: SearchState;
}

export default function SearchOverlay({
  onSearch,
  onFavoritePress,
  mode,
  onModeChange,
  searchResult: _searchResult,
  searchState = 'default',
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const currentMode = MODE_OPTIONS.find((m) => m.mode === mode) || MODE_OPTIONS[0];

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  const renderRightIcon = () => {
    switch (searchState) {
      case 'loading':
        return (
          <ActivityIndicator
            size={14}
            color="rgba(189,170,110,0.6)"
            style={styles.rightIcon}
          />
        );
      case 'result':
        return (
          <TouchableOpacity onPress={onFavoritePress} hitSlop={8} style={styles.rightIcon}>
            <MaterialIcons name="bookmark-border" size={18} color="#928f99" />
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity style={styles.rightIcon} hitSlop={8}>
            <Text style={styles.questionIcon}>?</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons
            name="search"
            size={16}
            color="rgba(255,255,255,0.3)"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="输入地点或者经纬度坐标"
            placeholderTextColor="rgba(255,255,255,0.18)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
          />
          {renderRightIcon()}
        </View>
      </View>

      {/* Mode switch */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={styles.modeToggle}
          onPress={() => setModeMenuOpen(!modeMenuOpen)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={currentMode.icon as keyof typeof MaterialIcons.glyphMap}
            size={12}
            color="rgba(255,255,255,0.5)"
          />
          <Text style={styles.modeText}>{currentMode.label}</Text>
          <MaterialIcons
            name={modeMenuOpen ? 'arrow-drop-up' : 'arrow-drop-down'}
            size={16}
            color="rgba(255,255,255,0.2)"
          />
        </TouchableOpacity>

        {/* Dropdown menu */}
        {modeMenuOpen && (
          <View style={styles.modeMenu}>
            {MODE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.mode}
                style={[
                  styles.modeMenuItem,
                  mode === opt.mode && styles.modeMenuItemActive,
                ]}
                onPress={() => {
                  onModeChange(opt.mode);
                  setModeMenuOpen(false);
                }}
              >
                <MaterialIcons
                  name={opt.icon as keyof typeof MaterialIcons.glyphMap}
                  size={14}
                  color={mode === opt.mode ? '#e5e1e6' : '#928f99'}
                />
                <Text
                  style={[
                    styles.modeMenuText,
                    mode === opt.mode && styles.modeMenuTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28,27,30,0.92)',
    borderRadius: 7,
    paddingLeft: 14,
    paddingRight: 10,
    height: 38,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#e5e1e6',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  rightIcon: {
    marginLeft: 4,
  },
  questionIcon: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },

  // Mode switch
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    position: 'relative',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(28,27,30,0.92)',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modeText: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
  },
  modeMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: 'rgba(28,27,30,0.95)',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    minWidth: 100,
  },
  modeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modeMenuItemActive: {
    backgroundColor: 'rgba(116,115,155,0.15)',
  },
  modeMenuText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#928f99',
  },
  modeMenuTextActive: {
    color: '#e5e1e6',
    fontFamily: 'Inter_600SemiBold',
  },
});
