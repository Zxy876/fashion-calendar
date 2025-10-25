// src/components/EventDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import './EventDetailPage.css';
import { storageService } from '../utils/storage';

const EventDetailPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [events, setEvents] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const editorRef = useRef(null);

  // 加载该日期的事件数据
  useEffect(() => {
    const savedContent = storageService.getDailyContent(date);
    const savedBackground = storageService.getDailyBackground(date);
    const dateEvents = storageService.getEventsByDate(date);

    setContent(savedContent || '');
    setBackgroundImage(savedBackground || '');
    setEvents(dateEvents);
  }, [date]);

  // 初始化编辑器内容
  useEffect(() => {
    if (editorRef.current && content !== undefined) {
      if (content) {
        editorRef.current.innerHTML = content;
        editorRef.current.classList.remove('empty');
      } else {
        editorRef.current.innerHTML = '';
        editorRef.current.classList.add('empty');
      }
    }
  }, [content]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      // 验证文件大小（限制为 5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        
        if (editorRef.current) {
          const selection = window.getSelection();
          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = "uploaded";
          img.style.maxWidth = "100%";
          img.style.borderRadius = "8px";
          img.style.margin = "10px 0";
          img.className = "uploaded-image";
          
          if (range) {
            range.insertNode(img);
            range.collapse(false);
          } else {
            editorRef.current.appendChild(img);
          }
          
          // 移除空状态
          editorRef.current.classList.remove('empty');
          
          // 触发内容更新
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          storageService.saveDailyContent(date, newContent);
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
      };
      
      reader.onerror = () => {
        alert('背景图片读取失败，请重试');
      };
      
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const saveContent = () => {
    storageService.saveDailyContent(date, content);
    alert('内容已保存');
  };

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    
    // 更新空状态
    if (editorRef.current) {
      if (newContent === '<br>' || newContent === '') {
        editorRef.current.classList.add('empty');
      } else {
        editorRef.current.classList.remove('empty');
      }
    }
    
    // 自动保存
    storageService.saveDailyContent(date, newContent);
  };

  const handleEditorFocus = () => {
    if (editorRef.current) {
      editorRef.current.classList.remove('empty');
    }
  };

  const handleEditorBlur = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (!currentContent || currentContent === '<br>') {
        editorRef.current.classList.add('empty');
      }
    }
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

    // 验证时间格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!startTime || !endTime || !timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert('时间格式不正确，请使用 HH:mm 格式 (00:00 - 23:59)');
      return;
    }

    // 验证时间逻辑
    const start = new Date(date + 'T' + startTime + ':00');
    const end = new Date(date + 'T' + endTime + ':00');
    
    if (end <= start) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    // 检查时间冲突
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

  return (
    <div className="event-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回日历
        </button>
        <h1 className="detail-title">{moment(date).format('YYYY年MM月DD日 dddd')}</h1>
        <button className="save-btn" onClick={saveContent}>
          💾 保存内容
        </button>
      </div>
      
      <div className="detail-content">
        <div className="editor-toolbar">
          <button 
            className="toolbar-btn" 
            onClick={() => setShowImageUpload(!showImageUpload)}
          >
            📷 添加图片
          </button>
          
          <label className="toolbar-btn">
            🖼️ 背景图片
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
          style={{ 
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: backgroundImage ? 'rgba(255, 255, 255, 0.9)' : 'transparent'
          }}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;