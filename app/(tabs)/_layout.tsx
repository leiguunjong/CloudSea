import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#74739b',
        tabBarInactiveTintColor: '#928f99',
        tabBarStyle: {
          backgroundColor: '#1c1b1e',
          borderTopColor: 'rgba(116, 115, 155, 0.1)',
          borderTopWidth: 1,
          position: 'absolute',
          bottom: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          letterSpacing: 3,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: '地图',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: '我',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
