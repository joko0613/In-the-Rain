/*
==============================================================================
雨中漫步 - DOM元素引用模块
==============================================================================

文件结构：
1. DOM元素引用对象 - 存储所有HTML元素引用
   - 容器元素
   - 角色和雨伞元素
   - 背景和地面元素
   - 特效容器
   - UI元素
   - 体力UI元素
2. UI操作函数
   - resetUIElements - 重置UI到初始状态
   - updateScoreDisplay - 更新分数显示
   - updateEndScreen - 更新结束屏幕
*/

// elements.js - 处理DOM元素引用和访问

// 创建DOM元素引用对象
const elements = {
    // 1. 容器元素
    gameContainer: document.getElementById('game-container'),
    gameCanvas: document.getElementById('game-canvas'),
    
    // 2. 角色和雨伞元素
    character: document.getElementById('character-group'),
    umbrellaGroup: document.getElementById('umbrella-group'),
    umbrellaCanopy: document.getElementById('umbrella-canopy'),
    umbrellaHandle: document.getElementById('umbrella-handle'),
    
    // 3. 背景和地面元素
    cityscapeContainer: document.getElementById('cityscape-container'),
    groundContainer: document.getElementById('ground-container'),
    
    // 4. 特效容器
    raindropsContainer: document.getElementById('raindrops'),
    splashEffectsContainer: document.getElementById('splash-effects'),
    raindropTrailsContainer: document.getElementById('raindrop-trails'),
    groundSplashesContainer: document.getElementById('ground-splashes'),
    
    // 5. UI元素
    scoreDisplay: document.getElementById('score-display'),
    startScreen: document.getElementById('start-screen'),
    endScreen: document.getElementById('end-screen'),
    startButton: document.getElementById('start-button'),
    restartButton: document.getElementById('restart-button'),
    endScore: document.getElementById('end-score'),
    endReason: document.getElementById('end-reason'),
    
    // 6. 体力UI元素
    staminaContainer: document.getElementById('stamina-container'),
    staminaLabel: document.getElementById('stamina-label'),
    staminaBar: document.getElementById('stamina-bar'),
    staminaFill: document.getElementById('stamina-fill'),
    staminaChange: document.getElementById('stamina-change')
};

// 初始化/重置UI元素函数
function resetUIElements() {
    elements.scoreDisplay.textContent = `分数: 0`;
    elements.startScreen.style.display = 'none';
    elements.endScreen.style.display = 'none';
    
    // 清除特效容器内容
    elements.raindropsContainer.innerHTML = '';
    elements.splashEffectsContainer.innerHTML = '';
    elements.raindropTrailsContainer.innerHTML = '';
    elements.groundSplashesContainer.innerHTML = '';
}

// 更新分数显示
function updateScoreDisplay(score) {
    elements.scoreDisplay.textContent = `分数: ${score}`;
}

// 更新结束屏幕显示
function updateEndScreen(score, reason) {
    elements.endScore.textContent = `分数: ${score}`;
    elements.endReason.textContent = reason;
    elements.endScreen.style.display = 'flex';
}

export { elements, resetUIElements, updateScoreDisplay, updateEndScreen };