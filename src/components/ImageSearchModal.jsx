// src/components/ImageSearchModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { unsplashService } from '../services/unsplashService';
import { storageService } from '../utils/storage'; // 添加这行导入
import './ImageSearchModal.css';

const ImageSearchModal = ({ date, onClose, onImageSelect, onImageSave, onSetAsBackground }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'saved'

  // 搜索图片
  const searchImages = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const results = await unsplashService.searchImages(query);
      setImages(results);
    } catch (err) {
      setError('搜索失败，请检查网络连接或稍后重试');
      console.error('搜索图片失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取随机图片
  const loadRandomImages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await unsplashService.getRandomImages();
      setImages(results);
    } catch (err) {
      setError('加载图片失败，请检查网络连接');
      console.error('加载随机图片失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载随机图片
  useEffect(() => {
    loadRandomImages();
  }, [loadRandomImages]);

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchImages(searchQuery);
    }
  };

  // 获取已保存的图片
  const savedImages = storageService.getDailyImages(date);

  return (
    <div className="image-search-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>图片搜索与收藏</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 搜索图片
          </button>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            💾 已保存 ({savedImages.length})
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入关键词搜索图片..."
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? '搜索中...' : '搜索'}
              </button>
              <button 
                type="button" 
                className="random-btn"
                onClick={loadRandomImages}
                disabled={loading}
              >
                随机图片
              </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            <div className="images-grid">
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                images.map(image => (
                  <div key={image.id} className="image-item">
                    <img 
                      src={image.thumb} 
                      alt={image.description}
                      onClick={() => onImageSelect(image.url)}
                    />
                    <div className="image-actions">
                      <button 
                        className="use-btn"
                        onClick={() => onImageSelect(image.url)}
                      >
                        使用
                      </button>
                      <button 
                        className="save-btn"
                        onClick={() => onImageSave(image)}
                      >
                        收藏
                      </button>
                      <button 
                        className="bg-btn"
                        onClick={() => onSetAsBackground && onSetAsBackground(image.url)}
                      >
                        背景
                      </button>
                    </div>
                    <div className="image-info">
                      <span className="author">by {image.author}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="saved-section">
            {savedImages.length === 0 ? (
              <div className="empty-saved">
                <div className="empty-icon">🖼️</div>
                <p>还没有保存任何图片</p>
                <p>在搜索标签页中收藏喜欢的图片吧！</p>
              </div>
            ) : (
              <div className="images-grid">
                {savedImages.map(image => (
                  <div key={image.id} className="image-item">
                    <img 
                      src={image.url} 
                      alt={image.description}
                      onClick={() => onImageSelect(image.url)}
                    />
                    <div className="image-actions">
                      <button 
                        className="use-btn"
                        onClick={() => onImageSelect(image.url)}
                      >
                        使用
                      </button>
                      <button 
                        className="bg-btn"
                        onClick={() => onSetAsBackground && onSetAsBackground(image.url)}
                      >
                        背景
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => {
                          storageService.deleteDailyImage(date, image.id);
                          // 触发父组件刷新
                          onImageSave(image);
                        }}
                      >
                        删除
                      </button>
                    </div>
                    <div className="image-info">
                      <span className="author">by {image.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSearchModal;