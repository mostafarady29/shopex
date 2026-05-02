import React from 'react';

/**
 * Button Component based on the SaaS Hub Design System
 */
const Button = ({
    children,
    variant = 'primary', // primary, outline-primary, secondary, success, danger
    size = '', // sm, lg, icon
    className = '',
    icon,
    ...props
}) => {
    const baseClass = 'btn-custom';
    const variantClass = variant ? `btn-${variant}` : '';
    const sizeClass = size ? (size === 'icon' ? 'btn-icon' : `btn-${size}`) : '';

    return (
        <button
            type={props.type || "button"}
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
            {...props}
        >
            {icon && <i className={`bi ${icon}`}></i>}
            {children}
        </button>
    );
};

export default Button;
