// src/utils/storage.js (修复版)
import moment from 'moment';

const STORAGE_KEYS = {
  EVENTS: 'calendar-events',
  DAILY_CONTENT: 'daily-content-',
  DAILY_BACKGROUND: 'daily-background-',
  DAILY_IMAGES: 'daily-images-' // 新增：存储每日保存的图片
};

export const storageService = {
  // 事件数据管理
  getEvents: () => {
    try {
      const events = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('获取事件数据失败:', error);
      return [];
    }
  },

  saveEvents: (events) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error('保存事件数据失败:', error);
      return false;
    }
  },

  addEvent: (event) => {
    const events = storageService.getEvents();
    const newEvent = {
      ...event,
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    };
    events.push(newEvent);
    storageService.saveEvents(events);
    return newEvent;
  },

  updateEvent: (eventId, updates) => {
    const events = storageService.getEvents();
    const index = events.findIndex(e => e.id === eventId);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      storageService.saveEvents(events);
      return events[index];
    }
    return null;
  },

  deleteEvent: (eventId) => {
    const events = storageService.getEvents();
    const filteredEvents = events.filter(e => e.id !== eventId);
    storageService.saveEvents(filteredEvents);
    return filteredEvents;
  },

  // 每日内容管理
  getDailyContent: (date) => {
    try {
      return localStorage.getItem(`${STORAGE_KEYS.DAILY_CONTENT}${date}`) || '';
    } catch (error) {
      console.error('获取每日内容失败:', error);
      return '';
    }
  },

  saveDailyContent: (date, content) => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.DAILY_CONTENT}${date}`, content);
      console.log(`内容已保存到: daily-content-${date}`, content.substring(0, 100));
      return true;
    } catch (error) {
      console.error('保存每日内容失败:', error);
      return false;
    }
  },

  // 每日背景图片管理
  getDailyBackground: (date) => {
    try {
      return localStorage.getItem(`${STORAGE_KEYS.DAILY_BACKGROUND}${date}`) || '';
    } catch (error) {
      console.error('获取背景图片失败:', error);
      return '';
    }
  },

  saveDailyBackground: (date, backgroundImage) => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.DAILY_BACKGROUND}${date}`, backgroundImage);
      return true;
    } catch (error) {
      console.error('保存背景图片失败:', error);
      return false;
    }
  },

  // 新增：每日图片管理
  getDailyImages: (date) => {
    try {
      const images = localStorage.getItem(`${STORAGE_KEYS.DAILY_IMAGES}${date}`);
      return images ? JSON.parse(images) : [];
    } catch (error) {
      console.error('获取每日图片失败:', error);
      return [];
    }
  },

  saveDailyImage: (date, imageData) => {
    try {
      const images = storageService.getDailyImages(date);
      const newImage = {
        ...imageData,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        savedAt: new Date().toISOString()
      };
      images.push(newImage);
      localStorage.setItem(`${STORAGE_KEYS.DAILY_IMAGES}${date}`, JSON.stringify(images));
      console.log(`图片已保存到: daily-images-${date}`, newImage);
      return newImage;
    } catch (error) {
      console.error('保存每日图片失败:', error);
      return null;
    }
  },

  deleteDailyImage: (date, imageId) => {
    try {
      const images = storageService.getDailyImages(date);
      const filteredImages = images.filter(img => img.id !== imageId);
      localStorage.setItem(`${STORAGE_KEYS.DAILY_IMAGES}${date}`, JSON.stringify(filteredImages));
      return filteredImages;
    } catch (error) {
      console.error('删除每日图片失败:', error);
      return [];
    }
  },

  // 获取特定日期的事件
  getEventsByDate: (date) => {
    const events = storageService.getEvents();
    return events.filter(event => 
      moment(event.start).isSame(date, 'day')
    );
  },

  // 获取本月事件
  getEventsByMonth: (date) => {
    const events = storageService.getEvents();
    return events.filter(event => 
      moment(event.start).isSame(date, 'month')
    );
  },

  // 新增：检查日期是否有图片（用于日历标记）
  hasDailyImages: (date) => {
    const images = storageService.getDailyImages(date);
    return images.length > 0;
  },

  // 新增：获取所有有图片的日期
  getAllImageDates: () => {
    const dates = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.DAILY_IMAGES)) {
        const date = key.replace(STORAGE_KEYS.DAILY_IMAGES, '');
        dates.push(date);
      }
    }
    return dates;
  },

  // 清理所有数据
  clearAllData: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('daily-content-') || 
            key.startsWith('daily-background-') || 
            key.startsWith('daily-images-') || 
            key === 'calendar-events') {
          localStorage.removeItem(key);
        }
      });
      console.log('所有数据已清理');
      return true;
    } catch (error) {
      console.error('清理数据失败:', error);
      return false;
    }
  }
};