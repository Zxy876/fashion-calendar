import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';

// 设置中文本地化
moment.locale('zh-cn');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [hoveredDate, setHoveredDate] = useState(null);
  const [previewEvents, setPreviewEvents] = useState([]);
  const navigate = useNavigate();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDay = new Date().getDate();
  
  // 从 localStorage 加载保存的事件
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      // 将字符串日期转换回 Date 对象
      const parsedEvents = JSON.parse(savedEvents);
      return parsedEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
    } else {
      // 默认事件
      return [
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
    }
  });

  // 当事件变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);
const [touchTimer, setTouchTimer] = useState(null);

const handleTouchStart = (date) => {
  const timer = setTimeout(() => {
    handleDayMouseEnter(date);
  }, 500); // 长按500ms显示预览
  setTouchTimer(timer);
};

const handleTouchEnd = () => {
  if (touchTimer) {
    clearTimeout(touchTimer);
    setTouchTimer(null);
  }
  handleDayMouseLeave();
};

  // 处理鼠标悬停
  const handleDayMouseEnter = (date) => {
    setHoveredDate(date);
    const dayEvents = events.filter(event => 
      moment(event.start).isSame(date, 'day')
    );
    setPreviewEvents(dayEvents);
  };

  const handleDayMouseLeave = () => {
    setHoveredDate(null);
    setPreviewEvents([]);
  };

  // 处理日期点击跳转
  const handleDateClick = (date) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    navigate(`/date/${dateString}`);
  };

  // 自定义日期单元格组件
  const CustomDateCell = ({ date }) => {
  const dayEvents = events.filter(event => 
    moment(event.start).isSame(date, 'day')
  );
  
  return (
    <div 
      className="custom-date-cell"
      onMouseEnter={() => handleDayMouseEnter(date)}
      onMouseLeave={handleDayMouseLeave}
      onTouchStart={() => handleTouchStart(date)}
      onTouchEnd={handleTouchEnd}
      onClick={() => handleDateClick(date)}
      style={{ 
        height: '100%', 
        width: '100%', 
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      <div className="date-number">
        {moment(date).date()}
      </div>
      {dayEvents.length > 0 && (
        <div className="event-dots">
          {dayEvents.slice(0, 3).map((event, index) => (
            <div 
              key={index}
              className={`event-dot ${event.type}`}
              title={event.title}
            />
          ))}
        </div>
      )}
    </div>
  );
};
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

  const handleSelectEvent = (event) => {
    alert(`事件: ${event.title}\n开始: ${moment(event.start).format('YYYY-MM-DD HH:mm')}\n结束: ${moment(event.end).format('YYYY-MM-DD HH:mm')}`);
  };

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('请输入新事件名称:');
    if (title) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (startDate.getTime() === endDate.getTime()) {
        endDate.setHours(startDate.getHours() + 1);
      }
      
      const newEvent = {
        id: Date.now(),
        title,
        start: startDate,
        end: endDate,
        type: 'work'  // 确保有 type 属性
      };
      
      setEvents(prev => [...prev, newEvent]);
    }
  };

  // 添加事件类型选择功能
  const handleAddEventWithType = () => {
    const title = window.prompt('请输入新事件名称:');
    if (title) {
      const type = window.prompt('请输入事件类型 (work/meeting/personal/urgent):', 'work');
      const now = new Date();
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      
      const newEvent = {
        id: Date.now(),
        title,
        start: now,
        end: end,
        type: type || 'work'
      };
      
      setEvents(prev => [...prev, newEvent]);
    }
  };

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
          
          <button className="add-event-btn" onClick={handleAddEventWithType}>
            + 添加事件
          </button>
        </div>
      </div>
    );
  };

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
            
            {/* 悬停预览卡片 */}
            {hoveredDate && previewEvents.length > 0 && (
              <div className="date-preview-card">
                <div className="preview-header">
                  {moment(hoveredDate).format('MM月DD日')} 的事件
                </div>
                <div className="preview-events">
                  {previewEvents.map(event => (
                    <div key={event.id} className={`preview-event ${event.type}`}>
                      <span className="preview-event-title">{event.title}</span>
                      <span className="preview-event-time">
                        {moment(event.start).format('HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
                  month: {
                    dateHeader: ({ date, label }) => (
                      <CustomDateCell date={date} />
                    )
                  },
                  week: {
                    dateHeader: ({ date, label }) => (
                      <CustomDateCell date={date} />
                    )
                  },
                  day: {
                    dateHeader: ({ date, label }) => (
                      <CustomDateCell date={date} />
                    )
                  }
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
                popup
                step={60}
                showMultiDayTimes
              />
            </div>
          </div>
          
          <div className="calendar-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                今日事件
                <span className="event-count">
                  {events.filter(event => moment(event.start).isSame(moment(), 'day')).length}
                </span>
              </h3>
              
              <div className="event-list">
                {events
                  .filter(event => moment(event.start).isSame(moment(), 'day'))
                  .map(event => (
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
                  ))
                }
                
                {events.filter(event => moment(event.start).isSame(moment(), 'day')).length === 0 && (
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
                  <div className="stat-value">{events.length}</div>
                  <div className="stat-label">总事件</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {events.filter(e => e.type === 'work').length}
                  </div>
                  <div className="stat-label">工作</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {events.filter(e => e.type === 'personal').length}
                  </div>
                  <div className="stat-label">个人</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {events.filter(e => e.type === 'urgent').length}
                  </div>
                  <div className="stat-label">紧急</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;