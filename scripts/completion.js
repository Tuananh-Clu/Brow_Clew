document.addEventListener('DOMContentLoaded', () => {
  const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));

  if (!lastOrder) {
    window.location.href = 'product.html';
    return;
  }

  const orderDate = new Date(lastOrder.date);
  const estimatedTime = new Date(orderDate.getTime() + 30 * 60000);

  document.getElementById('orderNumber').textContent = lastOrder.id;
  document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  document.getElementById('orderTime').textContent = orderDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('totalPrice').textContent = Math.round(lastOrder.total).toLocaleString('vi-VN') + 'đ';

  const now = new Date();
  const timeLeft = Math.max(0, Math.round((estimatedTime - now) / 60000));
  document.getElementById('estimatedTime').textContent = timeLeft > 0 ? timeLeft + ' phút' : 'Đang giao';
});
