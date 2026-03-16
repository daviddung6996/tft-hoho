import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { COACHES, COACHES_BY_ID } from '../coachSelect.data';
import type { CoachId } from '../coachSelect.types';
import { CoachFab } from './CoachFab';
import { CoachSelectOverlay } from './CoachSelectOverlay';

const currentAugments = [
    {
        id: 'aug-1',
        title: 'Featherweights III',
        description: 'Tempo augment cho board can xuat skill som.',
        icon: '/tft-assets/featherweights.png',
        tier: 2 as const,
    },
    {
        id: 'aug-2',
        title: 'Jeweled Lotus II',
        description: 'Them crit cho board AP va flex item de hon.',
        icon: '/tft-assets/jeweled-lotus-iii.png',
        tier: 2 as const,
    },
];

const gameContext = {
    stage: '3-2',
    comp: 'Faerie / Mage',
    gold: 24,
    level: 6,
    hp: 72,
    decisionType: 'augment' as const,
    decisionLabel: 'Augment',
    proChoiceId: 'aug-1',
    proChoiceLabel: 'Featherweights III',
    currentDecisionOptions: currentAugments.map(({ id, title, icon, tier }) => ({
        id,
        title,
        icon,
        tier,
    })),
    currentAugments: currentAugments.map(augment => augment.title),
    currentAugmentOptions: currentAugments.map(({ id, title, icon, tier }) => ({
        id,
        title,
        icon,
        tier,
    })),
    chosenAugments: ['Starter Kit'],
    synergies: ['Faerie', 'Mage'],
    boardChampions: ['Lux', 'Seraphine'],
    items: ['Jeweled Gauntlet', 'Rabadon'],
};

const getCoachButtonName = (displayName: string) => new RegExp(`coach ${displayName}$`, 'i');

const renderHarness = (onAskCoach = vi.fn(), onObserveBoard = vi.fn()) => {
    const Harness = () => {
        const [selectedCoachId, setSelectedCoachId] = useState<CoachId>('visian');

        return (
            <CoachSelectOverlay
                coach={COACHES_BY_ID[selectedCoachId]}
                currentAugments={currentAugments}
                gameContext={gameContext}
                uiState="select"
                answer=""
                error={null}
                onClose={vi.fn()}
                onSelectCoach={setSelectedCoachId}
                onAskCoach={onAskCoach}
                onBackToSelect={vi.fn()}
                onObserveBoard={onObserveBoard}
            />
        );
    };

    return render(<Harness />);
};

describe('CoachSelectOverlay', () => {
    it('renders Visian hero in pose mode while keeping the carousel thumbnail separate', () => {
        renderHarness();

        const heroImage = screen.getByTestId('coach-hero-image');
        expect(heroImage.getAttribute('src')).toContain('/coach-assets/pose/visian-clean.png');

        const heroWrapper = heroImage.closest('.coach-select-visual__hero');
        expect(heroWrapper).not.toBeNull();
        expect(heroWrapper?.className).toContain('coach-select-visual__hero--pose');
        expect(document.querySelector('.coach-select-visual__poster-frame')).toBeNull();

        const visianCard = screen.getByRole('button', { name: getCoachButtonName('Visian') });
        const thumbnailImage = visianCard.querySelector('img');
        expect(thumbnailImage?.getAttribute('src')).toContain('/coach-assets/visian-thumb.png');
    });

    it('renders uploaded local portraits for every coach instead of champion fallback art', async () => {
        const user = userEvent.setup();
        renderHarness();

        for (const coach of COACHES) {
            await user.click(screen.getByRole('button', { name: getCoachButtonName(coach.displayName) }));

            const heroImage = screen.getByTestId('coach-hero-image');
            expect(heroImage.getAttribute('src')).toContain('/coach-assets/pose/');
            expect(heroImage.getAttribute('src')).not.toContain('/tft-assets/');

            const coachCard = screen.getByRole('button', { name: getCoachButtonName(coach.displayName) });
            const thumbnailImage = coachCard.querySelector('img');
            expect(thumbnailImage?.getAttribute('src')).toContain('/coach-assets/');
            expect(thumbnailImage?.getAttribute('src')).toContain('-thumb.png');
            expect(thumbnailImage?.getAttribute('src')).not.toContain('/tft-assets/');
        }
    });

    it('updates the selected coach preview without sending a request', async () => {
        const user = userEvent.setup();
        const askCoachSpy = vi.fn();
        renderHarness(askCoachSpy);

        expect(screen.getByRole('heading', { name: 'VISIAN' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: getCoachButtonName('Dit Sap') }));

        expect(askCoachSpy).not.toHaveBeenCalled();
        expect(screen.getByRole('heading', { name: 'DIT SAP' })).toBeInTheDocument();
        expect(document.querySelector('.coach-select-panel__cta')?.textContent).toMatch(/Dit Sap/i);
    });

    it('falls back to the coach fallback image when the local portrait fails', async () => {
        renderHarness();

        const heroImage = screen.getByTestId('coach-hero-image');
        expect(heroImage.getAttribute('src')).toContain('/coach-assets/pose/visian-clean.png');

        fireEvent.error(heroImage);

        await waitFor(() => {
            expect(screen.getByTestId('coach-hero-image').getAttribute('src')).toContain(
                '/tft-assets/tft16_ryze_square.tft_set16.png',
            );
            expect(screen.getByTestId('coach-hero-image').closest('.coach-select-visual__hero')?.className).toContain(
                'coach-select-visual__hero--art-fallback',
            );
        });
    });

    it('shows a busy status without rendering a separate pick section when analysis fails', () => {
        render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID.one_by_one}
                currentAugments={currentAugments}
                gameContext={gameContext}
                uiState="response"
                answer=""
                error="Coach đang bận train, thử lại sau nha."
                onClose={vi.fn()}
                onSelectCoach={vi.fn()}
                onAskCoach={vi.fn()}
                onBackToSelect={vi.fn()}
                onObserveBoard={vi.fn()}
            />,
        );

        expect(screen.getByRole('heading', { name: /1by1.*đang bận train/i })).toBeInTheDocument();
        expect(screen.getByText(/Coach đang bận train, thử lại sau nha\./i)).toBeInTheDocument();
        expect(screen.queryByText('Pick')).not.toBeInTheDocument();
        expect(screen.getByText('Trạng thái')).toBeInTheDocument();
    });

    it('shows path choices instead of hidden augment options during intent declaration', () => {
        render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID.visian}
                currentAugments={currentAugments}
                gameContext={{
                    ...gameContext,
                    decisionType: 'path',
                    decisionLabel: 'Huong augment',
                    proChoiceId: 'econ',
                    proChoiceLabel: 'Kinh te',
                    currentDecisionOptions: [
                        { id: 'econ', title: 'Kinh te', subtitle: 'Vang, XP, luot roll' },
                        { id: 'item', title: 'Trang bi', subtitle: 'Manh do, do lon, do Orn' },
                        { id: 'combat', title: 'Danh nhau', subtitle: 'Loi combat, team-wide buff' },
                        { id: 'emblem', title: 'An', subtitle: 'An toc he, Xeng/Chao, Giap chess' },
                    ],
                    currentAugments: [],
                    currentAugmentOptions: [],
                }}
                uiState="select"
                answer=""
                error={null}
                onClose={vi.fn()}
                onSelectCoach={vi.fn()}
                onAskCoach={vi.fn()}
                onBackToSelect={vi.fn()}
                onObserveBoard={vi.fn()}
            />,
        );

        expect(screen.getByText('Huong augment')).toBeInTheDocument();
        expect(screen.getByText('Kinh te')).toBeInTheDocument();
        expect(screen.getByText('Trang bi')).toBeInTheDocument();
        expect(screen.queryByText('Featherweights III')).not.toBeInTheDocument();
    });

    it('renders loading state without pick/why sections and keeps the observe-board CTA', async () => {
        const user = userEvent.setup();
        const onObserveBoard = vi.fn();
        render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID.visian}
                currentAugments={currentAugments}
                gameContext={gameContext}
                uiState="loading"
                answer=""
                error={null}
                onClose={vi.fn()}
                onSelectCoach={vi.fn()}
                onAskCoach={vi.fn()}
                onBackToSelect={vi.fn()}
                onObserveBoard={onObserveBoard}
            />,
        );

        expect(screen.queryByText('Pick')).not.toBeInTheDocument();
        expect(screen.queryByText('Tai sao')).not.toBeInTheDocument();
        expect(screen.getByText(/Giữ nguyên phân tích ở đây/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ra ngoài xem lại board/i })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /Ra ngoài xem lại board/i }));
        expect(onObserveBoard).toHaveBeenCalledTimes(1);
    });

    it('uses the close button to return to board while loading coach analysis', async () => {
        const user = userEvent.setup();
        const onObserveBoard = vi.fn();
        const onClose = vi.fn();

        render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID.visian}
                currentAugments={currentAugments}
                gameContext={gameContext}
                uiState="loading"
                answer=""
                error={null}
                onClose={onClose}
                onSelectCoach={vi.fn()}
                onAskCoach={vi.fn()}
                onBackToSelect={vi.fn()}
                onObserveBoard={onObserveBoard}
            />,
        );

        await user.click(screen.getByRole('button', { name: /Dong coach overlay/i }));

        expect(onObserveBoard).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('renders a single analysis section in response mode', () => {
        render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID.visian}
                currentAugments={currentAugments}
                gameContext={gameContext}
                uiState="response"
                answer="Featherweights III hop spot nay vi board dang can tempo som va augment nay giu mau dep hon."
                error={null}
                onClose={vi.fn()}
                onSelectCoach={vi.fn()}
                onAskCoach={vi.fn()}
                onBackToSelect={vi.fn()}
            />,
        );

        expect(screen.queryByText('Pick')).not.toBeInTheDocument();
        expect(screen.queryByText('Tai sao')).not.toBeInTheDocument();
        expect(screen.getByText('Phân Tích')).toBeInTheDocument();
        expect(screen.getByText(/Featherweights III hop spot nay/i)).toBeInTheDocument();
    });

    it('renders return fab variants with the expected labels and classes', () => {
        const { rerender } = render(
            <CoachFab
                onClick={vi.fn()}
                variant="return-loading"
                label="Coach Visian đang nhìn nhận thế trận"
                eyebrow="Coach"
                isDimmed
            />,
        );

        expect(screen.getByRole('button', { name: 'Coach Visian đang nhìn nhận thế trận' }).className).toContain('coach-fab--return-loading');
        expect(screen.getByRole('button', { name: 'Coach Visian đang nhìn nhận thế trận' }).className).toContain('coach-fab--dimmed');
        expect(document.querySelector('.coach-fab__inline-dots')).not.toBeNull();

        rerender(
            <CoachFab
                onClick={vi.fn()}
                variant="return-ready"
                label="Xem phân tích"
                eyebrow="Đã xong"
                isPulsing
            />,
        );

        expect(screen.getByRole('button', { name: 'Xem phân tích' }).className).toContain('coach-fab--return-ready');
        expect(screen.getByRole('button', { name: 'Xem phân tích' }).className).toContain('coach-fab--pulsing');
        expect(document.querySelector('.coach-fab__inline-dots')).toBeNull();
    });
});
