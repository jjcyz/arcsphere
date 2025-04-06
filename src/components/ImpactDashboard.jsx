import { useState, useEffect } from 'react';
import './ImpactDashboard.css';

export default function ImpactDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Sample data - in a real app, this would come from an API or database
  const upcomingEvents = [
    {
      id: 1,
      type: 'meetup',
      title: 'Mountain Skills Workshop',
      date: '2024-07-15',
      location: 'Vancouver, BC',
      description: 'Learn essential mountain skills from experienced guides.'
    },
    {
      id: 2,
      type: 'expedition',
      title: 'Alpine Climbing Expedition',
      date: '2024-08-10',
      location: 'Whistler, BC',
      description: 'Join our expert team for a 5-day alpine climbing expedition.'
    },
    {
      id: 3,
      type: 'workshop',
      title: 'Gear Maintenance Workshop',
      date: '2024-07-22',
      location: 'Seattle, WA',
      description: 'Learn how to maintain and repair your outdoor gear.'
    },
    {
      id: 4,
      type: 'grant',
      title: 'Community Grant Application Deadline',
      date: '2024-07-30',
      location: 'Online',
      description: 'Submit your application for the Q3 Community Grant Program.'
    }
  ];

  const impactStats = [
    { label: 'Community Members', value: '2,500+' },
    { label: 'Events Hosted', value: '20+' },
    { label: 'Grant Awarded', value: '$12K+' },
    { label: 'Partners Connected', value: '45+' }
  ];

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const hasEvent = upcomingEvents.some(event => event.date === dateString);

      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${hasEvent ? 'has-event' : ''}`}
        >
          <span className="day-number">{day}</span>
          {hasEvent && <div className="event-indicator"></div>}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="impact-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Impact Dashboard</h2>
        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events
          </button>
          <button
            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'upcoming' ? (
          <>
            <div className="impact-stats">
              {impactStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="upcoming-events">
              <h3 className="section-title">Upcoming Events</h3>
              <div className="events-list">
                {upcomingEvents.map(event => (
                  <div key={event.id} className={`event-card ${event.type}`}>
                    <div className="event-date">{formatDate(event.date)}</div>
                    <div className="event-title">{event.title}</div>
                    <div className="event-location">{event.location}</div>
                    <div className="event-description">{event.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="calendar-container">
            <div className="calendar-header">
              <button
                className="calendar-nav-button"
                onClick={() => navigateMonth('prev')}
              >
                ←
              </button>
              <h3 className="calendar-title">
                {getMonthName(currentMonth)} {currentYear}
              </h3>
              <button
                className="calendar-nav-button"
                onClick={() => navigateMonth('next')}
              >
                →
              </button>
            </div>

            <div className="calendar-weekdays">
              <div className="weekday">Sun</div>
              <div className="weekday">Mon</div>
              <div className="weekday">Tue</div>
              <div className="weekday">Wed</div>
              <div className="weekday">Thu</div>
              <div className="weekday">Fri</div>
              <div className="weekday">Sat</div>
            </div>

            <div className="calendar-grid">
              {renderCalendar()}
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <div className="legend-indicator"></div>
                <div className="legend-label">Event</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
