Bu proje React Native (CLI) tabanlı mobil istemci ve NestJS tabanlı bir Socket.IO signaling sunucusu ile geliştirilmiş, WebRTC teknolojisini kullanarak gerçek zamanlı sesli ve görüntülü görüşme yapılabilen bir uygulamadır.


✅ Gerçek zamanlı sesli & görüntülü görüşme (WebRTC)

✅ NestJS ile Socket.IO signaling sunucusu

✅ React Native CLI istemci (Android & iOS)

✅ Dil desteği (i18next / EN - TR)

✅ STUN server (Google STUN) ile NAT traversal

✅ Rol yönetimi (caller / callee)

✅ 2 kişi sınırlı oda yapısı

✅ Bağlantı koptuğunda peer temizleme


🔴 Frontend

󠁯•󠁏󠁏 React Native CLI

󠁯•󠁏󠁏 react-native-webrtc

󠁯•󠁏󠁏 socket.io-client

󠁯•󠁏󠁏 react-navigation

󠁯•󠁏󠁏 i18next (çoklu dil desteği)

󠁯•󠁏󠁏 AsyncStorage (dil tercihi kaydı)

🔴 Backend

󠁯•󠁏󠁏 NestJS

󠁯•󠁏󠁏 Socket.IO

📌  Altyapı

󠁯•󠁏󠁏 STUN server: stun:stun.l.google.com:19302

󠁯•󠁏󠁏 Codec: VP8 (SDP manipülasyonu ile önceliklendiriliyor)

📌  Mimari & Akış

👉 Odaya Katılım

󠁯•󠁏󠁏 Kullanıcı roomId ile odaya katılır.

󠁯•󠁏󠁏 Sunucu, odaya ekler ve eşleşme durumunu yönetir.

👉 Signaling

󠁯•󠁏󠁏 İlk giren kullanıcı caller, ikincisi callee olur.

󠁯•󠁏󠁏 Caller → Offer gönderir.

󠁯•󠁏󠁏 Callee → Answer gönderir.

󠁯•󠁏󠁏 Her iki taraf ICE candidate’larını karşılıklı paylaşır.

👉 WebRTC PeerConnection

󠁯•󠁏󠁏 mediaDevices.getUserMedia() ile kamera & mikrofon alınır.

󠁯•󠁏󠁏 RTCPeerConnection üzerinden bağlantı kurulur.

󠁯•󠁏󠁏 ontrack ile karşı tarafın medya akışı alınır.

👉  Görüşme

󠁯•󠁏󠁏 RTCView ile local ve remote görüntü ekranda gösterilir.

󠁯•󠁏󠁏 Kullanıcı leave butonuna bastığında bağlantı sonlandırılır.
