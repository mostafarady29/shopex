import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
    const { id, name, category, price, originalPrice, image, rating, badge } = product;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <div
            className="product-card"
            data-product-id={id}
            data-category={category}
        >
            <Link to={`/products/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="product-card-image">
                    <img src={image} alt={name} loading="lazy" />
                    {badge && (
                        <span className={`product-badge ${badge}`}>
                            {badge === 'sale' ? 'Sale' : 'New'}
                        </span>
                    )}
                </div>

                <div className="product-card-body">
                    <p className="product-category">{category}</p>
                    <h3 className="product-title">{name}</h3>
                    <div className="product-rating" aria-label={`Rating: ${rating} out of 5`}>
                        {[...Array(fullStars)].map((_, i) => (
                            <i key={`full-${i}`} className="bi bi-star-fill" aria-hidden="true"></i>
                        ))}
                        {hasHalfStar && <i className="bi bi-star-half" aria-hidden="true"></i>}
                        <span className="product-rating-count">({rating})</span>
                    </div>
                    <div className="product-price">
                        <span>${price.toFixed(2)}</span>
                        {originalPrice && (
                            <span className="product-price-original">${originalPrice.toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </Link>

            <div className="product-card-footer">
                <button
                    className="add-to-cart-btn"
                    onClick={(e) => { e.preventDefault(); onAddToCart && onAddToCart(product); }}
                    aria-label={`Add ${name} to cart`}
                >
                    <i className="bi bi-bag-plus" aria-hidden="true"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
