// src/components/EventDetailPage.jsx
import React, { useState, useEffect } from 'react';
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

  // 加载该日期的事件数据
  useEffect(() => {
    const savedContent = storageService.getDailyContent(date);
    const savedBackground = storageService.getDailyBackground(date);
    const dateEvents = storageService.getEventsByDate(date);

    setContent(savedContent);
    setBackgroundImage(savedBackground);
    setEvents(dateEvents);
  }, [date]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        const newContent = content + `<img src="${imageUrl}" alt="uploaded" style="max-width: 100%; border-radius: 8px; margin: 10px 0;" />`;
        setContent(newContent);
        storageService.saveDailyContent(date, newContent);
      };
      reader.readAsDataURL(file);
    }
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
  };

  const saveContent = () => {
    storageService.saveDailyContent(date, content);
    alert('内容已保存');
  };

  const addNewEvent = () => {
    const title = prompt('请输入事件标题:');
    if (!title) return;

    const type = prompt('请输入事件类型 (work/meeting/personal/urgent):', 'work');
    const startTime = prompt('请输入开始时间 (HH:mm)', '09:00');
    const endTime = prompt('请输入结束时间 (HH:mm)', '10:00');

    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    const newEvent = {
      title,
      start: new Date(date + 'T' + startTime + ':00'),
      end: new Date(date + 'T' + endTime + ':00'),
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

  const handleContentChange = (e) => {
    const newContent = e.target.innerHTML;
    setContent(newContent);
    // 自动保存
    storageService.saveDailyContent(date, newContent);
  };

  return (
    <div className="event-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← 返回日历
        </button>
        <h1 className="detail-title">{moment(date).format('YYYY年MM月DD日')}</h1>
        <button className="save-btn" onClick={saveContent}>
          💾 保存
        </button>
      </div>
      
      <div className="detail-content">
        <div className="editor-toolbar">
          <button className="toolbar-btn" onClick={() => setShowImageUpload(!showImageUpload)}>
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
          <h3>今日事件 ({events.length})</h3>
          {events.length > 0 ? (
            <div className="events-list">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <div>
                    <h4>{event.title}</h4>
                    <p>
                      {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="event-type">
                      {event.type === 'work' && '工作'}
                      {event.type === 'meeting' && '会议'}
                      {event.type === 'personal' && '个人'}
                      {event.type === 'urgent' && '紧急'}
                    </span>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
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
          className="content-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          style={{ 
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;