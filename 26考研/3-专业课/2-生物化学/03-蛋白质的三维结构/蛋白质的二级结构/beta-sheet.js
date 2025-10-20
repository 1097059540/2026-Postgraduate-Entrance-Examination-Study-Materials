// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化β折叠模型
    initBetaSheetModel();
});

/**
 * 初始化β折叠模型
 */
function initBetaSheetModel() {
    const container = document.getElementById('beta-sheet-model');
    const { scene, camera, renderer, controls } = setupThreeJSEnvironment(container);
    
    addLighting(scene);
    createBetaSheet(scene);
    addBetaSheetLabels(scene);
    
    setupModelControls('beta', controls, camera, scene, renderer);
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        
        // 更新标签位置
        if (container.updateLabels) {
            container.updateLabels.forEach(updateFn => updateFn(camera, renderer));
        }
        
        renderer.render(scene, camera);
    }
    animate();
}

/**
 * 设置Three.js环境
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} - 包含scene, camera, renderer, controls的对象
 */
function setupThreeJSEnvironment(container) {
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 添加轨道控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 创建信息提示元素
    const tooltip = document.createElement('div');
    tooltip.className = 'model-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);
    
    // 设置射线检测器和鼠标事件
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let intersectedObject = null;
    
    // 鼠标移动事件
    renderer.domElement.addEventListener('mousemove', function(event) {
        // 计算鼠标在画布中的标准化位置（-1到1之间）
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // 更新射线检测器
        raycaster.setFromCamera(mouse, camera);
        
        // 检测与模型对象的交点
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        // 重置之前的高亮对象
        if (intersectedObject) {
            if (intersectedObject.material.originalColor) {
                intersectedObject.material.color.set(intersectedObject.material.originalColor);
            }
            intersectedObject = null;
            tooltip.style.display = 'none';
        }
        
        // 处理新的交点
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // 检查对象是否有userData.info属性
            if (object.userData && object.userData.info) {
                // 保存原始颜色并高亮显示
                if (!object.material.originalColor) {
                    object.material.originalColor = object.material.color.getHex();
                }
                object.material.color.set(0xffff00); // 黄色高亮
                
                // 显示信息提示
                tooltip.textContent = object.userData.info;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX - rect.left + 10) + 'px';
                tooltip.style.top = (event.clientY - rect.top + 10) + 'px';
                
                intersectedObject = object;
            }
        }
    });
    
    // 窗口大小调整事件
    window.addEventListener('resize', function() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    return { scene, camera, renderer, controls };
}

/**
 * 添加光照
 * @param {THREE.Scene} scene - 场景
 */
function addLighting(scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // 定向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    
    // 添加第二个定向光以增强阴影效果
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.4);
    secondaryLight.position.set(-1, -1, -1).normalize();
    scene.add(secondaryLight);
}

/**
 * 设置模型控制按钮
 * @param {string} prefix - 按钮ID前缀
 * @param {THREE.OrbitControls} controls - 轨道控制器
 * @param {THREE.Camera} camera - 相机
 * @param {THREE.Scene} scene - 场景
 * @param {THREE.WebGLRenderer} renderer - 渲染器
 */
function setupModelControls(prefix, controls, camera, scene, renderer) {
    const rotateBtn = document.getElementById(`${prefix}-rotate`);
    const resetBtn = document.getElementById(`${prefix}-reset`);
    
    // 自动旋转按钮
    rotateBtn.addEventListener('click', function() {
        controls.autoRotate = !controls.autoRotate;
        this.textContent = controls.autoRotate ? '停止旋转' : '自动旋转';
    });
    
    // 重置视图按钮
    resetBtn.addEventListener('click', function() {
        // 使用TWEEN创建平滑动画
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 0, z: 15 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
            
        new TWEEN.Tween(controls.target)
            .to({ x: 0, y: 0, z: 0 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
            
        // 更新TWEEN动画
        function updateTween() {
            if (TWEEN.update()) {
                requestAnimationFrame(updateTween);
            }
            controls.update();
            renderer.render(scene, camera);
        }
        updateTween();
    });
}

/**
 * 创建β折叠模型
 * @param {THREE.Scene} scene - Three.js场景
 */
function createBetaSheet(scene) {
    // β折叠参数
    const width = 8;       // 折叠宽度
    const height = 6;      // 折叠高度
    const depth = 0.5;     // 折叠厚度
    const strands = 4;     // 链数量
    const strandGap = 1.2; // 链间距
    
    // 创建反平行β折叠
    for (let i = 0; i < strands; i++) {
        // 确定链的位置
        const z = (i - (strands - 1) / 2) * strandGap;
        
        // 创建折叠链（平面）
        const strandGeometry = new THREE.PlaneGeometry(width, depth);
        const strandMaterial = new THREE.MeshPhongMaterial({
            color: i % 2 === 0 ? 0x3f51b5 : 0x1a237e,
            side: THREE.DoubleSide
        });
        
        const strand = new THREE.Mesh(strandGeometry, strandMaterial);
        strand.userData = {
            type: 'strand',
            info: `β折叠链：${i % 2 === 0 ? '正向' : '反向'}排列的肽链，呈伸展状态。`
        };
        
        // 设置位置和旋转
        strand.position.set(0, 0, z);
        
        // 交替旋转链（反平行排列）
        if (i % 2 === 1) {
            strand.rotation.y = Math.PI;
        }
        
        // 应用褶皱效果
        applyRippleEffect(strand, width, i % 2 === 1);
        
        scene.add(strand);
        
        // 添加氨基酸残基（球体）
        const residuesPerStrand = 8;
        const residueSpacing = width / (residuesPerStrand - 1);
        
        for (let j = 0; j < residuesPerStrand; j++) {
            const x = (j * residueSpacing) - (width / 2);
            
            // 计算褶皱效果下的y坐标
            const rippleY = Math.sin(j * Math.PI / (residuesPerStrand - 1)) * 0.5;
            
            const residueGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const residueMaterial = new THREE.MeshPhongMaterial({
                color: 0xe74c3c,
                shininess: 100
            });
            
            const residue = new THREE.Mesh(residueGeometry, residueMaterial);
            residue.userData = {
                type: 'residue',
                info: '氨基酸残基：构成β折叠的基本单元，相邻残基间距约为0.35nm。'
            };
            
            // 设置残基位置，考虑褶皱效果
            residue.position.set(x, rippleY, z);
            
            scene.add(residue);
            
            // 添加侧链（交替朝上和朝下）
            if (j > 0 && j < residuesPerStrand - 1) { // 跳过两端的残基
                const sidechainDirection = j % 2 === 0 ? 1 : -1; // 交替朝向
                const sidechainLength = 0.8;
                
                const sidechainGeometry = new THREE.CylinderGeometry(0.1, 0.1, sidechainLength, 8);
                const sidechainMaterial = new THREE.MeshPhongMaterial({
                    color: 0x2ecc71,
                    shininess: 100
                });
                
                const sidechain = new THREE.Mesh(sidechainGeometry, sidechainMaterial);
                sidechain.userData = {
                    type: 'sidechain',
                    info: '氨基酸侧链：R基团，在β折叠中交替朝向折叠平面的上下两侧。'
                };
                
                // 定位侧链
                sidechain.position.set(
                    x,
                    rippleY + (sidechainDirection * sidechainLength / 2),
                    z
                );
                
                // 旋转侧链使其垂直于折叠平面
                sidechain.rotation.x = Math.PI / 2;
                
                scene.add(sidechain);
            }
        }
    }
    
    // 添加氢键连接相邻链
    for (let i = 0; i < strands - 1; i++) {
        const z1 = (i - (strands - 1) / 2) * strandGap;
        const z2 = ((i + 1) - (strands - 1) / 2) * strandGap;
        
        // 每条链上添加多个氢键
        const hbondsPerStrand = 4;
        
        for (let j = 0; j < hbondsPerStrand; j++) {
            const x = (j * width / (hbondsPerStrand - 1)) - (width / 2);
            
            // 计算褶皱效果下的y坐标
            const rippleY = Math.sin(j * Math.PI / (hbondsPerStrand - 1)) * 0.5;
            
            // 创建氢键（虚线）
            const hbondPoints = [];
            hbondPoints.push(new THREE.Vector3(x, rippleY, z1));
            hbondPoints.push(new THREE.Vector3(x, rippleY, z2));
            
            const hbondGeometry = new THREE.BufferGeometry().setFromPoints(hbondPoints);
            const hbondMaterial = new THREE.LineDashedMaterial({
                color: 0xf39c12,
                dashSize: 0.2,
                gapSize: 0.1,
                linewidth: 1
            });
            
            const hbond = new THREE.Line(hbondGeometry, hbondMaterial);
            hbond.computeLineDistances(); // 计算虚线距离
            hbond.userData = {
                type: 'hbond',
                info: '氢键：在β折叠中，相邻肽链间通过氢键连接稳定结构。'
            };
            scene.add(hbond);
        }
    }
}

/**
 * 应用褶皱效果到β折叠链
 * @param {THREE.Mesh} strand - 折叠链网格
 * @param {number} width - 链宽度
 * @param {boolean} reverse - 是否反向
 */
function applyRippleEffect(strand, width, reverse) {
    // 获取几何体顶点
    const geometry = strand.geometry;
    const positionAttribute = geometry.getAttribute('position');
    
    // 应用褶皱变形
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const normalizedX = (x + width/2) / width; // 归一化到0-1范围
        
        // 计算褶皱高度
        let rippleY = Math.sin(normalizedX * Math.PI) * 0.5;
        if (reverse) rippleY = -rippleY;
        
        positionAttribute.setY(i, rippleY);
    }
    
    // 更新几何体
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
}

/**
 * 添加β折叠特性标签
 * @param {THREE.Scene} scene - Three.js场景
 */
function addBetaSheetLabels(scene) {
    const container = document.getElementById('beta-sheet-model');
    
    // 初始化updateLabels数组
    if (!container.updateLabels) {
        container.updateLabels = [];
    }
    
    // 添加标签
    addFeatureLabel(container, '反平行排列', new THREE.Vector3(0, 2, 0));
    addFeatureLabel(container, '氢键连接', new THREE.Vector3(0, 0, 0));
    addFeatureLabel(container, '侧链交替朝向', new THREE.Vector3(-3, -1, 0));
    addFeatureLabel(container, '残基间距: 0.35nm', new THREE.Vector3(3, -1, 0));
}

/**
 * 添加特性标签
 * @param {HTMLElement} container - 容器元素
 * @param {string} text - 标签文本
 * @param {THREE.Vector3} position - 3D位置
 */
function addFeatureLabel(container, text, position) {
    // 创建标签容器
    const labelElement = document.createElement('div');
    labelElement.className = 'feature-label';
    labelElement.textContent = text;
    container.appendChild(labelElement);
    
    // 创建热点元素
    const hotspot = document.createElement('div');
    hotspot.className = 'feature-hotspot';
    container.appendChild(hotspot);
    
    // 鼠标悬停事件
    hotspot.addEventListener('mouseenter', () => {
        labelElement.classList.add('visible');
    });
    
    hotspot.addEventListener('mouseleave', () => {
        labelElement.classList.remove('visible');
    });
    
    // 创建更新函数
    const updatePosition = (camera, renderer) => {
        // 将3D坐标转换为屏幕坐标
        const vector = position.clone();
        vector.project(camera);
        
        // 转换为CSS坐标
        const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (-(vector.y * 0.5) + 0.5) * renderer.domElement.clientHeight;
        
        // 更新标签位置
        labelElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        hotspot.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        
        // 根据深度调整可见性
        if (vector.z > 1) {
            labelElement.style.display = 'none';
            hotspot.style.display = 'none';
        } else {
            labelElement.style.display = 'block';
            hotspot.style.display = 'block';
        }
    };
    
    // 添加到更新函数数组
    container.updateLabels.push(updatePosition);
}