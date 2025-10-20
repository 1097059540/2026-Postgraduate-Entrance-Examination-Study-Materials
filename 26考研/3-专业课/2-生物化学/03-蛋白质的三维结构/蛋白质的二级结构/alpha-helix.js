// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化α螺旋模型
    initAlphaHelixModel();
});

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
 * 创建α螺旋模型
 * @param {THREE.Scene} scene - 场景
 */
function createAlphaHelix(scene) {
    // α螺旋的真实参数
    const radius = 2.3; // 螺旋半径（约0.23nm，放大10倍显示）
    const aminoAcidsPerTurn = 3.6; // 每圈氨基酸数量
    const pitchPerTurn = 5.4; // 每圈螺距（0.54nm，放大10倍显示）
    const aminoAcidHeight = 1.5; // 每个氨基酸的轴向高度（0.15nm，放大10倍显示）
    const totalAminoAcids = 18; // 总氨基酸数量（5圈螺旋）
    const totalHeight = totalAminoAcids * aminoAcidHeight; // 总高度
    const turns = totalAminoAcids / aminoAcidsPerTurn; // 螺旋圈数
    const segments = totalAminoAcids * 10; // 分段数（每个氨基酸10个分段，使曲线更平滑）
    
    // 材质
    const backboneMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db, shininess: 100 });
    const residueMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c, shininess: 100 });
    const sidechainMaterial = new THREE.MeshPhongMaterial({ color: 0x2ecc71, shininess: 100 });
    const hbondMaterial = new THREE.LineDashedMaterial({
        color: 0xf39c12,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 1
    });
    const axisMaterial = new THREE.MeshPhongMaterial({ color: 0x9b59b6, transparent: true, opacity: 0.5 });
    
    // 创建螺旋骨架
    const backbonePoints = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = 2 * Math.PI * turns * t;
        const x = radius * Math.cos(angle);
        const y = totalHeight * (t - 0.5); // 使用计算出的总高度
        const z = radius * Math.sin(angle);
        backbonePoints.push(new THREE.Vector3(x, y, z));
    }
    
    const backboneCurve = new THREE.CatmullRomCurve3(backbonePoints);
    const backboneGeometry = new THREE.TubeGeometry(backboneCurve, segments, 0.2, 8, false);
    const backbone = new THREE.Mesh(backboneGeometry, backboneMaterial);
    backbone.userData = {
        type: 'backbone',
        info: '肽链骨架：由α碳原子、氨基和羧基组成的主链，形成螺旋结构的基本框架。'
    };
    scene.add(backbone);
    
    // 创建氨基酸残基（球体）
    const residues = [];
    const segmentsPerAminoAcid = segments / totalAminoAcids; // 每个氨基酸对应的分段数
    for (let i = 0; i < totalAminoAcids; i++) {
        const segmentIndex = Math.round(i * segmentsPerAminoAcid);
        const t = segmentIndex / segments;
        const point = backboneCurve.getPoint(t);
        
        const residueGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const residue = new THREE.Mesh(residueGeometry, residueMaterial);
        residue.position.copy(point);
        residue.userData = {
            type: 'residue',
            info: `氨基酸残基 ${i + 1}：构成蛋白质的基本单元，在α螺旋中每3.6个残基完成一个完整螺旋周期。`
        };
        scene.add(residue);
        residues.push(residue);
    }
    
    // 创建侧链（圆柱体）
    for (let i = 0; i < residues.length; i++) {
        const residue = residues[i];
        const t = i / totalAminoAcids;
        const angle = 2 * Math.PI * turns * t;
        
        // 侧链方向（指向螺旋外侧）
        const direction = new THREE.Vector3(
            Math.cos(angle),
            0,
            Math.sin(angle)
        ).normalize();
        
        // 创建圆柱体表示侧链
        const sidechainLength = 1.5;
        const sidechainGeometry = new THREE.CylinderGeometry(0.15, 0.15, sidechainLength, 8);
        const sidechain = new THREE.Mesh(sidechainGeometry, sidechainMaterial);
        
        // 定位和旋转侧链
        sidechain.position.copy(residue.position).add(direction.clone().multiplyScalar(sidechainLength / 2));
        sidechain.lookAt(sidechain.position.clone().add(direction));
        sidechain.rotateX(Math.PI / 2);
        sidechain.userData = {
            type: 'sidechain',
            info: '氨基酸侧链：R基团，指向螺旋外侧，决定了氨基酸的特性和功能。'
        };
        scene.add(sidechain);
    }
    
    // 创建氢键（虚线）- 每个氨基酸的C=O与其前第4位的N-H形成氢键
    for (let i = 4; i < residues.length; i++) {
        const donorResidue = residues[i - 4]; // 氢键供体（N-H）
        const acceptorResidue = residues[i]; // 氢键受体（C=O）
        
        // 计算氢键的起点和终点
        const start = donorResidue.position.clone();
        const end = acceptorResidue.position.clone();
        
        const hbondGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const hbond = new THREE.Line(hbondGeometry, hbondMaterial);
        hbond.computeLineDistances(); // 计算虚线所需的距离
        hbond.userData = {
            type: 'hbond',
            info: `氢键：氨基酸${i-3}的C=O与氨基酸${i+1}的N-H形成氢键，稳定α螺旋结构。`
        };
        scene.add(hbond);
    }
    
    // 创建螺旋轴
    const axisGeometry = new THREE.CylinderGeometry(0.1, 0.1, totalHeight, 16);
    const axis = new THREE.Mesh(axisGeometry, axisMaterial);
    axis.userData = {
        type: 'axis',
        info: `螺旋轴：α螺旋的中心轴，每3.6个氨基酸完成一圈，螺距为0.54nm，每个氨基酸轴向高度0.15nm。`
    };
    scene.add(axis);
}

/**
 * 添加α螺旋特性标签
 * @param {THREE.Scene} scene - 场景
 */
function addAlphaHelixLabels(scene) {
    // 标签数据
    const labels = [
        { position: new THREE.Vector3(0, 4, 0), text: '螺旋轴' },
        { position: new THREE.Vector3(2.5, 2, 0), text: '氢键' },
        { position: new THREE.Vector3(-3, 0, 0), text: '侧链' },
        { position: new THREE.Vector3(0, -3, 3), text: '肽链骨架' },
        { position: new THREE.Vector3(3, -2, -2), text: '氨基酸残基' }
    ];
    
    // 获取容器元素
    const container = document.getElementById('alpha-helix-model');
    
    // 初始化updateLabels数组
    if (!container.updateLabels) {
        container.updateLabels = [];
    }
    
    // 为每个标签创建HTML元素和更新函数
    labels.forEach(label => {
        // 创建标签容器
        const labelElement = document.createElement('div');
        labelElement.className = 'feature-label';
        labelElement.textContent = label.text;
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
            const vector = label.position.clone();
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
    });
}