import React from 'react';

export const LiquidGlassSVGFilter = () => (
  <svg style={{ display: 'none', position: 'absolute' }} aria-hidden="true">
    <defs>
      <filter
        id="liquid-glass-filter"
        x="-10%" y="-10%"
        width="120%" height="120%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008"
          numOctaves="1"
          seed="5"
          result="turbulence"
        />
        <feGaussianBlur
          in="turbulence"
          stdDeviation="2"
          result="softMap"
        />
        <feSpecularLighting
          in="softMap"
          surfaceScale="4"
          specularConstant="0.6"
          specularExponent="25"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-5000" y="-10000" z="18000" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          in2="SourceGraphic"
          operator="arithmetic"
          k1="0" k2="1" k3="0.15" k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="litImage"
          in2="softMap"
          scale="18"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

type GlassLevel = 1 | 2 | 3;
type GlassVariant = 'light' | 'dark';

interface LiquidGlassProps {
  children: React.ReactNode;
  level?: GlassLevel;
  variant?: GlassVariant;
  className?: string;
  style?: React.CSSProperties;
  borderRadius?: number;
  onClick?: () => void;
  as?: React.ElementType;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  level = 1,
  variant = 'light',
  className = '',
  style = {},
  borderRadius = 20,
  onClick,
  as: Tag = 'div',
}) => {
  const level1Light: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(12px) saturate(160%) brightness(110%)',
    WebkitBackdropFilter: 'blur(12px) saturate(160%) brightness(110%)',
    border: '1px solid rgba(255, 255, 255, 0.30)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    borderRadius,
    position: 'relative',
    isolation: 'isolate' as const,
  };

  const level1Dark: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(14px) saturate(160%) brightness(105%)',
    WebkitBackdropFilter: 'blur(14px) saturate(160%) brightness(105%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
    borderRadius,
    position: 'relative',
    isolation: 'isolate' as const,
  };

  const level2Light: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.20)',
    backdropFilter: 'blur(16px) saturate(150%) brightness(114%)',
    WebkitBackdropFilter: 'blur(16px) saturate(150%) brightness(114%)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    borderRadius,
    position: 'relative',
    isolation: 'isolate' as const,
    boxShadow: [
      '0 8px 32px rgba(0, 0, 0, 0.18)',
      'inset 2px 2px 5px rgba(255, 255, 255, 0.40)',
      'inset -1px -1px 3px rgba(255, 255, 255, 0.12)',
      'inset 0 4px 20px rgba(255, 255, 255, 0.14)',
    ].join(', '),
  };

  const level2Dark: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.07)',
    backdropFilter: 'blur(16px) saturate(150%) brightness(108%)',
    WebkitBackdropFilter: 'blur(16px) saturate(150%) brightness(108%)',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius,
    position: 'relative',
    isolation: 'isolate' as const,
    boxShadow: [
      '0 8px 32px rgba(0, 0, 0, 0.40)',
      'inset 2px 2px 5px rgba(255, 255, 255, 0.18)',
      'inset -1px -1px 3px rgba(255, 255, 255, 0.06)',
      'inset 0 4px 20px rgba(255, 255, 255, 0.08)',
    ].join(', '),
  };

  const level3Extra: React.CSSProperties = {
    filter: 'url(#liquid-glass-filter)',
  };

  const baseStyle: React.CSSProperties = (() => {
    if (level === 1) return variant === 'dark' ? level1Dark : level1Light;
    if (level === 2) return variant === 'dark' ? level2Dark : level2Light;
    const l2 = variant === 'dark' ? level2Dark : level2Light;
    return { ...l2, ...level3Extra };
  })();

  const noiseDataUri = `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

  return (
    <Tag
      onClick={onClick}
      className={className}
      style={{
        ...baseStyle,
        ...style,
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {level >= 2 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            opacity: 0.025,
            backgroundImage: noiseDataUri,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {level >= 2 && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            border: '1px solid transparent',
            background: `linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.05)) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'contents' }}>
        {children}
      </span>
    </Tag>
  );
};

export default LiquidGlass;
