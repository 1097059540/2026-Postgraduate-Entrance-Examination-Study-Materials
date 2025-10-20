// beta-turn.js - β转角模型的初始化和交互功能

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化β转角模型
    initBetaTurnModel();
});

/**
 * 初始化β转角模型
 */
function initBetaTurnModel() {
    const container = document.getElementById('beta-turn-model');
    const { scene, camera, renderer, controls } = setupThreeJSEnvironment(container);
    
    addLighting(scene);
    createBetaTurn(scene);
    addBetaTurnLabels(scene);
    
    setupModelControls('beta-turn', controls, camera, scene, renderer);
    
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
 * 创建β转角模型
 * @param {THREE.Scene} scene - Three.js场景
 */
function createBetaTurn(scene) {
    // β转角参数
    const turnRadius = 1.5;  // 转角半径
    const strandLength = 4;  // 链长度
    
    // 创建转角曲线
    const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-strandLength, 0, 0),
        new THREE.Vector3(-turnRadius, turnRadius, 0),
        new THREE.Vector3(turnRadius, turnRadius, 0),
        new THREE.Vector3(strandLength, 0, 0)
    );
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x3f51b5, linewidth: 3 });
    
    const turnCurve = new THREE.Line(geometry, material);
    turnCurve.userData = {
        type: 'backbone',
        info: 'β转角骨架：连接两个β链的转角结构，通常由4个氨基酸残基组成'
    };
    scene.add(turnCurve);
    
    // 添加氨基酸残基（球体）
    // 转角通常由4个氨基酸残基组成
    const turnResidues = 4;
    const turnPoints = [];
    
    // 获取转角部分的点
    for (let i = 0; i < turnResidues; i++) {
        const t = 0.3 + (i * 0.4 / (turnResidues - 1));  // 0.3-0.7范围内的点
        turnPoints.push(curve.getPoint(t));
    }
    
    // 添加转角残基
    turnPoints.forEach((point, i) => {
        const residueGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        
        // 不同位置的残基使用不同颜色
        let residueColor;
        let residueInfo;
        if (i === 0) {
            residueColor = 0x4caf50;  // 第一个残基
            residueInfo = '第一个残基：通常提供C=O基团形成氢键';
        } else if (i === 1) {
            residueColor = 0xe91e63;  // 通常是脯氨酸
            residueInfo = '第二个残基：通常是脯氨酸，其刚性环状结构有助于形成转角';
        } else if (i === 2) {
            residueColor = 0xff9800;  // 通常是甘氨酸
            residueInfo = '第三个残基：通常是甘氨酸，其灵活性有助于形成转角';
        } else {
            residueColor = 0x2196f3;  // 第四个残基
            residueInfo = '第四个残基：通常提供N-H基团形成氢键';
        }
        
        const residueMaterial = new THREE.MeshPhongMaterial({ color: residueColor });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.copy(point);
        residue.userData = {
            type: 'residue',
            info: residueInfo
        };
        scene.add(residue);
        
        // 添加侧链（小球体）
        if (i !== 2) {  // 假设第三个残基（甘氨酸）没有侧链
            const sideChainGeometry = new THREE.SphereGeometry(0.15, 12, 12);
            const sideChainMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const sideChain = new THREE.Mesh(sideChainGeometry, sideChainMaterial);
            
            // 侧链位置（根据残基位置计算）
            const direction = new THREE.Vector3(0, 0, 1);
            if (i === 1) {  // 脯氨酸的侧链连接到氮原子
                direction.set(0, -0.5, 0.5);
            }
            
            sideChain.position.copy(point).add(direction.multiplyScalar(0.5));
            sideChain.userData = {
                type: 'sideChain',
                info: i === 1 ? '脯氨酸侧链：形成环状结构，限制了主链的旋转自由度' : 
                       '氨基酸侧链：R基团，决定了氨基酸的特性'
            };
            scene.add(sideChain);
        }
    });
    
    // 添加氢键（虚线）
    const hydrogenBondGeometry = new THREE.BufferGeometry().setFromPoints([
        turnPoints[0],  // 第一个残基
        turnPoints[3]   // 第四个残基
    ]);
    
    const hydrogenBondMaterial = new THREE.LineDashedMaterial({
        color: 0xffeb3b,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 2
    });
    
    const hydrogenBond = new THREE.Line(hydrogenBondGeometry, hydrogenBondMaterial);
    hydrogenBond.computeLineDistances();  // 计算虚线距离
    hydrogenBond.userData = {
        type: 'hydrogenBond',
        info: '氢键：连接第一个残基的C=O与第四个残基的N-H，稳定β转角结构'
    };
    scene.add(hydrogenBond);
}

/**
 * 添加β转角特性标签
 * @param {THREE.Scene} scene - Three.js场景
 */
function addBetaTurnLabels(scene) {
    const container = document.getElementById('beta-turn-model');
    
    // 4个氨基酸残基标签
    addFeatureLabel(container, '4个氨基酸残基', new THREE.Vector3(0, 2, 0));
    
    // 180°转向标签
    addFeatureLabel(container, '180°转向', new THREE.Vector3(0, 0, 2));
    
    // 氢键标签
    addFeatureLabel(container, '氢键稳定', new THREE.Vector3(0, -1, 0));
    
    // 特定氨基酸标签
    addFeatureLabel(container, '脯氨酸和甘氨酸常见', new THREE.Vector3(-3, 0, 0));
}

/**
 * 设置Three.js环境
 * @param {HTMLElement} container - 容器元素
 * @returns {Object} 包含场景、相机、渲染器和控制器的对象
 */
function setupThreeJSEnvironment(container) {
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 创建轨道控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // 添加窗口大小调整监听
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // 创建信息提示框
    const tooltip = document.createElement('div');
    tooltip.className = 'model-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    
    // 设置射线检测和鼠标事件
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject = null;
    
    // 鼠标移动事件
    container.addEventListener('mousemove', (event) => {
        // 计算鼠标在容器内的相对位置
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        // 射线检测
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        // 重置之前的高亮对象
        if (hoveredObject) {
            if (hoveredObject.material.emissive) {
                hoveredObject.material.emissive.setHex(hoveredObject.currentHex);
            }
            hoveredObject = null;
            tooltip.style.display = 'none';
        }
        
        // 检查是否有交点
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // 检查对象是否有用户数据和信息
            if (object.userData && object.userData.info) {
                // 高亮显示对象
                if (object.material.emissive) {
                    hoveredObject = object;
                    hoveredObject.currentHex = hoveredObject.material.emissive.getHex();
                    hoveredObject.material.emissive.setHex(0x333333);
                }
                
                // 显示信息提示框
                tooltip.textContent = object.userData.info;
                tooltip.style.display = 'block';
                
                // 更新提示框位置
                const tooltipX = event.clientX + 10;
                const tooltipY = event.clientY + 10;
                tooltip.style.left = `${tooltipX}px`;
                tooltip.style.top = `${tooltipY}px`;
            }
        }
    });
    
    // 鼠标离开事件
    container.addEventListener('mouseleave', () => {
        if (hoveredObject && hoveredObject.material.emissive) {
            hoveredObject.material.emissive.setHex(hoveredObject.currentHex);
            hoveredObject = null;
        }
        tooltip.style.display = 'none';
    });
    
    return { scene, camera, renderer, controls };
}

/**
 * 添加光照
 * @param {THREE.Scene} scene - Three.js场景
 */
function addLighting(scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    
    // 半球光（提供更自然的环境光照）
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.5);
    scene.add(hemisphereLight);
}

/**
 * 添加特性标签
 * @param {HTMLElement} container - 容器元素
 * @param {string} text - 标签文本
 * @param {THREE.Vector3} position - 标签位置
 */
function addFeatureLabel(container, text, position) {
    // 创建标签元素
    const label = document.createElement('div');
    label.className = 'feature-label';
    label.textContent = text;
    container.appendChild(label);
    
    // 更新标签位置的函数
    const updatePosition = (camera, renderer) => {
        // 将3D位置转换为屏幕位置
        const vector = position.clone();
        vector.project(camera);
        
        // 转换为CSS坐标
        const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-vector.y * 0.5 + 0.5) * container.clientHeight;
        
        // 更新标签位置
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        
        // 检查是否在相机前面（z < 1）
        if (vector.z < 1) {
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
    };
    
    // 存储更新函数
    if (!container.updateLabels) {
        container.updateLabels = [];
    }
    container.updateLabels.push(updatePosition);
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