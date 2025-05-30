'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Zap, Shield } from 'lucide-react';

const DeadmanModeCountdown = () => {
  const [deadmanCountdown, setDeadmanCountdown] = useState('');
  const [breachCountdown, setBreachCountdown] = useState('');
  const [deadmanStatus, setDeadmanStatus] = useState('');
  const [nextBreachTime, setNextBreachTime] = useState(null);
  const [isBreachActive, setIsBreachActive] = useState(false);

  // Deadman Mode schedule
  const DEADMAN_START = new Date('2025-05-30T12:00:00.000Z');
  const DEADMAN_END = new Date('2025-06-08T23:59:59.999Z');
  const BREACH_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

  // Check if we're currently in Deadman Mode
  const isInDeadmanMode = () => {
    const now = new Date();
    return now >= DEADMAN_START && now <= DEADMAN_END;
  };

  // Check if we're currently in a breach
  const isCurrentlyInBreach = () => {
    const now = new Date();
    
    if (!isInDeadmanMode()) return false;
    
    // Get today's breach start time (19:00 UTC)
    const today19UTC = new Date();
    today19UTC.setUTCHours(19, 0, 0, 0);
    
    const breachEndTime = new Date(today19UTC.getTime() + BREACH_DURATION);
    
    return now >= today19UTC && now <= breachEndTime;
  };

  // Calculate next breach time (19:00 UTC daily during Deadman Mode)
  const getNextBreach = () => {
    const now = new Date();
    
    // If Deadman Mode hasn't started yet, return the first breach after it starts
    if (now < DEADMAN_START) {
      const firstBreach = new Date('2025-05-30T19:00:00.000Z');
      return firstBreach;
    }
    
    // If Deadman Mode has ended, return null
    if (now > DEADMAN_END) {
      return null;
    }
    
    // During Deadman Mode, find next 19:00 UTC
    const today19UTC = new Date();
    today19UTC.setUTCHours(19, 0, 0, 0);
    
    const breachEndTime = new Date(today19UTC.getTime() + BREACH_DURATION);
    
    // If we're currently in a breach, return tomorrow's breach
    if (now >= today19UTC && now <= breachEndTime) {
      const tomorrow19UTC = new Date(today19UTC);
      tomorrow19UTC.setUTCDate(tomorrow19UTC.getUTCDate() + 1);
      
      // Make sure tomorrow is still within Deadman Mode
      if (tomorrow19UTC <= DEADMAN_END) {
        return tomorrow19UTC;
      }
      return null;
    }
    
    // If it's past today's breach (after breach end), get tomorrow's breach
    if (now > breachEndTime) {
      const tomorrow19UTC = new Date(today19UTC);
      tomorrow19UTC.setUTCDate(tomorrow19UTC.getUTCDate() + 1);
      
      // Make sure tomorrow is still within Deadman Mode
      if (tomorrow19UTC <= DEADMAN_END) {
        return tomorrow19UTC;
      }
      return null;
    }
    
    return today19UTC;
  };

  // Update countdowns
  const updateCountdowns = () => {
    const now = new Date();
    
    // Deadman Mode countdown
    if (now < DEADMAN_START) {
      const diff = DEADMAN_START - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDeadmanStatus('WAITING FOR DEADMAN MODE');
      setDeadmanCountdown(`${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    } else if (now > DEADMAN_END) {
      setDeadmanStatus('DEADMAN MODE ENDED');
      setDeadmanCountdown('--:--:--');
    } else {
      setDeadmanStatus('DEADMAN MODE ACTIVE');
      const diff = DEADMAN_END - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDeadmanCountdown(`${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
    
    // Check if we're in a breach
    const inBreach = isCurrentlyInBreach();
    setIsBreachActive(inBreach);
    
    // Breach countdown
    const nextBreach = getNextBreach();
    setNextBreachTime(nextBreach);
    
    if (!nextBreach && !inBreach) {
      setBreachCountdown('No more breaches');
      return;
    }
    
    if (inBreach) {
      // We're in a breach, show remaining breach time
      const today19UTC = new Date();
      today19UTC.setUTCHours(19, 0, 0, 0);
      const breachEndTime = new Date(today19UTC.getTime() + BREACH_DURATION);
      
      const breachTimeLeft = breachEndTime - now;
      
      if (breachTimeLeft <= 0) {
        setBreachCountdown('BREACH ENDING...');
        return;
      }
      
      const breachMinutes = Math.floor(breachTimeLeft / (1000 * 60));
      const breachSeconds = Math.floor((breachTimeLeft % (1000 * 60)) / 1000);
      
      setBreachCountdown(`${breachMinutes.toString().padStart(2, '0')}:${breachSeconds.toString().padStart(2, '0')} left`);
      return;
    }
    
    // Not in breach, show time until next breach
    const breachDiff = nextBreach - now;
    
    if (breachDiff <= 0) {
      setBreachCountdown('BREACH STARTING NOW!');
      return;
    }
    
    const breachHours = Math.floor(breachDiff / (1000 * 60 * 60));
    const breachMinutes = Math.floor((breachDiff % (1000 * 60 * 60)) / (1000 * 60));
    const breachSeconds = Math.floor((breachDiff % (1000 * 60)) / 1000);
    
    setBreachCountdown(`${breachHours.toString().padStart(2, '0')}:${breachMinutes.toString().padStart(2, '0')}:${breachSeconds.toString().padStart(2, '0')}`);
  };

  useEffect(() => {
    // Update countdowns every second
    const interval = setInterval(updateCountdowns, 1000);

    // Initial update
    updateCountdowns();

    return () => clearInterval(interval);
  }, []);

  // Helper function to extract time components for display
  const parseCountdownTime = (countdownStr) => {
    // Handle different time formats
    if (countdownStr.includes('d ')) {
      // Format: "Xd HH:MM:SS"
      const parts = countdownStr.split(' ');
      const timePart = parts[1] || '00:00:00';
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      return { hours: hours || 0, minutes: minutes || 0, seconds: seconds || 0 };
    } else if (countdownStr.includes(':')) {
      // Format: "HH:MM:SS" or "MM:SS"
      const parts = countdownStr.split(':').map(Number);
      if (parts.length === 3) {
        return { hours: parts[0], minutes: parts[1], seconds: parts[2] };
      } else if (parts.length === 2) {
        return { hours: 0, minutes: parts[0], seconds: parts[1] };
      }
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const deadmanTime = parseCountdownTime(deadmanCountdown);
  const breachTime = parseCountdownTime(breachCountdown);

  const formatDisplayTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className=" bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white tracking-wide">DEADMAN All STARS</h1>
        </div>
        <div className="flex items-center gap-4">
          
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deadman Mode Panel */}
          <div className="relative">
            <div className={`absolute inset-0 ${
              deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20' :
              deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'bg-gradient-to-br from-yellow-500/20 to-orange-600/20' :
              'bg-gradient-to-br from-gray-500/20 to-slate-600/20'
            } rounded-2xl blur-xl`}></div>
            <div className={`relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border shadow-2xl ${
              deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'border-green-500/30' :
              deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'border-yellow-500/30' :
              'border-gray-500/30'
            }`}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`text-xs font-bold px-6 py-1 rounded-full tracking-wider ${
                  deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'bg-green-500 text-black' :
                  deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'bg-yellow-500 text-black' :
                  'bg-gray-500 text-white'
                }`}>
                  {deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'ACTIVE' :
                   deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'WAITING' : 'ENDED'}
                </div>
              </div>
              
              <div className="text-center pt-4">
                <div className="text-white text-lg font-medium mb-2 tracking-wide">
                  {deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'STARTS IN' : 'TIME LEFT'}
                </div>
                <div className="text-7xl font-mono font-bold text-white mb-4 tracking-wider">
                  {deadmanCountdown || '--:--'}
                </div>
                <div className={`text-lg font-semibold mb-6 tracking-wide ${
                  deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'text-green-400' :
                  deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'text-yellow-400' :
                  'text-gray-400'
                }`}>
                  {deadmanStatus}
                </div>
              </div>
              
              {/* Corner decorations */}
              <div className={`absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 ${
                deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'border-green-500/40' :
                deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'border-yellow-500/40' :
                'border-gray-500/40'
              }`}></div>
              <div className={`absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 ${
                deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'border-green-500/40' :
                deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'border-yellow-500/40' :
                'border-gray-500/40'
              }`}></div>
              <div className={`absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 ${
                deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'border-green-500/40' :
                deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'border-yellow-500/40' :
                'border-gray-500/40'
              }`}></div>
              <div className={`absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 ${
                deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'border-green-500/40' :
                deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'border-yellow-500/40' :
                'border-gray-500/40'
              }`}></div>
            </div>
          </div>

          {/* Breach Panel */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-rose-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 shadow-2xl">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`text-xs font-bold px-6 py-1 rounded-full tracking-wider ${
                  isBreachActive ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500 text-white'
                }`}>
                  {isBreachActive ? 'BREACH ACTIVE' : 'BREACH'}
                </div>
              </div>
              
              <div className="text-center pt-4">
                <div className="text-white text-lg font-medium mb-2 tracking-wide">
                  {isBreachActive ? 'TIME LEFT' : 'NEXT BREACH'}
                </div>
                <div className={`text-7xl font-mono font-bold mb-4 tracking-wider ${
                  isBreachActive ? 'text-red-400 animate-pulse' : 'text-white'
                }`}>
                  {breachCountdown || '--:--'}
                </div>
                <div className="text-red-400 text-lg font-semibold mb-6 tracking-wide">
                  {isBreachActive ? 'ACTIVE' : 'DANGER'}
                </div>
                
                {/* Danger indicator bars */}
                <div className="flex justify-center items-end gap-1 mb-4 h-12">
                  {Array.from({ length: 40 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-red-500 w-1.5 rounded-t-sm opacity-60"
                      style={{
                        height: `${Math.random() * 80 + 20}%`,
                        animation: `pulse ${0.5 + Math.random() * 1}s infinite`
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="text-red-400 text-sm font-semibold tracking-widest">DANGER</div>
              </div>
              
              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-red-500/40"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-red-500/40"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-red-500/40"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-red-500/40"></div>
            </div>
          </div>
        </div>

        {/* Grid background effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"></div>
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DeadmanModeCountdown;