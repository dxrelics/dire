"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  hours: number
}

export default function CountdownTimer({ hours }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: hours,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetTime = new Date()
    targetTime.setHours(targetTime.getHours() + hours)

    const interval = setInterval(() => {
      const now = new Date()
      const difference = targetTime.getTime() - now.getTime()

      if (difference <= 0) {
        clearInterval(interval)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [hours])

  return (
    <div className="flex justify-center gap-4 text-center">
      <div className="bg-gray-800 rounded-lg p-4 min-w-[80px]">
        <div className="text-3xl font-bold">{timeLeft.hours.toString().padStart(2, "0")}</div>
        <div className="text-xs text-gray-400 uppercase">Hours</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 min-w-[80px]">
        <div className="text-3xl font-bold">{timeLeft.minutes.toString().padStart(2, "0")}</div>
        <div className="text-xs text-gray-400 uppercase">Minutes</div>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 min-w-[80px]">
        <div className="text-3xl font-bold">{timeLeft.seconds.toString().padStart(2, "0")}</div>
        <div className="text-xs text-gray-400 uppercase">Seconds</div>
      </div>
    </div>
  )
}
