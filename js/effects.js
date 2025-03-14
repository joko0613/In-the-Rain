/*
==============================================================================
雨中漫步 - 视觉效果模块
==============================================================================

文件结构：
1. 雨滴特效
   - createSplashEffect - 创建甩水特效
   - createVerticalBounceEffect - 创建垂直弹开效果
   - createLateralBounceEffect - 创建水平弹开效果
   - updateSplashParticles - 更新甩水特效粒子
2. 滑落效果
   - createTrailingDrop - 创建雨滴滑落效果
   - updateTrailingDrops - 更新雨伞上滑落的雨滴
3. 地面水花
   - createGroundSplash - 创建地面溅起水花
   - updateGroundSplashes - 更新地面水花效果
*/

// effects.js - 处理各种视觉效果，如甩水，滑落和地面水花
import { game } from './gameState.js';
import { elements, updateScoreDisplay } from './elements.js';
import config from './config.js';

// 创建甩水特效
function createSplashEffect(direction) {
    // 粒子数量基于积水量
    const particleCount = Math.floor(config.effects.splashParticleCount * 
                                   (game.umbrella.waterLevel / 100) + 3);
    
    // 雨伞位置
    const umbrellaX = game.character.x + game.umbrella.offsetX;
    const umbrellaY = game.character.y + game.umbrella.offsetY;
    const umbrellaEdge = config.umbrella.width / 2;
    
    // 创建甩水粒子
    for (let i = 0; i < particleCount; i++) {
        // 粒子从雨伞边缘飞出
        const angle = (direction > 0 ? -30 : -150) + (Math.random() - 0.5) * 40;
        const distance = Math.random() * umbrellaEdge;
        
        const startX = umbrellaX + Math.cos(angle * Math.PI / 180) * distance;
        const startY = umbrellaY + Math.sin(angle * Math.PI / 180) * distance - 10;
        
        // 粒子速度 - 更快更远
        const speed = config.effects.splashParticleSpeed * (0.7 + Math.random() * 0.6);
        
        // 创建粒子元素
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('cx', startX);
        particle.setAttribute('cy', startY);
        particle.setAttribute('r', config.effects.splashParticleSize * (0.7 + Math.random() * 0.6));
        particle.setAttribute('fill', '#88ccff');
        particle.setAttribute('opacity', '0.7');
        
        // 添加到特效容器
        elements.splashEffectsContainer.appendChild(particle);
        
        // 记录粒子数据
        game.splashParticles.push({
            element: particle,
            x: startX,
            y: startY,
            vx: speed * Math.cos(angle * Math.PI / 180),
            vy: speed * Math.sin(angle * Math.PI / 180),
            gravity: 0.15 + Math.random() * 0.1,
            lifetime: config.effects.splashParticleLifetime * (0.8 + Math.random() * 0.4),
            opacity: 0.7
        });
        
        // 增加分数 - 甩水也能得分
        game.score++;
    }
    
    // 更新分数显示
    updateScoreDisplay(game.score);
}

// 创建雨滴垂直弹开效果（适用于静止伞面）
function createVerticalBounceEffect(x, y) {
    // 创建几个弹开的小水滴
    const dropletCount = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < dropletCount; i++) {
        // 垂直向上弹出，带一点随机偏移
        const angle = -90 + (Math.random() - 0.5) * 20; // 主要垂直向上
        const speed = config.rain.bounceVerticalSpeed * (0.8 + Math.random() * 0.4);
        
        // 创建弹开粒子
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('cx', x);
        particle.setAttribute('cy', y);
        particle.setAttribute('r', 1 + Math.random());
        particle.setAttribute('fill', '#88ccff');
        particle.setAttribute('opacity', '0.7');
        
        // 添加到特效容器
        elements.splashEffectsContainer.appendChild(particle);
        
        // 记录粒子数据
        game.splashParticles.push({
            element: particle,
            x: x,
            y: y,
            vx: speed * Math.cos(angle * Math.PI / 180),
            vy: speed * Math.sin(angle * Math.PI / 180),
            gravity: 0.15 + Math.random() * 0.05,
            lifetime: 15 + Math.random() * 10,
            opacity: 0.7
        });
    }
}

// 创建雨滴水平弹开效果（适用于旋转伞面）
function createLateralBounceEffect(x, y, direction) {
    // 创建几个弹开的小水滴
    const dropletCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < dropletCount; i++) {
        // 更水平的弹出角度，远离雨伞
        const baseAngle = direction > 0 ? -20 : -160; // 更平行于地面
        const angle = baseAngle + (Math.random() - 0.5) * 30;
        const speed = config.rain.bounceLateralSpeed * (0.9 + Math.random() * 0.6);
        
        // 创建弹开粒子
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('cx', x);
        particle.setAttribute('cy', y);
        particle.setAttribute('r', 1 + Math.random());
        particle.setAttribute('fill', '#88ccff');
        particle.setAttribute('opacity', '0.7');
        
        // 添加到特效容器
        elements.splashEffectsContainer.appendChild(particle);
        
        // 记录粒子数据 - 更远的弹出距离
        game.splashParticles.push({
            element: particle,
            x: x,
            y: y,
            vx: speed * Math.cos(angle * Math.PI / 180),
            vy: speed * Math.sin(angle * Math.PI / 180),
            gravity: 0.1 + Math.random() * 0.05,
            lifetime: 20 + Math.random() * 15, // 更长的生命周期
            opacity: 0.7
        });
    }
}

// 创建雨滴在雨伞上滑落的效果
function createTrailingDrop(x, y, umbrellaSide) {
    // 创建滑落的雨滴元素
    const trailDrop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    trailDrop.setAttribute('cx', x);
    trailDrop.setAttribute('cy', y);
    trailDrop.setAttribute('r', 1.5);
    trailDrop.setAttribute('fill', '#88ccff');
    trailDrop.setAttribute('opacity', '0.6');
    
    // 添加到轨迹容器
    elements.raindropTrailsContainer.appendChild(trailDrop);
    
    // 计算滑落方向（根据雨伞形状和碰撞点位置）
    const umbrellaCenterX = game.character.x + game.umbrella.offsetX;
    const slideDirection = (x < umbrellaCenterX) ? -1 : 1;
    
    // 记录滑落雨滴数据
    game.trailingDrops.push({
        element: trailDrop,
        x: x,
        y: y,
        umbrellaSide: umbrellaSide, // -1为左侧，1为右侧
        progress: 0,
        lifetime: 30 + Math.random() * 20,
        slideSpeed: 0.5 + Math.random() * 0.5,
        slideDirection: slideDirection
    });
}

// 更新雨伞上滑落的雨滴
function updateTrailingDrops() {
    const dropsToRemove = [];
    
    game.trailingDrops.forEach((drop, index) => {
        // 增加进度
        drop.progress++;
        
        // 获取当前雨伞位置和角度
        const umbrellaX = game.character.x + game.umbrella.offsetX;
        const umbrellaY = game.character.y + game.umbrella.offsetY;
        const umbrellaRotation = game.umbrella.rotation * Math.PI / 180;
        const umbrellaEdge = config.umbrella.width / 2;
        
        // 计算雨滴在雨伞上的滑落轨迹
        // 滑落轨迹是沿着雨伞边缘的弧形
        const slideProgress = Math.min(1, drop.progress / drop.lifetime);
        
        // 雨滴从初始位置向伞沿滑动
        const slideAngle = (Math.PI / 2) * slideProgress * drop.slideDirection;
        const umbrellaRadius = config.umbrella.width / 2;
        
        // 雨滴滑落到伞沿
        if (slideProgress >= 0.95) {
            // 到达伞沿，开始落下
            const fallProgress = (slideProgress - 0.95) * 20; // 放大落下进度
            const dropX = umbrellaX + Math.cos(slideAngle) * umbrellaRadius;
            const dropY = umbrellaY - Math.sin(Math.PI/2 - slideAngle) * config.umbrella.height 
                         + fallProgress * 10; // 加速下落
            
            // 更新雨滴位置
            drop.x = dropX;
            drop.y = dropY;
            
            // 如果落到地面，创建溅起效果并移除
            if (dropY >= config.game.groundLevel) {
                createGroundSplash(dropX, config.game.groundLevel);
                dropsToRemove.push(index);
            }
        } else {
            // 沿着雨伞表面滑动
            // 用抛物线模拟雨伞形状: y = (x/width)^2 * height
            const relativeX = Math.cos(slideAngle) * umbrellaRadius;
            const umbrellaHeight = Math.sin(Math.PI/2 - Math.abs(slideAngle)) * config.umbrella.height;
            
            const dropX = umbrellaX + relativeX;
            const dropY = umbrellaY - umbrellaHeight;
            
            // 更新雨滴位置
            drop.x = dropX;
            drop.y = dropY;
            
            // 淡出效果
            const opacity = Math.max(0, 0.6 * (1 - slideProgress * 0.5));
            drop.element.setAttribute('opacity', opacity);
        }
        
        // 应用位置
        drop.element.setAttribute('cx', drop.x);
        drop.element.setAttribute('cy', drop.y);
        
        // 如果寿命结束，标记为移除
        if (drop.progress >= drop.lifetime) {
            dropsToRemove.push(index);
        }
    });
    
    // 移除处理完的滑落雨滴
    for (let i = dropsToRemove.length - 1; i >= 0; i--) {
        const index = dropsToRemove[i];
        elements.raindropTrailsContainer.removeChild(game.trailingDrops[index].element);
        game.trailingDrops.splice(index, 1);
    }
}

// 更新甩水特效粒子
function updateSplashParticles() {
    const particlesToRemove = [];
    
    game.splashParticles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // 应用重力
        particle.vy += particle.gravity;
        
        // 更新SVG元素
        particle.element.setAttribute('cx', particle.x);
        particle.element.setAttribute('cy', particle.y);
        
        // 降低生命值和透明度
        particle.lifetime--;
        particle.opacity = 0.7 * (particle.lifetime / config.effects.splashParticleLifetime);
        particle.element.setAttribute('opacity', particle.opacity);
        
        // 如果粒子碰到地面，创建溅起效果并移除
        if (particle.y >= config.game.groundLevel) {
            createGroundSplash(particle.x, config.game.groundLevel);
            particlesToRemove.push(index);
        }
        // 生命结束或飞出屏幕，标记为移除
        else if (particle.lifetime <= 0 || 
            particle.x < 0 || particle.x > config.game.width || 
            particle.y < 0) {
            particlesToRemove.push(index);
        }
    });
    
    // 移除过期粒子
    for (let i = particlesToRemove.length - 1; i >= 0; i--) {
        const index = particlesToRemove[i];
        elements.splashEffectsContainer.removeChild(game.splashParticles[index].element);
        game.splashParticles.splice(index, 1);
    }
}

// 创建地面溅起的水花效果
function createGroundSplash(x, y) {
    // 创建水花容器
    const splashGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    elements.groundSplashesContainer.appendChild(splashGroup);
    
    // 创建水花圆圈（扩散效果）
    const splash = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    splash.setAttribute('cx', x);
    splash.setAttribute('cy', y);
    splash.setAttribute('r', 1);
    splash.setAttribute('fill', 'none');
    splash.setAttribute('stroke', '#88ccff');
    splash.setAttribute('stroke-width', '1');
    splash.setAttribute('opacity', '0.7');
    
    // 添加到水花容器
    splashGroup.appendChild(splash);
    
    // 创建几个小水滴（溅起效果）
    const dropletCount = 2 + Math.floor(Math.random() * 3);
    const droplets = [];
    
    for (let i = 0; i < dropletCount; i++) {
        const angle = Math.random() * Math.PI;
        const speed = 0.3 + Math.random() * 0.5;
        const size = 0.8 + Math.random() * 0.7;
        
        const droplet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        droplet.setAttribute('cx', x);
        droplet.setAttribute('cy', y);
        droplet.setAttribute('r', size);
        droplet.setAttribute('fill', '#88ccff');
        droplet.setAttribute('opacity', '0.6');
        
        // 添加到水花容器
        splashGroup.appendChild(droplet);
        
        // 记录溅起水滴数据
        droplets.push({
            element: droplet,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: -Math.sin(angle) * speed - 1,
            gravity: 0.1,
            size: size
        });
    }
    
    // 记录水花数据
    game.groundSplashes.push({
        element: splashGroup,
        splash: splash,
        droplets: droplets,
        x: x,
        y: y,
        radius: 1,
        progress: 0,
        lifetime: config.effects.groundSplashLifetime + Math.random() * 10
    });
}

// 更新地面溅起的水花
function updateGroundSplashes() {
    const splashesToRemove = [];
    
    game.groundSplashes.forEach((splash, index) => {
        // 增加进度
        splash.progress++;
        
        // 计算完成百分比
        const progress = splash.progress / splash.lifetime;
        
        // 更新圆圈扩散效果
        const newRadius = 1 + config.effects.groundSplashRadius * progress;
        const opacity = 0.7 * (1 - progress);
        
        splash.radius = newRadius;
        splash.splash.setAttribute('r', newRadius);
        splash.splash.setAttribute('opacity', opacity);
        
        // 更新溅起的小水滴
        splash.droplets.forEach(droplet => {
            // 应用重力
            droplet.vy += droplet.gravity;
            
            // 更新位置
            droplet.x += droplet.vx;
            droplet.y += droplet.vy;
            
            // 如果落回地面，停止移动
            if (droplet.y >= config.game.groundLevel) {
                droplet.y = config.game.groundLevel;
                droplet.vy = 0;
                droplet.vx *= 0.8; // 摩擦力
            }
            
            // 淡出效果
            const dropOpacity = 0.6 * (1 - progress);
            
            // 应用更新
            droplet.element.setAttribute('cx', droplet.x);
            droplet.element.setAttribute('cy', droplet.y);
            droplet.element.setAttribute('opacity', dropOpacity);
        });
        
        // 如果寿命结束，标记为移除
        if (splash.progress >= splash.lifetime) {
            splashesToRemove.push(index);
        }
    });
    
    // 移除处理完的水花
    for (let i = splashesToRemove.length - 1; i >= 0; i--) {
        const index = splashesToRemove[i];
        elements.groundSplashesContainer.removeChild(game.groundSplashes[index].element);
        game.groundSplashes.splice(index, 1);
    }
}

export { 
    createSplashEffect, 
    createVerticalBounceEffect, 
    createLateralBounceEffect, 
    createTrailingDrop,
    createGroundSplash,
    updateTrailingDrops,
    updateSplashParticles,
    updateGroundSplashes
};