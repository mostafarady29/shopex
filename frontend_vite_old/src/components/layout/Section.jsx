import React from 'react';

const Section = ({ children, className = '', id, ...props }) => {
    return (
        <section id={id} className={`section ${className}`.trim()} {...props}>
            {children}
        </section>
    );
};

export default Section;
