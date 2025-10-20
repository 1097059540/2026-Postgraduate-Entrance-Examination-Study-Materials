// super-secondary.js - 超二级结构模型的初始化和交互功能

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化超二级结构模型
    initSuperSecondaryModel();
});

/**
 * 初始化超二级结构模型
 */
function initSuperSecondaryModel() {
    const container = document.getElementById('super-secondary-model');
    const { scene, camera, renderer, controls } = setupThreeJSEnvironment(container);
    
    addLighting(scene);
    createSuperSecondaryStructure(scene);
    addSuperSecondaryLabels(scene);
    
    setupModelControls('super-secondary', controls, camera, scene, renderer);
    
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
 * 创建超二级结构模型
 * @param {THREE.Scene} scene - Three.js场景
 */
function createSuperSecondaryStructure(scene) {
    // 创建βαβ单元模型
    // 参数设置
    const betaLength = 4;  // β折叠长度
    const alphaHeight = 6;  // α螺旋高度
    const alphaRadius = 1;  // α螺旋半径
    const spacing = 3;      // 结构间距
    
    // 创建第一个β折叠
    const beta1Points = [];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = -spacing - betaLength * (1 - t);
        const y = Math.sin(t * Math.PI) * 0.5;
        beta1Points.push(new THREE.Vector3(x, y, 0));
    }
    
    const beta1Geometry = new THREE.BufferGeometry().setFromPoints(beta1Points);
    const beta1Material = new THREE.LineBasicMaterial({ color: 0x1a237e, linewidth: 3 });
    const beta1 = new THREE.Line(beta1Geometry, beta1Material);
    beta1.userData = {
        type: 'betaStrand',
        info: 'β折叠链：第一条β链，通常与第二条β链平行排列，形成βαβ单元'
    };
    scene.add(beta1);
    
    // 创建α螺旋
    const helixPoints = [];
    const turns = 2;  // 螺旋圈数
    const segments = 50;  // 分段数
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = 2 * Math.PI * turns * t;
        const x = 0;
        const y = alphaHeight * (t - 0.5);
        const z = alphaRadius * Math.cos(angle);
        const x2 = alphaRadius * Math.sin(angle);
        helixPoints.push(new THREE.Vector3(x, y, x2));
    }
    
    const helixGeometry = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const helixMaterial = new THREE.LineBasicMaterial({ color: 0x3f51b5, linewidth: 2 });
    const helix = new THREE.Line(helixGeometry, helixMaterial);
    helix.userData = {
        type: 'alphaHelix',
        info: 'α螺旋：连接两条β链的螺旋结构，是βαβ单元的核心组成部分'
    };
    scene.add(helix);
    
    // 创建第二个β折叠
    const beta2Points = [];
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const x = spacing + betaLength * t;
        const y = Math.sin(t * Math.PI) * 0.5;
        beta2Points.push(new THREE.Vector3(x, y, 0));
    }
    
    const beta2Geometry = new THREE.BufferGeometry().setFromPoints(beta2Points);
    const beta2Material = new THREE.LineBasicMaterial({ color: 0x1a237e, linewidth: 3 });
    const beta2 = new THREE.Line(beta2Geometry, beta2Material);
    beta2.userData = {
        type: 'betaStrand',
        info: 'β折叠链：第二条β链，通常与第一条β链平行排列，形成βαβ单元'
    };
    scene.add(beta2);
    
    // 添加连接线
    // 连接第一个β折叠和α螺旋
    const connect1Points = [];
    connect1Points.push(new THREE.Vector3(-spacing, 0, 0));
    connect1Points.push(new THREE.Vector3(0, -alphaHeight/2, 0));
    
    const connect1Geometry = new THREE.BufferGeometry().setFromPoints(connect1Points);
    const connect1Material = new THREE.LineDashedMaterial({
        color: 0x757575,
        dashSize: 0.3,
        gapSize: 0.2,
        linewidth: 1
    });
    
    const connect1 = new THREE.Line(connect1Geometry, connect1Material);
    connect1.computeLineDistances();
    connect1.userData = {
        type: 'connector',
        info: '连接肽：连接β折叠和α螺旋的短肽段，通常没有规则的二级结构'
    };
    scene.add(connect1);
    
    // 连接α螺旋和第二个β折叠
    const connect2Points = [];
    connect2Points.push(new THREE.Vector3(0, alphaHeight/2, 0));
    connect2Points.push(new THREE.Vector3(spacing, 0, 0));
    
    const connect2Geometry = new THREE.BufferGeometry().setFromPoints(connect2Points);
    const connect2Material = new THREE.LineDashedMaterial({
        color: 0x757575,
        dashSize: 0.3,
        gapSize: 0.2,
        linewidth: 1
    });
    
    const connect2 = new THREE.Line(connect2Geometry, connect2Material);
    connect2.computeLineDistances();
    connect2.userData = {
        type: 'connector',
        info: '连接肽：连接α螺旋和β折叠的短肽段，通常没有规则的二级结构'
    };
    scene.add(connect2);
    
    // 添加一些氨基酸残基（球体）表示结构特征
    // 在β折叠上添加残基
    for (let i = 0; i < 2; i++) {
        const beta = i === 0 ? beta1 : beta2;
        const points = i === 0 ? beta1Points : beta2Points;
        const positions = [0.3, 0.7]; // 在β折叠上的相对位置
        
        positions.forEach(pos => {
            const index = Math.floor(pos * points.length);
            const point = points[index];
            
            const residueGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const residueMaterial = new THREE.MeshPhongMaterial({ color: 0x4caf50 });
            const residue = new THREE.Mesh(residueGeometry, residueMaterial);
            residue.position.copy(point);
            residue.userData = {
                type: 'residue',
                info: 'β折叠残基：在β链上的氨基酸残基，通常呈伸展构象'
            };
            scene.add(residue);
        });
    }
    
    // 在α螺旋上添加残基
    const helixPositions = [0.25, 0.5, 0.75]; // 在α螺旋上的相对位置
    
    helixPositions.forEach(pos => {
        const index = Math.floor(pos * helixPoints.length);
        const point = helixPoints[index];
        
        const residueGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const residueMaterial = new THREE.MeshPhongMaterial({ color: 0xff9800 });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.copy(point);
        residue.userData = {
            type: 'residue',
            info: 'α螺旋残基：在α螺旋上的氨基酸残基，呈螺旋排列'
        };
        scene.add(residue);
    });
}

/**
 * 添加超二级结构特性标签
 * @param {THREE.Scene} scene - Three.js场景
 */
function addSuperSecondaryLabels(scene) {
    const container = document.getElementById('super-secondary-model');
    
    // βαβ单元标签
    addFeatureLabel(container, 'βαβ单元', new THREE.Vector3(0, 3, 0));
    
    // α螺旋标签
    addFeatureLabel(container, 'α螺旋', new THREE.Vector3(0, 0, 2));
    
    // β折叠标签
    addFeatureLabel(container, 'β折叠', new THREE.Vector3(-4, 0, 0));
    addFeatureLabel(container, 'β折叠', new THREE.Vector3(4, 0, 0));
    
    // 连接肽标签
    addFeatureLabel(container, '连接肽', new THREE.Vector3(-2, -2, 0));
    addFeatureLabel(container, '连接肽', new THREE.Vector3(2, 2, 0));
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