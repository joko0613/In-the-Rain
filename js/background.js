/*
==============================================================================
雨中漫步 - 背景和地面移动模块
==============================================================================

文件结构：
1. moveBackground - 处理背景城市轮廓的移动和循环
2. moveGround - 处理地面和水坑的移动和循环
*/

// background.js - 处理背景和地面的移动效果
import { game } from './gameState.js';
import { elements } from './elements.js';
import config from './config.js';

// 移动背景
// 修改后的代码
function moveBackground() {
    // 更新背景位置
    game.background.x -= config.background.speed;
    
    // 计算视口宽度与游戏宽度的比例
    const viewportWidth = window.innerWidth;
    const gameWidth = 800;
    const widthRatio = viewportWidth / gameWidth;
    
    // 当第一个背景完全移出屏幕时，重置位置实现无限循环
    // 在宽屏幕上，需要考虑屏幕宽度因素
    if (game.background.x <= -800 * Math.max(1, widthRatio)) {
        game.background.x = 0;
    }
    
    // 更新SVG中的背景位置
    elements.cityscapeContainer.setAttribute('transform', `translate(${game.background.x}, 0)`);
}

// 移动地面
function moveGround() {
    // 更新地面位置
    game.ground.x -= config.background.groundSpeed;
    
    // 当第一组水坑完全移出屏幕时，重置位置实现无限循环
    if (game.ground.x <= -800) {
        game.ground.x = 0;
    }
    
    // 更新SVG中的地面位置
    elements.groundContainer.setAttribute('transform', `translate(${game.ground.x}, 0)`);
}

export { moveBackground, moveGround };