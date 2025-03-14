/*
==============================================================================
雨中漫步 - 体力系统模块
==============================================================================

文件结构：
1. 体力值管理
   - updateStamina - 更新体力值(自然衰减)
   - changeStamina - 改变体力值并记录变化
2. UI交互
   - updateStaminaUI - 更新体力条显示
   - showStaminaChange - 显示体力变化
   - updateStaminaChangeDisplay - 更新体力变化显示
   - showStaminaWarning - 显示体力不足警告
*/

// stamina.js - 处理体力系统
import { game } from './gameState.js';
import { elements } from './elements.js';
import config from './config.js';
import { endGame } from './gameEnd.js';

// 更新体力值
function updateStamina() {
    // 应用自然体力衰减
    game.stamina.current -= config.stamina.naturalDecay;
    
    // 确保体力值不会小于0
    if (game.stamina.current < 0) {
        game.stamina.current = 0;
        
        // 如果体力耗尽，结束游戏
        if (game.isRunning) {
            game.stamina.endReason = "你的体力耗尽了!";
            endGame();
        }
    }
    
    // 更新体力UI
    updateStaminaUI();
}

// 更新体力UI
function updateStaminaUI() {
    // 计算体力百分比
    const percent = (game.stamina.current / config.stamina.max) * 100;
    
    // 更新填充条宽度
    elements.staminaFill.style.width = `${percent}%`;
    
    // 根据体力值改变颜色
    let color;
    if (percent <= config.stamina.criticalThreshold) {
        // 危险 - 红色
        color = '#ff0000';
        // 添加闪烁效果
        elements.staminaFill.style.animation = 'pulse 0.5s infinite alternate';
    } else if (percent <= config.stamina.lowWarningThreshold) {
        // 警告 - 橙色
        color = '#ff9900';
        elements.staminaFill.style.animation = 'none';
    } else {
        // 正常 - 绿色
        color = '#4CAF50';
        elements.staminaFill.style.animation = 'none';
    }
    
    // 应用颜色
    elements.staminaFill.style.backgroundColor = color;
}

// 改变体力值并显示变化
function changeStamina(amount) {
    // 记录旧值
    const oldValue = game.stamina.current;
    
    // 应用变化，并确保在有效范围内
    game.stamina.current = Math.max(0, Math.min(config.stamina.max, game.stamina.current + amount));
    
    // 计算实际变化量
    const actualChange = game.stamina.current - oldValue;
    
    // 如果有实际变化，显示变化指示器
    if (actualChange !== 0) {
        // 记录变化量和显示计时器
        game.stamina.lastChange = actualChange;
        game.stamina.changeDisplayTimer = 60; // 显示60帧
        
        // 更新变化显示
        showStaminaChange(actualChange);
    }
    
    // 更新UI
    updateStaminaUI();
}

// 显示体力变化
function showStaminaChange(change) {
    const changeElement = elements.staminaChange;
    
    // 设置文本和颜色
    if (change > 0) {
        changeElement.textContent = `+${change.toFixed(1)}`;
        changeElement.style.color = '#4CAF50'; // 绿色表示增加
    } else {
        changeElement.textContent = `${change.toFixed(1)}`;
        changeElement.style.color = '#ff0000'; // 红色表示减少
    }
    
    // 重置动画
    changeElement.style.opacity = '1';
    changeElement.style.transform = 'translateY(0)';
    
    // 添加动画
    setTimeout(() => {
        changeElement.style.opacity = '0';
        changeElement.style.transform = 'translateY(-20px)';
    }, 50);
}

// 更新体力变化显示计时器
function updateStaminaChangeDisplay() {
    if (game.stamina.changeDisplayTimer > 0) {
        game.stamina.changeDisplayTimer--;
        
        // 当计时器结束时，隐藏显示
        if (game.stamina.changeDisplayTimer === 0) {
            elements.staminaChange.style.opacity = '0';
        }
    }
}

// 显示体力不足警告
function showStaminaWarning() {
    // 闪烁体力条作为视觉反馈
    elements.staminaContainer.classList.add('warning-flash');
    
    // 短暂后移除闪烁效果
    setTimeout(() => {
        elements.staminaContainer.classList.remove('warning-flash');
    }, 500);
    
    // 显示负面反馈
    showStaminaChange(-1);
}

export { 
    updateStamina, 
    updateStaminaUI, 
    changeStamina, 
    showStaminaChange, 
    updateStaminaChangeDisplay,
    showStaminaWarning
};