'use client';

import React, {useState, useRef, useEffect, memo, useCallback} from 'react';
import {Plus, X, Volume2, VolumeX, Maximize2, Settings} from 'lucide-react';

const getEmbedUrl = (stream) => {
    // For Twitch, we need to use only the hostname without port
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    if (stream.platform === 'twitch') {
        // Twitch only accepts hostname without port and doesn't like special characters
        return `https://player.twitch.tv/?channel=${stream.channel}&parent=${hostname}&muted=1`;
    } else if (stream.platform === 'kick') {
        // Use Kick's embed player URL
        return `https://player.kick.com/${stream.channel}`;
    }
    return '';
};

const StreamWindow = memo(({stream, onMute, onRemove}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            const message = stream.muted ? {command: 'mute'} : {command: 'unmute'};

            iframe.contentWindow.postMessage(message, '*');
        }
    }, [stream.muted]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!isFullscreen && iframeRef.current) {
            if (iframeRef.current.requestFullscreen) {
                iframeRef.current.requestFullscreen();
                setIsFullscreen(true);
            }
        }
    };

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg relative group">
            <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${stream.platform === 'twitch' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                    <span className="text-white text-sm font-medium capitalize">
                        {stream.platform} - {stream.channel}
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => onMute(stream.id)} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title={stream.muted ? 'Unmute' : 'Mute'}>
                        {stream.muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white p-1 rounded transition-colors" title="Fullscreen">
                        <Maximize2 size={16} />
                    </button>
                    <button onClick={() => onRemove(stream.id)} className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors" title="Remove stream">
                        <X size={16} />
                    </button>
                </div>
            </div>
            <div className="relative aspect-video">
                <iframe
                    ref={iframeRef}
                    src={getEmbedUrl(stream)}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={`${stream.platform} stream - ${stream.channel}`}
                    key={`${stream.id}-${stream.channel}`}
                />
            </div>
        </div>
    );
});

StreamWindow.displayName = 'StreamWindow';

// Define teams and their streams
const TEAMS = {
    odablock: [
        {id: 1, platform: 'kick', channel: 'Odablock ', muted: true},
        {id: 2, platform: 'kick', channel: 'Rhys', muted: true},
        {id: 3, platform: 'twitch', channel: 'muts', muted: true},
        {id: 10, platform: 'kick', channel: 'Mikars', muted: true},
        {id: 11, platform: 'twitch', channel: 'Muts', muted: true}

    ],
    SoloMissionSnakes: [
        {id: 4, platform: 'twitch', channel: 'Ditterbitter', muted: true},
        {id: 5, platform: 'twitch', channel: 'Purespam', muted: true},
        {id: 12, platform: 'twitch', channel: 'Raikesy', muted: true}
    ],
    dinonuggets: [
        {id: 7, platform: 'twitch', channel: 'dino_xx', muted: true},
        {id: 8, platform: 'kick', channel: 'Westham', muted: true},
        {id: 9, platform: 'kick', channel: 'Skiddler', muted: true},
        {id: 6, platform: 'twitch', channel: 'coxie', muted: true},
        {id: 13,platform: 'twitch', channel: 'Verf', muted: true}
    ],
    SkillSpecs_Smorcs: [
        {id: 14, platform: 'twitch', channel: 'skillspecs', muted: true},
        {id: 15, platform: 'twitch', channel: 'Purpp', muted: true},
        {id: 16, platform: 'twitch', channel: 'c_engineer', muted: true},
        {id: 17, platform: 'kick', channel: 'Sick_Nerd', muted: true},
        {id: 18, platform: 'twitch', channel: 'sparcmac', muted: true},
    ],
    B0aty_Brawlers: [
        {id: 19, platform: 'twitch', channel: 'B0aty', muted: true},
        {id: 20, platform: 'twitch', channel: 'dubiedobies', muted: true},
        {id: 21, platform: 'twitch', channel: 'port_khazard', muted: true},
        {id: 22, platform: 'kick', channel: 'Pip', muted: true},
        {id: 23, platform: 'twitch', channel: 'EVScape', muted: true},
    ],
    B0aty_Brawlers: [
        {id: 24, platform: 'twitch', channel: 'B0aty', muted: true},
        {id: 25, platform: 'twitch', channel: 'dubiedobies', muted: true},
        {id: 26, platform: 'twitch', channel: 'port_khazard', muted: true},
        {id: 27, platform: 'kick', channel: 'Pip', muted: true},
        {id: 29, platform: 'twitch', channel: 'EVScape', muted: true},
    ],
    Torvesta_Titans: [
        {id: 30, platform: 'twitch', channel: 'torvesta', muted: true},
        {id: 31, platform: 'twitch', channel: 'Eliop14', muted: true},
        {id: 32, platform: 'twitch', channel: 'Alfie', muted: true},
        {id: 33, platform: 'twitch', channel: 'mr_mammal', muted: true},
    ],
};

const MultiStreamViewer = () => {
    // Start with no streams loaded
    const [streams, setStreams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [newStreamUrl, setNewStreamUrl] = useState('');
    const [gridCols, setGridCols] = useState(2);
    const [showAddStream, setShowAddStream] = useState(false);

    const parseStreamUrl = useCallback((url) => {
        const twitchMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
        if (twitchMatch) {
            return {platform: 'twitch', channel: twitchMatch[1]};
        }

        const kickMatch = url.match(/kick\.com\/([a-zA-Z0-9_]+)/);
        if (kickMatch) {
            return {platform: 'kick', channel: kickMatch[1]};
        }

        if (url && !url.includes('/')) {
            return {platform: 'twitch', channel: url};
        }

        return null;
    }, []);

    const addStream = useCallback(() => {
        const parsed = parseStreamUrl(newStreamUrl);
        if (parsed) {
            const newStream = {
                id: Date.now(),
                platform: parsed.platform,
                channel: parsed.channel,
                muted: true,
            };
            setStreams((prev) => [...prev, newStream]);
            setNewStreamUrl('');
            setShowAddStream(false);
        }
    }, [newStreamUrl, parseStreamUrl]);

    const removeStream = useCallback((id) => {
        setStreams((prev) => prev.filter((stream) => stream.id !== id));
    }, []);

    const toggleMute = useCallback((id) => {
        setStreams((prev) => prev.map((stream) => (stream.id === id ? {...stream, muted: !stream.muted} : {...stream, muted: true})));
    }, []);

    // Handler to load a team's streams
    const loadTeam = (teamName) => {
        setStreams(TEAMS[teamName] || []);
        setSelectedTeam(teamName);
    };

    return (
        <div className=" bg-gradient-to-br from-slate-800 via-slate-900 to-slate-8 p-6">
            {/* Header */}
            <div className="mb-6">
                {/* Team Selector */}
                <div className="flex flex-wrap justify-center  gap-2 mb-4">
                    {Object.keys(TEAMS).map((team) => (
                        <button
                            key={team}
                            onClick={() => loadTeam(team)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                                selectedTeam === team
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-gray-700 text-gray-200 hover:bg-blue-600'
                            }`}
                        >
                            {team.charAt(0).toUpperCase() + team.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <button onClick={() => setShowAddStream(!showAddStream)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                        <Plus size={20} />
                        <span>Add Stream</span>
                    </button>

                    {/* Grid  layout*/}
                    <div className="flex items-center space-x-2">
                        <Settings size={20} className="text-white" />
                        <label className="text-white font-medium">Grid:</label>
                        <select value={gridCols} onChange={(e) => setGridCols(Number(e.target.value))} className="border border-gray-300 bg-black  rounded px-3 py-1">
                            <option value={1}>1 Column</option>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                            <option value={5}>5 Columns</option>
                            <option value={6}>6 Columns</option>
                        </select>
                    </div>
                </div>

                {/* Add Stream Form */}
                {showAddStream && (
                    <div className="bg-white text-black p-4 rounded-lg shadow-md mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newStreamUrl}
                                onChange={(e) => setNewStreamUrl(e.target.value)}
                                placeholder="Enter Twitch/Kick URL or channel name (e.g., twitch.tv/shroud or just 'shroud')"
                                className="flex-1 border border-gray-300 rounded px-3 py-2"
                            />
                            <button onClick={addStream} className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded transition-colors">
                                Add
                            </button>
                            <button onClick={() => setShowAddStream(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
                                Cancel
                            </button>
                        </div>
                        <p className="text-sm text-black mt-2">Supported formats: twitch.tv/username, kick.com/username, or just the username</p>
                    </div>
                )}
            </div>

            {/* Streams Grid */}
            {streams.length > 0 ? (
                <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${gridCols}, 1fr)`}}>
                    {streams.map((stream) => (
                        <StreamWindow key={stream.id} stream={stream} onMute={toggleMute} onRemove={removeStream} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">No streams added yet</p>
                    <button onClick={() => setShowAddStream(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
                        Add Your First Stream
                    </button>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-gray-600 text-sm">
                <p>Click the volume icon to unmute a stream. Only one stream can be unmuted at a time.</p>
            </div>
        </div>
    );
};

export default MultiStreamViewer;
