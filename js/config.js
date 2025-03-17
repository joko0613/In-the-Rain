/*
==============================================================================
雨中漫步 - 游戏配置参数模块
==============================================================================

文件结构：
1. 角色设置 - 控制角色基本属性
2. 雨伞设置 - 控制雨伞物理属性和动画
3. 背景设置 - 控制背景和地面移动速度 
4. 雨滴设置 - 控制雨滴生成、移动和交互
5. 特效设置 - 控制视觉效果参数
6. 游戏区域和难度 - 控制游戏整体参数
7. 体力系统设置 - 控制体力值相关参数
*/

// config.js - 包含游戏所有配置参数

const config = {
    // 1. 角色设置
    character: {
        defaultX: 200,                   // 角色X位置
        defaultY: 430,                   // 角色Y位置
        width: 20,                       // 角色宽度
        height: 40                       // 角色高度
    },
    
    // 2. 雨伞设置
    umbrella: {
        defaultAngle: 5,                 // 雨伞默认倾斜角度
        offsetX: 10,                     // 雨伞相对角色的X偏移
        offsetY: -25,                    // 雨伞相对角色的Y偏移
        width: 60,                       // 雨伞宽度
        height: 20,                      // 雨伞弧度高度
        
        // 旋转设置
        rotationSpeed: 15,               // 雨伞旋转速度
        rotationAmount: 360,             // 完整旋转角度
        rotationDuration: 30,            // 旋转持续帧数
        
        // 摆动设置
        shakeAmplitudeX: 3,              // 水平摆动幅度
        shakeAmplitudeY: 2,              // 垂直摆动幅度
        shakeAmplitudeR: 4,              // 角度摆动幅度
        shakeDuration: 16,               // 摆动持续帧数
        shakeCooldown: 2                 // 摆动冷却时间
    },
    
    // 3. 背景设置
    background: {
        speed: 0.5,                      // 背景移动速度（每帧像素数）
        groundSpeed: 0.8                 // 地面移动速度（每帧像素数）
    },
    
    // 4. 雨滴设置
    rain: {
        baseSpeed: 1.5,                  // 基础下落速度（每帧像素数）- 放慢速度
        lateralAngle: 15,                // 雨滴下落角度(度) - 添加向左倾斜
        lateralSpeedVariation: 0.5,      // 横向速度变化范围
        verticalSpeedVariation: 0.7,     // 纵向速度变化范围
        spawnRate: 5,                    // 雨滴生成间隔（帧数）
        acceleration: 0.0001,            // 每帧速度增加量
        sizeMin: 3,                      // 最小雨滴半径
        sizeMax: 6,                      // 最大雨滴半径
        groupSize: 7,                    // 每组雨滴的数量
        maxActive: 450,                  // 最大活跃雨滴组数量
        
        // 雨滴弹开效果
        bounceLateralSpeed: 2.5,         // 旋转时水平弹开速度
        bounceVerticalSpeed: 3.0,        // 静止时垂直弹开速度
        bounceDistance: 100,             // 弹开距离
        
        // 滑落机制
        trailDropChance: 0.7,            // 雨滴沿雨伞滑落的概率
        trailSpreadFactor: 0.5           // 滑落雨滴分布因子
    },
    
    // 5. 特效设置
    effects: {
        // 甩水效果
        splashParticleCount: 12,         // 甩水粒子数量
        splashParticleSpeed: 3.0,        // 甩水粒子速度
        splashParticleLifetime: 25,      // 甩水粒子生命周期(帧数)
        splashParticleSize: 1.8,         // 甩水粒子大小
        
        // 地面水花效果
        groundSplashLifetime: 20,        // 地面水花生命周期
        groundSplashRadius: 5            // 地面水花半径
    },
    
    // 6. 游戏区域和难度
    // 修改后的代码
    game: {
        width: window.innerWidth > 800 ? window.innerWidth : 800,  // 动态游戏视口宽度
        height: window.innerHeight > 600 ? window.innerHeight : 600, // 动态游戏视口高度
        groundLevel: 470,                // 地面Y坐标
        difficultyIncrease: 0.1,         // 难度增加速率
        speedIncreaseInterval: 1000,     // 速度增加间隔（帧数）
    
    // 计分系统
    scoreOnRotatingOnly: true        // 只有雨滴击中旋转中的雨伞才得分
},
    
    // 7. 体力系统设置
    stamina: {
        max: 100,                        // 最大体力值
        initial: 100,                    // 初始体力值
        rotationCost: 10,                // 旋转雨伞消耗的体力
        recoveryBase: 15,                 // 每个雨滴提供的基础恢复量
        recoveryMultiplier: 2,         // 每额外击中一个雨滴的恢复倍率
        lowWarningThreshold: 25,         // 低体力警告阈值
        criticalThreshold: 10,           // 危险体力阈值
        naturalDecay: 0.02,              // 自然体力衰减率(每帧)
        minRequiredForAction: 5          // 执行动作需要的最小体力值
    }
};

export default config;