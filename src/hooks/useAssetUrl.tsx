import { useState } from 'react';
import { getAllAssetUrls, AssetType } from '../utils/assetUrlBuilder';

/**
 * Asset Image component with automatic fallback
 * When an image fails to load, it automatically tries the next URL in the fallback chain
 */
interface AssetImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    type: AssetType;
    name: string;
    alt: string;
}

export function AssetImage({ type, name, alt, className, style, ...props }: AssetImageProps) {
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const urls = getAllAssetUrls({ type, name });
    const currentUrl = urls[currentUrlIndex] || '';

    const handleError = () => {
        const nextIndex = currentUrlIndex + 1;
        if (nextIndex < urls.length) {
            setCurrentUrlIndex(nextIndex);
        } else {
            console.warn(`All asset URLs failed for ${type}: ${name}`, urls);
        }
    };

    return (
        <img
            src={currentUrl}
            alt={alt}
            className={className}
            style={style}
            onError={handleError}
            {...props}
        />
    );
}
