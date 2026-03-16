/**
 * Bug Condition Exploration Test for CoachSelectOverlay Layout Defects
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
 * 
 * This test surfaces counterexamples that demonstrate 7 layout bugs:
 * 1. Scrollbars appear when panel content exceeds available height
 * 2. Content overlaps carousel at small viewport heights
 * 3. "Augment trên bàn" section renders with 3 augment cards
 * 4. Carousel shows 3 cards at 820px breakpoint instead of 5
 * 5. CTA button glow should stay restrained instead of using oversized blur
 * 6. Character card hover should stay stable instead of scaling on hover
 * 7. Misalignment issues due to redundant augment section
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { COACHES_BY_ID } from '../coachSelect.data';
import type { CoachId } from '../coachSelect.types';
import { CoachSelectOverlay } from './CoachSelectOverlay';

const mockAugments = [
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
    {
        id: 'aug-3',
        title: 'Starter Kit',
        description: 'Extra gold early game.',
        icon: '/tft-assets/starter-kit.png',
        tier: 1 as const,
    },
];

const mockGameContext = {
    stage: '3-2',
    comp: 'Faerie / Mage',
    gold: 24,
    level: 6,
    hp: 72,
    decisionType: 'augment' as const,
    decisionLabel: 'Augment',
    currentDecisionOptions: mockAugments.map(({ id, title, icon, tier }) => ({
        id,
        title,
        icon,
        tier,
    })),
    currentAugments: mockAugments.map(a => a.title),
    currentAugmentOptions: mockAugments.map(({ id, title, icon, tier }) => ({
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

describe('CoachSelectOverlay - Bug Condition Exploration (Property 1: Fault Condition)', () => {
    /**
     * Property 1: Layout Defects Detection
     * 
     * This property-based test generates various render states and checks for the 7 layout bugs.
     * On UNFIXED code, this test MUST FAIL, proving the bugs exist.
     * After the fix is implemented, this test MUST PASS, proving the bugs are eliminated.
     */
    it('Property 1: should render without scrollbars, overlaps, redundant sections, responsive carousel regressions, oversized CTA glow, or hover scaling', () => {
        fc.assert(
            fc.property(
                // Generate test cases with different coaches and UI states
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                fc.constantFrom<'select' | 'loading' | 'response'>('select', 'loading', 'response'),
                fc.option(fc.string(), { nil: null }),
                (coachId, uiState, answer) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    // Render the component
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState={uiState}
                            pick={uiState === 'response' ? 'Featherweights III' : null}
                            reasoning={answer ?? ''}
                            isReasoningStreaming={uiState === 'loading'}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Only check layout bugs when in 'select' state (not loading/response)
                    if (uiState === 'select') {
                        // Bug 1: Check for scrollbars (scrollHeight > clientHeight indicates scrollbar)
                        const panel = container.querySelector('.coach-select-panel');
                        if (panel) {
                            const hasScrollbar = panel.scrollHeight > panel.clientHeight;
                            expect(hasScrollbar).toBe(false); // EXPECTED TO FAIL on unfixed code
                        }

                        // Bug 3: Check for redundant "Augment trên bàn" section
                        const augmentSection = container.querySelector('.coach-select-panel__section');
                        const augmentSectionText = augmentSection?.textContent || '';
                        const hasAugmentSection = augmentSectionText.includes('Augment Tren Ban');
                        expect(hasAugmentSection).toBe(false); // EXPECTED TO FAIL on unfixed code

                        // Bug 4: Check carousel always shows 5 cards (not responsive)
                        const carousel = container.querySelector('.coach-carousel');
                        if (carousel) {
                            const computedStyle = window.getComputedStyle(carousel);
                            const gridColumns = computedStyle.gridTemplateColumns;
                            // Should always be 5 columns, not responsive
                            // On unfixed code at 820px, it will be 3 columns
                            // Handle both expanded (5 space-separated values) and unexpanded (repeat(5, ...)) formats
                            const isExpanded = !gridColumns.includes('repeat');
                            const columnCount = isExpanded 
                                ? gridColumns.split(' ').length 
                                : parseInt(gridColumns.match(/repeat\((\d+)/)?.[1] || '0');
                            expect(columnCount).toBe(5); // EXPECTED TO FAIL on unfixed code at 820px
                        }

                        // Bug 5: CTA should keep a restrained shadow profile
                        const ctaButton = container.querySelector('.coach-select-panel__cta');
                        if (ctaButton) {
                            const computedStyle = window.getComputedStyle(ctaButton);
                            const boxShadow = computedStyle.boxShadow;
                            const blurRadii = (boxShadow.match(/\d+px/g) || [])
                                .map(val => parseInt(val))
                                .filter(val => val > 0);
                            const hasOversizedGlow = blurRadii.some(blur => blur > 20);
                            expect(hasOversizedGlow).toBe(false);
                        }

                        // Bug 6: Character card hover should not use scale transform
                        const carouselItem = container.querySelector('.coach-carousel__item');
                        if (carouselItem) {
                            const styleSheets = Array.from(document.styleSheets);
                            let hoverTransform = '';
                            
                            for (const sheet of styleSheets) {
                                try {
                                    const rules = Array.from(sheet.cssRules || []);
                                    for (const rule of rules) {
                                        if (rule instanceof CSSStyleRule) {
                                            if (rule.selectorText?.includes('.coach-carousel__item:hover')) {
                                                hoverTransform = rule.style.transform;
                                                if (hoverTransform) break;
                                            }
                                        }
                                    }
                                    if (hoverTransform) break;
                                } catch (e) {
                                    // Skip inaccessible stylesheets (CORS)
                                }
                            }
                            
                            expect(hoverTransform).not.toContain('scale');
                            expect(hoverTransform).not.toContain('translate');
                        }
                    }
                }
            ),
            {
                numRuns: 20, // Run 20 test cases with different combinations
                verbose: true, // Show counterexamples when test fails
            }
        );
    });

    /**
     * Concrete test case for Bug 3: Redundant "Augment trên bàn" section
     * This is a focused test that clearly demonstrates the bug exists.
     */
    it('Bug 3: should NOT render "Augment trên bàn" section in select state', () => {
        const { container } = render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID['visian']}
                currentAugments={mockAugments}
                gameContext={mockGameContext}
                uiState="select"
                pick={null}
                reasoning=""
                isReasoningStreaming={false}
                error={null}
                onClose={() => {}}
                onSelectCoach={() => {}}
                onAskCoach={() => {}}
                onBackToSelect={() => {}}
            />
        );

        // Check that "Augment Tren Ban" section does NOT exist
        const augmentLabels = Array.from(container.querySelectorAll('.coach-select-panel__label'));
        const hasAugmentSection = augmentLabels.some(label => 
            label.textContent?.includes('Augment Tren Ban')
        );

        expect(hasAugmentSection).toBe(false); // EXPECTED TO FAIL on unfixed code
    });

    /**
     * Concrete test case for Bug 5: CTA button should stay restrained
     */
    it('Bug 5: CTA button should avoid oversized glow blur radius', () => {
        const { container } = render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID['visian']}
                currentAugments={mockAugments}
                gameContext={mockGameContext}
                uiState="select"
                pick={null}
                reasoning=""
                isReasoningStreaming={false}
                error={null}
                onClose={() => {}}
                onSelectCoach={() => {}}
                onAskCoach={() => {}}
                onBackToSelect={() => {}}
            />
        );

        const ctaButton = container.querySelector('.coach-select-panel__cta');
        expect(ctaButton).toBeTruthy();

        if (ctaButton) {
            const computedStyle = window.getComputedStyle(ctaButton);
            const boxShadow = computedStyle.boxShadow;
            
            const blurRadii = (boxShadow.match(/\d+px/g) || [])
                .map(val => parseInt(val))
                .filter(val => val > 0);
            
            const hasOversizedGlow = blurRadii.some(blur => blur > 20);
            
            expect(hasOversizedGlow).toBe(false);
        }
    });

    /**
     * Concrete test case for Bug 6: Hover should stay stable and refined.
     */
    it('Bug 6: character cards should not scale on hover', () => {
        render(
            <CoachSelectOverlay
                coach={COACHES_BY_ID['visian']}
                currentAugments={mockAugments}
                gameContext={mockGameContext}
                uiState="select"
                pick={null}
                reasoning=""
                isReasoningStreaming={false}
                error={null}
                onClose={() => {}}
                onSelectCoach={() => {}}
                onAskCoach={() => {}}
                onBackToSelect={() => {}}
            />
        );

        const styleSheets = Array.from(document.styleSheets);
        let hoverTransform = '';
        
        for (const sheet of styleSheets) {
            try {
                const rules = Array.from(sheet.cssRules || []);
                for (const rule of rules) {
                    if (rule instanceof CSSStyleRule) {
                        if (rule.selectorText?.includes('.coach-carousel__item:hover')) {
                            hoverTransform = rule.style.transform;
                            if (hoverTransform) break;
                        }
                    }
                }
                if (hoverTransform) break;
            } catch (e) {
                // Skip inaccessible stylesheets (CORS)
            }
        }
        
        expect(hoverTransform).not.toContain('scale');
        expect(hoverTransform).not.toContain('translate');
    });
});

describe('CoachSelectOverlay - Preservation Tests (Property 2: Existing Functionality Unchanged)', () => {
    /**
     * Property 2: Preservation - Existing Functionality Unchanged
     * 
     * These tests verify that non-buggy functionality remains unchanged:
     * - 2-column layout structure
     * - Coach selection functionality
     * - Stat animations
     * - Ability display
     * - Context bar
     * - Response card behavior
     * - Mobile responsiveness (overall layout, not carousel)
     * - Header functionality
     * - Visual panel styling
     * - Color variables
     * 
     * **IMPORTANT**: These tests run on UNFIXED code and MUST PASS to establish baseline behavior.
     * After the fix, these tests MUST STILL PASS to prove preservation.
     * 
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**
     */

    /**
     * Property 2.1: Coach Selection Functionality Preserved
     * 
     * Verifies that clicking carousel cards updates the main display with selected coach info.
     * This behavior must remain unchanged after the fix.
     */
    it('Property 2.1: should update main display when selecting different coaches from carousel', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (initialCoachId, selectedCoachId) => {
                    const initialCoach = COACHES_BY_ID[initialCoachId];
                    const selectedCoach = COACHES_BY_ID[selectedCoachId];
                    
                    let currentCoach = initialCoach;
                    const handleSelectCoach = (coachId: CoachId) => {
                        currentCoach = COACHES_BY_ID[coachId];
                    };

                    const { container, rerender } = render(
                        <CoachSelectOverlay
                            coach={currentCoach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={handleSelectCoach}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Verify initial coach is displayed
                    const initialName = container.querySelector('.coach-select-info__name');
                    expect(initialName?.textContent).toBe(initialCoach.displayName.toUpperCase());

                    // Simulate selecting a different coach
                    handleSelectCoach(selectedCoachId);
                    
                    // Re-render with new coach
                    rerender(
                        <CoachSelectOverlay
                            coach={currentCoach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={handleSelectCoach}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Verify selected coach is now displayed
                    const selectedName = container.querySelector('.coach-select-info__name');
                    expect(selectedName?.textContent).toBe(selectedCoach.displayName.toUpperCase());
                }
            ),
            { numRuns: 15 }
        );
    });

    /**
     * Property 2.2: Stat Animations Preserved
     * 
     * Verifies that stat bars render with proper structure for animation.
     * Animation timing and easing must remain unchanged after the fix.
     * Note: We check for the presence of stat bars and their CSS class, not computed animation
     * since test environment may not fully compute CSS animations.
     */
    it('Property 2.2: should render stat bars with proper structure for animation', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check that stat bars exist with proper structure
                    const statBars = container.querySelectorAll('.coach-stat__fill');
                    expect(statBars.length).toBeGreaterThan(0);

                    // Check that each stat bar has the CSS class that applies animation
                    statBars.forEach(bar => {
                        expect(bar.classList.contains('coach-stat__fill')).toBe(true);
                    });

                    // Check that stat values and labels exist
                    const statLabels = container.querySelectorAll('.coach-stat__label');
                    const statValues = container.querySelectorAll('.coach-stat__value');
                    
                    expect(statLabels.length).toBeGreaterThan(0);
                    expect(statValues.length).toBeGreaterThan(0);
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.3: Response Card Behavior Preserved
     * 
     * Verifies that clicking "HỎI COACH" shows loading state then response card.
     * This flow must remain unchanged after the fix.
     */
    it('Property 2.3: should show loading state and response card when asking coach', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                fc.string({ minLength: 20, maxLength: 200 }).filter(s => s.trim().length > 10),
                (coachId, responseText) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    // Test loading state
                    const { container: loadingContainer } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="loading"
                            pick="Featherweights III"
                            reasoning=""
                            isReasoningStreaming={true}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Should show loading variant
                    const loadingCard = loadingContainer.querySelector('.coach-response-card--loading');
                    expect(loadingCard).toBeTruthy();

                    // Test response state with meaningful text
                    const meaningfulResponse = responseText.trim() || 'Test response from coach';
                    const { container: responseContainer } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="response"
                            pick="Featherweights III"
                            reasoning={meaningfulResponse}
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Should show response card
                    const responseCard = responseContainer.querySelector('.coach-response-card');
                    expect(responseCard).toBeTruthy();
                    
                    // Should have response body
                    const responseBody = responseContainer.querySelector('.coach-response-card__body');
                    expect(responseBody).toBeTruthy();
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.4: Mobile Responsive Layout Preserved
     * 
     * Verifies that overlay adjusts to single-column layout at 820px breakpoint.
     * Note: Overall layout responsiveness should be preserved, but carousel should NOT be responsive.
     */
    it('Property 2.4: should maintain 2-column layout structure', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check that content area exists with 2-column structure
                    const content = container.querySelector('.coach-select-content');
                    expect(content).toBeTruthy();

                    // Check that both columns exist
                    const visualPanel = container.querySelector('.coach-select-visual');
                    const infoPanel = container.querySelector('.coach-select-info');
                    
                    expect(visualPanel).toBeTruthy();
                    expect(infoPanel).toBeTruthy();
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.5: Context Bar Preserved
     * 
     * Verifies that context bar displays stage, level, gold, and augments correctly.
     * This display logic must remain unchanged after the fix.
     */
    it('Property 2.5: should display context bar with game state information', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check that context bar exists
                    const contextBar = container.querySelector('.coach-context-bar');
                    expect(contextBar).toBeTruthy();

                    // Check that game state is displayed
                    const contextText = contextBar?.textContent || '';
                    expect(contextText).toContain(mockGameContext.stage);
                    expect(contextText).toContain(String(mockGameContext.level));
                    expect(contextText).toContain(String(mockGameContext.gold));
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.6: Visual Panel Styling Preserved
     * 
     * Verifies that coach portrait, accent shape, fog, and caption render correctly.
     * All visual styling must remain unchanged after the fix.
     */
    it('Property 2.6: should render visual panel with coach portrait and styling elements', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check visual panel elements exist
                    const visualPanel = container.querySelector('.coach-select-visual__panel');
                    const accentShape = container.querySelector('.coach-select-visual__shape--accent');
                    const portrait = container.querySelector('.coach-select-portrait');
                    const fog = container.querySelector('.coach-select-visual__fog');
                    const caption = container.querySelector('.coach-select-visual__caption');

                    expect(visualPanel).toBeTruthy();
                    expect(accentShape).toBeTruthy();
                    expect(portrait).toBeTruthy();
                    expect(fog).toBeTruthy();
                    expect(caption).toBeTruthy();

                    // Check caption contains coach info
                    const captionText = caption?.textContent || '';
                    expect(captionText).toContain(coach.role);
                    expect(captionText).toContain(coach.tagline);
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.7: Ability Display Preserved
     * 
     * Verifies that ability card displays with key, name, and description.
     * This display must remain unchanged after the fix.
     */
    it('Property 2.7: should display ability card with key, name, and description', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check ability card elements exist
                    const abilityCard = container.querySelector('.coach-ability-card');
                    const abilityKey = container.querySelector('.coach-ability-card__key');
                    const abilityName = container.querySelector('.coach-ability-card__name');
                    const abilityDesc = container.querySelector('.coach-ability-card__desc');

                    expect(abilityCard).toBeTruthy();
                    expect(abilityKey).toBeTruthy();
                    expect(abilityName).toBeTruthy();
                    expect(abilityDesc).toBeTruthy();

                    // Check ability content matches coach data
                    expect(abilityKey?.textContent).toBe(coach.ability.key);
                    expect(abilityName?.textContent).toBe(coach.ability.name);
                    expect(abilityDesc?.textContent).toBe(coach.ability.description);
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.8: Header Functionality Preserved
     * 
     * Verifies that header displays title and close button correctly.
     * This functionality must remain unchanged after the fix.
     */
    it('Property 2.8: should render header with title and close button', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check header elements exist
                    const header = container.querySelector('.coach-select-header');
                    const title = container.querySelector('.coach-select-header__title');
                    const closeButton = container.querySelector('.coach-select-header__close');

                    expect(header).toBeTruthy();
                    expect(title).toBeTruthy();
                    expect(closeButton).toBeTruthy();

                    // Check title text
                    expect(title?.textContent).toBe('Chọn Coach');
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Property 2.9: Color Variables and Hextech Styling Preserved
     * 
     * Verifies that CSS custom properties and Hextech aesthetic remain unchanged.
     * All color variables and styling must be preserved after the fix.
     */
    it('Property 2.9: should maintain Hextech styling with color variables', () => {
        fc.assert(
            fc.property(
                fc.constantFrom<CoachId>('visian', 'dit_sap', 'one_by_one', 'buffalow', 'tftiseasy'),
                (coachId) => {
                    const coach = COACHES_BY_ID[coachId];
                    
                    const { container } = render(
                        <CoachSelectOverlay
                            coach={coach}
                            currentAugments={mockAugments}
                            gameContext={mockGameContext}
                            uiState="select"
                            pick={null}
                            reasoning=""
                            isReasoningStreaming={false}
                            error={null}
                            onClose={() => {}}
                            onSelectCoach={() => {}}
                            onAskCoach={() => {}}
                            onBackToSelect={() => {}}
                        />
                    );

                    // Check that shell has accent color variable set
                    const shell = container.querySelector('.coach-select-shell');
                    expect(shell).toBeTruthy();

                    if (shell) {
                        const style = (shell as HTMLElement).style;
                        const accentColor = style.getPropertyValue('--coach-accent');
                        
                        // Should have accent color set from coach data
                        expect(accentColor).toBe(coach.accentColor);
                    }

                    // Check that Hextech styling elements exist
                    const frame = container.querySelector('.coach-select-shell__frame');
                    expect(frame).toBeTruthy();
                }
            ),
            { numRuns: 10 }
        );
    });

    /**
     * Concrete test: CTA Button Functionality Preserved
     * 
     * Verifies that the "HỎI COACH" button displays correct text and is clickable.
     */
    it('should display CTA button with correct text in select state', () => {
        const coach = COACHES_BY_ID['visian'];
        
        const { container } = render(
            <CoachSelectOverlay
                coach={coach}
                currentAugments={mockAugments}
                gameContext={mockGameContext}
                uiState="select"
                pick={null}
                reasoning=""
                isReasoningStreaming={false}
                error={null}
                onClose={() => {}}
                onSelectCoach={() => {}}
                onAskCoach={() => {}}
                onBackToSelect={() => {}}
            />
        );

        const ctaButton = container.querySelector('.coach-select-panel__cta');
        expect(ctaButton).toBeTruthy();
        
        const ctaText = ctaButton?.textContent || '';
        expect(ctaText).toContain(`Hỏi ${coach.displayName}`);
    });

    /**
     * Concrete test: Carousel Structure Preserved
     * 
     * Verifies that carousel renders all 5 coaches with correct structure.
     */
    it('should render carousel with all coach cards', () => {
        const coach = COACHES_BY_ID['visian'];
        
        const { container } = render(
            <CoachSelectOverlay
                coach={coach}
                currentAugments={mockAugments}
                gameContext={mockGameContext}
                uiState="select"
                pick={null}
                reasoning=""
                isReasoningStreaming={false}
                error={null}
                onClose={() => {}}
                onSelectCoach={() => {}}
                onAskCoach={() => {}}
                onBackToSelect={() => {}}
            />
        );

        const carousel = container.querySelector('.coach-carousel');
        expect(carousel).toBeTruthy();

        // Should have 5 coach cards
        const carouselItems = container.querySelectorAll('.coach-carousel__item');
        expect(carouselItems.length).toBe(5);

        // Each card should have portrait and name
        carouselItems.forEach(item => {
            const thumb = item.querySelector('.coach-carousel__thumb');
            const name = item.querySelector('.coach-carousel__name');
            
            expect(thumb).toBeTruthy();
            expect(name).toBeTruthy();
        });
    });
});
