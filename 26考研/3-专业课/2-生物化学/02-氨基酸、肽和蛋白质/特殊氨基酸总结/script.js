/**
 * 特殊氨基酸分类总结网页交互脚本
 * 实现平滑滚动、表格排序、返回顶部等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 添加平滑滚动效果
    setupSmoothScrolling();
    
    // 添加表格排序功能
    setupTableSorting();
    
    // 添加返回顶部按钮
    setupScrollToTop();
    
    // 添加表格搜索功能
    setupTableSearch();
    
    // 添加响应式导航菜单
    setupResponsiveNav();
    
    // 添加页脚链接功能
    setupFooterLinks();
    
    // 添加滚动动画
    setupScrollAnimation();
});

/**
 * 设置平滑滚动效果
 */
function setupSmoothScrolling() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('nav a');
    
    // 为每个链接添加点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标元素
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            // 平滑滚动到目标元素
            if (targetElement) {
                // 获取header高度，用于偏移计算
                const headerHeight = document.querySelector('header').offsetHeight;
                
                // 计算目标位置（考虑header高度）
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                // 平滑滚动
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 设置表格排序功能
 */
function setupTableSorting() {
    // 获取所有表格
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        
        // 为每个表头添加点击事件
        headers.forEach((header, index) => {
            // 添加排序图标和样式
            header.style.cursor = 'pointer';
            header.innerHTML += ' <i class="fas fa-sort"></i>';
            
            // 添加点击事件
            header.addEventListener('click', function() {
                sortTable(table, index);
                
                // 更新排序图标
                updateSortIcon(this, headers);
            });
        });
    });
}

/**
 * 排序表格
 * @param {HTMLTableElement} table - 要排序的表格
 * @param {number} columnIndex - 排序的列索引
 */
function sortTable(table, columnIndex) {
    let rows = Array.from(table.querySelectorAll('tbody tr'));
    let sortDirection = table.getAttribute('data-sort-direction') === 'asc' ? 'desc' : 'asc';
    
    // 更新表格排序方向
    table.setAttribute('data-sort-direction', sortDirection);
    table.setAttribute('data-sort-column', columnIndex);
    
    // 排序行
    rows.sort((rowA, rowB) => {
        const cellA = rowA.querySelectorAll('td')[columnIndex].textContent.trim();
        const cellB = rowB.querySelectorAll('td')[columnIndex].textContent.trim();
        
        // 检查是否为数字
        const numA = parseFloat(cellA);
        const numB = parseFloat(cellB);
        
        if (!isNaN(numA) && !isNaN(numB)) {
            return sortDirection === 'asc' ? numA - numB : numB - numA;
        } else {
            return sortDirection === 'asc' 
                ? cellA.localeCompare(cellB, 'zh-CN') 
                : cellB.localeCompare(cellA, 'zh-CN');
        }
    });
    
    // 重新添加排序后的行
    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));
}

/**
 * 更新排序图标
 * @param {HTMLElement} clickedHeader - 被点击的表头
 * @param {NodeList} allHeaders - 所有表头
 */
function updateSortIcon(clickedHeader, allHeaders) {
    // 重置所有图标
    allHeaders.forEach(header => {
        const icon = header.querySelector('i');
        icon.className = 'fas fa-sort';
    });
    
    // 更新当前列的图标
    const table = clickedHeader.closest('table');
    const sortDirection = table.getAttribute('data-sort-direction');
    const icon = clickedHeader.querySelector('i');
    
    icon.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
}

/**
 * 设置返回顶部按钮
 */
function setupScrollToTop() {
    // 创建返回顶部按钮
    const scrollTopButton = document.createElement('div');
    scrollTopButton.className = 'scroll-top';
    scrollTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollTopButton);
    
    // 监听滚动事件，控制按钮显示/隐藏
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopButton.classList.add('visible');
        } else {
            scrollTopButton.classList.remove('visible');
        }
    });
    
    // 点击返回顶部
    scrollTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * 设置表格搜索功能
 */
function setupTableSearch() {
    // 为每个部分添加搜索框
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        const tables = section.querySelectorAll('table');
        
        if (tables.length > 0) {
            // 创建搜索框
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.innerHTML = `
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" class="search-input" placeholder="搜索表格内容...">
                </div>
            `;
            
            // 插入到表格前
            const firstTable = tables[0];
            firstTable.parentNode.insertBefore(searchContainer, firstTable);
            
            // 添加搜索事件
            const searchInput = searchContainer.querySelector('.search-input');
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                
                // 搜索所有表格
                tables.forEach(table => {
                    const rows = table.querySelectorAll('tbody tr');
                    
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        if (text.includes(searchTerm)) {
                            row.style.display = '';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                });
            });
        }
    });
    
    // 添加搜索框样式
    const style = document.createElement('style');
    style.textContent = `
        .search-container {
            margin-bottom: 1rem;
        }
        
        .search-box {
            display: flex;
            align-items: center;
            background-color: #f5f5f5;
            border-radius: 4px;
            padding: 0.5rem;
            border: 1px solid #e0e0e0;
        }
        
        .search-box i {
            color: #757575;
            margin-right: 0.5rem;
        }
        
        .search-input {
            border: none;
            background: transparent;
            flex-grow: 1;
            outline: none;
            font-size: 1rem;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 设置响应式导航菜单
 */
function setupResponsiveNav() {
    const header = document.querySelector('header .container');
    const nav = document.querySelector('nav');
    
    // 创建菜单按钮
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    header.insertBefore(menuButton, nav);
    
    // 添加菜单按钮样式
    const style = document.createElement('style');
    style.textContent = `
        .menu-toggle {
            display: none;
            background: transparent;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
        }
        
        @media (max-width: 768px) {
            .menu-toggle {
                display: block;
                position: absolute;
                top: 1.5rem;
                right: 1.5rem;
            }
            
            nav {
                display: none;
                width: 100%;
                margin-top: 1rem;
            }
            
            nav.active {
                display: block;
            }
            
            header .container {
                position: relative;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 添加点击事件
    menuButton.addEventListener('click', function() {
        nav.classList.toggle('active');
        
        // 更新图标
        const icon = this.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });
}

/**
 * 设置页脚链接功能
 */
function setupFooterLinks() {
    // 获取页脚链接
    const footerLinks = document.querySelectorAll('.footer-links a');
    
    // 为每个链接添加功能
    footerLinks.forEach(link => {
        const icon = link.querySelector('i');
        
        // 根据图标类型添加不同功能
        if (icon.classList.contains('fa-print')) {
            // 打印功能
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.print();
            });
        } else if (icon.classList.contains('fa-share-alt')) {
            // 分享功能
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 如果浏览器支持Web Share API
                if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        url: window.location.href
                    }).catch(console.error);
                } else {
                    // 复制链接到剪贴板
                    const tempInput = document.createElement('input');
                    tempInput.value = window.location.href;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    
                    // 显示提示
                    alert('链接已复制到剪贴板！');
                }
            });
        } else if (icon.classList.contains('fa-file-pdf')) {
            // PDF下载功能（这里仅模拟，实际需要服务器端支持）
            link.addEventListener('click', function(e) {
                e.preventDefault();
                alert('PDF功能需要服务器支持，此处为演示。');
                // 实际实现可能需要调用服务器API或使用专门的PDF生成库
            });
        }
    });
}

/**
 * 设置滚动动画
 */
function setupScrollAnimation() {
    // 获取所有需要动画的元素
    const animatedElements = document.querySelectorAll('.section');
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 当元素进入视口
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeIn');
                // 观察过后不再观察
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 当10%的元素可见时触发
    });
    
    // 观察每个元素
    animatedElements.forEach(element => {
        // 移除可能已有的动画类
        element.classList.remove('animate__animated', 'animate__fadeIn');
        observer.observe(element);
    });
}