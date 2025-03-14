/*
==============================================================================
雨中漫步 - 雨滴系统模块
==============================================================================

文件结构：
1. 雨滴生成
   - spawnRaindrop - 创建新的雨滴组
2. 雨滴更新和物理
   - updateRaindrops - 更新所有雨滴位置和状态
3. 碰撞检测
   - checkCollision - 检测雨滴与角色/雨伞碰撞
   - checkCharacterCollision - 检测雨滴与角色碰撞
*/

// raindrops.js - 处理雨滴的生成、移动和碰撞检测
import { game } from './gameState.js';
import { elements, updateScoreDisplay } from './elements.js';
import config from './config.js';
import { checkUmbrellaCollision } from './umbrella.js';
import { 
    createVerticalBounceEffect, 
    createLateralBounceEffect, 
    createTrailingDrop,
    createGroundSplash
} from './effects.js';
import { endGame } from './gameEnd.js';

// 生成新雨滴
function spawnRaindrop() {
    // 生成随机位置作为雨滴组的中心
    const centerX = Math.random() * config.game.width;
    const y = 0; // 从顶部开始
    
    // 创建一个组元素来包含多个雨滴
    const raindropGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    elements.raindropsContainer.appendChild(raindropGroup);
    
    // 生成多个雨滴作为一组
    const dropCount = config.rain.groupSize + Math.floor(Math.random() * 3) - 1;
    const drops = [];
    
    // 计算雨滴的下落角度和速度 - 带有随机变化
    const baseAngleRad = config.rain.lateralAngle * Math.PI / 180;
    
    for (let i = 0; i < dropCount; i++) {
        // 随机大小
        const size = config.rain.sizeMin + Math.random() * 
                   (config.rain.sizeMax - config.rain.sizeMin);
        
        // 在中心点附近随机分布
        const offsetX = (Math.random() - 0.5) * 35;
        const offsetY = (Math.random() - 0.5) * 20;
        const x = centerX + offsetX;
        
        // 计算这个雨滴的横向和纵向速度（添加随机性）
        // 横向速度（负值表示向左）
        const lateralSpeedVariation = (Math.random() - 0.5) * config.rain.lateralSpeedVariation;
        const vx = -Math.sin(baseAngleRad) * config.rain.baseSpeed * (1 + lateralSpeedVariation);
        
        // 纵向速度
        const verticalSpeedVariation = (Math.random() * config.rain.verticalSpeedVariation);
        const vy = Math.cos(baseAngleRad) * config.rain.baseSpeed * (1 + verticalSpeedVariation);
        
        // 创建主雨滴
        const raindrop = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // 使用路径创建水滴形状
        const dropPath = `M${x},${y} 
                          C${x-size*0.5},${y+size*0.5} ${x-size*0.5},${y+size*1.5} ${x},${y+size*2} 
                          C${x+size*0.5},${y+size*1.5} ${x+size*0.5},${y+size*0.5} ${x},${y} Z`;
        
        raindrop.setAttribute('d', dropPath);
        raindrop.setAttribute('fill', '#88ccff');
        raindrop.setAttribute('opacity', '0.8');
        
        // 添加高光效果
        const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        highlight.setAttribute('cx', x - size * 0.2);
        highlight.setAttribute('cy', y + size * 0.5);
        highlight.setAttribute('rx', size * 0.2);
        highlight.setAttribute('ry', size * 0.3);
        highlight.setAttribute('fill', '#ffffff');
        highlight.setAttribute('opacity', '0.4');
        
        // 添加到组
        raindropGroup.appendChild(raindrop);
        raindropGroup.appendChild(highlight);
        
        // 记录这个雨滴的信息
        drops.push({
            x: x,
            y: y,
            size: size,
            offsetY: offsetY,
            element: raindrop,
            highlight: highlight,
            vx: vx,        // 横向速度分量
            vy: vy         // 纵向速度分量
        });
    }
    
    // 添加到游戏状态
    game.raindrops.push({
        element: raindropGroup,
        drops: drops,
        centerX: centerX,
        y: y
    });
}

// 更新所有雨滴并检查碰撞
function updateRaindrops() {
    const raindropsToRemove = [];
    
    game.raindrops.forEach((raindropGroup, index) => {
        // 更新整组雨滴的位置 - 基础移动
        raindropGroup.y += config.rain.baseSpeed;
        
        // 更新每个单独雨滴的位置
        raindropGroup.drops.forEach(drop => {
            // 更新雨滴位置 - 根据各自的速度向量
            drop.x += drop.vx;
            const newY = raindropGroup.y + drop.offsetY + drop.vy;
            
            // 更新水滴形状
            const x = drop.x;
            const y = newY;
            const size = drop.size;
            
            const dropPath = `M${x},${y} 
                          C${x-size*0.5},${y+size*0.5} ${x-size*0.5},${y+size*1.5} ${x},${y+size*2} 
                          C${x+size*0.5},${y+size*1.5} ${x+size*0.5},${y+size*0.5} ${x},${y} Z`;
            
            drop.element.setAttribute('d', dropPath);
            
            // 更新高光位置
            drop.highlight.setAttribute('cx', x - size * 0.2);
            drop.highlight.setAttribute('cy', y + size * 0.5);
        });
        
        // 检查雨滴是否落到地面
        if (raindropGroup.y > config.game.groundLevel) {
            // 创建地面溅起效果
            raindropGroup.drops.forEach(drop => {
                createGroundSplash(drop.x, config.game.groundLevel);
            });
            raindropsToRemove.push(index);
            return;
        }
        
        // 检查与雨伞或角色的碰撞
        let hasCollisionWithUmbrella = false;
        let hasCollisionWithCharacter = false;
        
        // 为每个雨滴单独检查碰撞
        raindropGroup.drops.forEach(drop => {
            const collisionResult = checkCollision({
                x: drop.x,
                y: raindropGroup.y + drop.offsetY,
                size: drop.size
            });
            
            if (collisionResult.collided) {
                // 如果是与雨伞碰撞
                if (collisionResult.hitUmbrella) {
                    hasCollisionWithUmbrella = true;
                    
                    // 如果雨伞正在旋转，创建水平弹开效果并计分
                    if (game.umbrella.isRotating) {
                        const bounceDirection = game.umbrella.rotationDirection;
                        createLateralBounceEffect(drop.x, raindropGroup.y + drop.offsetY, bounceDirection);
                        
                        // 新增：记录这次旋转中击中的雨滴数量
                        game.umbrella.raindropsDeflectedInRotation++;
                        
                        // 只有在雨伞旋转时击中才增加分数
                        if (config.game.scoreOnRotatingOnly) {
                            // 增加分数
                            game.score++;
                            updateScoreDisplay(game.score);
                        }
                    } 
                    // 如果雨伞静止，根据概率创建垂直弹开或滑落效果
                    else {
                        // 控制垂直弹开的概率
                        if (Math.random() >= config.rain.trailDropChance) {
                            createVerticalBounceEffect(drop.x, raindropGroup.y + drop.offsetY);
                        } else {
                            // 计算滑落方向（根据雨滴在雨伞上的位置）
                            const umbrellaCenterX = game.character.x + game.umbrella.offsetX;
                            const umbrellaSide = (drop.x > umbrellaCenterX) ? 1 : -1;
                            
                            // 创建多个滑落雨滴以增加效果
                            const trailCount = 1 + Math.floor(Math.random() * 2);
                            for (let i = 0; i < trailCount; i++) {
                                // 滑落雨滴的起点位置有轻微的随机偏移
                                const spreadFactor = config.rain.trailSpreadFactor;
                                const trailX = drop.x + (Math.random() - 0.5) * spreadFactor * 10;
                                const trailY = raindropGroup.y + drop.offsetY + (Math.random() - 0.5) * spreadFactor * 5;
                                
                                createTrailingDrop(trailX, trailY, umbrellaSide);
                            }
                        }
                        
                        // 如果配置不要求只对旋转雨伞计分，那么也为静止雨伞阻挡的雨滴计分
                        if (!config.game.scoreOnRotatingOnly) {
                            // 增加分数
                            game.score++;
                            updateScoreDisplay(game.score);
                        }
                    }
                } 
                // 如果是与角色碰撞
                else if (collisionResult.hitCharacter) {
                    hasCollisionWithCharacter = true;
                }
            }
        });
        
        // 如果任何雨滴与雨伞或角色碰撞，移除整个雨滴组
        if (hasCollisionWithUmbrella || hasCollisionWithCharacter) {
            raindropsToRemove.push(index);
        }
    });
    
    // 移除处理过的雨滴组（倒序移除以避免索引问题）
    for (let i = raindropsToRemove.length - 1; i >= 0; i--) {
        const index = raindropsToRemove[i];
        elements.raindropsContainer.removeChild(game.raindrops[index].element);
        game.raindrops.splice(index, 1);
    }
}

// 检查雨滴是否与雨伞或角色碰撞
function checkCollision(raindrop) {
    // 默认结果
    const result = {
        collided: false,
        hitUmbrella: false,
        hitCharacter: false
    };
    
    // 角色位置
    const characterX = game.character.x;
    const characterY = game.character.y;
    const characterTop = characterY - config.character.height / 2; // 包括头部
    
    // 雨伞位置
    const umbrellaX = characterX + game.umbrella.offsetX;
    const umbrellaY = characterY + game.umbrella.offsetY;
    const umbrellaRotation = game.umbrella.rotation * Math.PI / 180;
    
    // 计算雨滴是否靠近角色
    const dx = raindrop.x - characterX;
    const dy = raindrop.y - characterY;
    const distanceToCharacter = Math.sqrt(dx * dx + dy * dy);
    
    // 如果雨滴远离角色，不可能发生碰撞
    if (distanceToCharacter > 100) return result;
    
    // 检查与雨伞的碰撞
    if (checkUmbrellaCollision(raindrop, umbrellaX, umbrellaY, umbrellaRotation)) {
        // 成功阻挡
        
        // 增加雨伞积水量
        game.umbrella.waterLevel = Math.min(100, game.umbrella.waterLevel + 2);
        
        result.collided = true;
        result.hitUmbrella = true;
        return result;
    }
    
    // 检查与角色的碰撞
    if (checkCharacterCollision(raindrop, characterX, characterTop)) {
        // 角色被淋湿 - 游戏结束
        game.stamina.endReason = "你被雨淋湿了!";
        endGame();
        
        result.collided = true;
        result.hitCharacter = true;
        return result;
    }
    
    return result;
}

// 检查雨滴是否与角色碰撞
function checkCharacterCollision(raindrop, characterX, characterTop) {
    // 简单的矩形碰撞检测，用于角色身体和头部
    return raindrop.x >= characterX - config.character.width / 2 &&
           raindrop.x <= characterX + config.character.width / 2 &&
           raindrop.y >= characterTop &&
           raindrop.y <= game.character.y + config.character.height;
}

export { spawnRaindrop, updateRaindrops };