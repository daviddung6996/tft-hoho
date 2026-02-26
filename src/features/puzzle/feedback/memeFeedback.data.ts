import { MemeItem } from './meme.types';

export const FALLBACK_CORRECT_MEMES: MemeItem[] = [
    { id: 'c1', text: 'Galaxy Brain move', emoji: '🧠', category: 'correct', insight: 'Bạn đã đọc board cực kỳ chính xác.', isActive: true },
    { id: 'c2', text: '200 IQ play', emoji: '🎯', category: 'correct', insight: 'Augment này synergize hoàn hảo với đội hình hiện tại.', isActive: true },
    { id: 'c3', text: 'Certified Challenger', emoji: '👑', category: 'correct', insight: 'Đây là lựa chọn có winrate cao nhất trên board này.', isActive: true },
    { id: 'c4', text: 'Built different', emoji: '💎', category: 'correct', insight: 'Không nhiều người nhận ra giá trị thực của augment này.', isActive: true },
    { id: 'c5', text: 'Pro player material', emoji: '⭐', category: 'correct', insight: 'Tư duy giống hệt Challenger main.', isActive: true },
    { id: 'c6', text: 'Smurf detected', emoji: '🔍', category: 'correct', insight: 'Lựa chọn này cho thấy bạn hiểu meta rất sâu.', isActive: true },
    { id: 'c7', text: 'Clean decision', emoji: '✨', category: 'correct', insight: 'Augment này tối ưu nhất cho economy hiện tại.', isActive: true },
    { id: 'c8', text: 'Diff actually', emoji: '💪', category: 'correct', insight: 'Board context match — augment này scale tốt nhất về late game.', isActive: true },
    { id: 'c9', text: 'Bạn nên đi thi TFT', emoji: '🏆', category: 'correct', insight: 'Chọn đúng khi board yếu là skill thật sự.', isActive: true },
    { id: 'c10', text: 'Challenger vibes only', emoji: '🔥', category: 'correct', insight: 'Augment này boost team fight damage đáng kể.', isActive: true },
    { id: 'c11', text: 'Big brain energy', emoji: '⚡', category: 'correct', insight: 'Synergy trait được tăng lên đáng kể từ augment này.', isActive: true },
    { id: 'c12', text: 'The prophecy is true', emoji: '🌟', category: 'correct', insight: 'Đây là augment mà 70%+ Challenger chọn trong tình huống tương tự.', isActive: true },
    { id: 'c13', text: 'Trust the process', emoji: '📈', category: 'correct', insight: 'Long-term value — augment này mạnh từ giữa đến lategame.', isActive: true },
    { id: 'c14', text: 'TFT IQ over 9000', emoji: '💹', category: 'correct', insight: 'Bạn đã tính toán đúng augment nào giúp hit power spike sớm nhất.', isActive: true },
    { id: 'c15', text: 'Flawless execution', emoji: '🎮', category: 'correct', insight: 'Không cần nghĩ nhiều, augment này là must-pick trên board này.', isActive: true },
];

export const FALLBACK_INCORRECT_MEMES: MemeItem[] = [
    { id: 'i1', text: 'This is why you\'re hardstuck', emoji: '🤡', category: 'incorrect', insight: 'Augment bạn chọn có winrate thấp hơn ~8% so với best pick.', isActive: true },
    { id: 'i2', text: 'Uninstall TFT', emoji: '💀', category: 'incorrect', insight: 'Augment này không synergize tốt với đội hình hiện tại.', isActive: true },
    { id: 'i3', text: 'My Gold player could never...', emoji: '😅', category: 'incorrect', insight: 'Augment bạn chọn tốt trên lý thuyết, nhưng board hiện tại không tận dụng được.', isActive: true },
    { id: 'i4', text: 'The audacity...', emoji: '😤', category: 'incorrect', insight: 'Pro player nhìn thấy điều bạn không thấy — board context rất quan trọng.', isActive: true },
    { id: 'i5', text: 'Interesting choice...', emoji: '🧐', category: 'incorrect', insight: 'Augment này chỉ mạnh khi bạn hit certain units — rủi ro quá cao.', isActive: true },
    { id: 'i6', text: 'Copium overdose', emoji: '💊', category: 'incorrect', insight: 'Đây là trap augment — nhìn mạnh nhưng winrate thực tế thấp.', isActive: true },
    { id: 'i7', text: 'FF 15 energy', emoji: '🏳️', category: 'incorrect', insight: 'Augment đúng giúp stabilize board, augment bạn chọn không giải quyết vấn đề chính.', isActive: true },
    { id: 'i8', text: 'Back to Iron', emoji: '🪨', category: 'incorrect', insight: 'Lựa chọn này bỏ qua trait synergy quan trọng nhất trên board.', isActive: true },
    { id: 'i9', text: 'Chat diff', emoji: '💬', category: 'incorrect', insight: 'Augment pro chọn boost power spike ngay lập tức, augment bạn chọn chậm hơn 2-3 rounds.', isActive: true },
    { id: 'i10', text: 'Plot armor won\'t save you', emoji: '🛡️', category: 'incorrect', insight: 'Augment bạn chọn chỉ mạnh nếu bạn đã có advantage — nhưng board đang yếu.', isActive: true },
    { id: 'i11', text: 'Giáo sư xui', emoji: '📉', category: 'incorrect', insight: 'Lựa chọn này phổ biến nhưng là sai lầm kinh điển ở rank cao.', isActive: true },
    { id: 'i12', text: 'Sai rồi bạn ơi', emoji: '❌', category: 'incorrect', insight: 'Economy augment khi HP thấp = chọn chậm chết. Cần augment combat ngay.', isActive: true },
    { id: 'i13', text: 'Bronze moment', emoji: '🥉', category: 'incorrect', insight: 'Augment đúng cho thêm ~15% combat power so với lựa chọn của bạn.', isActive: true },
    { id: 'i14', text: 'Đây là trap', emoji: '🪤', category: 'incorrect', insight: 'Augment này nhìn hấp dẫn nhưng cần điều kiện board mà bạn chưa có.', isActive: true },
    { id: 'i15', text: 'Học thêm nhé', emoji: '📚', category: 'incorrect', insight: 'Không sao, hiểu sai để hiểu đúng. Xem giải thích để rút kinh nghiệm.', isActive: true },
];

let lastMemeId: string | null = null;

export function getRandomMeme(category: 'correct' | 'incorrect', memes?: MemeItem[]): MemeItem {
    const pool = memes && memes.length > 0
        ? memes.filter(m => m.category === category && m.isActive)
        : category === 'correct' ? FALLBACK_CORRECT_MEMES : FALLBACK_INCORRECT_MEMES;

    if (pool.length === 0) {
        return category === 'correct' ? FALLBACK_CORRECT_MEMES[0] : FALLBACK_INCORRECT_MEMES[0];
    }

    const available = pool.length > 1
        ? pool.filter(m => m.id !== lastMemeId)
        : pool;

    const picked = available[Math.floor(Math.random() * available.length)];
    lastMemeId = picked.id;
    return picked;
}
