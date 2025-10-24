// src/utils/storage.js
import moment from 'moment';

const STORAGE_KEYS = {
  EVENTS: 'calendar-events',
  DAILY_CONTENT: 'daily-content-',
  DAILY_BACKGROUND: 'daily-background-'
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
      id: Date.now() + Math.random().toString(36).substr(2, 9) // 唯一ID
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
  }
};