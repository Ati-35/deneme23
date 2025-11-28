// Story Store - Stories Feature State
// Instagram-style stories sistemi için state yönetimi

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type StoryContentType = 'image' | 'lottie' | 'text' | 'milestone' | 'tip' | 'success_story';

export interface StoryContent {
  id: string;
  type: StoryContentType;
  title?: string;
  subtitle?: string;
  text?: string;
  imageUrl?: string;
  lottieSource?: string;
  backgroundColor?: string;
  gradientColors?: string[];
  icon?: string;
  ctaText?: string;
  ctaRoute?: string;
}

export interface Story {
  id: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  contents: StoryContent[];
  createdAt: Date;
  expiresAt?: Date;
  priority: number;
}

export interface StoryCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  borderGradient: string[];
}

export interface StoryState {
  stories: Story[];
  categories: StoryCategory[];
  viewedStoryIds: string[];
  currentStoryIndex: number;
  currentContentIndex: number;
  isViewerOpen: boolean;
  activeCategory: string | null;
  
  // Actions
  openStoryViewer: (categoryId: string) => void;
  closeStoryViewer: () => void;
  markStoryAsViewed: (storyId: string) => void;
  nextContent: () => boolean; // returns false if no more content
  previousContent: () => boolean;
  nextStory: () => boolean;
  previousStory: () => boolean;
  isStoryViewed: (storyId: string) => boolean;
  getUnviewedCount: (categoryId: string) => number;
  getCurrentStory: () => Story | null;
  getCurrentContent: () => StoryContent | null;
  resetDailyStories: () => void;
}

// Story categories
const STORY_CATEGORIES: StoryCategory[] = [
  {
    id: 'goals',
    name: 'Hedefler',
    icon: 'flag-outline',
    color: '#F59E0B',
    borderGradient: ['#F59E0B', '#D97706'],
  },
  {
    id: 'motivation',
    name: 'Motivasyon',
    icon: 'flash-outline',
    color: '#8B5CF6',
    borderGradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    id: 'education',
    name: 'Eğitim',
    icon: 'school-outline',
    color: '#3B82F6',
    borderGradient: ['#3B82F6', '#2563EB'],
  },
  {
    id: 'achievements',
    name: 'Başarılar',
    icon: 'trophy-outline',
    color: '#FFD700',
    borderGradient: ['#FFD700', '#F59E0B'],
  },
  {
    id: 'health',
    name: 'Sağlık',
    icon: 'heart-outline',
    color: '#22C55E',
    borderGradient: ['#22C55E', '#16A34A'],
  },
  {
    id: 'community',
    name: 'Topluluk',
    icon: 'people-outline',
    color: '#EC4899',
    borderGradient: ['#EC4899', '#DB2777'],
  },
];

// Default stories
const generateDefaultStories = (): Story[] => [
  {
    id: 'goals_1',
    category: 'goals',
    categoryIcon: 'flag-outline',
    categoryColor: '#F59E0B',
    contents: [
      {
        id: 'goals_1_1',
        type: 'text',
        title: 'Bugünün Hedefi',
        text: 'Her gün bir adım daha yakınsın özgürlüğe. Bugün de güçlü kal! 💪',
        gradientColors: ['#F59E0B', '#D97706'],
        icon: '🎯',
      },
      {
        id: 'goals_1_2',
        type: 'tip',
        title: 'Günün İpucu',
        text: 'Sigara isteği geldiğinde 4-7-8 nefes tekniğini dene: 4 saniye nefes al, 7 saniye tut, 8 saniye ver.',
        gradientColors: ['#D97706', '#B45309'],
        icon: '💡',
        ctaText: 'Nefes Egzersizi',
        ctaRoute: '/breathingExercise',
      },
    ],
    createdAt: new Date(),
    priority: 1,
  },
  {
    id: 'motivation_1',
    category: 'motivation',
    categoryIcon: 'flash-outline',
    categoryColor: '#8B5CF6',
    contents: [
      {
        id: 'motivation_1_1',
        type: 'text',
        title: 'Motivasyon',
        text: '"En büyük zafer, düşmana karşı değil, kendine karşı kazanılan zaferdir." - Platon',
        gradientColors: ['#8B5CF6', '#7C3AED'],
        icon: '✨',
      },
      {
        id: 'motivation_1_2',
        type: 'text',
        title: 'Hatırla',
        text: 'Her "hayır" dediğinde, sağlığına ve ailine "evet" diyorsun.',
        gradientColors: ['#7C3AED', '#6D28D9'],
        icon: '❤️',
      },
    ],
    createdAt: new Date(),
    priority: 2,
  },
  {
    id: 'education_1',
    category: 'education',
    categoryIcon: 'school-outline',
    categoryColor: '#3B82F6',
    contents: [
      {
        id: 'education_1_1',
        type: 'text',
        title: 'Biliyor Muydun?',
        text: 'Sigara bıraktıktan 20 dakika sonra kalp atışın ve kan basıncın normale dönmeye başlar.',
        gradientColors: ['#3B82F6', '#2563EB'],
        icon: '🧠',
      },
      {
        id: 'education_1_2',
        type: 'milestone',
        title: '12 Saat Sonra',
        text: 'Kandaki karbonmonoksit seviyesi normale döner ve vücudun daha fazla oksijen alır.',
        gradientColors: ['#2563EB', '#1D4ED8'],
        icon: '💨',
      },
      {
        id: 'education_1_3',
        type: 'tip',
        title: '1 Yıl Sonra',
        text: 'Koroner kalp hastalığı riskin sigara içenlere göre yarıya düşer!',
        gradientColors: ['#1D4ED8', '#1E40AF'],
        icon: '❤️‍🩹',
        ctaText: 'Daha Fazla Bilgi',
        ctaRoute: '/education',
      },
    ],
    createdAt: new Date(),
    priority: 3,
  },
  {
    id: 'achievements_1',
    category: 'achievements',
    categoryIcon: 'trophy-outline',
    categoryColor: '#FFD700',
    contents: [
      {
        id: 'achievements_1_1',
        type: 'text',
        title: 'Başarıların',
        text: 'Her geçen gün yeni bir başarı. Sen bunu başarıyorsun! 🏆',
        gradientColors: ['#FFD700', '#F59E0B'],
        icon: '🏅',
      },
      {
        id: 'achievements_1_2',
        type: 'tip',
        title: 'Rozet Kazan',
        text: 'Günlük görevlerini tamamlayarak XP kazan ve yeni rozetler aç!',
        gradientColors: ['#F59E0B', '#D97706'],
        icon: '🎖️',
        ctaText: 'Rozetlerimi Gör',
        ctaRoute: '/gamification',
      },
    ],
    createdAt: new Date(),
    priority: 4,
  },
  {
    id: 'health_1',
    category: 'health',
    categoryIcon: 'heart-outline',
    categoryColor: '#22C55E',
    contents: [
      {
        id: 'health_1_1',
        type: 'milestone',
        title: 'Sağlık İyileşmesi',
        text: 'Vücudun her gün kendini onarmaya devam ediyor. Nefes kapasiten artıyor.',
        gradientColors: ['#22C55E', '#16A34A'],
        icon: '🫁',
      },
      {
        id: 'health_1_2',
        type: 'tip',
        title: 'Sağlıklı Yaşam',
        text: 'Düzenli egzersiz ve bol su tüketimi, vücudunun daha hızlı toparlanmasına yardımcı olur.',
        gradientColors: ['#16A34A', '#15803D'],
        icon: '💧',
        ctaText: 'Sağlık Raporumu Gör',
        ctaRoute: '/health',
      },
    ],
    createdAt: new Date(),
    priority: 5,
  },
  {
    id: 'community_1',
    category: 'community',
    categoryIcon: 'people-outline',
    categoryColor: '#EC4899',
    contents: [
      {
        id: 'community_1_1',
        type: 'success_story',
        title: 'Başarı Hikayesi',
        subtitle: 'Ahmet B. - 30 Gün Sigarasız',
        text: '"İlk hafta zordu ama bu uygulama ile başardım. Şimdi kendimi çok daha iyi hissediyorum!"',
        gradientColors: ['#EC4899', '#DB2777'],
        icon: '🌟',
      },
      {
        id: 'community_1_2',
        type: 'text',
        title: 'Sen de Paylaş',
        text: 'Senin de bir başarı hikayen var mı? Topluluğumuzla paylaş ve başkalarına ilham ol!',
        gradientColors: ['#DB2777', '#BE185D'],
        icon: '💬',
        ctaText: 'Hikayeni Paylaş',
        ctaRoute: '/community',
      },
    ],
    createdAt: new Date(),
    priority: 6,
  },
];

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      stories: generateDefaultStories(),
      categories: STORY_CATEGORIES,
      viewedStoryIds: [],
      currentStoryIndex: 0,
      currentContentIndex: 0,
      isViewerOpen: false,
      activeCategory: null,

      openStoryViewer: (categoryId) => {
        const { stories } = get();
        const categoryStories = stories.filter((s) => s.category === categoryId);
        if (categoryStories.length === 0) return;

        set({
          isViewerOpen: true,
          activeCategory: categoryId,
          currentStoryIndex: 0,
          currentContentIndex: 0,
        });
      },

      closeStoryViewer: () =>
        set({
          isViewerOpen: false,
          activeCategory: null,
          currentStoryIndex: 0,
          currentContentIndex: 0,
        }),

      markStoryAsViewed: (storyId) =>
        set((state) => {
          if (state.viewedStoryIds.includes(storyId)) return state;
          return { viewedStoryIds: [...state.viewedStoryIds, storyId] };
        }),

      nextContent: () => {
        const { stories, activeCategory, currentStoryIndex, currentContentIndex } = get();
        const categoryStories = stories.filter((s) => s.category === activeCategory);
        const currentStory = categoryStories[currentStoryIndex];
        
        if (!currentStory) return false;

        if (currentContentIndex < currentStory.contents.length - 1) {
          set({ currentContentIndex: currentContentIndex + 1 });
          return true;
        }

        // Move to next story
        return get().nextStory();
      },

      previousContent: () => {
        const { currentContentIndex } = get();
        
        if (currentContentIndex > 0) {
          set({ currentContentIndex: currentContentIndex - 1 });
          return true;
        }

        return get().previousStory();
      },

      nextStory: () => {
        const { stories, activeCategory, currentStoryIndex } = get();
        const categoryStories = stories.filter((s) => s.category === activeCategory);
        
        // Mark current story as viewed
        const currentStory = categoryStories[currentStoryIndex];
        if (currentStory) {
          get().markStoryAsViewed(currentStory.id);
        }

        if (currentStoryIndex < categoryStories.length - 1) {
          set({ currentStoryIndex: currentStoryIndex + 1, currentContentIndex: 0 });
          return true;
        }

        // No more stories, close viewer
        get().closeStoryViewer();
        return false;
      },

      previousStory: () => {
        const { currentStoryIndex } = get();
        
        if (currentStoryIndex > 0) {
          const { stories, activeCategory } = get();
          const categoryStories = stories.filter((s) => s.category === activeCategory);
          const prevStory = categoryStories[currentStoryIndex - 1];
          
          set({
            currentStoryIndex: currentStoryIndex - 1,
            currentContentIndex: prevStory ? prevStory.contents.length - 1 : 0,
          });
          return true;
        }

        return false;
      },

      isStoryViewed: (storyId) => get().viewedStoryIds.includes(storyId),

      getUnviewedCount: (categoryId) => {
        const { stories, viewedStoryIds } = get();
        return stories.filter(
          (s) => s.category === categoryId && !viewedStoryIds.includes(s.id)
        ).length;
      },

      getCurrentStory: () => {
        const { stories, activeCategory, currentStoryIndex } = get();
        const categoryStories = stories.filter((s) => s.category === activeCategory);
        return categoryStories[currentStoryIndex] || null;
      },

      getCurrentContent: () => {
        const story = get().getCurrentStory();
        if (!story) return null;
        return story.contents[get().currentContentIndex] || null;
      },

      resetDailyStories: () =>
        set({
          viewedStoryIds: [],
          stories: generateDefaultStories(),
        }),
    }),
    {
      name: 'story-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        viewedStoryIds: state.viewedStoryIds,
      }),
    }
  )
);

export default useStoryStore;

