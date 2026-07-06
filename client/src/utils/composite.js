// Vector Doodle Drawing Helpers
const drawDoodleBow = (ctx, x, y, size) => {
  ctx.save();
  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Left loop
  ctx.beginPath();
  ctx.bezierCurveTo(x, y, x - size * 0.4, y - size * 0.5, x - size * 0.5, y, x, y);
  ctx.stroke();

  // Right loop
  ctx.beginPath();
  ctx.bezierCurveTo(x, y, x + size * 0.4, y - size * 0.5, x + size * 0.5, y, x, y);
  ctx.stroke();

  // Knot
  ctx.beginPath();
  ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e1e';
  ctx.fill();

  // Left tail
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.2, y + size * 0.3, x - size * 0.25, y + size * 0.55);
  ctx.stroke();

  // Right tail
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, y + size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.2, y + size * 0.3, x + size * 0.28, y + size * 0.55);
  ctx.stroke();

  ctx.restore();
};

const drawDoodleHeart = (ctx, x, y, size) => {
  ctx.save();
  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.15);
  ctx.bezierCurveTo(x, y - size * 0.1, x - size * 0.4, y - size * 0.1, x - size * 0.4, y + size * 0.25);
  ctx.bezierCurveTo(x - size * 0.4, y + size * 0.55, x, y + size * 0.75, x, y + size * 0.9);
  ctx.bezierCurveTo(x, y + size * 0.75, x + size * 0.4, y + size * 0.55, x + size * 0.4, y + size * 0.25);
  ctx.bezierCurveTo(x + size * 0.4, y - size * 0.1, x, y - size * 0.1, x, y + size * 0.15);
  ctx.stroke();
  
  ctx.restore();
};

const drawDoodleArrow = (ctx, x, y, size) => {
  ctx.save();
  ctx.strokeStyle = '#1e1e1e';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Arrow stem curve
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + size * 0.4, y + size * 0.2, x + size * 0.6, y - size * 0.1, x + size * 0.9, y + size * 0.35);
  ctx.stroke();

  // Arrow head points
  ctx.beginPath();
  ctx.moveTo(x + size * 0.68, y + size * 0.28);
  ctx.lineTo(x + size * 0.9, y + size * 0.35);
  ctx.lineTo(x + size * 0.85, y + size * 0.1);
  ctx.stroke();

  ctx.restore();
};

const drawWashiTape = (ctx, x, y, w, h) => {
  ctx.save();
  ctx.fillStyle = 'rgba(235, 215, 175, 0.45)'; // Semi-transparent beige tape
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;
  ctx.translate(x, y);
  ctx.rotate(-2.5 * Math.PI / 180);

  // Rect with torn edges
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  
  // Left side jagged line
  for (let ly = -h / 2; ly <= h / 2; ly += 4) {
    ctx.lineTo(-w / 2 + (Math.sin(ly) * 2), ly);
  }
  ctx.lineTo(w / 2, h / 2);
  
  // Right side jagged line
  for (let ry = h / 2; ry >= -h / 2; ry -= 4) {
    ctx.lineTo(w / 2 + (Math.cos(ry) * 2), ry);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

// Main Unified Compositing Engine
export const createPhotostrip = async (localCutouts, remoteCutouts, templateConfig, customCaption = '') => {
  return new Promise((resolve) => {
    const { layout, frameCount, photoFilter, frameStyle, decorations, frameDecorations, captionFont, captionText } = templateConfig;
    
    const canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    // 1. Establish Layout Dimensions
    if (layout === 'vertical-strip') {
      canvas.width = 800;
      canvas.height = frameCount === 4 ? 2400 : 1860;
    } else if (layout === 'grid-2x2') {
      canvas.width = 1200;
      canvas.height = 1200;
    } else {
      // Default / Polaroid Cards Tabletop
      canvas.width = 1200;
      canvas.height = 800;
    }

    // Helper to generate the background pattern fill style
    const getBackgroundFill = () => {
      const bg = frameStyle.background;
      if (bg.type === 'color') {
        return bg.value;
      } else if (bg.type === 'pattern') {
        if (bg.value === 'pink-stripe') {
          const patCanvas = document.createElement('canvas');
          patCanvas.width = 60;
          patCanvas.height = 40;
          const patCtx = patCanvas.getContext('2d');
          patCtx.fillStyle = '#ffffff'; // White base
          patCtx.fillRect(0, 0, 60, 40);
          patCtx.fillStyle = '#fde4ec'; // Pastel pink vertical stripes
          patCtx.fillRect(0, 0, 20, 40);
          // Add a thinner subtle peach line next to it for Canva look
          patCtx.fillStyle = '#fdf2e9';
          patCtx.fillRect(20, 0, 8, 40);
          return ctx.createPattern(patCanvas, 'repeat');
        } else if (bg.value === 'kraft-paper') {
          const patCanvas = document.createElement('canvas');
          patCanvas.width = 150;
          patCanvas.height = 150;
          const patCtx = patCanvas.getContext('2d');
          patCtx.fillStyle = '#e5dbcd'; // Kraft tan
          patCtx.fillRect(0, 0, 150, 150);
          
          // Draw subtle fibers/grain
          patCtx.strokeStyle = '#d7cca8';
          patCtx.lineWidth = 1;
          for (let i = 0; i < 8; i++) {
            patCtx.beginPath();
            patCtx.moveTo(Math.random() * 150, 0);
            patCtx.lineTo(Math.random() * 150, 150);
            patCtx.stroke();
          }
          for (let i = 0; i < 4; i++) {
            patCtx.beginPath();
            patCtx.moveTo(0, Math.random() * 150);
            patCtx.lineTo(150, Math.random() * 150);
            patCtx.stroke();
          }
          return ctx.createPattern(patCanvas, 'repeat');
        } else {
          // Create repeating stripe texture on-the-fly
          const patCanvas = document.createElement('canvas');
          patCanvas.width = 40;
          patCanvas.height = 40;
          const patCtx = patCanvas.getContext('2d');
          
          patCtx.fillStyle = '#fbf7f0'; // Cream background
          patCtx.fillRect(0, 0, 40, 40);
          
          patCtx.fillStyle = '#f3edd6'; // Subtle stripe
          patCtx.fillRect(0, 0, 12, 40);
          
          return ctx.createPattern(patCanvas, 'repeat');
        }
      }
      return '#ffffff';
    };

    // 2. Draw Overall Frame Background
    const bgFillStyle = getBackgroundFill();
    ctx.fillStyle = bgFillStyle;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Filter string builder
    let filterString = 'none';
    if (photoFilter && photoFilter !== 'none') {
      filterString = photoFilter;
    }

    // Helper image loader
    const loadImg = (src) => {
      return new Promise((res) => {
        if (!src) return res(null);
        const img = new Image();
        img.onload = () => res(img);
        img.src = src;
      });
    };

    const localPromises = localCutouts.map(src => loadImg(src));
    const remotePromises = remoteCutouts.map(src => loadImg(src));

    Promise.all([...localPromises, ...remotePromises]).then((allImages) => {
      const loadedLocal = allImages.slice(0, 4);
      const loadedRemote = allImages.slice(4, 8);

      // 3. Render Photo Blocks by Layout
      if (layout === 'vertical-strip') {
        if (templateConfig.id === 'vintage-love') {
          // --- VINTAGE LOVE PREMIUM JOURNAL STRIP ---
          const stripWidth = 490;
          const stripHeight = 1460;
          const stripX = (canvas.width - stripWidth) / 2;
          const stripY = 160;

          // 1. Draw torn paper background with drop shadow
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 8;
          
          ctx.beginPath();
          ctx.moveTo(stripX, stripY);
          
          // Top edge (slightly wavy)
          for (let x = stripX; x <= stripX + stripWidth; x += 10) {
            const wave = Math.sin(x * 0.05) * 1.0 + (Math.random() - 0.5) * 0.6;
            ctx.lineTo(x, stripY + wave);
          }
          // Right edge (torn/wavy)
          for (let y = stripY; y <= stripY + stripHeight; y += 8) {
            const wave = Math.sin(y * 0.1) * 1.5 + (Math.random() - 0.5) * 0.8;
            ctx.lineTo(stripX + stripWidth + wave, y);
          }
          // Bottom edge (slightly wavy)
          for (let x = stripX + stripWidth; x >= stripX; x -= 10) {
            const wave = Math.sin(x * 0.05) * 1.0 + (Math.random() - 0.5) * 0.6;
            ctx.lineTo(x, stripY + stripHeight + wave);
          }
          // Left edge (torn/wavy)
          for (let y = stripY + stripHeight; y >= stripY; y -= 8) {
            const wave = Math.sin(y * 0.1) * 1.5 + (Math.random() - 0.5) * 0.8;
            ctx.lineTo(stripX + wave, y);
          }
          ctx.closePath();
          ctx.fillStyle = '#faf7f2'; // Cream paper color
          ctx.fill();
          ctx.restore();

          // 2. Draw Pin at the top center
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 4;
          
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(canvas.width / 2, stripY + 28, 14, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#dfdad0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          ctx.fillStyle = '#fbfbfb';
          ctx.beginPath();
          ctx.arc((canvas.width / 2) - 4, stripY + 24, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 3. Draw photos inside the strip
          const photoW = 410;
          const photoH = 290;
          const photoX = stripX + (stripWidth - photoW) / 2;
          const photoY1 = stripY + 95;
          const gap = 38;

          for (let i = 0; i < frameCount; i++) {
            const photoY = photoY1 + i * (photoH + gap);

            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 2;
            
            // Alternating slight rotations
            const angle = (i === 0 ? -1.2 : i === 1 ? 1.0 : -0.8) * Math.PI / 180;
            ctx.translate(photoX + photoW / 2, photoY + photoH / 2);
            ctx.rotate(angle);
            
            const borderSize = 10;
            ctx.fillRect(-photoW / 2 - borderSize, -photoH / 2 - borderSize, photoW + borderSize * 2, photoH + borderSize * 2);

            ctx.fillStyle = '#ebdccb';
            ctx.fillRect(-photoW / 2, -photoH / 2, photoW, photoH);

            ctx.filter = filterString;

            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              const halfW = photoW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, photoH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = dx + (halfW - w) / 2 - photoW / 2;
                const y = (photoH - h) - photoH / 2;
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              if (localImg) {
                const scale = Math.min(photoW / localImg.width, photoH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = (photoW - w) / 2 - photoW / 2;
                const y = (photoH - h) - photoH / 2;
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();
          }

          // 4. Draw handwritten text
          const bottomTextY = photoY1 + frameCount * (photoH + gap) + 25;
          ctx.fillStyle = '#2c2925';
          ctx.font = captionFont;
          ctx.textAlign = 'center';
          ctx.fillText(customCaption || captionText, canvas.width / 2, bottomTextY);

        } else if (templateConfig.id === 'friends-forever') {
          // --- FRIENDS FOREVER PINK STRIP ---
          const stripWidth = 500;
          const stripHeight = 1350;
          const stripX = (canvas.width - stripWidth) / 2;
          const stripY = 120;

          // 1. Draw film strip background (peach colored card)
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 12;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 6;
          ctx.fillStyle = '#fde2d5'; // Peach card base
          ctx.fillRect(stripX, stripY, stripWidth, stripHeight);
          ctx.restore();

          // 2. Sprocket/Arrows and Film Neg markings
          ctx.fillStyle = '#a08b80';
          ctx.font = '600 13px sans-serif';
          ctx.fillText('→ 13', stripX + 18, stripY + 250);
          ctx.fillText('→ 14', stripX + 18, stripY + 800);
          
          ctx.save();
          ctx.translate(stripX + stripWidth - 18, stripY + 160);
          ctx.rotate(Math.PI / 2);
          ctx.font = '700 12px sans-serif';
          ctx.fillText('FILM NEGATIVE', 0, 0);
          ctx.restore();

          ctx.save();
          ctx.translate(stripX + stripWidth - 18, stripY + 700);
          ctx.rotate(Math.PI / 2);
          ctx.font = '700 12px sans-serif';
          ctx.fillText('FILM NEGATIVE', 0, 0);
          ctx.restore();

          // 3. Draw scattered watercolor hearts on the striped background
          const drawWatercolorHeart = (c, hx, hy, size, color) => {
            c.save();
            c.fillStyle = color;
            c.globalAlpha = 0.55;
            c.beginPath();
            c.moveTo(hx, hy + size * 0.2);
            c.bezierCurveTo(hx, hy - size * 0.15, hx - size * 0.5, hy - size * 0.15, hx - size * 0.5, hy + size * 0.3);
            c.bezierCurveTo(hx - size * 0.5, hy + size * 0.65, hx, hy + size * 0.85, hx, hy + size * 0.95);
            c.bezierCurveTo(hx, hy + size * 0.85, hx + size * 0.5, hy + size * 0.65, hx + size * 0.5, hy + size * 0.3);
            c.bezierCurveTo(hx + size * 0.5, hy - size * 0.15, hx, hy - size * 0.15, hx, hy + size * 0.2);
            c.closePath();
            c.fill();
            
            c.globalAlpha = 0.25;
            c.strokeStyle = color;
            c.lineWidth = 3;
            c.stroke();
            c.restore();
          };

          drawWatercolorHeart(ctx, 100, 220, 80, '#ff708d');
          drawWatercolorHeart(ctx, 700, 160, 70, '#ffb270');
          drawWatercolorHeart(ctx, 90, 550, 90, '#ff5484');
          drawWatercolorHeart(ctx, 710, 620, 85, '#ff5484');
          drawWatercolorHeart(ctx, 110, 920, 75, '#ffb270');
          drawWatercolorHeart(ctx, 700, 950, 70, '#ff708d');

          // 4. Draw photos (2 frames)
          const photoW = 410;
          const photoH = 500;
          const photoX = stripX + 45;
          const photoY1 = stripY + 60;
          const gap = 50;

          for (let i = 0; i < frameCount; i++) {
            const photoY = photoY1 + i * (photoH + gap);
            ctx.save();
            ctx.fillStyle = '#161616';
            ctx.fillRect(photoX, photoY, photoW, photoH);

            ctx.filter = filterString;
            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              const halfW = photoW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, photoH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = photoX + dx + (halfW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              if (localImg) {
                const scale = Math.min(photoW / localImg.width, photoH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = photoX + (photoW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();
          }

          // 5. Caption at the bottom
          const bottomTextY = photoY1 + frameCount * (photoH + gap) + 40;
          ctx.fillStyle = '#ff3366'; // Pink friends forever
          ctx.font = captionFont;
          ctx.textAlign = 'center';
          ctx.fillText(customCaption || captionText, canvas.width / 2, bottomTextY);

        } else if (templateConfig.id === 'live-in-moment') {
          // --- LIVE IN THE MOMENT MODERN STRIP ---
          const photoW = 540;
          const photoH = 310;
          const photoX = (canvas.width - photoW) / 2;
          const photoY1 = 120;
          const gap = 60;

          for (let i = 0; i < frameCount; i++) {
            const photoY = photoY1 + i * (photoH + gap);

            ctx.save();
            // Rounded corners clip
            ctx.beginPath();
            const radius = 26;
            ctx.moveTo(photoX + radius, photoY);
            ctx.lineTo(photoX + photoW - radius, photoY);
            ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + radius);
            ctx.lineTo(photoX + photoW, photoY + photoH - radius);
            ctx.quadraticCurveTo(photoX + photoW, photoY + photoH, photoX + photoW - radius, photoY + photoH);
            ctx.lineTo(photoX + radius, photoY + photoH);
            ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - radius);
            ctx.lineTo(photoX, photoY + radius);
            ctx.quadraticCurveTo(photoX, photoY, photoX + radius, photoY);
            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = '#eae5db';
            ctx.fillRect(photoX, photoY, photoW, photoH);

            ctx.filter = filterString;
            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              const halfW = photoW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, photoH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = photoX + dx + (halfW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              if (localImg) {
                const scale = Math.min(photoW / localImg.width, photoH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = photoX + (photoW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();

            // Draw the three horizontal dots below bottom right of each photo
            ctx.save();
            const dotsX = photoX + photoW - 30;
            const dotsY = photoY + photoH + 20;
            ctx.fillStyle = '#6e6a66';
            ctx.beginPath();
            ctx.arc(dotsX - 16, dotsY, 3.5, 0, Math.PI * 2);
            ctx.arc(dotsX, dotsY, 3.5, 0, Math.PI * 2);
            ctx.arc(dotsX + 16, dotsY, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Modern stacked typography caption at bottom-left
          const textX = photoX + 10;
          const textY1 = photoY1 + frameCount * (photoH + gap) + 50;
          
          ctx.save();
          ctx.textAlign = 'left';
          ctx.fillStyle = '#1d1916';
          
          // "LIVE IN"
          ctx.font = '600 52px Outfit, sans-serif';
          ctx.fillText('LIVE IN', textX, textY1);
          
          // "THE "
          ctx.font = '600 52px Outfit, sans-serif';
          ctx.fillText('THE ', textX, textY1 + 65);
          
          // "moment" (cursive)
          const theWidth = ctx.measureText('THE ').width;
          ctx.font = 'italic 700 62px Caveat, cursive';
          ctx.fillStyle = '#4a443e';
          ctx.fillText('moment', textX + theWidth, textY1 + 65);
          ctx.restore();

        } else if (templateConfig.id === 'friends-scrapbook') {
          // --- FRIENDS SCRAPBOOK ---
          const stripWidth = 470;
          const stripHeight = 1180;
          const stripX = (canvas.width - stripWidth) / 2;
          const stripY = 160;

          // 1. Draw black film card background
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
          ctx.shadowBlur = 18;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 8;
          ctx.fillStyle = '#161616'; // Matte Black
          ctx.fillRect(stripX, stripY, stripWidth, stripHeight);
          ctx.restore();

          // 2. Draw film markings on black border
          ctx.fillStyle = '#7a7a7a';
          ctx.font = '600 12px sans-serif';
          ctx.fillText('→ 13', stripX + 16, stripY + 220);
          ctx.fillText('→ 14', stripX + 16, stripY + 740);

          ctx.save();
          ctx.translate(stripX + stripWidth - 16, stripY + 200);
          ctx.rotate(Math.PI / 2);
          ctx.fillText('FILM NEGATIVE', 0, 0);
          ctx.restore();

          ctx.save();
          ctx.translate(stripX + stripWidth - 16, stripY + 680);
          ctx.rotate(Math.PI / 2);
          ctx.fillText('FILM NEGATIVE', 0, 0);
          ctx.restore();

          // 3. Draw photos
          const photoW = 390;
          const photoH = 460;
          const photoX = stripX + 40;
          const photoY1 = stripY + 50;
          const gap = 50;

          for (let i = 0; i < frameCount; i++) {
            const photoY = photoY1 + i * (photoH + gap);

            ctx.save();
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(photoX, photoY, photoW, photoH);

            ctx.filter = filterString;
            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              const halfW = photoW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, photoH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = photoX + dx + (halfW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              if (localImg) {
                const scale = Math.min(photoW / localImg.width, photoH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = photoX + (photoW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();
          }

          // 4. Kraft Tape at top center
          ctx.save();
          ctx.fillStyle = 'rgba(197, 163, 131, 0.92)'; // Kraft brown tape
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetY = 2;
          drawWashiTape(ctx, 400, stripY, 180, 48);
          ctx.restore();

          // 5. "friends" blue handwriting doodle on the left
          ctx.save();
          ctx.translate(130, stripY + 120);
          ctx.rotate(-15 * Math.PI / 180);
          ctx.fillStyle = '#3a8ea0';
          ctx.font = captionFont;
          ctx.fillText(customCaption || captionText, 0, 0);
          ctx.restore();

          // 6. Stacked red XOXO on bottom right
          ctx.save();
          ctx.translate(stripX + stripWidth - 10, stripY + stripHeight - 240);
          ctx.rotate(12 * Math.PI / 180);
          ctx.fillStyle = '#d32f2f';
          ctx.font = '700 74px Caveat, cursive';
          ctx.fillText('X O', 0, 0);
          ctx.fillText('X O', -25, 75);
          ctx.restore();

        } else if (templateConfig.id === 'valentine-strip') {
          // --- VALENTINE STRIP ---
          const stripWidth = 440;
          const stripHeight = 1420;
          const stripX = (canvas.width - stripWidth) / 2;
          const stripY = 160;

          // 1. Draw white strip background with shadow
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 10;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(stripX, stripY, stripWidth, stripHeight);
          ctx.restore();

          // 2. Draw grid tape at the top center
          ctx.save();
          ctx.fillStyle = 'rgba(230, 230, 230, 0.65)';
          drawWashiTape(ctx, 400, stripY, 160, 44);
          ctx.restore();

          // 3. Draw photos B&W
          const photoW = 360;
          const photoH = 270;
          const photoX = stripX + 40;
          const photoY1 = stripY + 90;
          const gap = 35;

          for (let i = 0; i < frameCount; i++) {
            const photoY = photoY1 + i * (photoH + gap);

            ctx.save();
            ctx.fillStyle = '#eaeaea';
            ctx.fillRect(photoX, photoY, photoW, photoH);

            ctx.filter = filterString;
            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              const halfW = photoW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, photoH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = photoX + dx + (halfW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              if (localImg) {
                const scale = Math.min(photoW / localImg.width, photoH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = photoX + (photoW - w) / 2;
                const y = photoY + (photoH - h);
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();
          }

          // 4. Draw typewriter multiline caption at the bottom
          const bottomTextY = photoY1 + frameCount * (photoH + gap) + 40;
          ctx.save();
          ctx.fillStyle = '#111111';
          ctx.font = captionFont;
          ctx.textAlign = 'center';
          
          const text = customCaption || captionText;
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            ctx.fillText(line, canvas.width / 2, bottomTextY + idx * 46);
          });
          ctx.restore();

        } else {
          // --- DEFAULT VERTICAL STRIP CODE ---
          const leftMargin = 50;
          const topMargin = 50;
          const boxW = canvas.width - (leftMargin * 2); // 700px
          const boxH = 430; // Aspect-ratio matching 4:3
          const gapY = 32;

          for (let i = 0; i < frameCount; i++) {
            const boxY = topMargin + i * (boxH + gapY);

            // Draw Maroon/White Outer border
            ctx.fillStyle = frameStyle.borderColor;
            ctx.fillRect(leftMargin, boxY, boxW, boxH);

            // If stamp-perforated (dotted) template
            if (frameStyle.borderStyle === 'dotted') {
              ctx.save();
              ctx.fillStyle = bgFillStyle; // punches background styled holes
              const holeRad = 9;
              const step = 28;

              // Punch holes along Top & Bottom
              for (let hx = leftMargin + 10; hx <= leftMargin + boxW - 10; hx += step) {
                ctx.beginPath(); ctx.arc(hx, boxY, holeRad, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(hx, boxY + boxH, holeRad, 0, Math.PI * 2); ctx.fill();
              }
              // Punch holes along Left & Right
              for (let hy = boxY + 10; hy <= boxY + boxH - 10; hy += step) {
                ctx.beginPath(); ctx.arc(leftMargin, hy, holeRad, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(leftMargin + boxW, hy, holeRad, 0, Math.PI * 2); ctx.fill();
              }
              ctx.restore();
            }

            // Inner photo crop area
            const innerW = boxW - (frameStyle.borderWidth * 2);
            const innerH = boxH - (frameStyle.borderWidth * 2);
            const innerX = leftMargin + frameStyle.borderWidth;
            const innerY = boxY + frameStyle.borderWidth;

            ctx.save();
            // Clip to rounded/normal rect inner box
            ctx.beginPath();
            const radius = frameStyle.cornerRadius;
            ctx.moveTo(innerX + radius, innerY);
            ctx.lineTo(innerX + innerW - radius, innerY);
            ctx.quadraticCurveTo(innerX + innerW, innerY, innerX + innerW, innerY + radius);
            ctx.lineTo(innerX + innerW, innerY + innerH - radius);
            ctx.quadraticCurveTo(innerX + innerW, innerY + innerH, innerX + innerW - radius, innerY + innerH);
            ctx.lineTo(innerX + radius, innerY + innerH);
            ctx.quadraticCurveTo(innerX, innerY + innerH, innerX, innerY + innerH - radius);
            ctx.lineTo(innerX, innerY + radius);
            ctx.quadraticCurveTo(innerX, innerY, innerX + radius, innerY);
            ctx.closePath();
            ctx.clip();

            // Draw cozy background theme color inside frame cutout (beige theme)
            ctx.fillStyle = '#ebdccb';
            ctx.fillRect(innerX, innerY, innerW, innerH);

            // Apply selected filter to canvas
            ctx.filter = filterString;

            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              // Duo Mode (Split side-by-side)
              const halfW = innerW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, innerH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = innerX + dx + (halfW - w) / 2;
                const y = innerY + (innerH - h); // align to bottom
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              // Solo Mode (Centered)
              if (localImg) {
                const scale = Math.min(innerW / localImg.width, innerH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = innerX + (innerW - w) / 2;
                const y = innerY + (innerH - h);
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();

            // Draw Frame-specific vector doodles
            if (frameDecorations && frameDecorations.length > 0) {
              const frameDecor = frameDecorations.find(fd => fd.frameIndex === i);
              if (frameDecor) {
                const dx = innerX + (frameDecor.position.x / 100) * innerW;
                const dy = innerY + (frameDecor.position.y / 100) * innerH;
                if (frameDecor.type === 'doodle-bow') {
                  drawDoodleBow(ctx, dx, dy, frameDecor.size);
                } else if (frameDecor.type === 'doodle-heart') {
                  drawDoodleHeart(ctx, dx, dy, frameDecor.size);
                } else if (frameDecor.type === 'doodle-arrow') {
                  drawDoodleArrow(ctx, dx, dy, frameDecor.size);
                }
              }
            }
          }

          // Draw bottom label caption text
          const bottomY = topMargin + frameCount * (boxH + gapY) + 15;
          ctx.fillStyle = frameStyle.borderColor === '#ffffff' ? '#2d3436' : '#ffffff';
          ctx.font = captionFont;
          ctx.textAlign = 'center';
          ctx.fillText(customCaption || captionText, canvas.width / 2, bottomY + 45);
        }
      } else if (layout === 'grid-2x2') {
        // --- 2. GRID 2X2 COLLAGE LAYOUT ---
        const leftMargin = 70;
        const topMargin = 70;
        const boxSize = (canvas.width - (leftMargin * 2) - 30) / 2; // ~515px
        const gap = 30;

        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            const i = r * 2 + c;
            const boxX = leftMargin + c * (boxSize + gap);
            const boxY = topMargin + r * (boxSize + gap);

            ctx.fillStyle = frameStyle.borderColor;
            ctx.fillRect(boxX, boxY, boxSize, boxSize);

            const innerW = boxSize - (frameStyle.borderWidth * 2);
            const innerH = boxSize - (frameStyle.borderWidth * 2);
            const innerX = boxX + frameStyle.borderWidth;
            const innerY = boxY + frameStyle.borderWidth;

            ctx.save();
            ctx.beginPath();
            const radius = frameStyle.cornerRadius;
            ctx.moveTo(innerX + radius, innerY);
            ctx.lineTo(innerX + innerW - radius, innerY);
            ctx.quadraticCurveTo(innerX + innerW, innerY, innerX + innerW, innerY + radius);
            ctx.lineTo(innerX + innerW, innerY + innerH - radius);
            ctx.quadraticCurveTo(innerX + innerW, innerY + innerH, innerX + innerW - radius, innerY + innerH);
            ctx.lineTo(innerX + radius, innerY + innerH);
            ctx.quadraticCurveTo(innerX, innerY + innerH, innerX, innerY + innerH - radius);
            ctx.lineTo(innerX, innerY + radius);
            ctx.quadraticCurveTo(innerX, innerY, innerX + radius, innerY);
            ctx.closePath();
            ctx.clip();

            ctx.fillStyle = '#ebdccb';
            ctx.fillRect(innerX, innerY, innerW, innerH);

            ctx.filter = filterString;

            const localImg = loadedLocal[i];
            const remoteImg = loadedRemote[i];

            if (remoteImg) {
              const halfW = innerW / 2;
              const drawFrameHalf = (img, dx) => {
                if (!img) return;
                const scale = Math.min(halfW / img.width, innerH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = innerX + dx + (halfW - w) / 2;
                const y = innerY + (innerH - h);
                ctx.drawImage(img, x, y, w, h);
              };
              drawFrameHalf(localImg, 0);
              drawFrameHalf(remoteImg, halfW);
            } else {
              if (localImg) {
                const scale = Math.min(innerW / localImg.width, innerH / localImg.height);
                const w = localImg.width * scale * 0.95;
                const h = localImg.height * scale * 0.95;
                const x = innerX + (innerW - w) / 2;
                const y = innerY + (innerH - h);
                ctx.drawImage(localImg, x, y, w, h);
              }
            }
            ctx.restore();
          }
        }

        // Draw caption
        const bottomY = canvas.height - 95;
        ctx.fillStyle = '#2d3436';
        ctx.font = captionFont;
        ctx.textAlign = 'center';
        ctx.fillText(customCaption || captionText, canvas.width / 2, bottomY + 40);

      } else {
        // --- 3. CLASSIC TABLETOP POLAROIDS ---
        const woodGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 100, canvas.width / 2, canvas.height / 2, 700);
        woodGrad.addColorStop(0, '#534035');
        woodGrad.addColorStop(1, '#2c1e17');
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const drawGridPolaroid = (imagesList, centerX, centerY, angle, label) => {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);

          // Card shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 20;
          ctx.shadowOffsetX = 6;
          ctx.shadowOffsetY = 10;

          const cardW = 440;
          const cardH = 540;
          ctx.fillStyle = '#fefefa';
          ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);

          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;

          const photoW = 390;
          const photoH = 390;
          const photoX = -photoW / 2;
          const photoY = -cardH / 2 + 25;

          ctx.fillStyle = '#ebdccb';
          ctx.fillRect(photoX, photoY, photoW, photoH);

          const cellW = 185;
          const cellH = 185;
          const gap = 10;

          ctx.save();
          ctx.rect(photoX, photoY, photoW, photoH);
          ctx.clip();

          ctx.filter = filterString;

          for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 2; c++) {
              const idx = r * 2 + c;
              const img = imagesList[idx];
              if (img) {
                const cx = photoX + c * (cellW + gap);
                const cy = photoY + r * (cellH + gap);

                ctx.save();
                ctx.rect(cx, cy, cellW, cellH);
                ctx.clip();

                const scale = Math.min(cellW / img.width, cellH / img.height);
                const w = img.width * scale * 0.95;
                const h = img.height * scale * 0.95;
                const x = cx + (cellW - w) / 2;
                const y = cy + (cellH - h);
                ctx.drawImage(img, x, y, w, h);
                ctx.restore();
              }
            }
          }
          ctx.restore();

          // Brand tag
          ctx.fillStyle = '#2c3e50';
          ctx.font = 'italic 28px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(label, 0, cardH / 2 - 35);

          ctx.restore();
        };

        drawGridPolaroid(loadedLocal, canvas.width * 0.28 + 40, canvas.height * 0.5, -4 * Math.PI / 180, 'You');
        if (loadedRemote.some(img => img !== null)) {
          drawGridPolaroid(loadedRemote, canvas.width * 0.72 - 40, canvas.height * 0.5, 5 * Math.PI / 180, 'Friend');
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = captionFont;
        ctx.textAlign = 'center';
        ctx.fillText(customCaption || captionText, canvas.width / 2, canvas.height - 40);
      }

      // 4. Draw Overlay Decorations (Stickers / Tape / Emojis)
      if (decorations && decorations.length > 0) {
        decorations.forEach((d) => {
          const dx = (d.position.x / 100) * canvas.width;
          const dy = (d.position.y / 100) * canvas.height;

          if (d.type === 'emoji') {
            ctx.font = `${d.size}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(d.value, dx, dy);
          } else if (d.type === 'washi-tape') {
            drawWashiTape(ctx, dx, dy, d.size.w, d.size.h);
          }
        });
      }

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    });
  });
};
