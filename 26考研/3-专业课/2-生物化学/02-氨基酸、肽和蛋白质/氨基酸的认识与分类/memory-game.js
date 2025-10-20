document.addEventListener('DOMContentLoaded', function() {
    // 氨基酸数据
    const aminoAcids = [
        { name: "丙氨酸", code3: "Ala", code1: "A" },
        { name: "精氨酸", code3: "Arg", code1: "R" },
        { name: "天冬酰胺", code3: "Asn", code1: "N" },
        { name: "天冬氨酸", code3: "Asp", code1: "D" },
        { name: "半胱氨酸", code3: "Cys", code1: "C" },
        { name: "谷氨酰胺", code3: "Gln", code1: "Q" },
        { name: "谷氨酸", code3: "Glu", code1: "E" },
        { name: "甘氨酸", code3: "Gly", code1: "G" },
        { name: "组氨酸", code3: "His", code1: "H" },
        { name: "异亮氨酸", code3: "Ile", code1: "I" },
        { name: "亮氨酸", code3: "Leu", code1: "L" },
        { name: "赖氨酸", code3: "Lys", code1: "K" },
        { name: "甲硫氨酸", code3: "Met", code1: "M" },
        { name: "苯丙氨酸", code3: "Phe", code1: "F" },
        { name: "脯氨酸", code3: "Pro", code1: "P" },
        { name: "丝氨酸", code3: "Ser", code1: "S" },
        { name: "苏氨酸", code3: "Thr", code1: "T" },
        { name: "色氨酸", code3: "Trp", code1: "W" },
        { name: "酪氨酸", code3: "Tyr", code1: "Y" },
        { name: "缬氨酸", code3: "Val", code1: "V" }
    ];
    
    // DOM元素
    const gameContainer = document.getElementById('memoryGame');
    const selectedCountElement = document.getElementById('selectedCount');
    const remainingTilesElement = document.getElementById('remainingTiles');
    const resetBtn = document.getElementById('resetBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const successModal = document.getElementById('successModal');
    const easyModeBtn = document.getElementById('easyMode');
    const hardModeBtn = document.getElementById('hardMode');
    const referenceTableBody = document.getElementById('referenceTableBody');
    const referenceTable = document.getElementById('referenceTable');
    
    // 游戏状态
    let selectedTiles = [];
    let matchedAminoAcids = [];
    let remainingTiles = 60;
    let isHardMode = false;
    
    // 初始化游戏
    function initGame() {
        // 清空游戏容器
        gameContainer.innerHTML = '';
        
        // 重置游戏状态
        selectedTiles = [];
        matchedAminoAcids = [];
        remainingTiles = 60;
        updateGameInfo();
        
        // 创建氨基酸数据集（每种氨基酸的中文名、三字母代码和单字母代码）
        let nameData = [];
        let code3Data = [];
        let code1Data = [];
        
        // 打乱氨基酸顺序
        const shuffledAminoAcids = shuffleArray([...aminoAcids]);
        
        shuffledAminoAcids.forEach(acid => {
            nameData.push({ text: acid.name, type: 'name', acid: acid.name });
            code3Data.push({ text: acid.code3, type: 'code3', acid: acid.name });
            code1Data.push({ text: acid.code1, type: 'code1', acid: acid.name });
        });
        
        // 打乱每种类型内部的顺序
        nameData = shuffleArray(nameData);
        code3Data = shuffleArray(code3Data);
        code1Data = shuffleArray(code1Data);
        
        // 创建6×10的网格
        // 左边两列显示名称，中间两列显示三字母缩写，右边两列显示单字母缩写
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 6; col++) {
                let tileData;
                let tileType;
                
                if (col < 2) {
                    // 左边两列显示名称
                    tileData = nameData[row * 2 + (col % 2)];
                    tileType = 'name-tile';
                } else if (col < 4) {
                    // 中间两列显示三字母缩写
                    tileData = code3Data[row * 2 + (col % 2)];
                    tileType = 'code3-tile';
                } else {
                    // 右边两列显示单字母缩写
                    tileData = code1Data[row * 2 + (col % 2)];
                    tileType = 'code1-tile';
                }
                
                const tileElement = document.createElement('div');
                tileElement.className = `memory-tile ${tileType}`;
                tileElement.textContent = tileData.text;
                tileElement.dataset.acid = tileData.acid;
                tileElement.dataset.type = tileData.type;
                
                // 添加点击事件
                tileElement.addEventListener('click', handleTileClick);
                
                // 添加到游戏容器
                gameContainer.appendChild(tileElement);
            }
        }
        
        // 生成参考表格
        generateReferenceTable();
        
        // 隐藏成功模态框
        successModal.classList.remove('show');
    }
    
    // 生成参考表格
    function generateReferenceTable() {
        referenceTableBody.innerHTML = '';
        
        aminoAcids.forEach(acid => {
            const row = document.createElement('tr');
            row.dataset.acid = acid.name;
            row.className = 'pending';
            
            const nameCell = document.createElement('td');
            nameCell.textContent = acid.name;
            
            const code3Cell = document.createElement('td');
            code3Cell.textContent = acid.code3;
            code3Cell.className = 'hidden-in-hard';
            
            const code1Cell = document.createElement('td');
            code1Cell.textContent = acid.code1;
            code1Cell.className = 'hidden-in-hard';
            
            row.appendChild(nameCell);
            row.appendChild(code3Cell);
            row.appendChild(code1Cell);
            
            referenceTableBody.appendChild(row);
        });
        
        // 设置表格模式
        setTableMode();
    }
    
    // 设置表格模式（简单/困难）
    function setTableMode() {
        if (isHardMode) {
            referenceTable.classList.add('hard-mode');
        } else {
            referenceTable.classList.remove('hard-mode');
        }
    }
    
    // 更新表格中的氨基酸状态
    function updateReferenceTable(acidName, isCompleted) {
        const row = referenceTableBody.querySelector(`tr[data-acid="${acidName}"]`);
        if (row) {
            row.className = isCompleted ? 'completed' : 'pending';
        }
    }
    
    // 处理方块点击
    function handleTileClick(e) {
        const tile = e.target;
        
        // 如果方块已经被匹配，则忽略点击
        if (tile.classList.contains('matched')) {
            return;
        }
        
        // 如果方块已经被选中，则取消选中
        if (tile.classList.contains('selected')) {
            tile.classList.remove('selected');
            selectedTiles = selectedTiles.filter(selected => selected !== tile);
            updateGameInfo();
            return;
        }
        
        // 选中方块
        tile.classList.add('selected');
        selectedTiles.push(tile);
        updateGameInfo();
        
        // 检查是否已选择了3个方块
        if (selectedTiles.length === 3) {
            checkMatch();
        }
    }
    
    // 检查匹配
    function checkMatch() {
        const acid1 = selectedTiles[0].dataset.acid;
        const acid2 = selectedTiles[1].dataset.acid;
        const acid3 = selectedTiles[2].dataset.acid;
        
        // 检查是否为同一种氨基酸的不同表示方式
        if (acid1 === acid2 && acid2 === acid3) {
            // 匹配成功
            setTimeout(() => {
                selectedTiles.forEach(tile => {
                    tile.classList.add('matched');
                    tile.classList.remove('selected');
                });
                
                // 更新已匹配的氨基酸列表
                if (!matchedAminoAcids.includes(acid1)) {
                    matchedAminoAcids.push(acid1);
                    
                    // 更新参考表格
                    updateReferenceTable(acid1, true);
                }
                
                // 更新剩余方块数
                remainingTiles -= 3;
                updateGameInfo();
                
                // 清空选中的方块
                selectedTiles = [];
                
                // 检查游戏是否完成
                checkGameCompletion();
            }, 500);
        } else {
            // 匹配失败
            setTimeout(() => {
                selectedTiles.forEach(tile => {
                    tile.classList.remove('selected');
                });
                selectedTiles = [];
                updateGameInfo();
            }, 1000);
        }
    }
    
    // 更新游戏信息
    function updateGameInfo() {
        selectedCountElement.textContent = selectedTiles.length;
        remainingTilesElement.textContent = remainingTiles;
    }
    
    // 检查游戏是否完成
    function checkGameCompletion() {
        if (remainingTiles === 0) {
            // 游戏完成，显示成功模态框
            setTimeout(() => {
                successModal.classList.add('show');
            }, 500);
        }
    }
    
    // 打乱数组
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // 切换游戏难度
    function toggleDifficulty(isHard) {
        isHardMode = isHard;
        
        // 更新按钮状态
        easyModeBtn.classList.toggle('active', !isHard);
        hardModeBtn.classList.toggle('active', isHard);
        
        // 更新表格模式
        setTableMode();
        
        // 重新开始游戏
        initGame();
    }
    
    // 事件监听器
    easyModeBtn.addEventListener('click', () => toggleDifficulty(false));
    hardModeBtn.addEventListener('click', () => toggleDifficulty(true));
    resetBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
}); 