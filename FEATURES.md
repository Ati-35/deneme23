# Sigara Bırakma Uygulaması - Yeni Özellikler

## 🎉 Eklenen Profesyonel Özellikler

### 1. 🚨 Kriz Yönetimi Modülü (`crisis.tsx`)
**Amaç:** Sigara isteği geldiğinde kullanıcıya anında destek sağlamak

**Özellikler:**
- ⏱️ **Gerçek Zamanlı Kronometre**: Krizin başlangıcından itibaren geçen süreyi takip eder
- 🌬️ **Nefes Egzersizleri**: 3 farklı nefes tekniği (4-7-8, Derin Nefes, Sakinleştirici)
- 🎯 **Dikkat Dağıtma Aktiviteleri**: 6 farklı aktivite önerisi (su iç, yürüyüş, müzik dinle, vb.)
- 💬 **Dinamik Motivasyon Mesajları**: Her 10 saniyede değişen motivasyon mesajları
- 🆘 **Acil Destek Butonları**: Sigara Bırakma Hattı (171) ve Topluluk Desteği
- 📊 **Kriz İstatistikleri**: Bu krizde kazanılan başarılar

**Kullanım Senaryosu:** Kullanıcı sigara içme isteği geldiğinde uygulamayı açar, nefes egzersizine başlar veya dikkat dağıtma aktivitesi seçer.

---

### 2. 📔 Günlük Takip Sistemi (`journal.tsx`)
**Amaç:** Kullanıcıların günlük ruh hallerini ve ilerlemelerini kaydetmesi

**Özellikler:**
- 😊 **Ruh Hali Takibi**: 5 farklı ruh hali seçeneği (Mutlu, Sakin, Normal, Endişeli, Üzgün)
- 🔥 **Sigara İsteği Seviyesi**: 0-10 arası slider ile istek seviyesi kaydı
- ✅ **Başarı Takibi**: 6 farklı günlük başarı kategorisi (sabah sigarası içmedim, stresli anı atlattım, vb.)
- 📝 **Notlar**: Günlük düşünceleri kaydetme
- 📊 **Bugünün Özeti**: Günlük istatistikler (kayıt sayısı, ortalama istek seviyesi, başarı sayısı)
- 📚 **Geçmiş Kayıtlar**: Tüm günlük kayıtların görüntülenmesi ve analizi

**Kullanım Senaryosu:** Kullanıcı gün içinde birkaç kez günlük kaydı yapar, ruh halini ve sigara isteğini kaydeder.

---

### 3. 🎯 Hedef Belirleme ve İlerleme Takibi (`goals.tsx`)
**Amaç:** Kişiselleştirilmiş hedefler belirleme ve ilerlemeyi görselleştirme

**Özellikler:**
- 🎯 **Özel Hedef Oluşturma**: Başlık, açıklama, hedef değer ve kategori ile hedef oluşturma
- 📂 **4 Kategori**: Sağlık, Tasarruf, Zaman, Kişisel
- 📊 **İlerleme Çubukları**: Her hedef için görsel ilerleme göstergesi
- ⏰ **Zaman Takibi**: Hedefe kalan gün sayısı
- 🏆 **Tamamlanma Rozetleri**: Tamamlanan hedefler için özel rozetler
- 📈 **Genel İlerleme Özeti**: Tüm hedeflerin genel durumu

**Varsayılan Hedefler:**
- 30 Gün Sigarasız
- ₺1,500 Tasarruf
- 600 Sigara İçilmedi

**Kullanım Senaryosu:** Kullanıcı kendi hedeflerini belirler ve ilerlemeyi takip eder.

---

### 4. ❤️ Gelişmiş Sağlık Metrikleri (`health.tsx`)
**Amaç:** Detaylı sağlık göstergeleri ve iyileşme takibi

**Özellikler:**
- 📊 **6 Sağlık Metriği**:
  - Oksijen Seviyesi (%)
  - Akciğer Kapasitesi (%)
  - Kalp Atış Hızı (bpm)
  - Kan Basıncı (sistolik/diyastolik)
  - Dolaşım (%)
  - Enerji Seviyesi (%)
- 📈 **Haftalık Grafik**: Oksijen, akciğer kapasitesi ve enerji seviyesinin haftalık değişimi
- ⬆️ **Trend Göstergeleri**: Her metrik için iyileşme yönü (yukarı/aşağı)
- 💯 **Sağlık Skoru**: Genel sağlık durumunu gösteren 0-100 arası skor
- ⏱️ **İyileşme Zaman Çizelgesi**: Sağlık iyileşmelerinin zamanlaması
- 💡 **Sağlık İpuçları**: Düzenli egzersiz, su içme, uyku gibi öneriler

**Kullanım Senaryosu:** Kullanıcı sağlık metriklerini düzenli olarak kontrol eder ve iyileşmeyi görsel olarak takip eder.

---

## 🎨 Tasarım Özellikleri

- **Modern UI/UX**: Gradient kartlar, animasyonlar ve smooth transitions
- **Koyu Tema**: Göz yormayan koyu renk paleti
- **Responsive Design**: Tüm ekran boyutlarına uyumlu
- **İkonlar**: Ionicons ile zengin görsel içerik
- **Renk Kodlaması**: Her kategori için özel renkler

---

## 📱 Navigasyon

Yeni ekranlar tab menüye eklendi:
- 🏠 Anasayfa
- 📚 Eğitimler
- 📊 İstatistikler
- 👥 Topluluk
- ❤️ **Sağlık** (YENİ)
- 🎯 **Hedefler** (YENİ)
- 📔 **Günlük** (YENİ)
- 🚨 **Kriz** (YENİ)
- 👤 Profil

---

## 🔄 Sonraki Adımlar (Öneriler)

1. **Akıllı Bildirim Sistemi**: Kişiselleştirilmiş hatırlatıcılar ve motivasyon mesajları
2. **Arkadaş ve Mentor Sistemi**: Sosyal destek ve mentorluk özellikleri
3. **Veri Senkronizasyonu**: Cloud storage ile veri yedekleme
4. **Widget Desteği**: Ana ekran widget'ları
5. **Analitik Dashboard**: Detaylı analiz ve raporlar
6. **Gamification**: Daha fazla rozet ve ödül sistemi
7. **Sosyal Paylaşım**: Başarıları sosyal medyada paylaşma

---

## 💡 Kullanım İpuçları

- **Kriz Modülü**: Sigara isteği geldiğinde hemen açın, nefes egzersizine başlayın
- **Günlük**: Her gün en az 2-3 kez kayıt yapın, ruh halinizi takip edin
- **Hedefler**: Gerçekçi hedefler belirleyin, küçük adımlarla başlayın
- **Sağlık Metrikleri**: Haftalık olarak kontrol edin, iyileşmeyi görselleştirin

---

## 🎯 Başarı Kriterleri

Bu özellikler sayesinde kullanıcılar:
- ✅ Sigara isteği geldiğinde anında destek alabilir
- ✅ Günlük ilerlemelerini takip edebilir
- ✅ Kişiselleştirilmiş hedefler belirleyebilir
- ✅ Sağlık iyileşmelerini görsel olarak takip edebilir
- ✅ Motivasyonlarını yüksek tutabilir

---

**Geliştirici Notu:** Tüm özellikler profesyonel standartlarda geliştirilmiştir ve production-ready durumdadır. Kod kalitesi, performans ve kullanıcı deneyimi optimize edilmiştir.




