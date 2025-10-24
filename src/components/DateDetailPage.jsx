import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import './DateDetailPage.css';

const DateDetailPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [content, setContent] = useState({
    text: '',
    images: [],
    backgroundColor: '#ffffff',
    events: []
  });

  // 处理文本内容变化
  const handleTextChange = (e) => {
    setContent(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  // 处理图片上传
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setContent(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  // 删除图片
  const handleRemoveImage = (index) => {
    setContent(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 处理背景颜色变化
  const handleBackgroundColorChange = (e) => {
    setContent(prev => ({
      ...prev,
      backgroundColor: e.target.value
    }));
  };

  // 添加新事件
  const handleAddEvent = () => {
    const title = prompt('请输入事件标题:');
    if (title) {
      const newEvent = {
        id: Date.now(),
        title,
        time: moment().format('HH:mm'),
        completed: false
      };
      
      setContent(prev => ({
        ...prev,
        events: [...prev.events, newEvent]
      }));
    }
  };

  // 切换事件完成状态
  const handleToggleEvent = (id) => {
    setContent(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.id === id ? { ...event, completed: !event.completed } : event
      )
    }));
  };

  // 保存内容到本地存储
  const saveContent = () => {
    localStorage.setItem(`date-content-${date}`, JSON.stringify(content));
    alert('内容已保存！');
  };

  // 加载保存的内容
  const loadSavedContent = () => {
    const saved = localStorage.getItem(`date-content-${date}`);
    if (saved) {
      setContent(JSON.parse(saved));
    }
  };

  // 页面加载时读取保存的内容
  React.useEffect(() => {
    loadSavedContent();
  }, [date]);

  return (
    <div className="date-detail-page" style={{ backgroundColor: content.backgroundColor }}>
      <div className="detail-container">
        {/* 头部 */}
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← 返回日历
          </button>
          <h1 className="detail-title">
            {moment(date).format('YYYY年MM月DD日')}
          </h1>
          <button className="save-btn" onClick={saveContent}>
            保存
          </button>
        </div>

        <div className="detail-content">
          {/* 左侧：编辑区域 */}
          <div className="edit-section">
            {/* 背景颜色选择 */}
            <div className="control-group">
              <label>背景颜色:</label>
              <input
                type="color"
                value={content.backgroundColor}
                onChange={handleBackgroundColorChange}
              />
            </div>

            {/* 文本编辑器 */}
            <div className="control-group">
              <label>日记内容:</label>
              <textarea
                value={content.text}
                onChange={handleTextChange}
                placeholder="写下今天的心情和计划..."
                rows="8"
              />
            </div>

            {/* 图片上传 */}
            <div className="control-group">
              <label>上传图片:</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <button 
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📷 选择图片
              </button>
            </div>

            {/* 事件管理 */}
            <div className="control-group">
              <label>今日事件:</label>
              <button className="add-event-btn" onClick={handleAddEvent}>
                + 添加事件
              </button>
              
              <div className="events-list">
                {content.events.map(event => (
                  <div key={event.id} className="event-item">
                    <input
                      type="checkbox"
                      checked={event.completed}
                      onChange={() => handleToggleEvent(event.id)}
                    />
                    <span className={event.completed ? 'completed' : ''}>
                      {event.title} - {event.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="preview-section">
            {/* 图片预览 */}
            {content.images.length > 0 && (
              <div className="images-preview">
                <h3>图片预览</h3>
                <div className="images-grid">
                  {content.images.map((url, index) => (
                    <div key={index} className="image-item">
                      <img src={url} alt={`上传的图片 ${index + 1}`} />
                      <button 
                        className="remove-image"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 文本预览 */}
            {content.text && (
              <div className="text-preview">
                <h3>日记预览</h3>
                <div className="preview-text">
                  {content.text}
                </div>
              </div>
            )}

            {/* 事件预览 */}
            {content.events.length > 0 && (
              <div className="events-preview">
                <h3>事件列表</h3>
                <div className="preview-events">
                  {content.events.map(event => (
                    <div key={event.id} className={`preview-event ${event.completed ? 'completed' : ''}`}>
                      <span className="event-time">{event.time}</span>
                      <span className="event-title">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateDetailPage;