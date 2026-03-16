export function getVisianChatUrl(): string {
    const overrideUrl = import.meta.env.VITE_VISIAN_CHAT_URL?.trim();
    if (overrideUrl) {
        const normalizedOverride = overrideUrl.replace(/\/+$/, '');
        return /\/functions\/v1\/visian-chat$/i.test(normalizedOverride)
            ? normalizedOverride
            : `${normalizedOverride}/functions/v1/visian-chat`;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
    return `${supabaseUrl.replace(/\/+$/, '')}/functions/v1/visian-chat`;
}

export function getVisianChatAnonKey(): string {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
}

export function getVisianChatHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
    const anonKey = getVisianChatAnonKey();
    return {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        ...(extraHeaders ?? {}),
    };
}
