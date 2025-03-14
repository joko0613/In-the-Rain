/*
==============================================================================
雨中漫步 - 游戏主入口模块
==============================================================================

文件结构：
1. 初始化函数
   - initGame - 游戏初始化
   - init - 应用初始化
   - setupEventListeners - 配置事件监听器
2. 主游戏循环
   - gameLoop - 执行每一帧的游戏逻辑
*/

// main.js - 游戏主入口，负责初始化和主循环
import config from './config.js';
import { game, resetGameState } from './gameState.js';
import { elements, resetUIElements } from './elements.js';
import { moveBackground, moveGround } from './background.js';
import { 
    handleInteraction, 
    rotateUmbrella, 
    shakeUmbrella, 
    updateUmbrellaPosition, 
    updateUmbrellaWaterLevel 
} from './umbrella.js';
import { spawnRaindrop, updateRaindrops } from './raindrops.js';
import { 
    updateTrailingDrops, 
    updateSplashParticles, 
    updateGroundSplashes 
} from './effects.js';
import { 
    updateStamina, 
    updateStaminaUI, 
    updateStaminaChangeDisplay 
} from './stamina.js';

// 初始化游戏
function initGame() {
    // 重置游戏状态
    resetGameState();
    
    // 重置UI元素
    resetUIElements();
    
    // 更新体力UI
    updateStaminaUI();
    
    // 重置雨伞位置
    updateUmbrellaPosition();
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 主游戏循环
function gameLoop() {
    if (!game.isRunning) return;
    
    game.frame++;
    
    // 更新背景和地面
    moveBackground();
    moveGround();
    
    // 更新雨伞状态
    if (game.umbrella.isRotating) {
        rotateUmbrella();
    } else if (game.umbrella.isShaking) {
        shakeUmbrella();
    }
    
    // 更新雨伞积水和雨滴互动效果
    updateUmbrellaWaterLevel();
    updateTrailingDrops();
    updateGroundSplashes();
    
    // 生成和更新雨滴
    if (game.frame >= game.nextRaindropSpawn && 
        game.raindrops.length < config.rain.maxActive) {
        spawnRaindrop();
        
        // 根据当前难度计算下一次生成时间
        const difficultyFactor = 1 - Math.min(0.7, game.frame / 10000 * config.game.difficultyIncrease);
        game.nextRaindropSpawn = game.frame + Math.floor(config.rain.spawnRate * difficultyFactor);
    }
    
    // 更新雨滴位置并检查碰撞
    updateRaindrops();
    
    // 更新特效粒子
    updateSplashParticles();
    
    // 随时间增加难度
    if (game.frame % config.game.speedIncreaseInterval === 0) {
        config.rain.baseSpeed += config.rain.acceleration * config.game.speedIncreaseInterval;
    }
    
    // 更新并检查体力状态
    updateStamina();
    
    // 显示体力变化
    updateStaminaChangeDisplay();
    
    // 继续游戏循环
    if (game.isRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// 添加事件监听器
function setupEventListeners() {
    // 添加按钮事件监听器
    elements.startButton.addEventListener('click', initGame);
    elements.restartButton.addEventListener('click', initGame);
    elements.gameCanvas.addEventListener('click', handleInteraction);
    
    // 添加触摸支持
    elements.gameCanvas.addEventListener('touchstart', function(event) {
        event.preventDefault();
        const touch = event.touches[0];
        handleInteraction(touch);
    });
}

// 初始化应用
function init() {
    // 设置事件监听器
    setupEventListeners();
    
    // 游戏准备就绪，显示开始屏幕
    console.log('雨中漫步游戏已准备就绪!');
}

// 启动游戏
init();