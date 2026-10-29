// NicaLogistics Cart Manager (Client-side localStorage with Stock Restrictions)

export const getCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('nicalogistics_cart') || '[]');
  } catch {
    return [];
  }
};

export const addToCart = (product, quantity = 1) => {
  if (typeof window === 'undefined') return { success: false, message: 'Entorno no soportado' };
  
  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === product.id);
  const currentQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
  const newQty = currentQty + quantity;

  if (newQty > product.stockActual) {
    return {
      success: false,
      message: `Stock insuficiente. Disponible: ${product.stockActual} unid.`
    };
  }

  const skuVal = product.codigoSku || product.sku || 'N/A';

  if (existingIndex > -1) {
    cart[existingIndex].quantity = newQty;
    // ensure sku is updated if it was previously undefined
    if (!cart[existingIndex].sku || cart[existingIndex].sku === 'undefined') {
      cart[existingIndex].sku = skuVal;
      cart[existingIndex].codigoSku = skuVal;
    }
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      sku: skuVal,
      codigoSku: skuVal,
      precio: product.precio,
      stockActual: product.stockActual,
      categoriaNombre: product.categoriaNombre,
      imagenUrl: product.imagenUrl,
      quantity: quantity
    });
  }

  localStorage.setItem('nicalogistics_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));

  return {
    success: true,
    message: `¡${product.nombre} añadido al carrito!`
  };
};

export const updateCartItemQuantity = (productId, newQuantity, maxStock) => {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  const validQty = Math.max(1, Math.min(newQuantity, maxStock !== undefined ? maxStock : item.stockActual));
  item.quantity = validQty;

  localStorage.setItem('nicalogistics_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const removeFromCart = (productId) => {
  if (typeof window === 'undefined') return;
  const cart = getCart().filter(item => item.id !== productId);
  localStorage.setItem('nicalogistics_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const clearCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('nicalogistics_cart');
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
};
