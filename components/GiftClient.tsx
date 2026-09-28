'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { GiftData } from '@/lib/giftData'

interface Props {
  data: GiftData
}

type ScreenType =
  | 'gift_intro' | 'menu' | 'cake_lit' | 'cake_blown'
  | 'envelope' | 'letter' | 'moments_cover' | 'moments_book' | 'song' | 'date' | 'success'

// قلوب خلفية ناعمة تطير بشكل مستمر  وسلس بدون استهلاك للمعالج أو تهنيج
const BACKGROUND_HEARTS = [
  { id: 1, left: '6%', size: 26, duration: '6.5s', delay: '0s', sway: '20px', rot: '12deg', emoji: '🩷', opacity: 0.75 },
  { id: 2, left: '14%', size: 30, duration: '8s', delay: '2.5s', sway: '-25px', rot: '-15deg', emoji: '💖', opacity: 0.8 },
  { id: 3, left: '22%', size: 20, duration: '7s', delay: '1s', sway: '15px', rot: '10deg', emoji: '✨', opacity: 0.7 },
  { id: 4, left: '30%', size: 28, duration: '9s', delay: '3.5s', sway: '-30px', rot: '-20deg', emoji: '💕', opacity: 0.85 },
  { id: 5, left: '38%', size: 24, duration: '6.2s', delay: '0.5s', sway: '25px', rot: '18deg', emoji: '🩷', opacity: 0.7 },
  { id: 6, left: '48%', size: 32, duration: '7.8s', delay: '4s', sway: '-15px', rot: '-10deg', emoji: '🎈', opacity: 0.75 },
  { id: 7, left: '56%', size: 26, duration: '8.5s', delay: '1.8s', sway: '20px', rot: '14deg', emoji: '💖', opacity: 0.8 },
  { id: 8, left: '64%', size: 22, duration: '6.8s', delay: '3s', sway: '-20px', rot: '-12deg', emoji: '✨', opacity: 0.7 },
  { id: 9, left: '72%', size: 28, duration: '7.5s', delay: '0.8s', sway: '30px', rot: '20deg', emoji: '🩷', opacity: 0.85 },
  { id: 10, left: '80%', size: 24, duration: '8.2s', delay: '2.2s', sway: '-25px', rot: '-16deg', emoji: '💕', opacity: 0.75 },
  { id: 11, left: '88%', size: 30, duration: '7.2s', delay: '4.5s', sway: '15px', rot: '12deg', emoji: '💖', opacity: 0.8 },
  { id: 12, left: '94%', size: 22, duration: '6.5s', delay: '1.5s', sway: '-18px', rot: '-14deg', emoji: '🩷', opacity: 0.7 },
  { id: 13, left: '18%', size: 26, duration: '8.7s', delay: '5s', sway: '22px', rot: '15deg', emoji: '💗', opacity: 0.75 },
  { id: 14, left: '84%', size: 28, duration: '7.6s', delay: '3.8s', sway: '-22px', rot: '-18deg', emoji: '✨', opacity: 0.7 },
  { id: 15, left: '50%', size: 34, duration: '9.2s', delay: '2s', sway: '18px', rot: '10deg', emoji: '💖', opacity: 0.8 },
]

export default function GiftClient({ data }: Props) {
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<ScreenType>('gift_intro')

  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isSongPlaying, setIsSongPlaying] = useState(false)
  const [songProgress, setSongProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const songAudioRef = useRef<HTMLAudioElement | null>(null)

  const [noCount, setNoCount] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const momentsImages = ['/images/pic1.jpg', '/images/pic2.jpg', '/images/pic3.jpg', '/images/pic4.jpg']

  const confettiRef = useRef<HTMLCanvasElement | null>(null)
  const confettiAnimRef = useRef<number | null>(null)

  // تفاعلات قلوب شاشة الرسالة عند النقر
  const [clickHearts, setClickHearts] = useState<{ id: number; x: number; y: number; emoji: string; burstX: number; burstY: number; rot: number; size: number }[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (data.musicUrl) {
      const audio = new Audio(data.musicUrl)
      audio.loop = true; audio.volume = 0.3
      audioRef.current = audio
    }
    return () => audioRef.current?.pause()
  }, [data.musicUrl])

  const navigateTo = useCallback((newScreen: ScreenType) => {
    window.history.pushState({ screen: newScreen }, '')
    setScreen(newScreen)

    if (newScreen !== 'song' && isSongPlaying && songAudioRef.current) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    }
  }, [isSongPlaying])

  useEffect(() => {
    window.history.replaceState({ screen: 'gift_intro' }, '')
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) setScreen(event.state.screen)
      else setScreen('gift_intro')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const toggleOurSong = () => {
    if (!songAudioRef.current) return
    if (isSongPlaying) {
      songAudioRef.current.pause()
      setIsSongPlaying(false)
    } else {
      if (musicPlaying && audioRef.current) {
        audioRef.current.pause()
        setMusicPlaying(false)
      }
      songAudioRef.current.play().then(() => {
        setIsSongPlaying(true)
      }).catch((error) => {
        console.error("Error playing the song:", error)
      })
    }
  }

  const handleSongTimeUpdate = () => {
    if (songAudioRef.current) {
      setCurrentTime(songAudioRef.current.currentTime)
      if (songAudioRef.current.duration) {
        setSongProgress((songAudioRef.current.currentTime / songAudioRef.current.duration) * 100)
      }
    }
  }

  const handleSongLoadedMetadata = () => {
    if (songAudioRef.current) {
      setDuration(songAudioRef.current.duration)
    }
  }

  const handleSongSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (songAudioRef.current && songAudioRef.current.duration) {
      const newTime = (Number(e.target.value) / 100) * songAudioRef.current.duration
      songAudioRef.current.currentTime = newTime
      setCurrentTime(newTime)
      setSongProgress(Number(e.target.value))
    }
  }

  const skipForward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.min(songAudioRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (songAudioRef.current) {
      songAudioRef.current.currentTime = Math.max(songAudioRef.current.currentTime - 10, 0)
    }
  }

  const launchConfetti = useCallback(() => {
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth; canvas.height = window.innerHeight

    const pieces: any[] = []
    const colors = ['#f472b6', '#fbcfe8', '#db2777', '#fda4af', '#fff', '#e2e8f0']
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 5,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      })
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed; p.vy += 0.05
        if (p.y < canvas.height + 20) alive = true
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore()
      }
      if (alive) confettiAnimRef.current = requestAnimationFrame(animate)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    if (confettiAnimRef.current) cancelAnimationFrame(confettiAnimRef.current)
    confettiAnimRef.current = requestAnimationFrame(animate)
  }, [])

  // دالة تفجير قلوب تفاعلية عند النقر أو اللمس في شاشة الرسالة
  const handleLetterScreenClick = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    let clientX = 0
    let clientY = 0
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else return
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const emojis = ['💖', '🩷', '💕', '💗', '✨']
    const newHearts: typeof clickHearts = []
    const count = 5 + Math.floor(Math.random() * 3)

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
      const distance = 35 + Math.random() * 45
      newHearts.push({
        id: Date.now() + Math.random() + i,
        x: clientX,
        y: clientY,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        burstX: Math.cos(angle) * distance,
        burstY: -Math.abs(Math.sin(angle) * distance) - (25 + Math.random() * 45),
        rot: (Math.random() - 0.5) * 40,
        size: 18 + Math.random() * 12
      })
    }

    setClickHearts(prev => [...prev.slice(-20), ...newHearts])
  }, [])

  // تنظيف قلوب النقر بعد انتهاء الأنيميشن تلقائياً
  useEffect(() => {
    if (clickHearts.length === 0) return
    const timer = setTimeout(() => {
      setClickHearts([])
    }, 1300)
    return () => clearTimeout(timer)
  }, [clickHearts])

  return (
    <div className="gift-page">
      <div className="corners-overlay">
        <div className="corner tl"></div><div className="corner tr"></div>
        <div className="corner bl"></div><div className="corner br"></div>
      </div>
      <div className="side-text left">BIRTHDAY • CELEBRATION</div>
      <div className="side-text right">WITH LOVE • FOR YOU</div>

      <canvas ref={confettiRef} id="confetti-canvas" style={{ position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none' }} />

      {/* ── SCREEN 1: INTRO ── */}
      <div className={`screen ${screen === 'gift_intro' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <p className="subtitle">✦ Something special is waiting ✦</p>
          <h1 className="gift-title">A Gift <br /><span>just for You</span></h1>
          <div className="crown-icon">👑</div>
          <div className="dots">• • •</div>
          <p className="description">
            "Today is a day as beautiful as you are. I've prepared a little digital surprise to celebrate your special moment."
          </p>
          <button className="btn-primary" onClick={() => navigateTo('menu')}>Open Your Surprise 🎁</button>
        </div>
      </div>

      {/* ── SCREEN 2: MENU ── */}
      <div className={`screen ${screen === 'menu' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 className="gift-title">Choose a <span>Surprise</span></h1>
            <p className="description">Tap any memory to reveal</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            width: '100%',
            maxWidth: '360px',
            marginBottom: '1.5rem'
          }}>
            <div
              onClick={() => navigateTo('cake_lit')}
              className="polaroid-card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '18px 10px', background: '#1a050c' }}
            >
              <span style={{ fontSize: '2rem' }}>🎂</span>
              <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold' }}>The Cake</p>
            </div>

            <div
              onClick={() => navigateTo('envelope')}
              className="polaroid-card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '18px 10px', background: '#1a050c' }}
            >
              <span style={{ fontSize: '2rem' }}>💌</span>
              <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold' }}>Message</p>
            </div>

            <div
              onClick={() => { setCurrentPhotoIndex(0); navigateTo('moments_cover'); }}
              className="polaroid-card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '18px 10px', background: '#1a050c' }}
            >
              <span style={{ fontSize: '2.0rem' }}>📸</span>
              <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold' }}>Moments</p>
            </div>

            <div
              onClick={() => navigateTo('song')}
              className="polaroid-card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '18px 10px', background: '#1a050c' }}
            >
              <span style={{ fontSize: '2rem' }}>🎵</span>
              <p style={{ color: '#f472b6', marginTop: '8px', fontWeight: 'bold' }}>Our Song</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => navigateTo('gift_intro')} style={{ margin: 0 }}>
              ← Back
            </button>
            <button className="btn-primary" onClick={() => navigateTo('date')}>
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── SCREEN 3: CAKE LIT ── */}
      <div className={`screen ${screen === 'cake_lit' ? 'visible' : ''}`}>
        <BuntingSVG />
        <div className="content-wrapper">
          <div className="svg-container">
            <div className="cake-glow"></div>
            <CakeLitSVG />
          </div>
          <h2 className="gift-title">Make a wish, <span>{data.name}</span> 👑</h2>
          <button className="btn-primary" onClick={() => { navigateTo('cake_blown'); setTimeout(launchConfetti, 100) }}>
            Blow the Candle 🎈
          </button>
          <button className="btn-secondary" style={{ marginTop: '10px' }} onClick={() => navigateTo('menu')}>
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* ── SCREEN 4: CAKE BLOWN ── */}
      <div className={`screen ${screen === 'cake_blown' ? 'visible' : ''}`}>
        <BuntingSVG />
        <div className="content-wrapper">
          <div className="svg-container" style={{ opacity: 0.8 }}>
            <CakeBlownSVG />
          </div>
          <h2 className="gift-title" style={{ marginBottom: '1.5rem' }}>Happy Birthday, habiby! 🎂</h2>
          <button className="btn-secondary" onClick={() => navigateTo('cake_lit')}>Light it Again ✨</button>
          <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => navigateTo('menu')}>
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* ── SCREEN 5: ENVELOPE ── */}
      <div className={`screen ${screen === 'envelope' ? 'visible' : ''}`}>
        <div className="content-wrapper" onClick={() => navigateTo('letter')}>
          <div className="svg-container envelope" style={{ cursor: 'pointer' }}>
            <EnvelopeSVG />
          </div>
          <p className="subtitle" style={{ letterSpacing: '0.2em', cursor: 'pointer' }}>✦ Click to open your letter ✦</p>
          <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={(e) => { e.stopPropagation(); navigateTo('menu'); }}>
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* ── SCREEN 6: LETTER (مع قلوب ناعمة وخفيفة متفاعلة لا تعلق أبداً) ── */}
      <div
        className={`screen ${screen === 'letter' ? 'visible' : ''}`}
        onClick={handleLetterScreenClick}
      >
        {/* قلوب خلفية تطير للأعلى بسلاسة فائقة باستخدام تسريع كارت الشاشة GPU */}
        {screen === 'letter' && (
          <div className="letter-hearts-container" aria-hidden="true">
            {BACKGROUND_HEARTS.map((h) => (
              <span
                key={h.id}
                className="floating-heart"
                style={{
                  left: h.left,
                  fontSize: `${h.size}px`,
                  ['--duration' as any]: h.duration,
                  ['--delay' as any]: h.delay,
                  ['--sway-x' as any]: h.sway,
                  ['--rot' as any]: h.rot,
                  ['--max-opacity' as any]: h.opacity,
                }}
              >
                {h.emoji}
              </span>
            ))}
          </div>
        )}

        {/* قلوب تفاعلية تنبثق وتطير عند النقر على أي مكان بالشاشة */}
        {screen === 'letter' && clickHearts.map((ch) => (
          <span
            key={ch.id}
            className="click-heart-burst"
            style={{
              left: `${ch.x}px`,
              top: `${ch.y}px`,
              fontSize: `${ch.size}px`,
              ['--burst-x' as any]: `${ch.burstX}px`,
              ['--burst-y' as any]: `${ch.burstY}px`,
              ['--burst-rot' as any]: `${ch.rot}deg`,
            }}
          >
            {ch.emoji}
          </span>
        ))}

        <div className="content-wrapper" style={{ zIndex: 95, position: 'relative' }}>
          <div className="letter-card">
            <div className="top-accent-sq"></div>

            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 14px auto',
              position: 'relative',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid #f472b6',
              boxShadow: '0 0 20px rgba(244, 114, 182, 0.5)',
              background: '#1a050c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              clipPath: 'path("M60 105 C 60 105, 5 65, 5 32 C 5 15, 20 6, 36 6 C 48 6, 56 15, 60 24 C 64 15, 72 6, 84 6 C 100 6, 115 15, 115 32 C 115 65, 60 105, 60 105 Z")'
            }}>
              <Image
                src="/images/pic1.jpg"
                alt="Letter Special Photo"
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>

            <h2 className="letter-title" style={{ marginTop: '0', color: '#f472b6' }}>To my favorite person,</h2>

            <div className="letter-scroll-area">
              <div className="letter-body" style={{ color: '#f472b6' }}>{data.message}</div>
              <div className="letter-divider"><span>✦</span></div>
              <div className="signature" style={{ color: '#f472b6' }}>
                <p>With all my love,</p>
                <p>{data.senderName || 'Youssef'} ✨</p>
              </div>
            </div>

            <button
              className="btn-secondary"
              style={{ width: '100%', marginTop: '15px' }}
              onClick={(e) => {
                e.stopPropagation()
                navigateTo('menu')
              }}
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      </div>

      {/* ── SCREEN 7A: MOMENTS COVER ── */}
      <div className={`screen ${screen === 'moments_cover' ? 'visible' : ''}`}>
        <div className="content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={() => navigateTo('moments_book')}
            style={{
              width: '100%',
              maxWidth: '310px',
              background: '#1c0710',
              border: '2px solid #50152d',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(219, 39, 119, 0.25)',
              position: 'relative'
            }}
          >
            <div style={{ width: '100%', height: '340px', position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
              <Image
                src="/images/cover.jpg"
                alt="Moments Cover"
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>

            <p style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>Tap to open album 📖</p>
          </div>

          <button className="btn-secondary" style={{ marginTop: '1.2rem', width: '100%', maxWidth: '310px' }} onClick={() => navigateTo('menu')}>← Back to Menu</button>
        </div>
      </div>

      {/* ── SCREEN 7B: MOMENTS BOOK ── */}
      <div className={`screen ${screen === 'moments_book' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <h2 className="gift-title" style={{ fontStyle: 'italic', marginBottom: '0.2rem' }}>Our Memories</h2>
          <p className="subtitle" style={{ color: '#94a3b8', marginBottom: '1.2rem' }}>Page {currentPhotoIndex + 1} of 4</p>

          <div className="polaroid-card" style={{ width: '100%', maxWidth: '300px', margin: '0 auto 1.2rem auto', padding: '12px', background: '#1c0710' }}>
            <div className="polaroid-pin"></div>
            <div className="polaroid-img-wrapper" style={{ width: '100%', height: '320px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
              <Image src={momentsImages[currentPhotoIndex]} alt={`Memory ${currentPhotoIndex + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem' }}>
            <button
              onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : 3))}
              style={{
                background: '#381322',
                border: '1px solid #f472b6',
                color: '#fbcfe8',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              ←
            </button>
            <button
              onClick={() => setCurrentPhotoIndex((prev) => (prev < 3 ? prev + 1 : 0))}
              style={{
                background: '#381322',
                border: '1px solid #f472b6',
                color: '#fbcfe8',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              →
            </button>
          </div>

          <button className="btn-secondary" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }} onClick={() => navigateTo('moments_cover')}>← Back to Cover</button>
        </div>
      </div>

      {/* ── SCREEN 8: SONG ── */}
      <div className={`screen ${screen === 'song' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <div className="player-container">
            <div className={`vinyl-record-container ${isSongPlaying ? 'vinyl-spin' : 'vinyl-paused'}`}>
              <VinylSVG />
            </div>

            <div className="music-player-card">
              <div className="player-cover">
                <Image src="/images/pic5.jpg" alt="Our Song Cover" fill style={{ objectFit: 'cover' }} unoptimized />
              </div>

              <div className="player-info">
                <div className="player-title">Our Song</div>
                <div className="player-artist">every word for you</div>
              </div>

              <div className="timeline-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={songProgress || 0}
                  onChange={handleSongSeek}
                  className="ios-slider"
                />
                <div className="time-labels">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(duration - currentTime)}</span>
                </div>
              </div>

              <div className="player-controls">
                <button className="control-btn" onClick={skipBackward}><BackwardIcon /></button>
                <button className="control-btn play-pause-circle" onClick={toggleOurSong}>
                  {isSongPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button className="control-btn" onClick={skipForward}><ForwardIcon /></button>
              </div>

              <div className="volume-container">
                <VolumeMinIcon />
                <input type="range" className="ios-slider" style={{ marginBottom: 0 }} defaultValue="80" />
                <VolumeMaxIcon />
              </div>
            </div>
          </div>

          <audio
            ref={songAudioRef}
            src="/audio/song.mp3"
            preload="auto"
            onTimeUpdate={handleSongTimeUpdate}
            onLoadedMetadata={handleSongLoadedMetadata}
            onEnded={() => setIsSongPlaying(false)}
          />

          <button className="btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => navigateTo('menu')}>
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* ── SCREEN 9: DATE / QUESTION ── */}
      <div className={`screen ${screen === 'date' ? 'visible' : ''}`}>
        <div className="content-wrapper">
          <p className="subtitle">✦ IMPORTANT QUESTION ✦</p>
          <h1 className="gift-title">Will you stay with me forever?</h1>

          <div className="svg-container" style={{ position: 'relative', width: '180px', height: '180px', margin: '15px auto' }}>
            <Image src="/images/bear-ask.jpg" alt="Will you stay with me?" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ fontSize: `${1 + noCount * 0.1}rem`, padding: `${0.8 + noCount * 0.1}rem ${2 + noCount * 0.1}rem` }} onClick={() => { navigateTo('success'); setTimeout(launchConfetti, 300) }}>Yes!</button>
            <button className="secret-link" style={{ padding: '0.8rem 1.5rem', background: '#0d0407', borderRadius: '8px', border: '1px solid #451325', margin: 0 }} onClick={() => setNoCount(noCount + 1)}>
              {['No', 'Please? 🥺', 'Really?!', 'Are you sure?', 'Knew you would say yes!'][Math.min(noCount, 4)]}
            </button>
          </div>
          <button className="btn-secondary" style={{ marginTop: '15px' }} onClick={() => navigateTo('menu')}>
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* ── SCREEN 10: SUCCESS ── */}
      <div className={`screen ${screen === 'success' ? 'visible' : ''}`}>
        <Sparkles />
        <div className="content-wrapper">
          <p className="subtitle">✦ IT IS A YES! ✦</p>
          <h1 className="gift-title">Knew you would say yes! ❤️</h1>
          <div className="svg-container" style={{ position: 'relative', width: '180px', height: '180px', margin: '15px auto' }}>
            <Image src="/images/bear-hug.gif" alt="Yay!" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
          </div>
          <button className="btn-secondary" style={{ marginTop: '15px' }} onClick={() => navigateTo('menu')}>
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  )
}

// =============================================
// HELPER COMPONENTS & PURE SVGS
// =============================================

function Sparkles() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1 }}>
      {Array.from({ length: 15 }).map((_, i) => (
        <span key={i} style={{
          position: 'absolute', width: '3px', height: '3px', background: '#fff', borderRadius: '50%',
          top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 13) % 90}%`,
          boxShadow: '0 0 10px #f472b6', opacity: 0.6
        }} />
      ))}
    </div>
  )
}

function BuntingSVG() {
  return (
    <svg width="100%" height="80" viewBox="0 0 800 80" preserveAspectRatio="none" style={{ position: 'fixed', top: 0, left: 0, zIndex: 0, opacity: 0.7, pointerEvents: 'none' }}>
      <line x1="0" y1="20" x2="800" y2="20" stroke="#50152d" strokeWidth="2" />
      {[...Array(10)].map((_, i) => (
        <polygon key={i} points={`${30 + i * 80},20 ${60 + i * 80},20 ${45 + i * 80},60`} fill={i % 2 === 0 ? "#db2777" : "#f472b6"} />
      ))}
    </svg>
  )
}

function CakeLitSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="100" cy="180" rx="75" ry="10" fill="#0d0407" />
      <path d="M40 130 H160 V175 C160 178 150 180 100 180 C50 180 40 178 40 175 V130 Z" fill="#381322" />
      <rect x="55" y="90" width="90" height="40" rx="4" fill="#831843" />
      <rect x="70" y="55" width="60" height="35" rx="4" fill="#db2777" />
      <circle cx="50" cy="130" r="5" fill="#f472b6" /><circle cx="80" cy="130" r="5" fill="#f472b6" /><circle cx="110" cy="130" r="5" fill="#f472b6" /><circle cx="140" cy="130" r="5" fill="#f472b6" />
      <rect x="96" y="25" width="8" height="30" rx="1" fill="#fbcfe8" />
      <line x1="96" y1="35" x2="104" y2="30" stroke="#f472b6" strokeWidth="2" />
      <g style={{ animation: 'pulse 1s infinite alternate', transformOrigin: '100px 22px' }}>
        <path d="M100 8 C92 18 92 26 100 30 C108 26 108 18 100 8 Z" fill="#facc15" />
      </g>
    </svg>
  )
}

function CakeBlownSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <ellipse cx="100" cy="180" rx="75" ry="10" fill="#0d0407" />
      <path d="M40 130 H160 V175 C160 178 150 180 100 180 C50 180 40 178 40 175 V130 Z" fill="#381322" />
      <rect x="55" y="90" width="90" height="40" rx="4" fill="#831843" />
      <rect x="70" y="55" width="60" height="35" rx="4" fill="#db2777" />
      <rect x="96" y="25" width="8" height="30" rx="1" fill="#fbcfe8" />
      <path d="M100 20 Q 95 10 100 0 T 100 -10" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function EnvelopeSVG() {
  return (
    <svg viewBox="0 0 280 180" fill="none" style={{ width: '100%', height: '100%' }}>
      <rect width="280" height="180" rx="12" fill="#0d0407" stroke="#50152d" strokeWidth="1.5" />
      <rect x="25" y="15" width="230" height="90" rx="6" fill="#f4f4f5" />
      <line x1="45" y1="35" x2="235" y2="35" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="45" y1="55" x2="190" y2="55" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="45" y1="75" x2="140" y2="75" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M0 180 L140 85 L280 180 Z" fill="#1f0a13" />
      <path d="M0 0 L140 85 L0 180 Z" fill="#14040a" />
      <path d="M280 0 L140 85 L280 180 Z" fill="#14040a" />
      <path d="M0 0 L140 105 L280 0 Z" fill="#381322" />
      <circle cx="140" cy="105" r="22" fill="#0d0407" stroke="#f472b6" strokeWidth="1.5" />
      <circle cx="140" cy="105" r="18" fill="#f472b6" />
      <path d="M140 112 C140 112 131 102 127 106 C123 110 128 118 140 125 C152 118 157 110 153 106 C149 102 140 112 140 112 Z" fill="#ffffff" />
    </svg>
  )
}

function VinylSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" style={{ width: '100%', height: '100%' }}>
      <circle cx="100" cy="100" r="100" fill="#030102" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="64" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="#12060b" strokeWidth="2" />
      <circle cx="100" cy="100" r="35" fill="#381322" />
      <circle cx="100" cy="100" r="30" fill="#db2777" />
      <circle cx="100" cy="100" r="5" fill="#030102" />
    </svg>
  )
}

function PlayIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> }
function PauseIcon() { return <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> }
function ForwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg> }
function BackwardIcon() { return <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6 z" /></svg> }
function VolumeMinIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg> }
function VolumeMaxIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg> }