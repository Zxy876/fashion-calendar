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
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        
        // 使用更安全的方式插入图片
        if (editorRef.current) {
          const selection = window.getSelection();
          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
          
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = "uploaded";
          img.style.maxWidth = "100%";
          img.style.borderRadius = "8px";
          img.style.margin = "10px 0";
          
          if (range) {
            range.insertNode(img);
            range.collapse(false);
          } else {
            editorRef.current.appendChild(img);
          }
          
          // 触发内容更新
          const newContent = editorRef.current.innerHTML;
          setContent(newContent);
          storageService.saveDailyContent(date, newContent);
        }
      };
      reader.readAsDataURL(file);
    }
    // 清空input，允许重复选择同一文件
    e.target.value = '';
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setBackgroundImage(imageUrl);
        storageService.saveDailyBackground(date, imageUrl);
      };
      reader.readAsDataURL(file);
    }
    // 清空input，允许重复选择同一文件
    e.target.value = '';
  };

  const saveContent = () => {
    storageService.saveDailyContent(date, content);
    alert('内容已保存');
  };

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    // 自动保存
    storageService.saveDailyContent(date, newContent);
  };

  const addNewEvent = () => {
    const title = prompt('请输入事件标题:');
    if (!title) return;

    const type = prompt('请输入事件类型 (work/meeting/personal/urgent):', 'work');
    const startTime = prompt('请输入开始时间 (HH:mm)', '09:00');
    const endTime = prompt('请输入结束时间 (HH:mm)', '10:00');

    // 验证时间格式
    if (!startTime || !endTime || !startTime.match(/^\d{2}:\d{2}$/) || !endTime.match(/^\d{2}:\d{2}$/)) {
      alert('时间格式不正确，请使用 HH:mm 格式');
      return;
    }

    // 验证时间逻辑
    const start = new Date(date + 'T' + startTime + ':00');
    const end = new Date(date + 'T' + endTime + ':00');
    
    if (end <= start) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const newEvent = {
      title,
      start: start,
      end: end,
      type: type || 'work'
    };

    const savedEvent = storageService.addEvent(newEvent);
    setEvents(prev => [...prev, savedEvent]);
  };

  const deleteEvent = (eventId) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      const updatedEvents = storageService.deleteEvent(eventId);
      setEvents(updatedEvents.filter(event => 
        moment(event.start).isSame(date, 'day')
      ));
    }
  };

  const formatEventType = (type) => {
    const typeMap = {
      'work': '工作',
      'meeting': '会议',
      'personal': '个人',
      'urgent': '紧急'
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
        <h1 className="detail-title">{moment(date).format('YYYY年MM月DD日')}</h1>
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
                multiple
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
          style={{ 
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: backgroundImage ? 'overlay' : 'normal',
            backgroundColor: backgroundImage ? 'rgba(255, 255, 255, 0.8)' : 'transparent'
          }}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;