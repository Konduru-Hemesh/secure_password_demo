import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
    Search
} from 'lucide-react';
import React, { useRef, useState } from 'react';

const cx = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface Shortcut {
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

interface SearchResult {
    icon: React.ReactNode;
    label: string;
    description: string;
    onClick?: () => void;
}

const SVGFilter = () => {
    return (
        <svg width="0" height="0">
            <filter id="blob">
                <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
                <feColorMatrix
                    values="
      1 0 0 0 0
      0 1 0 0 0
      0 0 1 0 0
      0 0 0 18 -9
    "
                    result="blob"
                />
                <feBlend in="SourceGraphic" in2="blob" />
            </filter>
        </svg>
    );
};

interface ShortcutButtonProps {
    icon: React.ReactNode;
    onClick?: () => void;
}

const ShortcutButton = ({ icon, onClick }: ShortcutButtonProps) => {
    return (
        <div onClick={(e) => { e.stopPropagation(); onClick?.(); }} className="rounded-full cursor-pointer hover:shadow-lg opacity-30 hover:opacity-100 transition-[opacity,shadow] duration-200">
            <div className="size-10 lg:size-12 aspect-square flex items-center justify-center bg-card border border-border/50 text-foreground">{icon}</div>
        </div>
    );
};

interface SpotlightPlaceholderProps {
    text: string;
    className?: string;
}

const SpotlightPlaceholder = ({ text, className }: SpotlightPlaceholderProps) => {
    return (
        <motion.div
            layout
            className={cx('absolute text-muted-foreground flex items-center pointer-events-none z-10', className)}
        >
            <AnimatePresence mode="popLayout">
                <motion.p
                    layoutId={`placeholder-${text}`}
                    key={`placeholder-${text}`}
                    initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                    {text}
                </motion.p>
            </AnimatePresence>
        </motion.div>
    );
};

interface SpotlightInputProps {
    placeholder: string;
    hidePlaceholder: boolean;
    value: string;
    onChange: (value: string) => void;
    placeholderClassName?: string;
}

const SpotlightInput = ({
    placeholder,
    hidePlaceholder,
    value,
    onChange,
    placeholderClassName
}: SpotlightInputProps) => {
    return (
        <div className="flex items-center w-full justify-start gap-3 px-5 h-12">
            <motion.div layoutId="search-icon" className="text-muted-foreground">
                <Search className="w-4 h-4" />
            </motion.div>
            <div className="flex-1 relative text-sm h-full flex items-center">
                {!hidePlaceholder && (
                    <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
                )}

                <motion.input
                    layout="position"
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-full bg-transparent outline-none ring-0 text-foreground"
                />
            </div>
        </div>
    );
};

interface SearchResultCardProps extends SearchResult {
    isLast: boolean;
}

const SearchResultCard = ({ icon, label, description, onClick, isLast }: SearchResultCardProps) => {
    return (
        <div onClick={onClick} className="overflow-hidden w-full group/card cursor-pointer">
            <div
                className={cx(
                    'flex items-center text-foreground justify-start hover:bg-foreground/5 gap-3 py-2 px-3 rounded-xl hover:shadow-md w-full transition-colors',
                    isLast && 'rounded-b-2xl'
                )}
            >
                <div className="size-8 [&_svg]:stroke-[1.5] [&_svg]:size-5 aspect-square flex items-center justify-center bg-card border border-border/50 rounded-lg">
                    {icon}
                </div>
                <div className="flex flex-col">
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex-1 flex items-center justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 text-muted-foreground">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

interface SearchResultsContainerProps {
    searchResults: SearchResult[];
    onHover: (index: number | null) => void;
}

const SearchResultsContainer = ({ searchResults, onHover }: SearchResultsContainerProps) => {
    return (
        <motion.div
            layout
            onMouseLeave={() => onHover(null)}
            className="px-2 border-t border-border/50 flex flex-col bg-card/50 max-h-64 overflow-y-auto w-full py-2 custom-scrollbar"
        >
            {searchResults.map((result, index) => {
                return (
                    <motion.div
                        key={`search-result-${index}`}
                        onMouseEnter={() => onHover(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            delay: index * 0.05,
                            duration: 0.2,
                            ease: 'easeOut'
                        }}
                    >
                        <SearchResultCard
                            icon={result.icon}
                            label={result.label}
                            description={result.description}
                            onClick={result.onClick}
                            isLast={index === searchResults.length - 1}
                        />
                    </motion.div>
                );
            })}
        </motion.div>
    );
};

interface AppleSpotlightProps {
    shortcuts?: Shortcut[];
    searchResults?: SearchResult[];
    searchValue: string;
    onSearchChange: (val: string) => void;
    className?: string;
}

/** Component or function for Apple Spotlight. */
export const AppleSpotlight = ({
    shortcuts = [],
    searchResults = [],
    searchValue,
    onSearchChange,
    className
}: AppleSpotlightProps) => {
    const [hovered, setHovered] = useState(false);
    const [hoveredSearchResult, setHoveredSearchResult] = useState<number | null>(null);
    const [hoveredShortcut, setHoveredShortcut] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className={cx('relative', className)}>
            <SVGFilter />

            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => {
                    setHovered(false);
                    setHoveredShortcut(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ filter: 'url(#blob)' }}
                className={cx(
                    'w-full flex items-center justify-end gap-3 z-20 group relative',
                    '[&>div]:rounded-3xl [&>div]:backdrop-blur-xl',
                    '[&_svg]:stroke-[1.4]'
                )}
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        layoutId="search-input-container"
                        transition={{
                            layout: {
                                duration: 0.5,
                                type: 'spring',
                                bounce: 0.2
                            }
                        }}
                        className="flex flex-col items-center justify-start z-10 shadow-lg border border-border/50 bg-card/60 w-full overflow-hidden"
                        style={{ borderRadius: searchValue ? '1.5rem' : '1.5rem' }}
                    >
                        <SpotlightInput
                            placeholder={
                                hoveredShortcut !== null
                                    ? shortcuts[hoveredShortcut].label
                                    : hoveredSearchResult !== null && searchResults[hoveredSearchResult]
                                        ? searchResults[hoveredSearchResult].label
                                        : 'Search or type a command...'
                            }
                            placeholderClassName={
                                hoveredSearchResult !== null ? 'text-primary' : 'text-muted-foreground'
                            }
                            hidePlaceholder={!!(hoveredSearchResult !== null || searchValue)}
                            value={searchValue}
                            onChange={onSearchChange}
                        />

                        {searchValue && searchResults.length > 0 && (
                            <SearchResultsContainer
                                searchResults={searchResults}
                                onHover={setHoveredSearchResult}
                            />
                        )}
                    </motion.div>

                    {/* Shortcuts that pop out sideways on hover */}
                    {hovered &&
                        !searchValue &&
                        shortcuts.map((shortcut, index) => (
                            <motion.div
                                key={`shortcut-${index}`}
                                onMouseEnter={() => setHoveredShortcut(index)}
                                layout
                                initial={{ scale: 0.7, x: 1 * (48 * (index + 1)) }}
                                animate={{ scale: 1, x: 0 }}
                                exit={{
                                    scale: 0.7,
                                    x: -1 * (20 * (shortcuts.length - index - 1) + 48 * (shortcuts.length - index - 1))
                                }}
                                transition={{
                                    duration: 0.5,
                                    type: 'spring',
                                    bounce: 0.3,
                                    delay: index * 0.05
                                }}
                                className="absolute shrink-0 flex items-center"
                                style={{ left: `-${52 * (index + 1)}px` }} // position them to the left of the search bar
                            >
                                <ShortcutButton icon={shortcut.icon} onClick={shortcut.onClick} />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
