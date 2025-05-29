'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

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

  return (
    <div className="w-full p-3">
      <div className="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-700 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Deadman Mode Timer</h1>
            <span className="text-sm text-gray-400">May 30 → Jun 8, 2025</span>
          </div>
          <div className="text-xs text-gray-400">
            Current UTC: {new Date().toISOString().slice(0, 19).replace('T', ' ')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deadman Mode Status */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-bold mb-1 ${
                  deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'text-green-400' :
                  deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {deadmanStatus}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'Starts in:' :
                   deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'Ends in:' :
                   'Mode ended'}
                </div>
                <div className="text-xl font-mono text-white font-bold">
                  {deadmanCountdown}
                </div>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                <Clock className={`w-5 h-5 ${
                  deadmanStatus === 'DEADMAN MODE ACTIVE' ? 'text-green-400' :
                  deadmanStatus === 'WAITING FOR DEADMAN MODE' ? 'text-yellow-400' :
                  'text-gray-400'
                }`} />
              </div>
            </div>
          </div>

          {/* Breach Countdown */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-bold mb-1 ${
                  isBreachActive ? 'text-red-400' : 'text-red-400'
                }`}>
                  {isBreachActive ? 'BREACH ACTIVE' : 'NEXT BREACH'}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {isBreachActive ? 'Time remaining:' : 
                   nextBreachTime ? 'Time until breach:' : 'No more breaches'}
                </div>
                <div className={`text-xl font-mono font-bold ${
                  isBreachActive ? 'text-red-400 animate-pulse' :
                  breachCountdown === 'BREACH STARTING NOW!' ? 'text-red-400 animate-pulse' : 'text-white'
                }`}>
                  {breachCountdown}
                </div>
                {nextBreachTime && !isBreachActive && (
                  <div className="text-xs text-gray-500 mt-1">
                    {nextBreachTime.toISOString().slice(0, 16).replace('T', ' ')} UTC
                  </div>
                )}
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                <Zap className={`w-5 h-5 ${
                  isBreachActive ? 'text-red-400 animate-pulse' :
                  breachCountdown === 'BREACH STARTING NOW!' ? 'text-red-400' :
                  nextBreachTime ? 'text-orange-400' : 'text-gray-400'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadmanModeCountdown;