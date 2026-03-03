import React, { useRef, useState, useCallback, useEffect } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { Player, PlayerRef } from '@remotion/player';
import { FlexCardChampionRemotion } from '../../../remotion/FlexCard/FlexCardChampionRemotion';
import { FlexCardData } from '../share.types';
import { generateFlexCaption } from '../share.service';
import './FlexCardCanvas.css';

interface ShareModalProps {
    data: FlexCardData;
    onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ data, onClose }) => {
    const cardRef = useRef<PlayerRef>(null);

    const [downloading, setDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [recording, setRecording] = useState(false);
    const [caption, setCaption] = useState<string | null>(null);
    const [captionLoading, setCaptionLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const fallbackCaption = `TFT IQ ${data.iqScore} — ${data.iqRank} out trình cả lobby. Ban bao nhieu? #dtcl #tftvn #tftiseasy #outtrinh #toilatrumchonloi`;
    const captionText = caption || fallbackCaption;

    // Generate caption on mount (handles React Strict Mode double-invoke)
    useEffect(() => {
        let cancelled = false;
        setCaptionLoading(true);
        generateFlexCaption(
            data.iqScore,
            data.iqRank,
            data.topPercent ?? 1,
        ).then((c) => {
            if (!cancelled) {
                setCaption(c);
                setCaptionLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [data.iqScore, data.iqRank, data.topPercent]);

    const handleFlexFrame = useCallback(async () => {
        const player = cardRef.current;
        if (!player) return;

        setDownloading(true);
        setDownloadSuccess(false);

        // Jump to the final frame for the frame export
        player.pause();
        player.seekTo(149);
        await new Promise((r) => setTimeout(r, 200));

        const container = player.getContainerNode();
        if (!container) { setDownloading(false); return; }

        try {
            const blob = await toBlob(container, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#010a13',
                style: { transform: 'none' }, // Remotion player scales elements, we want to capture at exact size
                filter: (node) => {
                    if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                        const href = (node as HTMLLinkElement).href;
                        if (href.includes('fonts.googleapis.com')) {
                            return false;
                        }
                    }
                    return true;
                }
            });
            if (!blob) throw new Error('Failed to generate image blob');

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `tftiq-${(data.username || 'player').replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${data.iqScore}.png`;
            link.href = url;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to capture flex frame:', err);
        } finally {
            setDownloading(false);
        }
    }, [data, caption, fallbackCaption]);

    const handleVideo = useCallback(async () => {
        const player = cardRef.current;
        if (!player) return;
        setRecording(true);

        try {
            player.pause();

            // Validate VideoEncoder
            if (typeof VideoEncoder === "undefined") {
                alert("This browser doesn't support local video encoding (WebCodecs). Use Chrome/Edge desktop.");
                setRecording(false);
                return;
            }

            const { Muxer, ArrayBufferTarget } = await import('webm-muxer');
            const fps = 30;
            const duration = 150;

            const muxer = new Muxer({
                target: new ArrayBufferTarget(),
                video: { codec: 'V_VP9', width: 1080, height: 1920, frameRate: fps }
            });

            const encoder = new VideoEncoder({
                output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                error: e => console.error(e)
            });

            encoder.configure({
                codec: 'vp09.00.10.08',
                width: 1080,
                height: 1920,
                bitrate: 5_000_000, // 5 Mbps for high quality 1080x1920
            });

            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#010a13';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < duration; i++) {
                player.seekTo(i);
                // Important: wait for React state to flush and DOM to update
                await new Promise(r => setTimeout(r, 60));

                const container = player.getContainerNode();
                if (!container) continue;

                const dataUrl = await toPng(container, {
                    quality: 0.85,
                    pixelRatio: 1, // Encode video at 1x resolution to keep time reasonable
                    backgroundColor: '#010a13',
                    style: { transform: 'none' }, // ensure we render at unscaled dimensions
                    filter: (node) => {
                        if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                            const href = (node as HTMLLinkElement).href;
                            if (href.includes('fonts.googleapis.com')) return false;
                        }
                        return true;
                    }
                });

                const img = new Image();
                await new Promise(r => {
                    img.onload = r;
                    img.src = dataUrl;
                });

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const frame = new VideoFrame(canvas, { timestamp: i * 1e6 / fps });
                encoder.encode(frame, { keyFrame: i % fps === 0 });
                frame.close();
            }

            await encoder.flush();
            muxer.finalize();
            const buffer = muxer.target.buffer;

            const blob = new Blob([buffer], { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `tftiq-${data.username}-${data.iqScore}.webm`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            setRecording(false);
            navigator.clipboard?.writeText(captionText);
        } catch (err) {
            console.error('Failed to record video:', err);
            setRecording(false);
        }
    }, [data, captionText]);

    const handleCopyCaption = useCallback(async () => {
        const text = captionText;
        if (!text) return;

        try {
            await navigator.clipboard?.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error('Failed to copy caption:', err);
        }
    }, [captionText]);

    return (
        <div className="share-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <button className="share-modal-close" onClick={onClose}>←</button>

            <div className="share-card-container">
                <div className="share-card-frame">
                    <div className="share-corner share-corner-tl" />
                    <div className="share-corner share-corner-tr" />
                    <div className="share-corner share-corner-bl" />
                    <div className="share-corner share-corner-br" />
                    <Player
                        ref={cardRef}
                        component={FlexCardChampionRemotion}
                        inputProps={{ data }}
                        durationInFrames={150}
                        fps={30}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        style={{
                            width: "100%",
                            aspectRatio: "1080 / 1920",
                        }}
                        autoPlay
                        controls={false}
                        loop
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="share-buttons-row">
                <button
                    className="share-btn share-btn-primary"
                    onClick={handleFlexFrame}
                    disabled={downloading || recording || downloadSuccess}
                    style={{
                        borderColor: downloadSuccess ? '#10B981' : undefined,
                        color: downloadSuccess ? '#051c1e' : undefined,
                        background: downloadSuccess ? '#10B981' : undefined,
                    }}
                >
                    {downloading ? 'ĐANG TẢI...' : downloadSuccess ? 'ĐÃ TẢI!' : 'FLEX FRAME'}
                    <div className="glow-sweep" />
                </button>
                <button
                    className="share-btn"
                    onClick={handleVideo}
                    disabled={downloading || recording}
                >
                    {recording ? 'ĐANG QUAY...' : 'VIDEO'}
                </button>
            </div>

            {/* Caption — single clickable box */}
            <div
                className={`share-caption-box${copied ? ' is-copied' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Copy caption"
                onClick={handleCopyCaption}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCopyCaption();
                    }
                }}
            >
                <div className="share-caption-label">
                    <span>COPY CAPTION NÀY NGAY!</span>
                    {copied && (
                        <span className="copied-tag">ĐÃ SAO CHÉP</span>
                    )}
                </div>
                <div className="share-caption-text">
                    {captionLoading
                        ? <span className="share-caption-loading">Đang tạo caption gây drama...</span>
                        : captionText
                    }
                </div>
            </div>
        </div>
    );
};
