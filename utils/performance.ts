// Performans Optimizasyonu Araçları
// React.memo, lazy loading, bundle size optimizasyonu

import React, { memo, ComponentType, LazyExoticComponent, Suspense } from 'react';
import { InteractionManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// 1. Memoization Yardımcıları
// ========================================

/**
 * Deep comparison için memo wrapper
 * Kompleks props'lu bileşenler için kullanılır
 */
export function memoWithDeepCompare<T extends ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: any, nextProps: any) => boolean
): T {
  return memo(Component, propsAreEqual || deepEqual) as T;
}

/**
 * Deep equality check
 */
function deepEqual(prevProps: any, nextProps: any): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    const isObject = typeof prevValue === 'object' && prevValue !== null;
    
    if (isObject) {
      if (!deepEqual(prevValue, nextValue)) return false;
    } else if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
}

// ========================================
// 2. Lazy Loading
// ========================================

/**
 * Lazy load component with prefetch support
 */
export function lazyWithPrefetch<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> & { prefetch: () => Promise<void> } {
  const Component = React.lazy(importFn) as any;
  Component.prefetch = importFn;
  return Component;
}

/**
 * Preload multiple components
 */
export async function preloadComponents(
  components: Array<{ prefetch: () => Promise<any> }>
): Promise<void> {
  await Promise.all(components.map(c => c.prefetch()));
}

// ========================================
// 3. Debounce & Throttle
// ========================================

/**
 * Debounce fonksiyonu
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle fonksiyonu
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ========================================
// 4. Interaction Manager
// ========================================

/**
 * Animasyon tamamlandıktan sonra çalıştır
 * Heavy işlemler için kullanılır
 */
export function runAfterInteractions(task: () => any): Promise<any> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(task());
    });
  });
}

/**
 * Frame tamamlandıktan sonra çalıştır
 */
export function runOnNextFrame(callback: () => void): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

// ========================================
// 5. Cache Yönetimi
// ========================================

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CacheItem<any>>();

/**
 * Memory cache with TTL
 */
export function getCached<T>(key: string): T | null {
  const item = memoryCache.get(key);
  
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    memoryCache.delete(key);
    return null;
  }
  
  return item.data;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

export function clearCache(key?: string): void {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}

/**
 * Memoized async function with cache
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttlMs: number = 5 * 60 * 1000
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = getCached(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = await fn(...args);
    setCache(key, result, ttlMs);
    return result;
  }) as T;
}

// ========================================
// 6. Batch Updates
// ========================================

interface BatchItem {
  key: string;
  value: any;
}

let batchQueue: BatchItem[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

/**
 * AsyncStorage batch writes
 */
export function batchAsyncStorage(key: string, value: any, delay: number = 100): void {
  batchQueue.push({ key, value });

  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  batchTimeout = setTimeout(async () => {
    const items = [...batchQueue];
    batchQueue = [];
    batchTimeout = null;

    try {
      const pairs: [string, string][] = items.map(item => [
        item.key,
        JSON.stringify(item.value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Batch storage error:', error);
    }
  }, delay);
}

// ========================================
// 7. List Optimizasyonu
// ========================================

/**
 * FlatList için optimum ayarlar
 */
export const flatListOptimizations = {
  removeClippedSubviews: Platform.OS === 'android',
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  windowSize: 5,
  initialNumToRender: 10,
  getItemLayout: (itemHeight: number) => (
    _data: any,
    index: number
  ) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
};

/**
 * Key extractor factory
 */
export function createKeyExtractor<T extends { id: string | number }>(
  prefix: string = ''
): (item: T, index: number) => string {
  return (item, index) => `${prefix}${item.id ?? index}`;
}

// ========================================
// 8. Image Optimizasyonu
// ========================================

/**
 * Resim boyutu hesapla
 */
export function calculateImageSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * Progressive image loading için placeholder URL
 */
export function getPlaceholderUrl(url: string, size: number = 20): string {
  // URL parametresi ile küçük versiyon iste
  if (url.includes('?')) {
    return `${url}&w=${size}&q=10`;
  }
  return `${url}?w=${size}&q=10`;
}

// ========================================
// 9. Memory Yönetimi
// ========================================

/**
 * Bellek kullanımını logla
 */
export function logMemoryUsage(): void {
  if (__DEV__) {
    // @ts-ignore
    const used = performance?.memory?.usedJSHeapSize;
    // @ts-ignore
    const total = performance?.memory?.totalJSHeapSize;
    
    if (used && total) {
      console.log(`Memory: ${(used / 1024 / 1024).toFixed(2)} MB / ${(total / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}

/**
 * Garbage collection için referansları temizle
 */
export function cleanup(refs: Array<{ current: any }>): void {
  refs.forEach(ref => {
    ref.current = null;
  });
}

// ========================================
// 10. Render Optimizasyonu
// ========================================

/**
 * Gereksiz render'ları tespit et
 */
export function useRenderCount(componentName: string): void {
  if (__DEV__) {
    const renderCount = React.useRef(0);
    renderCount.current += 1;
    console.log(`${componentName} rendered: ${renderCount.current} times`);
  }
}

/**
 * Props değişikliklerini logla
 */
export function usePropsChange(props: Record<string, any>, componentName: string): void {
  if (__DEV__) {
    const prevProps = React.useRef(props);
    
    React.useEffect(() => {
      const changedProps: string[] = [];
      
      Object.keys(props).forEach(key => {
        if (props[key] !== prevProps.current[key]) {
          changedProps.push(key);
        }
      });
      
      if (changedProps.length > 0) {
        console.log(`${componentName} props changed:`, changedProps);
      }
      
      prevProps.current = props;
    });
  }
}

// ========================================
// 11. Performance Monitoring
// ========================================

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

const metrics: PerformanceMetric[] = [];

/**
 * Performance ölçümü başlat
 */
export function startMeasure(name: string): void {
  metrics.push({
    name,
    startTime: Date.now(),
  });
}

/**
 * Performance ölçümünü bitir
 */
export function endMeasure(name: string): number | null {
  const metric = metrics.find(m => m.name === name && !m.endTime);
  
  if (!metric) {
    console.warn(`Metric "${name}" not found`);
    return null;
  }
  
  metric.endTime = Date.now();
  metric.duration = metric.endTime - metric.startTime;
  
  if (__DEV__) {
    console.log(`⏱️ ${name}: ${metric.duration}ms`);
  }
  
  return metric.duration;
}

/**
 * Tüm metrikleri getir
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Metrikleri temizle
 */
export function clearMetrics(): void {
  metrics.length = 0;
}







