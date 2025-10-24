import React, { useState, useMemo } from 'react';
import { useDispatchCart } from './ContextReducer'; // use your context dispatch

export default function Cards({ item }) {
  const dispatch = useDispatchCart();

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('regular');
  const options = item && Array.isArray(item.options) ? item.options : [];
  const priceObj = options.length > 0 && options[0] ? options[0] : {};

  const getPriceFor = (sz) => {
    if (!priceObj || Object.keys(priceObj).length === 0) return 0;
    if (priceObj[sz] != null) return Number(priceObj[sz]);
    if (sz === 'regular' && priceObj.half != null) return Number(priceObj.half);
    if (sz === 'full' && priceObj.full != null) return Number(priceObj.full);
    if (sz === 'medium') {
      if (priceObj.full != null && priceObj.half != null) {
        return Math.round((Number(priceObj.full) + Number(priceObj.half)) / 2);
      }
      if (priceObj.full != null) return Number(priceObj.full);
      if (priceObj.half != null) return Number(priceObj.half);
    }
    const v = Object.values(priceObj).find(vv => !isNaN(Number(vv)));
    return v ? Number(v) : 0;
  };

  const unitPrice = useMemo(() => getPriceFor(size), [size, JSON.stringify(priceObj)]);
  const total = useMemo(() => unitPrice * qty, [unitPrice, qty]);

  if (!item) return null;

  const handleAddToCart = () => {
    const payload = {
      _id: item._id || item.id || item.name, // keep an identifier
      name: item.name,
      img: item.img,
      qty: Number(qty),
      size,
      unitPrice: Number(unitPrice),
      totalPrice: Number(total),
      options: item.options || [],
    };
    // dispatch to cart - reducer should store payload (including unitPrice/totalPrice)
    dispatch({ type: 'ADD_TO_CART', payload });
    // optional small feedback
    console.log('Added to cart:', payload);
  };

  return (
    <>
      <div className='card mt-3' style={{ width: '18rem', maxHeight: '360px' }}>
        <img
          src={item.img || 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg'}
          className='card-img-top'
          alt={item.name || 'Food'}
          style={{ height: 160, objectFit: 'cover' }}
        />
        <div className='card-body'>
          <h5 className='card-title mt-2'>{item.name}</h5>
          <div className='d-flex gap-2 align-items-center mb-2'>
            <select
              className='form-select'
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              aria-label='Quantity'
              style={{ width: 80 }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              className='form-select'
              value={size}
              onChange={e => setSize(e.target.value)}
              aria-label='Size'
              style={{ minWidth: 150 }}
            >
              <option value='regular'>Half — ₹{getPriceFor('regular') || getPriceFor('half') || '-'}</option>
              <option value='medium'>Medium — ₹{getPriceFor('medium') || '-'}</option>
              <option value='full'>Full — ₹{getPriceFor('full') || '-'}</option>
            </select>
          </div>
        </div>
        <div className='card-footer d-flex justify-content-between align-items-center'>
          <div className='small text-muted'>Total Price:</div>
          <div className='fw-bold fs-5'>₹{isNaN(total) ? '0' : total.toFixed(0)}</div>
          <button className='btn btn-success ms-2' onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </>
  );
}
