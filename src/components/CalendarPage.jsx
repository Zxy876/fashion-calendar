// src/components/CalendarPage.js
import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';

// 设置中文本地化
moment.locale('zh-cn');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  // 状态管理
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  
  // 模拟事件数据
  const [events] = useState([
    {
      id: 1,
      title: '团队周会',
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 30),
      type: 'work'
    },
    {
      id: 2,
      title: '项目评审',
      start: new Date(2024, 0, 16, 14, 0),
      end: new Date(2024, 0, 16, 16, 0),
      type: 'meeting'
    },
    {
      id: 3,
      title: '健身训练',
      start: new Date(2024, 0, 17, 18, 0),
      end: new Date(2024, 0, 17, 19, 0),
      type: 'personal'
    },
    {
      id: 4,
      title: '客户拜访',
      start: new Date(2024, 0, 18, 9, 0),
      end: new Date(2024, 0, 18, 12, 0),
      type: 'urgent'
    }
  ]);

  // 日期导航功能
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

  // 跳转到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 切换视图
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
        fontWeight: '500'
      }
    };
  };

  // 事件处理
  const handleSelectEvent = (event) => {
    alert(`事件: ${event.title}\n开始: ${moment(event.start).format('YYYY-MM-DD HH:mm')}\n结束: ${moment(event.end).format('YYYY-MM-DD HH:mm')}`);
  };

  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('请输入新事件名称:');
    if (title) {
      alert(`已创建事件: ${title}\n时间: ${moment(start).format('YYYY-MM-DD HH:mm')} - ${moment(end).format('YYYY-MM-DD HH:mm')}`);
    }
  };

  // 自定义工具栏组件
  const CustomToolbar = () => {
    const currentMoment = moment(currentDate);
    
    return (
      <div className="custom-toolbar">
        <div className="toolbar-left">
          <button 
            className="nav-btn prev-btn"
            onClick={() => navigateDate(-1)}
            title="上一页"
          >
            ‹
          </button>
          
          <div className="date-display">
            <span className="current-year">{currentMoment.format('YYYY')}年</span>
            <span className="current-month">{currentMoment.format('MM')}月</span>
            {view === 'day' && (
              <span className="current-day">{currentMoment.format('DD')}日</span>
            )}
          </div>
          
          <button 
            className="nav-btn next-btn"
            onClick={() => navigateDate(1)}
            title="下一页"
          >
            ›
          </button>
          
          <button 
            className="today-btn"
            onClick={goToToday}
          >
            今天
          </button>
        </div>
        
        <div className="toolbar-right">
          <div className="view-controls">
            <button 
              className={`view-btn ${view === 'month' ? 'active' : ''}`}
              onClick={() => handleViewChange('month')}
            >
              月
            </button>
            <button 
              className={`view-btn ${view === 'week' ? 'active' : ''}`}
              onClick={() => handleViewChange('week')}
            >
              周
            </button>
            <button 
              className={`view-btn ${view === 'day' ? 'active' : ''}`}
              onClick={() => handleViewChange('day')}
            >
              日
            </button>
          </div>
          
          <button 
            className="add-event-btn"
            onClick={() => handleSelectSlot({ 
              start: new Date(), 
              end: new Date(Date.now() + 60 * 60 * 1000) 
            })}
          >
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
            <h1 className="app-title"> 时尚日历</h1>
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
              />
            </div>
          </div>
          
          <div className="calendar-sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                今日事件
                <span className="event-count">{events.filter(event => 
                  moment(event.start).isSame(moment(), 'day')).length}
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