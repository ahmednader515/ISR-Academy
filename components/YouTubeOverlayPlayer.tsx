"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { getYouTubeVideoId } from "@/lib/youtube";

/** حالات مشغل يوتيوب: -1 لم يبدأ، 0 انتهى، 1 يعمل، 2 متوقف، 3 يحمّل، 5 جاهز */
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_ENDED = 0;

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getPlayerState: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  getAvailableQualityLevels?: () => string[];
  setPlaybackQuality?: (quality: string) => void;
  getPlaybackQuality?: () => string;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: string | HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = { videoUrl: string; title: string };

/**
 * مشغل فيديو يوتيوب مع طبقة علوية وزر تشغيل/إيقاف وشريط تقدم للتقديم والتأخير.
 */
export function YouTubeOverlayPlayer({ videoUrl, title }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(100);
  const [qualityLevels, setQualityLevels] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>("");
  const [qualityOpen, setQualityOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoId = getYouTubeVideoId(videoUrl);

  const qualityLabels: Record<string, string> = {
    highres: "أعلى جودة",
    hd1080: "1080p",
    hd720: "720p",
    large: "480p",
    medium: "360p",
    small: "240p",
    tiny: "144p",
    auto: "تلقائي",
  };

  const stopProgressPoll = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
    // إخفاء شريط التحكم تلقائياً بعد ثانيتين أثناء التشغيل
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  const startProgressPoll = useCallback(() => {
    stopProgressPoll();
    progressIntervalRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      const state = p.getPlayerState();
      if (state !== YT_PLAYING) return;
      const t = p.getCurrentTime();
      const d = p.getDuration();
      setCurrentTime(t);
      if (Number.isFinite(d) && d > 0) setDuration(d);
    }, 250);
  }, [stopProgressPoll]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    const container = containerRef.current;
    let playerDiv: HTMLDivElement | null = null;

    const initPlayer = () => {
      if (!window.YT || !containerRef.current) return;
      if (document.getElementById("yt-player-" + videoId)) return;
      playerDiv = document.createElement("div");
      playerDiv.id = "yt-player-" + videoId;
      playerDiv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
      container.appendChild(playerDiv);
      new window.YT!.Player(playerDiv, {
        videoId,
        playerVars: { hd: 1 },
        events: {
          onReady(ev: { target: YTPlayer }) {
            playerRef.current = ev.target;
            const d = ev.target.getDuration();
            if (Number.isFinite(d) && d > 0) setDuration(d);
            try {
              const v = ev.target.getVolume();
              if (Number.isFinite(v)) setVolume(Math.round(v));
            } catch {}
            setReady(true);
          },
          onStateChange(ev: { data: number }) {
            const state = ev.data;
            if (state === YT_PLAYING) {
              setIsPlaying(true);
              setShowControls(true);
              scheduleHideControls();
              startProgressPoll();
              setTimeout(() => {
                const p = playerRef.current;
                if (p?.getAvailableQualityLevels) {
                  try {
                    const levels = p.getAvailableQualityLevels();
                    if (Array.isArray(levels) && levels.length > 0) setQualityLevels(levels);
                    if (p.getPlaybackQuality) setCurrentQuality(p.getPlaybackQuality());
                  } catch {}
                }
              }, 500);
            } else {
              setIsPlaying(false);
              setShowControls(true);
              if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
                controlsTimerRef.current = null;
              }
              stopProgressPoll();
              if (state === YT_PAUSED || state === YT_ENDED) {
                const p = playerRef.current;
                if (p) setCurrentTime(p.getCurrentTime());
              }
            }
          },
        },
      });
    };

    if (window.YT) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.getElementsByTagName("script")[0]?.parentNode?.insertBefore(tag, document.getElementsByTagName("script")[0]);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };
    }
    return () => {
      stopProgressPoll();
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = null;
      }
      playerRef.current = null;
      setReady(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      if (playerDiv?.parentNode) playerDiv.parentNode.removeChild(playerDiv);
    };
  }, [videoId, startProgressPoll, stopProgressPoll]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) p.pauseVideo();
    else p.playVideo();
  };


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = playerRef.current;
    if (!p || !duration) return;
    const value = parseFloat(e.target.value);
    const sec = value * duration;
    setIsSeeking(true);
    setCurrentTime(sec);
    p.seekTo(sec, true);
    setTimeout(() => setIsSeeking(false), 150);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const p = playerRef.current;
    if (!p || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const sec = percent * duration;
    setCurrentTime(sec);
    p.seekTo(sec, true);
  };

  const progressValue = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  const handleMouseMove = () => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    setShowControls(true);
    scheduleHideControls();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      // لما يطلع الماوس برّه أثناء التشغيل نخفي الشريط
      setShowControls(false);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const v = Math.max(0, Math.min(100, newVol));
    setVolume(v);
    const p = playerRef.current;
    if (p) p.setVolume(v);
  };

  const fetchQualityLevels = () => {
    const p = playerRef.current;
    if (!p?.getAvailableQualityLevels) return;
    try {
      const levels = p.getAvailableQualityLevels();
      if (Array.isArray(levels) && levels.length > 0) {
        setQualityLevels(levels);
        if (p.getPlaybackQuality) setCurrentQuality(p.getPlaybackQuality());
      }
    } catch {}
  };

  const handleQualitySelect = (q: string) => {
    const p = playerRef.current;
    if (!p) {
      setQualityOpen(false);
      return;
    }
    try {
      const t = p.getCurrentTime();
      const wasPlaying = p.getPlayerState() === YT_PLAYING;
      if (p.setPlaybackQuality) {
        p.pauseVideo();
        p.setPlaybackQuality(q);
        setCurrentQuality(q);
        if (Number.isFinite(t)) p.seekTo(t, true);
        if (wasPlaying) p.playVideo();
      }
    } catch {}
    setQualityOpen(false);
  };

  const toggleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        el.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    } catch {}
  };

  if (!videoId) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      {/* طبقة سوداء سفلية عند الإيقاف لإخفاء اقتراحات يوتيوب الخلفية */}
      {!isPlaying && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-1/2 bg-black" />
      )}
      {/* طبقة علوية للتحكم — لا تغطي شريط الأدوات */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        {/* منطقة النقر للتشغيل في المنتصف — العلامة تظهر فقط عند الإيقاف */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={togglePlay}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter" ? (e.preventDefault(), togglePlay()) : null)}
          role="button"
          tabIndex={0}
          aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
        >
          {!isPlaying && (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/90 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[var(--color-primary)]">
              <svg className="mr-1 h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* شريط التحكم في الأسفل */}
        <div
          className={`relative z-20 flex flex-col gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8 transition-opacity duration-200 ${
            isPlaying && !showControls ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {/* الصوت والجودة */}
          <div className="flex items-center justify-end gap-4">
            {/* الصوت */}
            <div dir="ltr" className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleVolumeChange(volume - 10)}
                disabled={!ready}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20 disabled:opacity-50"
                aria-label="تقليل الصوت"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                disabled={!ready}
                className="h-1.5 w-20 cursor-pointer accent-[var(--color-primary)] disabled:opacity-50"
                aria-label="مستوى الصوت"
              />
              <button
                type="button"
                onClick={() => handleVolumeChange(volume + 10)}
                disabled={!ready}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/20 disabled:opacity-50"
                aria-label="زيادة الصوت"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm14 3v4h2v-4h2v-2h-2V9h-2v2h-2v2h2zm-2-3.99V7c0-1.1.9-2 2-2s2 .9 2 2v2.01c1.16.41 2 1.52 2 2.99 0 1.48-.84 2.58-2 2.99V17c0 1.1-.9 2-2 2s-2-.9-2-2v-2.01c-1.16-.41-2-1.52-2-2.99 0-1.48.84-2.58 2-2.99z" />
                </svg>
              </button>
            </div>
            {/* الجودة */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  fetchQualityLevels();
                  setQualityOpen((o) => !o);
                }}
                disabled={!ready}
                className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1.5 text-xs text-white transition hover:bg-white/30 disabled:opacity-50"
                aria-label="تغيير الجودة"
              >
                {currentQuality ? (qualityLabels[currentQuality] ?? currentQuality) : "الجودة"}
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
              {qualityOpen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={() => setQualityOpen(false)} />
                  <ul className="absolute bottom-full right-0 z-20 mb-1 max-h-48 min-w-[8rem] overflow-auto rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg">
                    {qualityLevels.length > 0 ? (
                      qualityLevels.map((q) => (
                        <li key={q}>
                          <button
                            type="button"
                            onClick={() => handleQualitySelect(q)}
                            className="w-full px-3 py-2 text-right text-sm text-[var(--color-foreground)] hover:bg-[var(--color-border)]/50"
                          >
                            {qualityLabels[q] ?? q}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-[var(--color-muted)]">
                        الجودة تتوفر بعد بدء التشغيل
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>
          </div>
          {/* شريط التقديم والتأخير */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!ready}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-50"
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <span className="min-w-[2.5rem] text-right text-xs text-white/90 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div
              dir="ltr"
              className="relative h-2 flex-1 cursor-pointer rounded-full bg-white/30"
              onClick={handleProgressClick}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-75"
                style={{ width: `${progressValue * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={isSeeking ? progressValue : currentTime / (duration || 1)}
                onChange={handleSeek}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="تقديم أو تأخير المقطع"
              />
            </div>
            <button
              type="button"
              onClick={toggleFullscreen}
              disabled={!ready}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-50"
              aria-label="شاشة كاملة"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
