import { useState, useEffect } from 'react';
import './App.css'; // Make sure your ocean theme CSS is linked!

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDay, setSelectedDay] = useState('All');
  const uniqueDays = ['All', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // 1. Fetch from the exact Swagger endpoint
    fetch('https://adonix.hackillinois.org/event/')
      .then((res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Live HackIllinois Data:', data);
        
        // 2. The API wraps events in a data.events array
        const eventList = data.events || [];
        
        // 3. Optional: Sort events chronologically by startTime
        eventList.sort((a, b) => a.startTime - b.startTime);
        
        setEvents(eventList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load events:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far down the page we've scrolled
      const scrollPx = document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      // Get a decimal between 0 (top) and 1 (bottom)
      const scrollPercent = maxScroll > 0 ? scrollPx / maxScroll : 0;
      
      // Send this value to CSS!
      document.documentElement.style.setProperty('--scroll-percent', scrollPercent);

      if (scrollY > 60 && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollY < 10 && !isScrolled) {
        setIsScrolled(false);
      }
    };

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup the listener when the component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Helper: Convert Unix timestamp (seconds) to readable AM/PM time
  const formatTime = (unixSeconds) => {
    if (!unixSeconds) return 'TBD';
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Helper: Convert Unix timestamp to a Day string (e.g., "Friday")
  const formatDay = (unixSeconds) => {
    if (!unixSeconds) return '';
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleDateString([], { weekday: 'long' });
  };
  
  const filteredEvents = events.filter(event => {
    if (selectedDay === 'All') return true;
    return formatDay(event.startTime) === selectedDay;
  });

  return (
    <div style={{
      minHeight: '100vh',
      color: '#e2e8f0',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        margin: '-2rem -2rem 2rem -2rem', 
        padding: isScrolled ? '0.75rem 2rem' : '1.5rem 2rem', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', 
        backgroundColor: 'rgba(5, 19, 41, 0.65)', 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease-in-out' 
      }}>
        <h1 style={{ 
          color: '#ffffff', 
          margin: 0, 
          fontSize: isScrolled ? '1.5rem' : '2.2rem', 
          letterSpacing: '1px',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
          transition: 'all 0.3s ease-in-out'
        }}>
          Hack<span style={{ color: '#FF5F05' }}>Illinois</span>
          {!isScrolled && ' 2024 Schedule'}
        </h1>
        
        <p style={{ 
          color: '#cbd5e1', 
          margin: isScrolled ? '0' : '0.5rem 0 0 0',
          fontSize: '1rem',
          fontWeight: '300',
          opacity: isScrolled ? 0 : 1,
          height: isScrolled ? 0 : 'auto',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out'
        }}>
          Diving into the events...
        </p>
      </header>

      {/* State Handling: Loading & Error */}
      {loading && <p style={{ color: '#38bdf8', textAlign: 'center' }}>Scanning for events...</p>}
      {error && (
        <div style={{ backgroundColor: '#7f1d1d', padding: '1rem', borderRadius: '8px' }}>
          <p>Error reaching the surface: {error}</p>
        </div>
      )}

      {/* NEW: Day Filtering Tabs */}
      {!loading && !error && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {uniqueDays.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '0.6rem 1.5rem',
                // Use Illini Orange for the active tab, and a dark glass for inactive ones
                backgroundColor: selectedDay === day ? 'rgba(255, 95, 5, 0.8)' : 'rgba(5, 19, 41, 0.5)',
                color: '#ffffff',
                border: selectedDay === day ? '1px solid #FF5F05' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '30px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.2s ease-in-out',
                boxShadow: selectedDay === day ? '0 4px 15px rgba(255, 95, 5, 0.4)' : 'none'
              }}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {/* Grid Layout for Event Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* IMPORTANT: Change events.map to filteredEvents.map here! */}
        {!loading && !error && filteredEvents.map((event) => {
          const roomName = event.locations && event.locations.length > 0 
            ? event.locations[0].description 
            : 'Location TBA';
            
          // ... the rest of your card code stays exactly the same
          return (
            <div 
              key={event.id}
              style={{
                backgroundColor: 'rgba(15, 43, 72, 0.4)', 
                backdropFilter: 'blur(10px)', // I added the frosted glass back to the cards here!
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Top Row: Title & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', lineHeight: 1.3 }}>
                  {event.name}
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  marginLeft: '0.5rem'
                }}>
                  {event.eventType}
                </span>
              </div>

              {/* Middle Row: Time & Location */}
              <div style={{ 
                fontSize: '0.9rem', // Slightly larger
                color: '#ffffff',   // Changed from gray to pure white
                fontWeight: '600',  // Made the font thicker
                textShadow: '0 2px 6px rgba(0,0,0,0.8)', // Forces contrast against the bright sun
                marginBottom: '1rem' 
              }}>
                <div style={{ marginBottom: '0.35rem' }}>
                  📅 {formatDay(event.startTime)} • {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                <div>📍 {roomName}</div>
              </div>

              {/* Bottom Row: Description */}
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: '#f8fafc', // Brighter text
                textShadow: '0 1px 4px rgba(0,0,0,0.6)', // Shadow for legibility 
                lineHeight: 1.5, 
                flexGrow: 1 
              }}>
                {event.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}