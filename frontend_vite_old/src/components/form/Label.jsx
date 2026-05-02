import React from 'react';

const Label = ({ children, className = '', ...props }) => {
    return (
        <label className={`form-label-custom ${className}`.trim()} {...props}>
            {children}
        </label>
    );
};

export default Label;
