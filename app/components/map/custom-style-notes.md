# 高德地图自定义暗色样式 -- 研究笔记

> 目标：为 CloudSea 地图页（`app/(tabs)/map.tsx`）创建一段与 App 暗色设计语言和谐统一的自定义地图样式。

---

## 1. 当前状态

`map.tsx` 第 84 行使用 `MapType.Night`（值 `3`）启用高德内置的黑夜地图：

```tsx
<MapView
  ref={mapRef}
  style={styles.map}
  mapType={MapType.Night}   // 内置暗色，无法自定义配色
  ...
/>
```

`MapType.Night` 是一个预设样式，颜色方案由高德固化，无法调整。要获得与 App 视觉语言统一的暗色地图，需要使用 `customMapStyle` 属性。

---

## 2. customMapStyle 属性完整说明

`expo-gaode-map` 的 `MapView` 组件暴露了 `customMapStyle` prop，类型定义如下：

```typescript
// 来源: node_modules/expo-gaode-map/build/types/map-view.types.d.ts (lines 217-224)
customMapStyle?: {
  /** 在线样式ID（从高德开放平台获取） */
  styleId?: string;
  /** 本地样式文件路径 */
  styleDataPath?: string;
  /** 额外样式文件路径（可选） */
  extraStyleDataPath?: string;
};
```

### 2.1 两种使用方式

| 方式 | 属性 | 描述 | 适用场景 |
|------|------|------|----------|
| **在线样式** | `styleId` | 在高德开放平台创建并发布样式后获得 ID | 开发/测试阶段，可热更新 |
| **本地样式** | `styleDataPath` + `extraStyleDataPath` | 从 GeoHUB 导出 .data 文件并打包进 bundle | 生产环境，无网络依赖，不受在线限制 |

### 2.2 代码示例

```tsx
// 方案 A: 在线样式（推荐开发阶段使用，方便迭代）
<MapView
  customMapStyle={{ styleId: "ab84514368ab39bd0e607b5a5430605c" }}
  // ...
/>

// 方案 B: 本地样式文件（推荐生产环境使用）
<MapView
  customMapStyle={{
    styleDataPath: "amap_style.data",        // 放在 iOS bundle / Android assets 中
    extraStyleDataPath: "amap_extra.data",   // 可选
  }}
  // ...
/>
```

### 2.3 原生层实现确认

Android 端 (`node_modules/expo-gaode-map/android/.../managers/UIManager.kt`):

```kotlin
fun setCustomMapStyle(styleData: Map<String, Any>) {
  // 在线样式
  val styleId = styleData["styleId"] as? String
  if (!styleId.isNullOrEmpty()) {
    val options = com.amap.api.maps.model.CustomMapStyleOptions()
    options.isEnable = true
    options.styleId = styleId
    aMap.setCustomMapStyle(options)
    return
  }
  // 本地样式
  val styleDataPath = styleData["styleDataPath"] as? String
  if (!styleDataPath.isNullOrEmpty()) {
    val options = com.amap.api.maps.model.CustomMapStyleOptions()
    options.isEnable = true
    options.styleDataPath = styleDataPath
    // ...
  }
}
```

iOS 端 (`node_modules/expo-gaode-map/ios/managers/UIManager.swift`):

```swift
func setCustomMapStyle(_ styleData: [String: Any]) {
  // 在线样式
  if let styleId = styleData["styleId"] as? String, !styleId.isEmpty {
    let customStyle = MAMapCustomStyleOptions()
    customStyle.styleId = styleId
    cachedCustomStyleOptions = customStyle
    mapView.setCustomMapStyleOptions(customStyle)
    mapView.customMapStyleEnabled = true
  }
  // 本地样式：通过 Bundle.main.path 查找文件并读取为 Data
  // ...
}
```

**关键细节：iOS 端在切换 `mapType` 后会重新应用自定义样式**（`UIManager.swift` 第 46-49 行），这是 2.2.34 版本的一个修复。

### 2.4 与 mapType 的关系

- `customMapStyle` 是叠加在 `mapType` 之上的。建议搭配 `mapType={MapType.Standard}` 使用，让自定义样式全面接管地图渲染。
- 如果同时使用 `MapType.Night`，自定义样式会覆盖夜间地图的默认配色。

---

## 3. 高德开放平台自定义样式完整流程

### 3.1 前提条件

- 已有高德开放平台账号（与申请 API Key 的同一个账号）
- 应用已创建并配置了 Key（androidKey / iosKey）
- 注意：**样式 ID 和 Key 必须属于同一个开发者账号**

### 3.2 操作步骤

#### Step 1: 进入自定义地图平台

打开 [GeoHUB 定制地图](https://geohub.amap.com/mapstyle/index)。

#### Step 2: 选择模板

在左侧选择「自定义地图」，从预设模板中选择一个作为起点。

推荐选择 **「极夜蓝」（darkblue）** 作为暗色模板起点，它比「幻影黑」（dark）更容易调和成目标色板。

可用预设模板（供参考）：

| 样式名 | styleId | 说明 |
|--------|---------|------|
| 标准 | `amap://styles/normal` | 日间标准 |
| 月光银 | `amap://styles/light` | 浅色 |
| 远山黛 | `amap://styles/whitesmoke` | 极浅 |
| 草色青 | `amap://styles/fresh` | 清新绿色 |
| 幻影黑 | `amap://styles/dark` | 纯黑风格 |
| 极夜蓝 | `amap://styles/darkblue` | 深蓝暗色（推荐的模板起点） |
| 雅士灰 | `amap://styles/grey` | 灰色调 |
| 涂鸦 | `amap://styles/graffiti` | 涂鸦风 |
| 马卡龙 | `amap://styles/macaron` | 柔和多彩 |
| 靛青蓝 | `amap://styles/blue` | 蓝色系 |

#### Step 3: 编辑地图元素

左侧面板列出 **44 种可配置地图元素**，分为以下几大类：

**区域面（底图背景）**
| 元素 | 可配置 |
|------|--------|
| 陆地 | 填充颜色、透明度 |
| 水系（海洋/河流/湖泊） | 填充颜色、边界颜色 |
| 绿地/公园 | 填充颜色 |
| 建筑/楼块 | 填充颜色、轮廓颜色 |
| 大学/景区/医院等 | 填充颜色 |

**道路**
| 元素 | 可配置 |
|------|--------|
| 高速/快速路 | 线颜色、线宽 |
| 国道 | 线颜色、线宽 |
| 省道 | 线颜色、线宽 |
| 城市主干道 | 线颜色、线宽 |
| 街道/小路 | 线颜色、线宽 |
| 铁路 | 线颜色 |

**文字/标注**
| 元素 | 可配置 |
|------|--------|
| 行政区名（省/市/区） | 文字颜色、字体大小 |
| 乡镇/村庄名 | 文字颜色 |
| POI 标注（医院/超市/学校等） | 文字颜色 |
| 道路名称 | 文字颜色 |
| 地图标尺 | 文字颜色 |

**边界**
| 元素 | 可配置 |
|------|--------|
| 省界/市界 | 线颜色、线宽 |
| 景区围墙/小区围墙 | 线颜色 |
| 3D 楼块 | 颜色、高度样式 |

#### Step 4: 保存并发布

- 编辑完成后点击 **「保存」**
- 然后点击 **「发布」** — **这一步骤至关重要**，仅保存不发布不会生效
- 发布后大约 **1 分钟** 生效

#### Step 5: 获取样式 ID

- 点击 **「分享」**获取样式 ID（一串十六进制字符串，如 `ab84514368ab39bd0e607b5a5430605c`）
- 也可以在 [自定义地图控制台](https://geohub.amap.com/mapstyle/index) 中查看

#### Step 6: 在代码中使用

```tsx
// 将 MapType.Night 替换为：
mapType={MapType.Standard}           // 使用标准底图，由自定义样式接管
customMapStyle={{ styleId: "你的样式ID" }}
```

### 3.3 关键限制

- **免费账号限制**：免费账号使用自定义在线样式可能 **5 分钟后失效**，恢复默认
- **解决方案**：升级到企业版，或导出 `.data` 文件作为本地样式加载（本地样式无此限制）
- **创建次数限制**：每个账号只能免费创建 **1 次**自定义样式
- **升级入口**：https://developer.amap.com/upgrade#mapstyle

---

## 4. 与 CloudSea 设计系统匹配的暗色色板建议

### 4.1 App 设计令牌回顾

| Token | 色值 | 角色 |
|-------|------|------|
| 主背景 | `#131316` | 全局暗色底色 |
| 卡片表面 | `rgba(255,255,255,0.05)` | 玻璃拟态卡片 |
| Dusty Lavender | `#74739b` | 主色调 |
| Solar Gold | `#bdaa6e` | 强调色 |
| 一级文字 | `#e5e1e6` | 标题 |
| 二级文字 | `#c8c5cf` | 正文 |
| 三级文字 | `#928f99` | 辅助信息 |

### 4.2 推荐的地图元素配色方案

原则：**地图是背景层，UI overlay（搜索框、预报面板）是前景层。地图应低调、大气、不抢戏。**

```
底图背景
├── 陆地背景:       #15181c  (略冷于 #131316，与主背景拉开微弱层次)
├── 水系/海洋:      #1a1f2e  (深蓝灰，静默冷感)
├── 水系/河流湖泊:  #1c2235  (略亮于海洋，形成水体层级)
├── 绿地/公园:      #1b2a1f  (极暗绿，压低饱和度)

建筑
├── 楼块填充:       #1e1e24  (几乎融入背景)
├── 楼块轮廓:       #2a2a35  (低对比度)
├── 3D 楼块:        使用默认或关闭 (buildingsEnabled={false})

道路（按层级从主干到支路递减亮度）
├── 高速/快速路:    #3a3a50  (稍亮，识别主干骨架)
├── 国道:           #2e2e42
├── 省道:           #2a2a3e
├── 城市主干道:     #28283a
├── 一般街道:       #242432
├── 小路:           #1e1e28
├── 铁路:           #2a2a38

边界
├── 省界:           #36364d  (略高的线色，区域轮廓)
├── 市界:           #2a2a3d
├── 区界:           #222233

文字/标注（压低亮度和饱和度，不让文字跳出来）
├── 省/市名:        #74739b  (Dusty Lavender，与主色调一致)
├── 区/县名:        #605f7f  (比主色稍暗)
├── 乡镇/村庄:      #4a4a60  (更低)
├── 道路名称:       #5a5a75  (低调)
├── POI 标注:       #928f99  (三级文字色)
├── 标尺文字:       #928f99
```

### 4.3 设计理念

1. **底图如画布** — 陆地/水系/绿地极度低饱和度，形成一幅宁静的暗色底画。
2. **道路是骨架** — 高速和主干道略亮，让用户能识别位置关系，但不喧宾夺主。
3. **文字是气息** — 地图标注颜色压低至次级，让 App 的 UI overlay 成为视觉焦点。
4. **主色调引用** — 省市名使用 Dusty Lavender (`#74739b`)，建立与 App 品牌色的一致性。

### 4.4 简化版（极简暗底）

如果希望地图更干净，可以考虑大幅降低标注密度：

- 关闭大部分 POI 标注（仅保留医院/景区等关键类别）
- 乡镇/村庄名设为不可见或极低调
- 道路名称仅在大比例尺（zoom >= 14）时通过高德的自然缩放行为显示

在 GeoHUB 编辑器中，可以通过元素的「可见性」开关来控制。

---

## 5. 离线加载（本地 .data 文件）

对于生产环境，推荐导出样式文件并打包进 App bundle，避免在线样式限制。

### 5.1 导出 .data 文件

在 GeoHUB 样式编辑器中，发布后可以 **下载资源包**（`.data` 文件）。

### 5.2 引入方式

1. 将 `.data` 文件放入项目目录（如 `assets/amap-style/`）
2. Android: 文件会被打包进 APK assets
3. iOS: 文件需加入 Xcode 项目并确保在 Bundle 中

使用方式：

```tsx
customMapStyle={{
  styleDataPath: "assets/amap-style/cloudsea-dark.data",
}}
```

对于 iOS，`UIManager.swift` 通过 `Bundle.main.path(forResource:ofType:)` 查找文件，因此路径不需要带扩展名或资源目录前缀。

### 5.3 styleDataPath vs extraStyleDataPath

- `styleDataPath`: 主样式文件（.data）
- `extraStyleDataPath`: 附加样式文件（少于元素样式的补充文件），通常不需要

---

## 6. 实施建议

1. **首先在 GeoHUB 上创建并发布样式**，使用在线 `styleId` 模式验证视觉效果。
2. 在开发过程中使用 `styleId` 方式，方便在 GeoHUB 上快速迭代颜色。
3. 最终确定后，导出 `.data` 文件切换到本地加载模式，避免免费版的 5 分钟限制。
4. 切换自定义样式时，将 `mapType` 改回 `MapType.Standard`（值 `1`），让自定义样式完全接管渲染。
5. MapView 其他属性建议保持不变：`myLocationEnabled`、`compassEnabled` 等。

---

## 7. 参考资料

- [高德开放平台 — 自定义地图](https://lbs.amap.com/dev/mapstyle/index) (旧版入口)
- [GeoHUB — 地图样式定制](https://geohub.amap.com/mapstyle/index) (新版入口，推荐)
- [高德 JS API — 地图样式指南](https://lbs.amap.com/api/javascript-api/guide/map/map-style/)
- [高德 Android SDK — CustomMapStyleOptions 文档](https://a.amap.com/lbs/static/unzip/Android_Map_Doc/3D/com/amap/api/maps/model/CustomMapStyleOptions.html)
- [高德 iOS SDK — MAMapCustomStyleOptions 文档](https://a.amap.com/lbs/static/unzip/iOS_Map_Doc/AMap_iOS_API_Doc_3D/interface_m_a_map_custom_style_options.html)
- [expo-gaode-map GitHub](https://github.com/TomWq/expo-gaode-map)
- [expo-gaode-map React Native Directory](https://reactnative.directory/package/expo-gaode-map)
- [高德自定义地图权限升级](https://developer.amap.com/upgrade#mapstyle)
- [自定义高德地图深色主题 (掘金)](https://juejin.cn/post/7030714373878480910) — 一篇暗色自定义样式的实践参考
- [高德地图自定义样式 (CSDN)](https://blog.csdn.net/weixin_53791978/article/details/128184154) — 更多实操截图
