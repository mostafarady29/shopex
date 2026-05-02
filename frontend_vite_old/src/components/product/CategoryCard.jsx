import React from 'react';

const CategoryCard = ({ icon, title, description, onClick }) => {
    return (
        <div className="category-card animate-on-scroll hover-lift" onClick={onClick}>
            <div className="category-icon">
                <i className={`bi ${icon}`}></i>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

export default CategoryCard;
