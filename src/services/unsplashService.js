// src/services/unsplashService.js
const UNSPLASH_ACCESS_KEY = 'Vav_ZsQHIwJIQTh2FXP8wYroJ95JdWZClOiaf_5xBbM'; // 需要替换为实际的 Unsplash Access Key

export const unsplashService = {
  // 搜索图片
  searchImages: async (query, page = 1, perPage = 20) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('搜索图片失败');
      }
      
      const data = await response.json();
      return data.results.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        full: photo.urls.full,
        description: photo.description || photo.alt_description || '无描述',
        author: photo.user.name,
        authorUrl: photo.user.links.html,
        width: photo.width,
        height: photo.height
      }));
    } catch (error) {
      console.error('搜索图片失败:', error);
      throw error;
    }
  },

  // 获取随机图片
  getRandomImages: async (count = 20) => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random?count=${count}`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('获取随机图片失败');
      }
      
      const data = await response.json();
      return data.map(photo => ({
        id: photo.id,
        url: photo.urls.regular,
        thumb: photo.urls.thumb,
        full: photo.urls.full,
        description: photo.description || photo.alt_description || '无描述',
        author: photo.user.name,
        authorUrl: photo.user.links.html,
        width: photo.width,
        height: photo.height
      }));
    } catch (error) {
      console.error('获取随机图片失败:', error);
      throw error;
    }
  }
};