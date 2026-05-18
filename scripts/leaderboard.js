async function loadLeaderboard() {
    try {
        const { fetchOrders, fetchHeroProducts } = await import('./services/db-service.js');
        const data = await fetchOrders();
        const dataProducts = await fetchHeroProducts();
        const podiumContainer = document.querySelector('.podium-container');
        const datalist = [];
        data.forEach(order => {
            order.items.forEach(item => {
                datalist.push({ id: item.productId, quantity: item.quantity });
            });
        });

    const dataList = Object.values(datalist.reduce((acc, cur) => {
        if (acc[cur.id]) {
            acc[cur.id].quantity += cur.quantity;
        } else {
            acc[cur.id] = { ...cur };
        }
        return acc;
    }, {}));

    const dataListSorted = dataList.sort((a, b) => b.quantity - a.quantity);
    const top3 = dataListSorted.slice(0, 3);

    const podiumOrder = [1, 0, 2]; 
    const rankConfig = [
        { rank: 2, baseClass: 'base-2', crown: false },
        { rank: 1, baseClass: 'base-1', crown: true },
        { rank: 3, baseClass: 'base-3', crown: false },
    ];

    podiumContainer.innerHTML = podiumOrder.map((sortedIndex, i) => {
        const item = top3[sortedIndex];
        const product = dataProducts.find(p => p.id === item.id);


        const { rank, baseClass, crown } = rankConfig[i];
        return `
            <div class="podium-item rank-${rank}">
                <div class="podium-product">
                    ${crown ? '<div class="crown-icon"><i class="fa-solid fa-crown"></i></div>' : ''}
                    <div class="rank-badge">${rank}</div>
                    <img src="${product.image}" alt="${product.name}">
                    <div class="podium-info">
                        <h3>${product.name}</h3>
                        <p>${item.quantity.toLocaleString('vi-VN')} lượt mua</p>
                    </div>
                </div>
                <div class="podium-base ${baseClass}"></div>
            </div>
        `;
    }).join('');

    const rankList = document.querySelector('.rank-list');
    const restItems = dataListSorted.slice(3);

    rankList.innerHTML = restItems.map((item, i) => {
        const product = dataProducts.find(p => p.id === item.id);
        const rank = 4 + i;
        const trend = Math.random() > 0.5;
        const trendPercent = Math.floor(Math.random() * 30) + 1;

        if (!product) return '';

        return `
            <div class="rank-list-item">
                <div class="rank-num">${rank}</div>
                <div class="rank-img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="rank-details">
                    <h4>${product.name}</h4>
                    <p>${product.subtitle || 'Đặc biệt được yêu thích'}</p>
                </div>
                <div class="rank-stats">
                    <span class="trend ${trend ? 'up' : 'down'}">
                        <i class="fa-solid fa-arrow-trend-${trend ? 'up' : 'down'}"></i>
                        ${trend ? '+' : '-'}${trendPercent}%
                    </span>
                    <span class="score">${item.quantity.toLocaleString('vi-VN')}</span>
                </div>
            </div>
        `;
    }).join('');
    } catch (error) {
        console.error('Lỗi load leaderboard:', error);
        document.querySelector('.podium-container').innerHTML = '<p>Lỗi tải dữ liệu</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadLeaderboard);
