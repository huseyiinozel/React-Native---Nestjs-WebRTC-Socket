Uygulamanın mobil tarafı React Native CLI kullanılarak geliştirilmiştir. Gerçek zamanlı görüntülü ve sesli görüşme için WebRTC ve haberleşme için Socket.IO client entegrasyonu yapılmıştır.

🔴 Kullanılan Teknolojiler

󠁯•󠁏󠁏 React Native CLI → Mobil uygulama altyapısı

󠁯•󠁏󠁏 react-native-webrtc → Kamera, mikrofon ve medya stream yönetimi

󠁯•󠁏󠁏 socket.io-client → Signaling server’a bağlanmak ve olay tabanlı iletişim

󠁯•󠁏󠁏 @react-navigation → Ekranlar arası geçiş 

󠁯•󠁏󠁏i18next & AsyncStorage → Çok dillilik (EN/TR) desteği ve dil tercihinin cihazda saklanması

󠁯•󠁏󠁏 react-native-safe-area-context → Ekran kenar boşlukları için güvenli alan yönetimi


```sh
# Using npm
npm start

# OR using Yarn
yarn start
```



### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

iOS için, CocoaPods bağımlılıklarını yüklemeyi unutmayın (bunu yalnızca projeyi ilk kez klonladıktan sonra veya native bağımlılıkları güncelledikten sonra çalıştırmanız gerekir).

Yeni bir proje oluşturduğunuzda, CocoaPods’un kendisini yüklemek için Ruby bundler’ı çalıştırın:

```sh
bundle install
```

Daha sonra, ve her native bağımlılığınızı güncellediğinizde, şunu çalıştırın:

```sh
bundle exec pod install
```


```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

