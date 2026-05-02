import React from 'react';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={`form-control-custom ${className}`.trim()}
            {...props}
        />
    );
});

Input.displayName = 'Input';

export default Input;
