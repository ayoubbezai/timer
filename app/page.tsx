'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import GDG from './gdg.svg'
import LeftShape from '../assets/top_left_shape.png'
import RightShape from '../assets/top_right_shape.png'

export default function TimerApp() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    
    const [totalSeconds, setTotalSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [showInput, setShowInput] = useState(true)
    const [customTime, setCustomTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(0)
    const remainingTimeRef = useRef<number>(0)

    // Initialize with preset options
    const presetTimes = [
        { label: '1 min', seconds: 60 },
        { label: '5 min', seconds: 300 },
        { label: '10 min', seconds: 600 },
        { label: '15 min', seconds: 900 },
        { label: '30 min', seconds: 1800 },
        { label: '1 hour', seconds: 3600 },
        { label: 'Pomodoro', seconds: 1500 }, // 25 min
        { label: 'Break', seconds: 300 }      // 5 min
    ]

    // Calculate time units from total seconds
    const calculateTimeUnits = (seconds: number) => {
        const days = Math.floor(seconds / (3600 * 24))
        const hours = Math.floor((seconds % (3600 * 24)) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        
        return { days, hours, minutes, seconds: secs }
    }

    // Start timer
    const startTimer = () => {
        if (totalSeconds <= 0) return
        
        setIsRunning(true)
        setIsPaused(false)
        setShowInput(false)
        
        // Store start time and remaining time
        startTimeRef.current = Date.now()
        remainingTimeRef.current = totalSeconds
        
        if (timerRef.current) clearInterval(timerRef.current)
        
        timerRef.current = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
            const newRemaining = Math.max(remainingTimeRef.current - elapsedSeconds, 0)
            
            if (newRemaining <= 0) {
                handleTimerEnd()
                return
            }
            
            setTimeLeft(calculateTimeUnits(newRemaining))
        }, 100)
    }

    // Pause timer
    const pauseTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setIsPaused(true)
        
        // Update remaining time
        if (isRunning) {
            const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
            remainingTimeRef.current = Math.max(remainingTimeRef.current - elapsedSeconds, 0)
        }
    }

    // Resume timer
    const resumeTimer = () => {
        if (remainingTimeRef.current <= 0) return
        
        setIsPaused(false)
        startTimeRef.current = Date.now()
        
        timerRef.current = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
            const newRemaining = Math.max(remainingTimeRef.current - elapsedSeconds, 0)
            
            if (newRemaining <= 0) {
                handleTimerEnd()
                return
            }
            
            setTimeLeft(calculateTimeUnits(newRemaining))
        }, 100)
    }

    // Reset timer
    const resetTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        
        setIsRunning(false)
        setIsPaused(false)
        setShowInput(true)
        setTotalSeconds(0)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setCustomTime({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        remainingTimeRef.current = 0
    }

    // Handle timer end
    const handleTimerEnd = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        
        setIsRunning(false)
        setIsPaused(false)
        
        // Play sound or show notification
        if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: 'Your timer has finished!',
                icon: '/timer-icon.png'
            })
        }
        
        // Play audio
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3')
        audio.play()
    }

    // Set preset time
    const setPresetTime = (seconds: number) => {
        const timeUnits = calculateTimeUnits(seconds)
        setCustomTime(timeUnits)
        setTotalSeconds(seconds)
        setTimeLeft(timeUnits)
        setShowInput(false)
    }

    // Add time
    const addTime = (secondsToAdd: number) => {
        const newTotal = totalSeconds + secondsToAdd
        setTotalSeconds(newTotal)
        setTimeLeft(calculateTimeUnits(newTotal))
        
        if (isRunning && !isPaused) {
            remainingTimeRef.current += secondsToAdd
        }
    }

    // Set custom time from inputs
    const setCustomTimer = () => {
        const total = 
            (customTime.days * 24 * 3600) +
            (customTime.hours * 3600) +
            (customTime.minutes * 60) +
            customTime.seconds
        
        if (total <= 0) return
        
        setTotalSeconds(total)
        setTimeLeft(calculateTimeUnits(total))
        setShowInput(false)
    }

    // Format number with leading zero
    const formatNumber = (num: number) => num.toString().padStart(2, '0')

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    // Number display component
    const NumberText = ({ number }: { number: string }) => {
        return (
            <span className="relative inline-block">
                <span
                    className="
                        relative inline-block
                        text-5xl min-[480px]:text-6xl sm:text-7xl md:text-8xl lg:text-9xl
                        font-black italic
                        leading-none
                        select-none
                        [text-shadow:0.1px_0.1px_0_rgba(0,0,0,0.8),0.1px_0.1px_0_rgba(0,0,0,0.6)]
                        md:[text-shadow:1px_1px_0_rgba(0,0,0,0.8),2px_2px_0_rgba(0,0,0,0.6)]
                    "
                    style={{
                        color: '#538F56',
                        WebkitTextStroke: '2px #1a1a1a',
                        letterSpacing: '-1px',
                    }}
                >
                    {number}
                </span>
            </span>
        )
    }

    // Colon component
    const ColonText = () => (
        <div className="flex items-center justify-center h-full">
            <span
                className="
                    inline-block
                    text-4xl min-[480px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                    font-black italic
                    leading-none
                    mb-8 min-[480px]:mb-10 sm:mb-12 md:mb-16 lg:mb-20
                    select-none
                "
                style={{
                    color: '#4285F4',
                    WebkitTextStroke: '1.5px #1a1a1a',
                    textShadow: '1px 1px 0px rgba(0,0,0,0.9)'
                }}
            >
                :
            </span>
        </div>
    )

    // Control buttons component with fixed hover
    const ControlButton = ({ 
        onClick, 
        children, 
        color = 'bg-gray-800',
        hoverColor = 'hover:bg-gray-700'
    }: { 
        onClick: () => void, 
        children: React.ReactNode,
        color?: string,
        hoverColor?: string
    }) => (
        <button
            onClick={onClick}
            className={`
                ${color} ${hoverColor}
                text-white font-bold py-3 px-6
                border-2 border-black 
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[2px] hover:translate-y-[2px]
                active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                transition-all duration-100
                min-w-[120px]
                text-lg
                relative
                z-10
            `}
        >
            {children}
        </button>
    )

    // Time input component
    const TimeInput = ({ label, value, onChange, max = 99 }: {
        label: string,
        value: number,
        onChange: (value: number) => void,
        max?: number
    }) => (
        <div className="flex flex-col items-center">
            <input
                type="number"
                min="0"
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className="
                    w-20 h-20
                    text-4xl font-black
                    text-center
                    bg-white
                    border-2 border-black
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                    focus:outline-none focus:border-blue-500
                    [appearance:textfield]
                    [&::-webkit-outer-spin-button]:appearance-none
                    [&::-webkit-inner-spin-button]:appearance-none
                    transition-all duration-100
                "
            />
            <div className="text-sm font-bold mt-2 text-gray-800">{label}</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F6F2E7] relative font-space-grotesk overflow-x-hidden">
            {/* Vertical Lines - Fixed to show on all components */}
            <div className="absolute inset-0 pointer-events-none hidden 2xl:block">
                {Array.from({ length: 25 }).map((_, index) => (
                    <div 
                        key={`lg-${index}`}
                        className="absolute w-px h-full bg-[#B5D9E7]"
                        style={{ left: `${(index / 24) * 100}%` }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-none hidden xl:block 2xl:hidden">
                {Array.from({ length: 21 }).map((_, index) => (
                    <div 
                        key={`desktop-${index}`}
                        className="absolute w-px h-full bg-[#B5D9E7]"
                        style={{ left: `${(index / 20) * 100}%` }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-none hidden md:block xl:hidden">
                {Array.from({ length: 17 }).map((_, index) => (
                    <div 
                        key={`tablet-${index}`}
                        className="absolute w-px h-full bg-[#B5D9E7]"
                        style={{ left: `${(index / 16) * 100}%` }}
                    />
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-none md:hidden">
                {Array.from({ length: 13 }).map((_, index) => (
                    <div 
                        key={`mobile-${index}`}
                        className="absolute w-px h-full bg-[#B5D9E7]"
                        style={{ left: `${(index / 12) * 100}%` }}
                    />
                ))}
            </div>

            {/* Background Shapes similar to Hero */}
            <Image
                alt='left shape'
                className='absolute left-0 top-0 w-16 h-auto sm:w-20 md:w-28 lg:w-36 pointer-events-none'
                src={LeftShape}
            />
            
            <Image
                alt='right shape'
                className='absolute right-0 -top-8 w-24 h-auto sm:w-28 md:w-40 lg:w-48 pointer-events-none'
                src={RightShape}
            />

            {/* Main Content */}
       
<div className=' relative z-10 '>
  <div className='min-h-screen  flex relative z-10 items-center justify-center flex-col mb-2  '>


                        <div className='flex relative z-10 items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 pointer-events-none'>
                    <Image 
                        src={GDG} 
                        alt='GDG Logo' 
                        width={60}
                        height={58}
                        className='w-12 h-10 sm:w-16 sm:h-12 md:w-20 md:h-16 lg:w-24 lg:h-18'
                    />
                    <span className='text-xl sm:text-[2rem] md:text-[2.8rem] lg:text-[3.5rem] font-bold'>
                        DevFest '25 - GDG Batna
                    </span>
                </div>

                {/* Main Timer Display */}
                <div className="flex relative z-10 justify-center w-full items-center pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6">
                    <div className="
                        bg-white 
                        border-2 border-black 
                        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                        hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]
                        hover:translate-x-[1px] hover:translate-y-[1px]
                        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                        transition-all duration-100
                        w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl
                        mx-auto
                        py-6 sm:py-8 md:py-10 lg:py-12
                        overflow-hidden
                        cursor-default
                    ">
                        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-2 sm:px-4">
                            {/* Days */}
                            <div className="text-center flex-1 min-w-[50px] min-[480px]:min-w-[60px] sm:min-w-[70px] md:min-w-[80px]">
                                <div className="flex justify-center">
                                    <NumberText number={formatNumber(timeLeft.days)} />
                                </div>
                                <div className="text-sm min-[480px]:text-base sm:text-lg md:text-xl lg:text-2xl font-black mt-3 min-[480px]:mt-4 sm:mt-5 md:mt-6 lg:mt-8 tracking-wide text-gray-800 select-none">
                                    DAYS
                                </div>
                            </div>

                            <div className="flex items-center justify-center h-14 min-[480px]:h-16 sm:h-20 md:h-24 lg:h-28 -mx-1 sm:-mx-2">
                                <ColonText />
                            </div>

                            {/* Hours */}
                            <div className="text-center flex-1 min-w-[50px] min-[480px]:min-w-[60px] sm:min-w-[70px] md:min-w-[80px]">
                                <div className="flex justify-center">
                                    <NumberText number={formatNumber(timeLeft.hours)} />
                                </div>
                                <div className="text-sm min-[480px]:text-base sm:text-lg md:text-xl lg:text-2xl font-black mt-3 min-[480px]:mt-4 sm:mt-5 md:mt-6 lg:mt-8 tracking-wide text-gray-800 select-none">
                                    HOURS
                                </div>
                            </div>

                            <div className="flex items-center justify-center h-14 min-[480px]:h-16 sm:h-20 md:h-24 lg:h-28 -mx-1 sm:-mx-2">
                                <ColonText />
                            </div>

                            {/* Minutes */}
                            <div className="text-center flex-1 min-w-[50px] min-[480px]:min-w-[60px] sm:min-w-[70px] md:min-w-[80px]">
                                <div className="flex justify-center">
                                    <NumberText number={formatNumber(timeLeft.minutes)} />
                                </div>
                                <div className="text-sm min-[480px]:text-base sm:text-lg md:text-xl lg:text-2xl font-black mt-3 min-[480px]:mt-4 sm:mt-5 md:mt-6 lg:mt-8 tracking-wide text-gray-800 select-none">
                                    MINUTES
                                </div>
                            </div>

                            <div className="flex items-center justify-center h-14 min-[480px]:h-16 sm:h-20 md:h-24 lg:h-28 -mx-1 sm:-mx-2">
                                <ColonText />
                            </div>

                            {/* Seconds */}
                            <div className="text-center flex-1 min-w-[50px] min-[480px]:min-w-[60px] sm:min-w-[70px] md:min-w-[80px]">
                                <div className="flex justify-center">
                                    <NumberText number={formatNumber(timeLeft.seconds)} />
                                </div>
                                <div className="text-sm min-[480px]:text-base sm:text-lg md:text-xl lg:text-2xl font-black mt-3 min-[480px]:mt-4 sm:mt-5 md:mt-6 lg:mt-8 tracking-wide text-gray-800 select-none">
                                    SECONDS
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                  </div>


                {/* Controls Section */}
                <div className="mt-8 sm:mt-10 space-y-6 sm:space-y-8 px-4 sm:px-6 max-w-6xl mx-auto">
                    {/* Preset Times */}
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">QUICK SET</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                            {presetTimes.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPresetTime(preset.seconds)}
                                    className="
                                        bg-gray-100 hover:bg-gray-200
                                        border-2 border-black
                                        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        hover:translate-x-[2px] hover:translate-y-[2px]
                                        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                                        transition-all duration-100
                                        py-3 px-4
                                        font-bold
                                        text-sm sm:text-base
                                    "
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Time Input */}
                    {showInput && (
                        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">CUSTOM TIMER</h2>
                            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 flex-wrap">
                                <TimeInput
                                    label="DAYS"
                                    value={customTime.days}
                                    onChange={(val) => setCustomTime(prev => ({ ...prev, days: val }))}
                                    max={365}
                                />
                                <TimeInput
                                    label="HOURS"
                                    value={customTime.hours}
                                    onChange={(val) => setCustomTime(prev => ({ ...prev, hours: val }))}
                                    max={23}
                                />
                                <TimeInput
                                    label="MINUTES"
                                    value={customTime.minutes}
                                    onChange={(val) => setCustomTime(prev => ({ ...prev, minutes: val }))}
                                    max={59}
                                />
                                <TimeInput
                                    label="SECONDS"
                                    value={customTime.seconds}
                                    onChange={(val) => setCustomTime(prev => ({ ...prev, seconds: val }))}
                                    max={59}
                                />
                            </div>
                            <div className="flex justify-center mt-6 sm:mt-8">
                                <ControlButton
                                    onClick={setCustomTimer}
                                    color="bg-green-600"
                                    hoverColor="hover:bg-green-700"
                                >
                                    SET TIMER
                                </ControlButton>
                            </div>
                        </div>
                    )}

                    {/* Control Buttons */}
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                            {!isRunning ? (
                                <ControlButton
                                    onClick={startTimer}
                                    color="bg-green-600"
                                    hoverColor="hover:bg-green-700"
                                >
                                    START
                                </ControlButton>
                            ) : isPaused ? (
                                <ControlButton
                                    onClick={resumeTimer}
                                    color="bg-blue-600"
                                    hoverColor="hover:bg-blue-700"
                                >
                                    RESUME
                                </ControlButton>
                            ) : (
                                <ControlButton
                                    onClick={pauseTimer}
                                    color="bg-yellow-600"
                                    hoverColor="hover:bg-yellow-700"
                                >
                                    PAUSE
                                </ControlButton>
                            )}
                            
                            <ControlButton
                                onClick={resetTimer}
                                color="bg-red-600"
                                hoverColor="hover:bg-red-700"
                            >
                                RESET
                            </ControlButton>
                            
                            <ControlButton
                                onClick={() => addTime(60)}
                                color="bg-purple-600"
                                hoverColor="hover:bg-purple-700"
                            >
                                +1 MIN
                            </ControlButton>
                            
                            <ControlButton
                                onClick={() => addTime(300)}
                                color="bg-indigo-600"
                                hoverColor="hover:bg-indigo-700"
                            >
                                +5 MIN
                            </ControlButton>
                        </div>
                    </div>

                    {/* Status Display */}
                    <div className="text-center pb-8 sm:pb-12">
                        <div className="inline-block bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-3">
                            <div className="text-base sm:text-lg font-bold">
                                {isRunning ? (
                                    isPaused ? (
                                        <span className="text-yellow-600">⏸️ PAUSED</span>
                                    ) : (
                                        <span className="text-green-600">▶️ RUNNING</span>
                                    )
                                ) : totalSeconds > 0 ? (
                                    <span className="text-blue-600">⏹️ READY</span>
                                ) : (
                                    <span className="text-gray-600">⏱️ SET TIMER</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>

    )
}