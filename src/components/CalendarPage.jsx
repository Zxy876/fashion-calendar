// src/components/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';
import { storageService } from '../utils/storage';

// 设置中文本地化
moment.locale('zh-cn');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  
  // 添加悬停状态
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });
  
  // 从本地存储加载事件数据
  useEffect(() => {
    const savedEvents = storageService.getEvents();
    
    // 如果没有事件数据，初始化一些示例数据
    if (savedEvents.length === 0) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const currentDay = new Date().getDate();
      
      // 确保使用 Date 对象而不是字符串
      const sampleEvents = [
        {
          id: 1,
          title: '团队周会',
          start: new Date(currentYear, currentMonth, currentDay, 10, 0),
          end: new Date(currentYear, currentMonth, currentDay, 11, 30),
          type: 'work'
        },
        {
          id: 2,
          title: '项目评审',
          start: new Date(currentYear, currentMonth, currentDay + 1, 14, 0),
          end: new Date(currentYear, currentMonth, currentDay + 1, 16, 0),
          type: 'meeting'
        },
        {
          id: 3,
          title: '健身训练',
          start: new Date(currentYear, currentMonth, currentDay, 18, 0),
          end: new Date(currentYear, currentMonth, currentDay, 19, 0),
          type: 'personal'
        },
        {
          id: 4,
          title: '客户会议',
          start: new Date(currentYear, currentMonth, currentDay - 1, 9, 0),
          end: new Date(currentYear, currentMonth, currentDay - 1, 10, 30),
          type: 'urgent'
        }
      ];
      
      sampleEvents.forEach(event => storageService.addEvent(event));
      setEvents(sampleEvents);
    } else {
      // 确保从存储中加载的事件数据中的日期是 Date 对象
      const processedEvents = savedEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      setEvents(processedEvents);
    }
  }, []);

  // 日期导航
  const navigateDate = (direction) => {
    let newDate;
    if (view === 'month') {
      newDate = moment(currentDate).add(direction, 'months').toDate();
    } else if (view === 'week') {
      newDate = moment(currentDate).add(direction, 'weeks').toDate();
    } else {
      newDate = moment(currentDate).add(direction, 'days').toDate();
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  // 事件样式
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    switch (event.type) {
      case 'work':
        backgroundColor = '#3498db';
        break;
      case 'meeting':
        backgroundColor = '#9b59b6';
        break;
      case 'personal':
        backgroundColor = '#2ecc71';
        break;
      case 'urgent':
        backgroundColor = '#e74c3c';
        break;
      default:
        backgroundColor = '#3174ad';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500',
        padding: '2px 4px'
      }
    };
  };

  // 事件处理函数
  const handleSelectEvent = (event) => {
    alert(`事件: ${event.title}\n开始: ${moment(event.start).format('YYYY-MM-DD HH:mm')}\n结束: ${moment(event.end).format('YYYY-MM-DD HH:mm')}`);
  };

  // 日期悬停处理
  const handleDayMouseEnter = (date, e) => {
    const dayEvents = storageService.getEventsByDate(date);
    
    if (dayEvents.length > 0) {
      setHoveredDate({ date, events: dayEvents });
      setHoveredPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDayMouseLeave = () => {
    setHoveredDate(null);
  };

  // 日期点击处理 - 跳转到详情页
  const handleSelectSlot = ({ start, end }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    navigate(`/day/${dateStr}`);
  };

  // 添加新事件
  const handleAddEvent = () => {
    const title = prompt('请输入事件标题:');
    if (!title) return;

    const type = prompt('请输入事件类型 (work/meeting/personal/urgent):', 'work');
    const startTime = prompt('请输入开始时间 (HH:mm)', '09:00');
    const endTime = prompt('请输入结束时间 (HH:mm)', '10:00');

    const today = new Date();
    const [startHour, startMinute] = startTime.split(':');
    const [endHour, endMinute] = endTime.split(':');

    const newEvent = {
      title,
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMinute),
      type: type || 'work'
    };

    const savedEvent = storageService.addEvent(newEvent);
    // 确保新事件的日期是 Date 对象
    const eventWithDateObjects = {
      ...savedEvent,
      start: new Date(savedEvent.start),
      end: new Date(savedEvent.end)
    };
    setEvents(prev => [...prev, eventWithDateObjects]);
  };

  // 自定义日期单元格包装器
  const CustomDayWrapper = ({ children, value }) => {
    return (
      <div 
        onMouseEnter={(e) => handleDayMouseEnter(value, e)}
        onMouseLeave={handleDayMouseLeave}
        onClick={() => handleSelectSlot({ start: value, end: value })}
        style={{ cursor: 'pointer', height: '100%' }}
      >
        {children}
      </div>
    );
  };

  // 渲染悬停预览卡片
  const renderHoverPreview = () => {
    if (!hoveredDate) return null;

    return (
      <div 
        className="date-preview-card"
        style={{
          position: 'fixed',
          left: hoveredPosition.x + 10,
          top: hoveredPosition.y + 10,
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        <div className="preview-header">
          <h4>{moment(hoveredDate.date).format('MM月DD日')}</h4>
          <span className="event-count">{hoveredDate.events.length} 个事件</span>
        </div>
        <div className="preview-events">
          {hoveredDate.events.map(event => (
            <div key={event.id} className={`preview-event ${event.type}`}>
              <div className="event-time">
                {moment(event.start).format('HH:mm')}
              </div>
              <div className="event-title">{event.title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 自定义工具栏
  const CustomToolbar = () => {
    const currentMoment = moment(currentDate);
    
    return (
      <div className="custom-toolbar">
        <div className="toolbar-left">
          <button className="nav-btn prev-btn" onClick={() => navigateDate(-1)}>‹</button>
          
          <div className="date-display">
            <span className="current-year">{currentMoment.format('YYYY')}年</span>
            <span className="current-month">{currentMoment.format('MM')}月</span>
            {view === 'day' && <span className="current-day">{currentMoment.format('DD')}日</span>}
          </div>
          
          <button className="nav-btn next-btn" onClick={() => navigateDate(1)}>›</button>
          <button className="today-btn" onClick={goToToday}>今天</button>
        </div>
        
        <div className="toolbar-right">
          <div className="view-controls">
            <button className={`view-btn ${view === 'month' ? 'active' : ''}`} onClick={() => handleViewChange('month')}>月</button>
            <button className={`view-btn ${view === 'week' ? 'active' : ''}`} onClick={() => handleViewChange('week')}>周</button>
            <button className={`view-btn ${view === 'day' ? 'active' : ''}`} onClick={() => handleViewChange('day')}>日</button>
          </div>
          
          <button className="add-event-btn" onClick={handleAddEvent}>
            + 添加事件
          </button>
        </div>
      </div>
    );
  };

  // 获取今日事件
  const todayEvents = storageService.getEventsByDate(new Date());
  // 获取本月事件统计
  const monthEvents = storageService.getEventsByMonth(currentDate);

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="header-content">
            <h1 className="app-title">智能日程日历</h1>
            <div className="user-info">
              <div className="user-avatar">用</div>
              <span className="user-name">用户</span>
            </div>
          </div>
        </div>
        
        <div className="calendar-content">
          <div className="main-calendar">
            <CustomToolbar />
            
            <div className="calendar-wrapper">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                date={currentDate}
                onView={setView}
                onNavigate={setCurrentDate}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                eventPropGetter={eventStyleGetter}
                components={{
                  dayWrapper: CustomDayWrapper
                }}
                messages={{
                  next: "下一个",
                  previous: "上一个",
                  today: "今天",
                  month: "月",
                  week: "周",
                  day: "日",
                  agenda: "议程"
                }}
                style={{ height: 500 }}
                dayPropGetter={(date) => {
                  const hasEvents = storageService.getEventsByDate(date).length > 0;
                  return {
                    className: hasEvents ? 'has-events' : ''
                  };
                }}
                popup
                step={60}
                showMultiDayTimes
                // 添加格式配置来修复兼容性问题
                formats={{
                  dateFormat: 'D',
                  dayFormat: 'D',
                  weekdayFormat: 'ddd',
                  timeGutterFormat: 'HH:mm',
                  monthHeaderFormat: 'YYYY年 MM月',
                  dayHeaderFormat: 'YYYY年 MM月 DD日',
                  dayRangeHeaderFormat: ({ start, end }) => 
                    `${moment(start).format('YYYY年 MM月 DD日')} - ${moment(end).format('MM月 DD日')}`
                }}
              />
            </div>
          </div>
          
          <div className="calendar-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                今日事件
                <span className="event-count">{todayEvents.length}</span>
              </h3>
              
              <div className="event-list">
                {todayEvents.map(event => (
                  <div key={event.id} className={`event-item ${event.type}`}>
                    <div className="event-header">
                      <span className="event-title">{event.title}</span>
                      <span className="event-category">
                        {event.type === 'work' && '工作'}
                        {event.type === 'meeting' && '会议'}
                        {event.type === 'personal' && '个人'}
                        {event.type === 'urgent' && '紧急'}
                      </span>
                    </div>
                    <div className="event-time">
                      {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                    </div>
                  </div>
                ))}
                
                {todayEvents.length === 0 && (
                  <div className="empty-events">
                    <div className="empty-icon">📅</div>
                    <p>今天没有安排事件</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="sidebar-section">
              <h3 className="sidebar-title">本月统计</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{monthEvents.length}</div>
                  <div className="stat-label">总事件</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {monthEvents.filter(e => e.type === 'work').length}
                  </div>
                  <div className="stat-label">工作</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {monthEvents.filter(e => e.type === 'personal').length}
                  </div>
                  <div className="stat-label">个人</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {monthEvents.filter(e => e.type === 'urgent').length}
                  </div>
                  <div className="stat-label">紧急</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 添加悬停预览卡片 */}
      {renderHoverPreview()}
    </div>
  );
};

export default CalendarPage;