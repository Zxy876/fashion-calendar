import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';

// 设置中文本地化
moment.locale('zh-cn');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  
  // 修复：使用当前日期的事件数据
  const currentYear = new Date().getFullYear(); // 2025
  const currentMonth = new Date().getMonth();   // 9 (10月)
  const currentDay = new Date().getDate();      // 当前日期
  
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '团队周会',
      start: new Date(currentYear, currentMonth, currentDay, 10, 0),     // 今天10:00
      end: new Date(currentYear, currentMonth, currentDay, 11, 30),      // 今天11:30
      type: 'work'
    },
    {
      id: 2,
      title: '项目评审',
      start: new Date(currentYear, currentMonth, currentDay + 1, 14, 0), // 明天14:00
      end: new Date(currentYear, currentMonth, currentDay + 1, 16, 0),   // 明天16:00
      type: 'meeting'
    },
    {
      id: 3,
      title: '健身训练',
      start: new Date(currentYear, currentMonth, currentDay, 18, 0),     // 今天18:00
      end: new Date(currentYear, currentMonth, currentDay, 19, 0),       // 今天19:00
      type: 'personal'
    },
    {
      id: 4,
      title: '客户会议',
      start: new Date(currentYear, currentMonth, currentDay - 1, 9, 0),  // 昨天9:00
      end: new Date(currentYear, currentMonth, currentDay - 1, 10, 30),  // 昨天10:30
      type: 'urgent'
    }
  ]);

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

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('请输入新事件名称:');
    if (title) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // 如果只点击不拖动，设置默认时长1小时
      if (startDate.getTime() === endDate.getTime()) {
        endDate.setHours(startDate.getHours() + 1);
      }
      
      const newEvent = {
        id: Date.now(),
        title,
        start: startDate,
        end: endDate,
        type: 'work'
      };
      
      console.log('添加事件:', newEvent);
      setEvents(prev => [...prev, newEvent]);
    }
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
          
          <button className="add-event-btn" onClick={() => {
            const now = new Date();
            const end = new Date(now.getTime() + 60 * 60 * 1000);
            handleSelectSlot({ start: now, end });
          }}>+ 添加事件</button>
        </div>
      </div>
    );
  };

  // 调试信息
  console.log('当前事件:', events);
  console.log('当前日期:', currentDate);
  console.log('当前视图:', view);

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
                // 添加这些props确保事件显示
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