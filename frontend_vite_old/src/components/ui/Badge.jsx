import React from 'react';

/**
 * Badge Component based on the SaaS Hub Design System
 */
const Badge = ({
    children,
    variant = 'primary', // primary, success, warning, danger
    className = '',
    ...props
}) => {
    const baseClass = 'badge-custom';
    const variantClass = variant ? `badge-${variant}` : '';

    return (
        <span
            className={`${baseClass} ${variantClass} ${className}`.trim()}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
