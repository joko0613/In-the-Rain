/*
==============================================================================
雨中漫步 - 雨伞交互和动画模块
==============================================================================

文件结构：
1. 交互处理
   - handleInteraction - 处理点击/触摸事件
2. 旋转动画
   - rotateUmbrella - 处理雨伞旋转动画
   - updateUmbrellaHandleForRotation - 更新雨伞把手形状
3. 摆动动画
   - startUmbrellaShake - 启动雨伞摆动效果
   - shakeUmbrella - 处理雨伞摆动动画
4. 状态更新
   - updateUmbrellaPosition - 更新雨伞位置和旋转
   - updateUmbrellaWaterLevel - 更新雨伞积水量
5. 碰撞检测
   - checkUmbrellaCollision - 检测雨滴与雨伞的碰撞
*/

// umbrella.js - 处理雨伞的交互和动画效果
import { game } from './gameState.js';
import { elements } from './elements.js';
import config from './config.js';
import { changeStamina, showStaminaWarning } from './stamina.js';
import { createSplashEffect } from './effects.js';

// 处理点击/触摸交互 - 旋转雨伞
function handleInteraction(event) {
    if (!game.isRunning) return;
    
    // 如果雨伞刚刚操作过，忽略过于频繁的点击
    if (game.frame - game.umbrella.lastActionFrame < config.umbrella.shakeCooldown) 
        return;
    
    // 检查是否有足够的体力来旋转雨伞
    if (game.stamina.current < config.stamina.minRequiredForAction) {
        // 体力不足，可以添加视觉反馈
        showStaminaWarning();
        return;
    }
    
    // 确定旋转方向 (基于点击位置)
    const svgRect = elements.gameCanvas.getBoundingClientRect();
    const clickX = event.clientX - svgRect.left;
    
    // 基于点击位置确定旋转方向
    const rotationDirection = (clickX > game.character.x) ? 1 : -1;
    
    // 启动旋转
    game.umbrella.isRotating = true;
    game.umbrella.rotationProgress = 0;
    game.umbrella.rotationAngle = 0;
    game.umbrella.rotationDirection = rotationDirection;
    
    // 重置本次旋转中击中的雨滴计数
    game.umbrella.raindropsDeflectedInRotation = 0;
    
    // 记录旋转开始帧
    game.umbrella.lastActionFrame = game.frame;
    
    // 消耗体力
    changeStamina(-config.stamina.rotationCost);
    
    // 如果有足够积水，清空并创建甩水效果
    if (game.umbrella.waterLevel > 20) {
        createSplashEffect(rotationDirection);
        game.umbrella.waterLevel = 0;
    }
}

// 雨伞旋转效果
function rotateUmbrella() {
    if (!game.umbrella.isRotating) return;
    
    // 增加旋转进度
    game.umbrella.rotationProgress++;
    
    // 旋转持续时间
    const duration = config.umbrella.rotationDuration;
    
    // 计算旋转完成百分比
    const progress = game.umbrella.rotationProgress / duration;
    
    if (progress < 1) {
        // 计算当前旋转角度 - 在旋转过程中加速然后减速
        // 使用缓动函数使旋转更自然
        let easedProgress = progress < 0.5 ? 
            2 * progress * progress : // 加速阶段
            1 - Math.pow(-2 * progress + 2, 2) / 2; // 减速阶段
        
        // 应用旋转角度 - 一整圈旋转
        game.umbrella.rotationAngle = config.umbrella.rotationAmount * 
                                    easedProgress * 
                                    game.umbrella.rotationDirection;
        
        // 同时加入轻微的摆动效果
        const shakePhase = progress * Math.PI * 10;
        const shakeAmplitude = (1 - progress) * 4; // 随旋转进度减小抖动
        
        game.umbrella.offsetX = config.umbrella.offsetX + 
                               Math.sin(shakePhase) * shakeAmplitude;
        game.umbrella.offsetY = config.umbrella.offsetY + 
                               Math.cos(shakePhase * 0.8) * shakeAmplitude * 0.5;
        game.umbrella.rotation = config.umbrella.defaultAngle + 
                                Math.sin(shakePhase * 1.2) * shakeAmplitude;
        
        // 更新雨伞把手形状 - 模拟Y轴旋转效果
        updateUmbrellaHandleForRotation(game.umbrella.rotationAngle);
    } else {
        // 旋转结束，恢复正常位置
        game.umbrella.rotationAngle = 0;
        game.umbrella.offsetX = config.umbrella.offsetX;
        game.umbrella.offsetY = config.umbrella.offsetY;
        game.umbrella.rotation = config.umbrella.defaultAngle;
        game.umbrella.isRotating = false;
        
        // 重置雨伞把手形状
        updateUmbrellaHandleForRotation(0);
        
        // 旋转结束后开始摆动效果
        startUmbrellaShake();
        
        // 旋转结束后检查是否击中了雨滴，并回复体力
        if (game.umbrella.raindropsDeflectedInRotation > 0) {
            // 计算恢复体力值 - 基础值加上每个额外雨滴的奖励
            let recoveryAmount = config.stamina.recoveryBase;
            if (game.umbrella.raindropsDeflectedInRotation > 1) {
                recoveryAmount += (game.umbrella.raindropsDeflectedInRotation - 1) * config.stamina.recoveryMultiplier;
            }
            
            // 应用体力恢复
            changeStamina(recoveryAmount);
        }
        
        // 重置击中计数
        game.umbrella.raindropsDeflectedInRotation = 0;
    }
    
    // 更新雨伞位置
    updateUmbrellaPosition();
}

// 更新雨伞把手形状以模拟Y轴旋转
function updateUmbrellaHandleForRotation(angle) {
    // 归一化角度到0-360范围
    let normalizedAngle = angle % 360;
    if (normalizedAngle < 0) normalizedAngle += 360;
    
    // 计算当前旋转阶段 - 把手的可见性和形状会随旋转而变化
    
    // 计算把手弯曲程度 - 随旋转角度变化
    // 使用余弦函数模拟把手在旋转中的可见性变化
    const visibilityFactor = Math.cos(normalizedAngle * Math.PI / 180);
    
    // 把手的弯曲部分的可见长度
    const bendWidth = 5 * visibilityFactor;
    
    // 根据旋转角度段确定把手形状
    let handlePath;
    
    if (normalizedAngle >= 0 && normalizedAngle < 90) {
        // 从正面(J形)逐渐变为侧面(I形)
        const factor = 1 - normalizedAngle / 90;
        handlePath = `M0,0 L0,20 C0,${25 * factor + 20 * (1 - factor)} ${bendWidth},${25 * factor + 20 * (1 - factor)} ${bendWidth},20 L${bendWidth},${18 * factor + 20 * (1 - factor)}`;
    }
    else if (normalizedAngle >= 90 && normalizedAngle < 180) {
        // 从侧面(I形)逐渐变为背面(把手被伞面遮挡)
        handlePath = `M0,0 L0,20`;
    }
    else if (normalizedAngle >= 180 && normalizedAngle < 270) {
        // 从背面逐渐变为另一侧侧面(I形)
        handlePath = `M0,0 L0,20`;
    }
    else { // 270-360度
        // 从侧面(I形)逐渐恢复为正面(J形)
        const factor = (normalizedAngle - 270) / 90;
        handlePath = `M0,0 L0,20 C0,${20 + 5 * factor} ${bendWidth * factor},${20 + 5 * factor} ${bendWidth * factor},20 L${bendWidth * factor},${20 - 2 * factor}`;
    }
    
    // 应用路径到SVG元素
    elements.umbrellaHandle.setAttribute('d', handlePath);
    
    // 调整伞柄的可见性 - 在特定角度范围内降低不透明度
    if (normalizedAngle > 160 && normalizedAngle < 200) {
        // 当雨伞转到背面时，把手被伞面遮挡，降低可见性
        const opacity = Math.max(0, 1 - Math.abs(180 - normalizedAngle) / 20);
        elements.umbrellaHandle.setAttribute('opacity', 1 - opacity);
    } else {
        elements.umbrellaHandle.setAttribute('opacity', 1);
    }
}

// 启动雨伞摆动效果
function startUmbrellaShake() {
    game.umbrella.isShaking = true;
    game.umbrella.shakeProgress = 0;
    game.umbrella.shakeSeed = Math.random() * 10000 + game.frame;
}

// 雨伞摆动效果
function shakeUmbrella() {
    if (!game.umbrella.isShaking) return;
    
    // 增加摇摆进度
    game.umbrella.shakeProgress++;
    
    // 摇摆持续时间
    const duration = config.umbrella.shakeDuration;
    
    // 计算摇摆完成百分比
    const progress = game.umbrella.shakeProgress / duration;
    
    if (progress < 1) {
        // 使用正弦波产生自然的来回摇摆效果
        // 振幅随时间衰减
        const decay = 1 - progress;
        
        // 使用不同相位的正弦波，使X、Y和旋转的变化不完全同步
        const seedX = Math.sin(game.umbrella.shakeSeed * 0.1);
        const seedY = Math.cos(game.umbrella.shakeSeed * 0.1);
        const seedR = Math.sin(game.umbrella.shakeSeed * 0.2);
        
        // X方向的偏移 - 水平方向轻微摆动
        const phaseX = progress * Math.PI * 6 + seedX;
        const offsetX = Math.sin(phaseX) * config.umbrella.shakeAmplitudeX * decay;
        
        // Y方向的偏移 - 垂直方向轻微摆动
        const phaseY = progress * Math.PI * 5 + seedY;
        const offsetY = Math.sin(phaseY) * config.umbrella.shakeAmplitudeY * decay;
        
        // 旋转角度的偏移 - 角度轻微摆动
        const phaseR = progress * Math.PI * 7 + seedR;
        const offsetR = Math.sin(phaseR) * config.umbrella.shakeAmplitudeR * decay;
        
        // 应用偏移
        game.umbrella.offsetX = config.umbrella.offsetX + offsetX;
        game.umbrella.offsetY = config.umbrella.offsetY + offsetY;
        game.umbrella.rotation = config.umbrella.defaultAngle + offsetR;
    } else {
        // 摇摆结束，恢复正常位置
        game.umbrella.offsetX = config.umbrella.offsetX;
        game.umbrella.offsetY = config.umbrella.offsetY;
        game.umbrella.rotation = config.umbrella.defaultAngle;
        game.umbrella.isShaking = false;
    }
    
    // 更新雨伞位置
    updateUmbrellaPosition();
}

// 更新雨伞位置和旋转
function updateUmbrellaPosition() {
    // 获取当前的偏移和旋转值
    const offsetX = game.umbrella.offsetX;
    const offsetY = game.umbrella.offsetY;
    const rotation = game.umbrella.rotation;
    
    // 应用旋转变换
    elements.umbrellaGroup.setAttribute('transform', 
        `translate(${offsetX}, ${offsetY}) rotate(${rotation})`);
}

// 更新雨伞积水量
function updateUmbrellaWaterLevel() {
    // 雨伞积水最大值
    const maxWaterLevel = 100;
    
    // 如果雨伞积水已满，不再增加
    if (game.umbrella.waterLevel >= maxWaterLevel) return;
    
    // 每帧雨伞积水自然增加的量(模拟雨水积累)
    const naturalIncrease = 0.1;
    game.umbrella.waterLevel = Math.min(maxWaterLevel, 
                               game.umbrella.waterLevel + naturalIncrease);
}

// 检查雨滴是否与雨伞碰撞
function checkUmbrellaCollision(raindrop, umbrellaX, umbrellaY, umbrellaRotation) {
    // 计算雨滴相对于雨伞枢轴的位置
    const dx = raindrop.x - umbrellaX;
    const dy = raindrop.y - umbrellaY;
    
    // 旋转点以考虑雨伞旋转
    const rotatedX = dx * Math.cos(-umbrellaRotation) - dy * Math.sin(-umbrellaRotation);
    const rotatedY = dx * Math.sin(-umbrellaRotation) + dy * Math.cos(-umbrellaRotation);
    
    // 检查点是否在雨伞曲线下方
    if (Math.abs(rotatedX) <= config.umbrella.width / 2 && // 在雨伞宽度内
        rotatedY >= -config.umbrella.height && // 在曲线顶部以下
        rotatedY <= 0) { // 在雨伞枢轴以上
        
        // 计算雨伞在此x位置的高度
        // 简单抛物线: y = (x/width)^2 * height
        const umbrellaHeight = -(config.umbrella.height * 
                              (1 - Math.pow(2 * rotatedX / config.umbrella.width, 2)));
        
        // 如果雨滴在此高度以下，它在雨伞下方
        return rotatedY >= umbrellaHeight;
    }
    
    return false;
}

export { 
    handleInteraction, 
    rotateUmbrella, 
    shakeUmbrella, 
    updateUmbrellaPosition, 
    updateUmbrellaWaterLevel,
    checkUmbrellaCollision
};