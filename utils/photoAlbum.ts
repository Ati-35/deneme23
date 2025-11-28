// Photo Album & Progress Visualization
// Fotoğraf günlüğü, before/after karşılaştırması, ilerleme görselleri

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Types
export interface ProgressPhoto {
  id: string;
  uri: string;
  thumbnail?: string;
  category: PhotoCategory;
  dayNumber: number;
  date: string;
  note?: string;
  tags: string[];
  isFavorite: boolean;
  isBeforePhoto: boolean;
}

export type PhotoCategory = 
  | 'face'
  | 'teeth'
  | 'skin'
  | 'general'
  | 'milestone'
  | 'selfie';

export interface PhotoComparison {
  id: string;
  beforePhoto: ProgressPhoto;
  afterPhoto: ProgressPhoto;
  category: PhotoCategory;
  createdAt: string;
  title: string;
  daysApart: number;
}

export interface PhotoAlbum {
  id: string;
  name: string;
  description: string;
  coverPhotoId?: string;
  photoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PhotoStats {
  totalPhotos: number;
  favoriteCount: number;
  photosByCategory: Record<PhotoCategory, number>;
  photosByMonth: { month: string; count: number }[];
  streakDaysWithPhotos: number;
  lastPhotoDate?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  PHOTOS: '@photo_album_photos',
  ALBUMS: '@photo_album_albums',
  COMPARISONS: '@photo_comparisons',
  SETTINGS: '@photo_settings',
};

// Photo Directory
const PHOTO_DIRECTORY = FileSystem.documentDirectory + 'progress_photos/';

// Initialize photo directory
export async function initPhotoDirectory(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(PHOTO_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(PHOTO_DIRECTORY, { intermediates: true });
    }
  } catch (error) {
    console.error('Error initializing photo directory:', error);
  }
}

// Get All Photos
export async function getPhotos(): Promise<ProgressPhoto[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PHOTOS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting photos:', error);
    return [];
  }
}

// Get Photos by Category
export async function getPhotosByCategory(category: PhotoCategory): Promise<ProgressPhoto[]> {
  const photos = await getPhotos();
  return photos.filter(p => p.category === category);
}

// Get Photos by Date Range
export async function getPhotosByDateRange(startDate: string, endDate: string): Promise<ProgressPhoto[]> {
  const photos = await getPhotos();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return photos.filter(p => {
    const photoDate = new Date(p.date).getTime();
    return photoDate >= start && photoDate <= end;
  });
}

// Save Photo
export async function savePhoto(
  uri: string,
  category: PhotoCategory,
  dayNumber: number,
  options?: {
    note?: string;
    tags?: string[];
    isBeforePhoto?: boolean;
  }
): Promise<ProgressPhoto> {
  await initPhotoDirectory();
  
  const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const extension = uri.split('.').pop() || 'jpg';
  const newPath = `${PHOTO_DIRECTORY}${id}.${extension}`;
  
  try {
    // Copy photo to app directory
    await FileSystem.copyAsync({ from: uri, to: newPath });
    
    const photo: ProgressPhoto = {
      id,
      uri: newPath,
      category,
      dayNumber,
      date: new Date().toISOString(),
      note: options?.note,
      tags: options?.tags || [],
      isFavorite: false,
      isBeforePhoto: options?.isBeforePhoto || false,
    };
    
    const photos = await getPhotos();
    photos.push(photo);
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    
    return photo;
  } catch (error) {
    console.error('Error saving photo:', error);
    throw error;
  }
}

// Delete Photo
export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const photos = await getPhotos();
    const photo = photos.find(p => p.id === photoId);
    
    if (photo) {
      // Delete file
      await FileSystem.deleteAsync(photo.uri, { idempotent: true });
      
      // Remove from storage
      const filtered = photos.filter(p => p.id !== photoId);
      await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

// Update Photo
export async function updatePhoto(photoId: string, updates: Partial<ProgressPhoto>): Promise<ProgressPhoto | null> {
  try {
    const photos = await getPhotos();
    const index = photos.findIndex(p => p.id === photoId);
    
    if (index !== -1) {
      photos[index] = { ...photos[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
      return photos[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating photo:', error);
    return null;
  }
}

// Toggle Favorite
export async function toggleFavorite(photoId: string): Promise<boolean> {
  const photos = await getPhotos();
  const photo = photos.find(p => p.id === photoId);
  
  if (photo) {
    photo.isFavorite = !photo.isFavorite;
    await AsyncStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
    return photo.isFavorite;
  }
  return false;
}

// Get Favorite Photos
export async function getFavoritePhotos(): Promise<ProgressPhoto[]> {
  const photos = await getPhotos();
  return photos.filter(p => p.isFavorite);
}

// Create Comparison
export async function createComparison(
  beforePhotoId: string,
  afterPhotoId: string,
  title?: string
): Promise<PhotoComparison | null> {
  const photos = await getPhotos();
  const beforePhoto = photos.find(p => p.id === beforePhotoId);
  const afterPhoto = photos.find(p => p.id === afterPhotoId);
  
  if (!beforePhoto || !afterPhoto) return null;
  
  const daysApart = Math.abs(afterPhoto.dayNumber - beforePhoto.dayNumber);
  
  const comparison: PhotoComparison = {
    id: `comparison_${Date.now()}`,
    beforePhoto,
    afterPhoto,
    category: beforePhoto.category,
    createdAt: new Date().toISOString(),
    title: title || `${daysApart} Gün Farkı`,
    daysApart,
  };
  
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPARISONS);
    const comparisons: PhotoComparison[] = data ? JSON.parse(data) : [];
    comparisons.push(comparison);
    await AsyncStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(comparisons));
    return comparison;
  } catch (error) {
    console.error('Error creating comparison:', error);
    return null;
  }
}

// Get Comparisons
export async function getComparisons(): Promise<PhotoComparison[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPARISONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting comparisons:', error);
    return [];
  }
}

// Delete Comparison
export async function deleteComparison(comparisonId: string): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPARISONS);
    const comparisons: PhotoComparison[] = data ? JSON.parse(data) : [];
    const filtered = comparisons.filter(c => c.id !== comparisonId);
    await AsyncStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting comparison:', error);
  }
}

// Albums
export async function getAlbums(): Promise<PhotoAlbum[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ALBUMS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting albums:', error);
    return [];
  }
}

export async function createAlbum(name: string, description?: string): Promise<PhotoAlbum> {
  const album: PhotoAlbum = {
    id: `album_${Date.now()}`,
    name,
    description: description || '',
    photoIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const albums = await getAlbums();
    albums.push(album);
    await AsyncStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    return album;
  } catch (error) {
    console.error('Error creating album:', error);
    throw error;
  }
}

export async function addPhotoToAlbum(albumId: string, photoId: string): Promise<void> {
  try {
    const albums = await getAlbums();
    const album = albums.find(a => a.id === albumId);
    
    if (album && !album.photoIds.includes(photoId)) {
      album.photoIds.push(photoId);
      album.updatedAt = new Date().toISOString();
      if (!album.coverPhotoId) {
        album.coverPhotoId = photoId;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    }
  } catch (error) {
    console.error('Error adding photo to album:', error);
  }
}

export async function removePhotoFromAlbum(albumId: string, photoId: string): Promise<void> {
  try {
    const albums = await getAlbums();
    const album = albums.find(a => a.id === albumId);
    
    if (album) {
      album.photoIds = album.photoIds.filter(id => id !== photoId);
      album.updatedAt = new Date().toISOString();
      if (album.coverPhotoId === photoId) {
        album.coverPhotoId = album.photoIds[0];
      }
      await AsyncStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
    }
  } catch (error) {
    console.error('Error removing photo from album:', error);
  }
}

// Get Photo Stats
export async function getPhotoStats(): Promise<PhotoStats> {
  const photos = await getPhotos();
  
  const photosByCategory: Record<PhotoCategory, number> = {
    face: 0,
    teeth: 0,
    skin: 0,
    general: 0,
    milestone: 0,
    selfie: 0,
  };
  
  const monthlyCount: Record<string, number> = {};
  
  photos.forEach(photo => {
    photosByCategory[photo.category]++;
    
    const month = photo.date.substring(0, 7); // YYYY-MM
    monthlyCount[month] = (monthlyCount[month] || 0) + 1;
  });
  
  const photosByMonth = Object.entries(monthlyCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // Calculate streak days with photos
  const photoDays = new Set(photos.map(p => p.date.split('T')[0]));
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (photoDays.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  
  const sortedByDate = [...photos].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return {
    totalPhotos: photos.length,
    favoriteCount: photos.filter(p => p.isFavorite).length,
    photosByCategory,
    photosByMonth,
    streakDaysWithPhotos: streak,
    lastPhotoDate: sortedByDate[0]?.date,
  };
}

// Get Before/After Pairs
export async function getBeforeAfterPairs(category?: PhotoCategory): Promise<{
  before: ProgressPhoto[];
  after: ProgressPhoto[];
}> {
  const photos = await getPhotos();
  let filtered = photos;
  
  if (category) {
    filtered = photos.filter(p => p.category === category);
  }
  
  return {
    before: filtered.filter(p => p.isBeforePhoto),
    after: filtered.filter(p => !p.isBeforePhoto),
  };
}

// Get Timeline Data
export async function getPhotoTimeline(): Promise<{ date: string; photos: ProgressPhoto[] }[]> {
  const photos = await getPhotos();
  const grouped: Record<string, ProgressPhoto[]> = {};
  
  photos.forEach(photo => {
    const date = photo.date.split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(photo);
  });
  
  return Object.entries(grouped)
    .map(([date, photos]) => ({ date, photos }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Category Labels
export const CATEGORY_LABELS: Record<PhotoCategory, { label: string; icon: string }> = {
  face: { label: 'Yüz', icon: '😊' },
  teeth: { label: 'Dişler', icon: '🦷' },
  skin: { label: 'Cilt', icon: '✨' },
  general: { label: 'Genel', icon: '📷' },
  milestone: { label: 'Milestone', icon: '🏆' },
  selfie: { label: 'Selfie', icon: '🤳' },
};

export default {
  initPhotoDirectory,
  getPhotos,
  getPhotosByCategory,
  getPhotosByDateRange,
  savePhoto,
  deletePhoto,
  updatePhoto,
  toggleFavorite,
  getFavoritePhotos,
  createComparison,
  getComparisons,
  deleteComparison,
  getAlbums,
  createAlbum,
  addPhotoToAlbum,
  removePhotoFromAlbum,
  getPhotoStats,
  getBeforeAfterPairs,
  getPhotoTimeline,
  CATEGORY_LABELS,
};




