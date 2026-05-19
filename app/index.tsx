import { Text, View } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/map" />;
}

// ❌ 之前的错误写法
// import { GaodeMap, MapType } from 'expo-gaode-map';

// ✅ 正确的导入和写法
// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { MapView } from 'expo-gaode-map'; // 组件名是 MapView

// const MapScreen = () => {
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialCameraPosition={{
//           target: {
//             latitude: 39.91095,
//             longitude: 116.37296
//           },
//           zoom: 11
//         }}
//         myLocationEnabled // 显示用户位置
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   map: { flex: 1 },
// });

// export default MapScreen;