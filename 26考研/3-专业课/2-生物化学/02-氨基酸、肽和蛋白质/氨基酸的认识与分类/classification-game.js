document.addEventListener('DOMContentLoaded', function() {
    // 氨基酸数据
    const aminoAcids = [
        // A. 非极性脂肪族R基氨基酸
        { name: "甘氨酸", category: "A", fullName: "甘氨酸(α-氨基乙酸)" },
        { name: "丙氨酸", category: "A", fullName: "丙氨酸(α-氨基丙酸)" },
        { name: "缬氨酸", category: "A", fullName: "缬氨酸(β-叔戊基-α-氨酸)" },
        { name: "亮氨酸", category: "A", fullName: "亮氨酸(α-氨基-β-异丁基丙酸)" },
        { name: "异亮氨酸", category: "A", fullName: "异亮氨酸(α-氨基-γ-甲基戊酸)" },
        { name: "脯氨酸", category: "A", fullName: "脯氨酸(α-氨基-β-甲基戊酸)" },
        { name: "甲硫氨酸", category: "A", fullName: "甲硫氨酸(α-氨基-γ-甲硫基丁酸)" },
        
        // B. 芳香族R基氨基酸
        { name: "苯丙氨酸", category: "B", fullName: "苯丙氨酸(α-氨基-β-苯基丙酸)" },
        { name: "酪氨酸", category: "B", fullName: "酪氨酸(α-氨基-β-对羟基苯丙酸)" },
        { name: "色氨酸", category: "B", fullName: "色氨酸(α-氨基-β-吲哚基丙酸)" },
        
        // C. 极性、不带电荷的R基氨基酸
        { name: "丝氨酸", category: "C", fullName: "丝氨酸(α-氨基-β-羟基丙酸)" },
        { name: "苏氨酸", category: "C", fullName: "苏氨酸(α-氨基-β-羟基丁酸)" },
        { name: "半胱氨酸", category: "C", fullName: "半胱氨酸(α-氨基-β-巯基丙酸)" },
        { name: "天冬酰胺", category: "C", fullName: "天冬酰胺" },
        { name: "谷氨酰胺", category: "C", fullName: "谷氨酰胺" },
        
        // D. 带正电荷的(碱性)R基氨基酸
        { name: "赖氨酸", category: "D", fullName: "赖氨酸(α-ε-二氨基己酸)" },
        { name: "精氨酸", category: "D", fullName: "精氨酸(α-氨基-δ-胍基戊酸)" },
        { name: "组氨酸", category: "D", fullName: "组氨酸(α-氨基-β-咪唑基丙酸)" },
        
        // E. 带负电荷的(酸性)R基氨基酸
        { name: "天冬氨酸", category: "E", fullName: "天冬氨酸(α-氨基丁二酸)" },
        { name: "谷氨酸", category: "E", fullName: "谷氨酸(α-氨基戊二酸)" }
    ];
    
    // DOM元素
    const aminoAcidsContainer = document.getElementById('aminoAcids');
    const dropZones = document.querySelectorAll('.drop-zone');
    const resetBtn = document.getElementById('resetBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const successModal = document.getElementById('successModal');
    
    // 初始化游戏
    function initGame() {
        // 清空氨基酸容器
        aminoAcidsContainer.innerHTML = '';
        
        // 清空所有放置区域
        dropZones.forEach(zone => {
            zone.innerHTML = '';
        });
        
        // 打乱氨基酸顺序
        const shuffledAminoAcids = [...aminoAcids].sort(() => Math.random() - 0.5);
        
        // 创建氨基酸元素
        shuffledAminoAcids.forEach(acid => {
            const aminoAcidElement = document.createElement('div');
            aminoAcidElement.className = 'amino-acid';
            aminoAcidElement.textContent = acid.name;
            aminoAcidElement.setAttribute('draggable', 'true');
            aminoAcidElement.setAttribute('data-category', acid.category);
            aminoAcidElement.setAttribute('title', acid.fullName);
            
            // 添加拖拽事件监听器
            aminoAcidElement.addEventListener('dragstart', dragStart);
            
            // 添加到容器
            aminoAcidsContainer.appendChild(aminoAcidElement);
        });
        
        // 隐藏成功模态框
        successModal.classList.remove('show');
    }
    
    // 拖拽开始
    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.textContent);
        e.dataTransfer.setData('application/category', e.target.getAttribute('data-category'));
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }
    
    // 拖拽结束
    function dragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    // 允许放置
    function dragOver(e) {
        e.preventDefault();
        this.classList.add('highlight');
    }
    
    // 拖拽离开
    function dragLeave(e) {
        this.classList.remove('highlight');
    }
    
    // 放置
    function drop(e) {
        e.preventDefault();
        this.classList.remove('highlight');
        
        const aminoAcidName = e.dataTransfer.getData('text/plain');
        const aminoAcidCategory = e.dataTransfer.getData('application/category');
        const dropZoneCategory = this.parentElement.getAttribute('data-category');
        
        // 查找被拖拽的元素
        const draggedElement = Array.from(document.querySelectorAll('.amino-acid:not(.placed)')).find(el => el.textContent === aminoAcidName);
        
        if (!draggedElement) return;
        
        // 检查分类是否正确
        if (aminoAcidCategory === dropZoneCategory) {
            draggedElement.classList.add('correct', 'placed');
            this.appendChild(draggedElement);
            
            // 检查游戏是否完成
            checkGameCompletion();
        } else {
            // 分类错误，显示动画
            draggedElement.classList.add('incorrect');
            setTimeout(() => {
                draggedElement.classList.remove('incorrect');
            }, 500);
        }
    }
    
    // 检查游戏是否完成
    function checkGameCompletion() {
        const totalAminoAcids = aminoAcids.length;
        const placedAminoAcids = document.querySelectorAll('.amino-acid.placed').length;
        
        if (placedAminoAcids === totalAminoAcids) {
            // 游戏完成，显示成功模态框
            setTimeout(() => {
                successModal.classList.add('show');
            }, 500);
        }
    }
    
    // 添加事件监听器
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('dragleave', dragLeave);
        zone.addEventListener('drop', drop);
    });
    
    document.addEventListener('dragend', dragEnd);
    
    // 重置游戏
    resetBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
}); 