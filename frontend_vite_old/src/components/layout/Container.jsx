import React from 'react';

const Container = ({ children, className = '', ...props }) => {
    return (
        <div className={`container container-custom ${className}`.trim()} {...props}>
            {children}
        </div>
    );
};

export default Container;
