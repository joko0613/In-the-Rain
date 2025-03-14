/*
==============================================================================
雨中漫步 - 游戏结束模块
==============================================================================

文件结构：
1. endGame - 处理游戏结束流程
*/

// gameEnd.js - 处理游戏结束逻辑
import { game } from './gameState.js';
import { elements, updateEndScreen } from './elements.js';

// 结束游戏
function endGame() {
    game.isRunning = false;
    
    // 更新UI
    updateEndScreen(game.score, game.stamina.endReason);
}

export { endGame };