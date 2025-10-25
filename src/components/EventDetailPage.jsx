// src/components/EventDetailPage.jsx 
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import './EventDetailPage.css';
import { storageService } from '../utils/storage';
import ImageSearchModal from './ImageSearchModal';

const EventDetailPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [events, setEvents] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const editorRef = useRef(null);
  const isComposingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // 加载该日期的事件数据
  useEffect(() => {
    console.log('🔍 加载数据，日期:', date);
    
    const savedContent = storageService.getDailyContent(date);
    const savedBackground = storageService.getDailyBackground(date);
    const dateEvents = storageService.getEventsByDate(date);

    console.log('📝 加载到的内容:', savedContent ? `有内容，长度: ${savedContent.length}` : '无内容');
    console.log('🖼️ 背景图片:', savedBackground ? '有' : '无');
    console.log('📅 事件数量:', dateEvents.length);
    
    setContent(savedContent || '');
    setBackgroundImage(savedBackground || '');
    setEvents(dateEvents);
    
    isInitializedRef.current = true;
  }, [date]);

  // 初始化编辑器内容
  useEffect(() => {
    if (!editorRef.current) return;
    
    console.log('🎯 初始化编辑器，当前内容状态:', content ? `有内容，长度: ${content.length}` : '空');
    
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const currentFocus = document.activeElement;
    
    editorRef.current.innerHTML = content || '';
    
    console.log('✅ 编辑器内容已设置:', editorRef.current.innerHTML.substring(0, 100));
    
    if (range && currentFocus === editorRef.current) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    updateEmptyState();
    
  }, [content, date]);

  const updateEmptyState = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const isEmpty = !html || 
                     html === '<br>' || 
                     html === '<div><br></div>' || 
                     html === '&#8203;' ||
                     html === '<div>&#8203;</div>';
      
      if (isEmpty) {
        editorRef.current.classList.add('empty');
        console.log('📭 编辑器状态: 空');
      } else {
        editorRef.current.classList.remove('empty');
        console.log('📬 编辑器状态: 有内容');
      }
    }
  };

  // 从 DOM 更新内容状态
  const updateContentFromDOM = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      
      const cleanContent = newContent.replace(/&#8203;|<\/?div[^>]*>|<\/?br[^>]*>/g, '').trim();
      
      console.log('💾 准备保存内容，长度:', newContent.length, '清理后:', cleanContent.length);
      
      if (cleanContent) {
        setContent(newContent);
        updateEmptyState();
        const saveResult = storageService.saveDailyContent(date, newContent);
        console.log('💽 保存结果:', saveResult ? '成功' : '失败', '键名:', `daily-content-${date}`);
      } else {
        setContent('');
        updateEmptyState();
        storageService.saveDailyContent(date, '');
        console.log('💽 保存空内容');
      }
    }
  };

  // 内容变化处理
  const handleContentChange = () => {
    if (isComposingRef.current) return;
    
    console.log('⌨️ 内容变化触发');
    updateContentFromDOM();
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
    console.log('🇨🇳 中文输入开始');
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    console.log('🇨🇳 中文输入结束');
    updateContentFromDOM();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      setTimeout(updateContentFromDOM, 10);
    }
  };

  const saveContent = () => {
    updateContentFromDOM();
    alert('内容已保存！');
  };

  const handleEditorFocus = () => {
    if (editorRef.current) {
      editorRef.current.classList.remove('empty');
      console.log('🎯 编辑器获得焦点');
      
      if (editorRef.current.innerHTML === '&#8203;' || editorRef.current.innerHTML === '<div>&#8203;</div>') {
        editorRef.current.innerHTML = '';
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleEditorBlur = () => {
    console.log('👋 编辑器失去焦点');
    updateEmptyState();
    updateContentFromDOM();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        console.log('🖼️ 图片上传完成，大小:', imageUrl.length);
        
        if (editorRef.current) {
          const selection = window.getSelection();
          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = "uploaded";
          img.className = "uploaded-image";
          
          if (range) {
            range.insertNode(img);
            const space = document.createTextNode(' ');
            range.insertNode(space);
            range.collapse(false);
          } else {
            editorRef.current.appendChild(img);
            editorRef.current.appendChild(document.createTextNode(' '));
          }
          
          console.log('✅ 图片插入完成');
          updateContentFromDOM();
        }
      };
      
      reader.onerror = () => {
        alert('图片读取失败，请重试');
      };
      
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setBackgroundImage(imageUrl);
        storageService.saveDailyBackground(date, imageUrl);
        console.log('🎨 背景图片已保存');
      };
      
      reader.onerror = () => {
        alert('背景图片读取失败，请重试');
      };
      
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // 图片搜索相关功能
  const handleImageSelect = (imageUrl) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = "unsplash image";
      img.className = "uploaded-image";
      
      if (range) {
        range.insertNode(img);
        const space = document.createTextNode(' ');
        range.insertNode(space);
        range.collapse(false);
      } else {
        editorRef.current.appendChild(img);
        editorRef.current.appendChild(document.createTextNode(' '));
      }
      
      updateContentFromDOM();
    }
  };

  const handleImageSave = (imageData) => {
    storageService.saveDailyImage(date, imageData);
    alert('图片已保存到收藏！');
  };

  const handleSetAsBackground = (imageUrl) => {
    setBackgroundImage(imageUrl);
    storageService.saveDailyBackground(date, imageUrl);
    alert('已设置为背景图片！');
  };

  const addNewEvent = () => {
    const title = prompt('请输入事件标题:');
    if (!title || title.trim() === '') {
      alert('事件标题不能为空');
      return;
    }

    const type = prompt('请输入事件类型 (work/meeting/personal/urgent):', 'work');
    const validTypes = ['work', 'meeting', 'personal', 'urgent'];
    if (!validTypes.includes(type)) {
      alert('事件类型必须是: work, meeting, personal 或 urgent');
      return;
    }

    const startTime = prompt('请输入开始时间 (HH:mm)', '09:00');
    const endTime = prompt('请输入结束时间 (HH:mm)', '10:00');

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!startTime || !endTime || !timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('时间格式不正确，请使用 HH:mm 格式 (00:00 - 23:59)');
      return;
    }

    const start = new Date(date + 'T' + startTime + ':00');
    const end = new Date(date + 'T' + endTime + ':00');
    
    if (end <= start) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const hasConflict = events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (start < eventEnd && end > eventStart);
    });

    if (hasConflict) {
      if (!confirm('该时间段与已有事件冲突，是否继续添加？')) {
        return;
      }
    }

    const newEvent = {
      title: title.trim(),
      start: start,
      end: end,
      type: type
    };

    const savedEvent = storageService.addEvent(newEvent);
    setEvents(prev => [...prev, savedEvent]);
    alert('事件添加成功！');
  };

  const deleteEvent = (eventId) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      const updatedEvents = storageService.deleteEvent(eventId);
      setEvents(updatedEvents.filter(event => 
        moment(event.start).isSame(date, 'day')
      ));
      alert('事件已删除');
    }
  };

  const formatEventType = (type) => {
    const typeMap = {
      'work': '💼 工作',
      'meeting': '👥 会议',
      'personal': '👤 个人',
      'urgent': '🚨 紧急'
    };
    return typeMap[type] || type;
  };

  const getEventTypeColor = (type) => {
    const colorMap = {
      'work': '#3498db',
      'meeting': '#9b59b6',
      'personal': '#2ecc71',
      'urgent': '#e74c3c'
    };
    return colorMap[type] || '#3498db';
  };

  // 调试函数
  const checkStorage = () => {
    console.log('🔍 存储状态检查:');
    console.log('当前日期:', date);
    console.log('存储键:', `daily-content-${date}`);
    console.log('存储内容:', localStorage.getItem(`daily-content-${date}`));
    console.log('React状态内容:', content ? `有内容，长度: ${content.length}` : '空');
    console.log('编辑器内容:', editorRef.current?.innerHTML.substring(0, 200));
  };

  // 在组件挂载时检查存储
  useEffect(() => {
    console.log('🚀 EventDetailPage 组件挂载');
    checkStorage();
  }, []);

  return (
    <div className="event-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回日历
        </button>
        <h1 className="detail-title">{moment(date).format('YYYY年MM月DD日 dddd')}</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="toolbar-btn" 
            onClick={checkStorage}
            style={{ background: '#6c757d', fontSize: '12px', padding: '5px 10px' }}
          >
            🔍 调试
          </button>
          <button className="save-btn" onClick={saveContent}>
            💾 保存内容
          </button>
        </div>
      </div>
      
      <div className="detail-content">
        <div className="editor-toolbar">
          <button 
            className="toolbar-btn" 
            onClick={() => setShowImageUpload(!showImageUpload)}
          >
            📷 添加图片
          </button>
          
          <button 
            className="toolbar-btn"
            onClick={() => setShowImageSearch(true)}
            style={{ background: '#9b59b6' }}
          >
            🖼️ 搜索图片
          </button>
          
          <label className="toolbar-btn">
            🎨 背景图片
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleBackgroundUpload}
              style={{ display: 'none' }}
            />
          </label>
          
          <button className="toolbar-btn" onClick={addNewEvent}>
            ➕ 添加事件
          </button>
          
          {showImageUpload && (
            <div className="image-upload-panel">
              <span>选择图片：</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>
        
        <div className="events-section">
          <h3>📅 今日事件 ({events.length})</h3>
          {events.length > 0 ? (
            <div className="events-list">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="event-card"
                  style={{ borderLeftColor: getEventTypeColor(event.type) }}
                >
                  <div>
                    <h4>{event.title}</h4>
                    <p>
                      {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                    </p>
                  </div>
                  <div className="event-actions">
                    <span 
                      className="event-type"
                      style={{ backgroundColor: getEventTypeColor(event.type) }}
                    >
                      {formatEventType(event.type)}
                    </span>
                    <button 
                      className="delete-event-btn"
                      onClick={() => deleteEvent(event.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">暂无事件，点击"添加事件"按钮创建新事件</p>
          )}
        </div>
        
        <div 
          ref={editorRef}
          className="content-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onFocus={handleEditorFocus}
          onBlur={handleEditorBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          style={{ 
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: backgroundImage ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
          }}
        />
      </div>

      {/* 图片搜索模态框 */}
      {showImageSearch && (
        <ImageSearchModal
          date={date}
          onClose={() => setShowImageSearch(false)}
          onImageSelect={handleImageSelect}
          onImageSave={handleImageSave}
          onSetAsBackground={handleSetAsBackground}
        />
      )}
    </div>
  );
};

export default EventDetailPage;