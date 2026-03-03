const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function parseYouTubeTimestamp(raw: string | null): number | null {
    if (!raw) return null;

    const value = raw.trim().toLowerCase();
    if (!value) return null;

    if (/^\d+$/.test(value)) {
        const seconds = Number.parseInt(value, 10);
        return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
    }

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (!match) return null;

    const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
    const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
    const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
    const total = (hours * 3600) + (minutes * 60) + seconds;
    return total > 0 ? total : null;
}

function extractCandidateId(pathname: string): string | null {
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return null;

    if (['embed', 'shorts', 'live', 'v'].includes(pathParts[0])) {
        const id = pathParts[1];
        return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }
    return null;
}

export function extractYouTubeVideoId(urlOrId: string | null | undefined): string | null {
    const trimmed = (urlOrId ?? '').trim();
    if (!trimmed) return null;
    if (YOUTUBE_ID_PATTERN.test(trimmed)) return trimmed;

    try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.toLowerCase();

        if (host.includes('youtu.be')) {
            const id = parsed.pathname.split('/').filter(Boolean)[0];
            return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
        }

        if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
            const watchId = parsed.searchParams.get('v');
            if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId;

            return extractCandidateId(parsed.pathname);
        }
    } catch {
        // Fallback regex extraction for malformed-but-usable links.
    }

    const match = trimmed.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/live\/|\/v\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] ?? null;
}

export function buildYouTubeEmbedUrl(
    urlOrId: string,
    options?: { autoplay?: boolean }
): string {
    const id = extractYouTubeVideoId(urlOrId);
    if (!id) return urlOrId;

    const params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
    });

    if (options?.autoplay) {
        params.set('autoplay', '1');
    }

    try {
        const parsed = new URL(urlOrId);
        const startRaw = parsed.searchParams.get('start') || parsed.searchParams.get('t');
        const start = parseYouTubeTimestamp(startRaw);
        if (start !== null) params.set('start', String(start));
    } catch {
        // Ignore non-URL input.
    }

    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
