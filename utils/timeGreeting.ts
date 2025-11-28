// Time-based Greeting System
// Saat bazlı kişiselleştirilmiş karşılama mesajları

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type MoodType = 'encouraging' | 'celebrating' | 'supportive' | 'motivating';

export interface Greeting {
  title: string;
  subtitle: string;
  emoji: string;
  mood: MoodType;
}

// Get time of day
export const getTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

// Morning greetings (05:00 - 11:59)
const morningGreetings: Greeting[] = [
  {
    title: 'Günaydın!',
    subtitle: 'Sigarasız yeni bir gün başlıyor ✨',
    emoji: '🌅',
    mood: 'encouraging',
  },
  {
    title: 'Günaydın!',
    subtitle: 'Bugün de güçlü kalacaksın 💪',
    emoji: '☀️',
    mood: 'motivating',
  },
  {
    title: 'Harika bir sabah!',
    subtitle: 'Her nefes bir zafer 🏆',
    emoji: '🌞',
    mood: 'celebrating',
  },
  {
    title: 'Günaydın kahraman!',
    subtitle: 'Bugün seni harika şeyler bekliyor',
    emoji: '⭐',
    mood: 'encouraging',
  },
  {
    title: 'Yeni gün, yeni başarılar!',
    subtitle: 'Hedeflerine bir adım daha yakınsın',
    emoji: '🎯',
    mood: 'motivating',
  },
];

// Afternoon greetings (12:00 - 16:59)
const afternoonGreetings: Greeting[] = [
  {
    title: 'İyi günler!',
    subtitle: 'Bugün harika gidiyorsun 🌟',
    emoji: '☀️',
    mood: 'celebrating',
  },
  {
    title: 'Merhaba!',
    subtitle: 'Yarı yoldasın, devam et! 💪',
    emoji: '🔥',
    mood: 'encouraging',
  },
  {
    title: 'Güzel günler!',
    subtitle: 'Her an değerli, her an sigarasız',
    emoji: '✨',
    mood: 'supportive',
  },
  {
    title: 'Şampiyon!',
    subtitle: 'Öğleden sonra da güçlü kalıyorsun',
    emoji: '🏆',
    mood: 'celebrating',
  },
  {
    title: 'Harika gidiyorsun!',
    subtitle: 'Bugün de kendini aştın',
    emoji: '🚀',
    mood: 'motivating',
  },
];

// Evening greetings (17:00 - 21:59)
const eveningGreetings: Greeting[] = [
  {
    title: 'İyi akşamlar!',
    subtitle: 'Bugün de başardın! 🎉',
    emoji: '🌅',
    mood: 'celebrating',
  },
  {
    title: 'Akşamın kutlu olsun!',
    subtitle: 'Bir gün daha sigarasız tamamlandı',
    emoji: '🌆',
    mood: 'celebrating',
  },
  {
    title: 'Tebrikler!',
    subtitle: 'Bugün kendini kanıtladın 💪',
    emoji: '🏅',
    mood: 'celebrating',
  },
  {
    title: 'Harika iş çıkardın!',
    subtitle: 'Dinlenmeyi hak ettin',
    emoji: '🌟',
    mood: 'supportive',
  },
  {
    title: 'Güzel akşamlar!',
    subtitle: 'Yarın daha da güçlü olacaksın',
    emoji: '💫',
    mood: 'encouraging',
  },
];

// Night greetings (22:00 - 04:59)
const nightGreetings: Greeting[] = [
  {
    title: 'İyi geceler!',
    subtitle: 'Yarın için güç topla 🌙',
    emoji: '🌙',
    mood: 'supportive',
  },
  {
    title: 'Tatlı rüyalar!',
    subtitle: 'Bugün çok güçlüydün',
    emoji: '⭐',
    mood: 'celebrating',
  },
  {
    title: 'Geceye hazırsın!',
    subtitle: 'Huzurlu bir uyku seni bekliyor',
    emoji: '🌟',
    mood: 'supportive',
  },
  {
    title: 'Gece de yanındayız!',
    subtitle: 'Zorluk anlarında buraya gel',
    emoji: '🤝',
    mood: 'supportive',
  },
  {
    title: 'Yarın yeni bir gün!',
    subtitle: 'Şimdi dinlenme zamanı',
    emoji: '💤',
    mood: 'supportive',
  },
];

// Get greeting based on time of day
export const getGreeting = (): Greeting => {
  const timeOfDay = getTimeOfDay();
  let greetings: Greeting[];

  switch (timeOfDay) {
    case 'morning':
      greetings = morningGreetings;
      break;
    case 'afternoon':
      greetings = afternoonGreetings;
      break;
    case 'evening':
      greetings = eveningGreetings;
      break;
    case 'night':
      greetings = nightGreetings;
      break;
  }

  // Return random greeting from the array
  return greetings[Math.floor(Math.random() * greetings.length)];
};

// Get personalized greeting with name
export const getPersonalizedGreeting = (name: string, daysSmokeFree: number): Greeting => {
  const baseGreeting = getGreeting();
  const timeOfDay = getTimeOfDay();
  
  // Customize based on streak milestones
  if (daysSmokeFree === 1) {
    return {
      ...baseGreeting,
      subtitle: 'İlk günün tamamlandı! 🎉',
      mood: 'celebrating',
    };
  }
  
  if (daysSmokeFree === 7) {
    return {
      title: 'Tebrikler ' + name + '!',
      subtitle: 'Bir hafta sigarasız! Harikasın! 🏆',
      emoji: '🎊',
      mood: 'celebrating',
    };
  }
  
  if (daysSmokeFree === 30) {
    return {
      title: 'WOW ' + name + '!',
      subtitle: 'Bir ay sigarasız! İnanılmazsın! 👑',
      emoji: '🎉',
      mood: 'celebrating',
    };
  }

  // Add name to title if it's a simple greeting
  if (name && name.length > 0) {
    const personalTitle = baseGreeting.title.replace('!', `, ${name}!`);
    return {
      ...baseGreeting,
      title: personalTitle,
    };
  }

  return baseGreeting;
};

// Get motivational message for specific time
export const getMotivationalMessage = (timeOfDay: TimeOfDay, streak: number): string => {
  const messages: Record<TimeOfDay, string[]> = {
    morning: [
      'Güne pozitif başla, gün boyunca güçlü kal!',
      'Her sabah yeni bir fırsat. Bu sabah da kazandın!',
      'Sabahları en zor olabilir, ama sen daha güçlüsün!',
    ],
    afternoon: [
      'Günün yarısı bitti, sen hala güçlüsün!',
      'Öğleden sonra molası? Sigara yerine su iç!',
      'Bugün de harika gidiyorsun, devam et!',
    ],
    evening: [
      'Akşam yemeği zamanı, sağlıklı tercihlere devam!',
      'Günün stresini at, sigara olmadan!',
      'Akşam rutinini sigarasız tamamla!',
    ],
    night: [
      'Gece isteği normal, bu da geçecek.',
      'Uykudan önce derin nefes al, rahatla.',
      'Yarın uyanınca bir gün daha kazanmış olacaksın!',
    ],
  };

  const timeMessages = messages[timeOfDay];
  return timeMessages[Math.floor(Math.random() * timeMessages.length)];
};

// Get formatted date in Turkish
export const getFormattedDate = (): string => {
  return format(new Date(), 'dd MMMM yyyy, EEEE', { locale: tr });
};

// Get time-specific icon
export const getTimeIcon = (): string => {
  const timeOfDay = getTimeOfDay();
  
  switch (timeOfDay) {
    case 'morning':
      return 'sunny-outline';
    case 'afternoon':
      return 'partly-sunny-outline';
    case 'evening':
      return 'cloudy-night-outline';
    case 'night':
      return 'moon-outline';
  }
};

export default {
  getTimeOfDay,
  getGreeting,
  getPersonalizedGreeting,
  getMotivationalMessage,
  getFormattedDate,
  getTimeIcon,
};

