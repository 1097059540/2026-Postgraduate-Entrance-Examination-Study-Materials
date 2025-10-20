// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 导航切换功能
    setupNavigation();
    
    // 初始化所有3D模型
    initAlphaHelixModel();
    
    // 延迟加载其他模型，确保DOM元素已完全准备好
    setTimeout(() => {
        initBetaSheetModel();
        initBetaTurnModel();
        initSuperSecondaryModel();
        
        console.log('所有模型已初始化');
    }, 500);
});

/**
 * 设置导航切换功能
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.structure-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active类
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加active类到当前点击的链接
            this.classList.add('active');
            
            // 获取目标section并激活
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/**
 * 初始化α螺旋模型
 */
function initAlphaHelixModel() {
    // 创建场景、相机和渲染器
    const container = document.getElementById('alpha-helix-model');
    const { scene, camera, renderer, controls } = setupThreeJSEnvironment(container);
    
    // 添加环境光和定向光
    addLighting(scene);
    
    // 创建α螺旋模型
    createAlphaHelix(scene);
    
    // 添加特性标签
    addAlphaHelixLabels(scene);
    
    // 设置控制按钮
    setupModelControls('alpha', controls, camera, scene, renderer);
    
    // 动画循环
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
 * 初始化β转角模型
 */
function initBetaTurnModel() {
    const container = document.getElementById('beta-turn-model');
    const { scene, camera, renderer, controls } = setupThreeJSEnvironment(container);
    
    addLighting(scene);
    createBetaTurn(scene);
    addBetaTurnLabels(scene);
    
    setupModelControls('turn', controls, camera, scene, renderer);
    
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
 * 初始化超二级结构模型
 */
function initSuperSecondaryModel() {
    const container = document.getElementById('super-secondary-model');
    const { scene, camera, renderer, controls } = setupThreeJSEnvironment(container);
    
    addLighting(scene);
    createSuperSecondaryStructure(scene);
    addSuperSecondaryLabels(scene);
    
    setupModelControls('super', controls, camera, scene, renderer);
    
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
        
        // 设置射线从相机发出，经过鼠标位置
        raycaster.setFromCamera(mouse, camera);
        
        // 计算射线与场景中物体的交点
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        // 重置之前的交点对象
        if (intersectedObject) {
            if (intersectedObject.material.emissive) {
                intersectedObject.material.emissive.setHex(intersectedObject.currentHex);
            }
            intersectedObject = null;
            tooltip.style.display = 'none';
        }
        
        // 如果有交点
        if (intersects.length > 0) {
            intersectedObject = intersects[0].object;
            
            // 如果对象有用户数据
            if (intersectedObject.userData && intersectedObject.userData.info) {
                // 高亮显示对象
                if (intersectedObject.material.emissive) {
                    intersectedObject.currentHex = intersectedObject.material.emissive.getHex();
                    intersectedObject.material.emissive.setHex(0x555555);
                }
                
                // 显示提示信息
                tooltip.textContent = intersectedObject.userData.info;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX - rect.left) + 'px';
                tooltip.style.top = (event.clientY - rect.top) + 'px';
            }
        }
    });
    
    // 鼠标离开事件
    renderer.domElement.addEventListener('mouseout', function() {
        if (intersectedObject && intersectedObject.material.emissive) {
            intersectedObject.material.emissive.setHex(intersectedObject.currentHex);
        }
        intersectedObject = null;
        tooltip.style.display = 'none';
    });
    
    // 窗口大小调整时重设渲染器大小
    window.addEventListener('resize', function() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    return { scene, camera, renderer, controls, raycaster, mouse, tooltip };
}

/**
 * 添加场景光源
 * @param {THREE.Scene} scene - Three.js场景
 */
function addLighting(scene) {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // 定向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // 添加第二个定向光以增强阴影效果
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-5, -10, -7);
    scene.add(directionalLight2);
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
    
    let autoRotate = false;
    
    // 自动旋转按钮
    rotateBtn.addEventListener('click', function() {
        autoRotate = !autoRotate;
        controls.autoRotate = autoRotate;
        rotateBtn.textContent = autoRotate ? '停止旋转' : '自动旋转';
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
        function animate() {
            if (TWEEN.update()) {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
        }
        animate();
    });
}

/**
 * 创建α螺旋模型
 * @param {THREE.Scene} scene - Three.js场景
 */
function createAlphaHelix(scene) {
    // 螺旋参数
    const radius = 2;      // 螺旋半径
    const height = 10;     // 螺旋高度
    const turns = 3;       // 螺旋圈数
    const segments = 100;  // 分段数
    
    // 创建螺旋骨架
    const helixPoints = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = 2 * Math.PI * turns * t;
        const x = radius * Math.cos(angle);
        const y = height * (t - 0.5);  // 居中
        const z = radius * Math.sin(angle);
        helixPoints.push(new THREE.Vector3(x, y, z));
    }
    
    // 创建螺旋曲线
    const helixGeometry = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const helixMaterial = new THREE.LineBasicMaterial({ color: 0x1a237e, linewidth: 2 });
    const helix = new THREE.Line(helixGeometry, helixMaterial);
    helix.userData = { type: 'backbone', info: '螺旋骨架：右手螺旋结构，每3.6个氨基酸完成一个完整螺旋周期' };
    scene.add(helix);
    
    // 添加氨基酸残基（球体）
    const residuesPerTurn = 3.6;  // 每圈3.6个氨基酸
    const totalResidues = Math.floor(turns * residuesPerTurn);
    
    for (let i = 0; i < totalResidues; i++) {
        const t = i / totalResidues;
        const angle = 2 * Math.PI * turns * t;
        const x = radius * Math.cos(angle);
        const y = height * (t - 0.5);
        const z = radius * Math.sin(angle);
        
        // 创建氨基酸残基（球体）
        const residueGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const residueMaterial = new THREE.MeshPhongMaterial({ color: 0x3f51b5 });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.set(x, y, z);
        residue.userData = { type: 'residue', info: `氨基酸残基：每个螺旋周期包含3.6个氨基酸残基` };
        scene.add(residue);
        
        // 添加侧链（圆柱体）
        if (i % 2 === 0) {  // 交替添加侧链
            const sideChainLength = 1.2;
            const direction = new THREE.Vector3(x, y, z).normalize();
            
            const sideChainGeometry = new THREE.CylinderGeometry(0.1, 0.1, sideChainLength, 8);
            const sideChainMaterial = new THREE.MeshPhongMaterial({ color: 0xe91e63 });
            const sideChain = new THREE.Mesh(sideChainGeometry, sideChainMaterial);
            
            // 定位和旋转侧链
            sideChain.position.set(
                x + direction.x * sideChainLength/2,
                y + direction.y * sideChainLength/2,
                z + direction.z * sideChainLength/2
            );
            
            // 旋转侧链使其指向外部
            sideChain.lookAt(new THREE.Vector3(0, y, 0));
            sideChain.rotateX(Math.PI/2);
            sideChain.userData = { type: 'sidechain', info: '侧链：氨基酸的R基团指向螺旋外侧' };
            
            scene.add(sideChain);
        }
    }
    
    // 添加氢键（虚线）
    for (let i = 0; i < totalResidues - 4; i++) {  // 每个氨基酸与其后第4个形成氢键
        const t1 = i / totalResidues;
        const t2 = (i + 4) / totalResidues;
        
        const angle1 = 2 * Math.PI * turns * t1;
        const angle2 = 2 * Math.PI * turns * t2;
        
        const x1 = radius * Math.cos(angle1);
        const y1 = height * (t1 - 0.5);
        const z1 = radius * Math.sin(angle1);
        
        const x2 = radius * Math.cos(angle2);
        const y2 = height * (t2 - 0.5);
        const z2 = radius * Math.sin(angle2);
        
        // 创建氢键（虚线）
        const hbondPoints = [];
        hbondPoints.push(new THREE.Vector3(x1, y1, z1));
        hbondPoints.push(new THREE.Vector3(x2, y2, z2));
        
        const hbondGeometry = new THREE.BufferGeometry().setFromPoints(hbondPoints);
        const hbondMaterial = new THREE.LineDashedMaterial({
            color: 0x00bcd4,
            dashSize: 0.2,
            gapSize: 0.1,
            linewidth: 1
        });
        
        const hbond = new THREE.Line(hbondGeometry, hbondMaterial);
        hbond.computeLineDistances(); // 计算虚线距离
        hbond.userData = { type: 'hbond', info: '氢键：每个氨基酸的C=O与其前第4位的N-H形成氢键，稳定螺旋结构' };
        scene.add(hbond);
    }
    
    // 添加螺旋轴（中心线）
    const axisPoints = [];
    axisPoints.push(new THREE.Vector3(0, -height/2, 0));
    axisPoints.push(new THREE.Vector3(0, height/2, 0));
    
    const axisGeometry = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const axisMaterial = new THREE.LineDashedMaterial({
        color: 0x757575,
        dashSize: 0.5,
        gapSize: 0.3,
        linewidth: 1
    });
    
    const axis = new THREE.Line(axisGeometry, axisMaterial);
    axis.computeLineDistances();
    axis.userData = { type: 'axis', info: '螺旋轴：α螺旋围绕中心轴旋转，每个完整螺旋的轴向距离为0.54nm' };
    scene.add(axis);
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
            const x = (j - (residuesPerStrand - 1) / 2) * residueSpacing;
            
            // 计算褶皱高度
            const rippleHeight = Math.sin(j * Math.PI / 2) * 0.5;
            const y = rippleHeight;
            
            // 创建氨基酸残基
            const residueGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const residueMaterial = new THREE.MeshPhongMaterial({
                color: 0x4caf50
            });
            
            const residue = new THREE.Mesh(residueGeometry, residueMaterial);
            residue.position.set(x, y, z);
            scene.add(residue);
            
            // 添加侧链（上下交替）
            const sideChainLength = 0.8;
            const sideChainDirection = j % 2 === 0 ? 1 : -1;
            
            const sideChainGeometry = new THREE.CylinderGeometry(0.08, 0.08, sideChainLength, 8);
            const sideChainMaterial = new THREE.MeshPhongMaterial({ color: 0xff9800 });
            const sideChain = new THREE.Mesh(sideChainGeometry, sideChainMaterial);
            
            sideChain.position.set(
                x,
                y + sideChainDirection * sideChainLength/2,
                z
            );
            
            sideChain.rotation.x = Math.PI/2;
            scene.add(sideChain);
        }
    }
    
    // 添加氢键（链之间）
    for (let i = 0; i < strands - 1; i++) {
        const z1 = (i - (strands - 1) / 2) * strandGap;
        const z2 = ((i + 1) - (strands - 1) / 2) * strandGap;
        
        const residuesPerStrand = 8;
        const residueSpacing = width / (residuesPerStrand - 1);
        
        for (let j = 0; j < residuesPerStrand; j += 2) {  // 每隔一个残基添加氢键
            const x = (j - (residuesPerStrand - 1) / 2) * residueSpacing;
            
            // 计算褶皱高度
            const rippleHeight = Math.sin(j * Math.PI / 2) * 0.5;
            const y = rippleHeight;
            
            // 创建氢键（虚线）
            const hbondPoints = [];
            hbondPoints.push(new THREE.Vector3(x, y, z1));
            hbondPoints.push(new THREE.Vector3(x, y, z2));
            
            const hbondGeometry = new THREE.BufferGeometry().setFromPoints(hbondPoints);
            const hbondMaterial = new THREE.LineDashedMaterial({
                color: 0x00bcd4,
                dashSize: 0.2,
                gapSize: 0.1,
                linewidth: 1
            });
            
            const hbond = new THREE.Line(hbondGeometry, hbondMaterial);
            hbond.computeLineDistances();
            scene.add(hbond);
        }
    }
}

/**
 * 应用褶皱效果到β折叠链
 * @param {THREE.Mesh} strand - 链网格
 * @param {number} width - 链宽度
 * @param {boolean} reverse - 是否反向
 */
function applyRippleEffect(strand, width, reverse) {
    // 获取几何体顶点
    const positionAttribute = strand.geometry.getAttribute('position');
    
    // 应用褶皱效果
    for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const normalizedX = (x + width/2) / width;  // 归一化x坐标
        
        // 计算褶皱高度
        let rippleHeight = Math.sin(normalizedX * Math.PI * 4) * 0.5;
        if (reverse) rippleHeight = -rippleHeight;
        
        positionAttribute.setY(i, rippleHeight);
    }
    
    positionAttribute.needsUpdate = true;
    strand.geometry.computeVertexNormals();
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
        if (i === 1) {
            residueColor = 0xe91e63;  // 通常是脯氨酸
        } else if (i === 2) {
            residueColor = 0x9c27b0;  // 通常是甘氨酸
        } else {
            residueColor = 0x3f51b5;
        }
        
        const residueMaterial = new THREE.MeshPhongMaterial({ color: residueColor });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.copy(point);
        scene.add(residue);
    });
    
    // 添加氢键（第一个和第四个残基之间）
    const hbondPoints = [];
    hbondPoints.push(turnPoints[0]);
    hbondPoints.push(turnPoints[3]);
    
    const hbondGeometry = new THREE.BufferGeometry().setFromPoints(hbondPoints);
    const hbondMaterial = new THREE.LineDashedMaterial({
        color: 0x00bcd4,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 1
    });
    
    const hbond = new THREE.Line(hbondGeometry, hbondMaterial);
    hbond.computeLineDistances();
    scene.add(hbond);
    
    // 添加β链（转角两侧的链）
    // 左侧链
    const leftStrandPoints = [];
    for (let i = 0; i < 5; i++) {
        const x = -strandLength - i;
        leftStrandPoints.push(new THREE.Vector3(x, 0, 0));
    }
    
    const leftStrandGeometry = new THREE.BufferGeometry().setFromPoints(leftStrandPoints);
    const leftStrandMaterial = new THREE.LineBasicMaterial({ color: 0x1a237e, linewidth: 3 });
    const leftStrand = new THREE.Line(leftStrandGeometry, leftStrandMaterial);
    scene.add(leftStrand);
    
    // 右侧链
    const rightStrandPoints = [];
    for (let i = 0; i < 5; i++) {
        const x = strandLength + i;
        rightStrandPoints.push(new THREE.Vector3(x, 0, 0));
    }
    
    const rightStrandGeometry = new THREE.BufferGeometry().setFromPoints(rightStrandPoints);
    const rightStrandMaterial = new THREE.LineBasicMaterial({ color: 0x1a237e, linewidth: 3 });
    const rightStrand = new THREE.Line(rightStrandGeometry, rightStrandMaterial);
    scene.add(rightStrand);
    
    // 添加左侧链残基
    for (let i = 0; i < 3; i++) {
        const x = -strandLength - i - 0.5;
        const residueGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const residueMaterial = new THREE.MeshPhongMaterial({ color: 0x3f51b5 });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.set(x, 0, 0);
        scene.add(residue);
    }
    
    // 添加右侧链残基
    for (let i = 0; i < 3; i++) {
        const x = strandLength + i + 0.5;
        const residueGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const residueMaterial = new THREE.MeshPhongMaterial({ color: 0x3f51b5 });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.set(x, 0, 0);
        scene.add(residue);
    }
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
    scene.add(connect2);
    
    // 添加残基
    // β折叠残基
    for (let i = 0; i < 5; i++) {
        // 第一个β折叠残基
        const t1 = i / 4;
        const x1 = -spacing - betaLength * (1 - t1);
        const y1 = Math.sin(t1 * Math.PI) * 0.5;
        
        const residue1Geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const residue1Material = new THREE.MeshPhongMaterial({ color: 0x3f51b5 });
        const residue1 = new THREE.Mesh(residue1Geometry, residue1Material);
        residue1.position.set(x1, y1, 0);
        scene.add(residue1);
        
        // 第二个β折叠残基
        const t2 = i / 4;
        const x2 = spacing + betaLength * t2;
        const y2 = Math.sin(t2 * Math.PI) * 0.5;
        
        const residue2Geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const residue2Material = new THREE.MeshPhongMaterial({ color: 0x3f51b5 });
        const residue2 = new THREE.Mesh(residue2Geometry, residue2Material);
        residue2.position.set(x2, y2, 0);
        scene.add(residue2);
    }
    
    // α螺旋残基
    const residuesPerTurn = 3.6;  // 每圈3.6个氨基酸
    const totalResidues = Math.floor(turns * residuesPerTurn);
    
    for (let i = 0; i < totalResidues; i++) {
        const t = i / totalResidues;
        const angle = 2 * Math.PI * turns * t;
        const x = 0;
        const y = alphaHeight * (t - 0.5);
        const z = alphaRadius * Math.cos(angle);
        const x2 = alphaRadius * Math.sin(angle);
        
        const residueGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const residueMaterial = new THREE.MeshPhongMaterial({ color: 0x3f51b5 });
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.set(x, y, x2);
        scene.add(residue);
    }
}

/**
 * 添加α螺旋特性标签
 * @param {THREE.Scene} scene - Three.js场景
 */
function addAlphaHelixLabels(scene) {
    // 添加特性标签的DOM元素
    const container = document.getElementById('alpha-helix-model');
    
    // 右手螺旋标签
    addFeatureLabel(container, '右手螺旋', new THREE.Vector3(2, 0, 2));
    
    // 螺距标签
    addFeatureLabel(container, '螺距: 0.54nm', new THREE.Vector3(0, 3, 0));
    
    // 每转3.6个氨基酸标签
    addFeatureLabel(container, '每周3.6个氨基酸', new THREE.Vector3(-3, 0, 0));
    
    // 氨基酸高度标签
    addFeatureLabel(container, '每个氨基酸高度: 0.15nm', new THREE.Vector3(0, -3, 0));
}

/**
 * 添加β折叠特性标签
 * @param {THREE.Scene} scene - Three.js场景
 */
function addBetaSheetLabels(scene) {
    const container = document.getElementById('beta-sheet-model');
    
    // 反平行排列标签
    addFeatureLabel(container, '反平行排列', new THREE.Vector3(0, 2, 0));
    
    // 氢键连接标签
    addFeatureLabel(container, '氢键连接', new THREE.Vector3(0, 0, 0));
    
    // 侧链交替朝向标签
    addFeatureLabel(container, '侧链交替朝向', new THREE.Vector3(-3, -1, 0));
    
    // 残基间距标签
    addFeatureLabel(container, '残基间距: 0.35nm', new THREE.Vector3(3, -1, 0));
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
 * 添加特性标签
 * @param {HTMLElement} container - 容器元素
 * @param {string} text - 标签文本
 * @param {THREE.Vector3} position - 3D位置
 */
function addFeatureLabel(container, text, position) {
    const label = document.createElement('div');
    label.className = 'feature-label';
    label.textContent = text;
    label.style.display = 'none';
    container.appendChild(label);
    
    // 存储位置信息
    label.dataset.x = position.x;
    label.dataset.y = position.y;
    label.dataset.z = position.z;
    
    // 创建一个感应区域
    const hotspot = document.createElement('div');
    hotspot.className = 'feature-hotspot';
    container.appendChild(hotspot);
    
    // 添加鼠标悬停交互
    hotspot.addEventListener('mouseenter', function() {
        label.style.display = 'block';
    });
    
    hotspot.addEventListener('mouseleave', function() {
        label.style.display = 'none';
    });
    
    // 更新标签和热点位置的函数将在渲染循环中调用
    function updateLabelPosition(camera, renderer) {
        const vector = new THREE.Vector3(
            parseFloat(label.dataset.x),
            parseFloat(label.dataset.y),
            parseFloat(label.dataset.z)
        );
        
        vector.project(camera);
        
        const x = (vector.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-vector.y * 0.5 + 0.5) * container.clientHeight;
        
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        hotspot.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        
        // 检查是否在视图内
        if (vector.z > 1 || x < 0 || x > container.clientWidth || y < 0 || y > container.clientHeight) {
            hotspot.style.display = 'none';
        } else {
            hotspot.style.display = 'block';
        }
    }
    
    // 将更新函数附加到容器
    container.updateLabels = container.updateLabels || [];
    container.updateLabels.push(updateLabelPosition);
}