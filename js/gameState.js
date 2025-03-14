/*
==============================================================================
雨中漫步 - 游戏状态管理模块
==============================================================================

文件结构：
1. 游戏状态对象 - 存储所有游戏数据
   - 核心游戏状态 (运行状态、分数、帧计数)
   - 角色状态
   - 雨伞状态
   - 背景和地面状态
   - 游戏元素集合
   - 雨滴生成控制
   - 体力系统状态
2. 重置游戏状态函数 - 初始化/重置所有游戏状态
*/

// gameState.js - 管理游戏的所有状态数据
import config from './config.js';

// 创建游戏状态对象
const game = {
    // 1. 核心游戏状态
    isRunning: false,                  // 游戏是否运行中
    score: 0,                          // 当前分数
    frame: 0,                          // 当前帧计数
    
    // 2. 角色状态
    character: {
        x: config.character.defaultX,  // 当前X位置
        y: config.character.defaultY,  // 当前Y位置
        isWet: false                   // 是否被雨水淋湿
    },
    
    // 3. 雨伞状态
    umbrella: {
        // 基础属性
        baseRotation: config.umbrella.defaultAngle, // 基础旋转角度
        baseX: config.umbrella.offsetX,             // 基础X偏移
        baseY: config.umbrella.offsetY,             // 基础Y偏移
        
        // 旋转相关
        isRotating: false,             // 是否正在旋转
        rotationProgress: 0,           // 旋转进度
        rotationAngle: 0,              // 当前旋转角度
        rotationDirection: 1,          // 旋转方向
        
        // 摆动相关
        isShaking: false,              // 是否正在摆动
        shakePhase: 0,                 // 摆动阶段
        shakeProgress: 0,              // 摆动进度
        shakeSeed: 0,                  // 随机种子(使每次摆动模式不同)
        
        // 实际偏移量
        offsetX: config.umbrella.offsetX,   // 当前X偏移
        offsetY: config.umbrella.offsetY,   // 当前Y偏移
        rotation: config.umbrella.defaultAngle, // 当前旋转角度
        
        waterLevel: 0,                 // 雨伞积水量(0-100)
        lastActionFrame: 0,            // 上次操作的帧数
        
        // 旋转期间命中的雨滴数量
        raindropsDeflectedInRotation: 0
    },
    
    // 4. 背景状态
    background: {
        x: 0                           // 背景X位置
    },
    
    // 5. 地面状态
    ground: {
        x: 0                           // 地面X位置
    },
    
    // 6. 游戏元素集合
    raindrops: [],                     // 存储活跃雨滴组的数组
    splashParticles: [],               // 存储甩水特效粒子
    trailingDrops: [],                 // 存储在雨伞上滑落的雨滴
    groundSplashes: [],                // 存储地面溅起的水花
    
    // 7. 雨滴生成控制
    nextRaindropSpawn: 0,              // 下一个雨滴生成的帧计数器
    
    // 8. 体力系统状态
    stamina: {
        current: config.stamina.initial, // 当前体力值
        lastChange: 0,                   // 上次体力变化量
        changeDisplayTimer: 0,           // 变化显示计时器
        endReason: ""                    // 游戏结束原因
    }
};

// 重置游戏状态函数
function resetGameState() {
    // 重置游戏状态
    game.isRunning = true;
    game.score = 0;
    game.frame = 0;
    
    // 重置角色状态
    game.character.isWet = false;
    
    // 重置雨伞状态
    game.umbrella.rotation = config.umbrella.defaultAngle;
    game.umbrella.offsetX = config.umbrella.offsetX;
    game.umbrella.offsetY = config.umbrella.offsetY;
    game.umbrella.isRotating = false;
    game.umbrella.rotationProgress = 0;
    game.umbrella.rotationAngle = 0;
    game.umbrella.isShaking = false;
    game.umbrella.shakePhase = 0;
    game.umbrella.shakeProgress = 0;
    game.umbrella.waterLevel = 0;
    game.umbrella.lastActionFrame = 0;
    game.umbrella.raindropsDeflectedInRotation = 0;
    
    // 重置背景和地面位置
    game.background.x = 0;
    game.ground.x = 0;
    
    // 清空游戏元素集合
    game.raindrops = [];
    game.splashParticles = [];
    game.trailingDrops = [];
    game.groundSplashes = [];
    game.nextRaindropSpawn = 0;
    
    // 重置体力值
    game.stamina.current = config.stamina.initial;
    game.stamina.lastChange = 0;
    game.stamina.changeDisplayTimer = 0;
    game.stamina.endReason = "";
}

export { game, resetGameState };