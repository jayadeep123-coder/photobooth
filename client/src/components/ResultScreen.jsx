import { useEffect, useState } from 'react';
import TEMPLATES from '../utils/templates';
import { createPhotostrip } from '../utils/composite';
import './ResultScreen.css';

// SVG Assets for Cute Stickers
const STICKER_SVGS = {
  kitty: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="18,38 8,8 38,28" fill="#ffb8b8" stroke="#ff7675" stroke-width="3"/>
      <polygon points="82,38 92,8 62,28" fill="#ffb8b8" stroke="#ff7675" stroke-width="3"/>
      <ellipse cx="50" cy="55" rx="42" ry="32" fill="#ffffff" stroke="#2d3436" stroke-width="4"/>
      <circle cx="34" cy="50" r="4.5" fill="#2d3436"/>
      <circle cx="66" cy="50" r="4.5" fill="#2d3436"/>
      <ellipse cx="28" cy="58" rx="6" ry="4" fill="#ffa3a3" opacity="0.6"/>
      <ellipse cx="72" cy="58" rx="6" ry="4" fill="#ffa3a3" opacity="0.6"/>
      <path d="M 46,55 Q 50,59 54,55" fill="none" stroke="#2d3436" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="14" y1="54" x2="4" y2="52" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="14" y1="60" x2="3" y2="62" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="54" x2="96" y2="52" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="60" x2="97" y2="62" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,
  flower: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="22" r="16" fill="#ff7675"/>
      <circle cx="50" cy="78" r="16" fill="#ff7675"/>
      <circle cx="22" cy="50" r="16" fill="#ff7675"/>
      <circle cx="78" cy="50" r="16" fill="#ff7675"/>
      <circle cx="30" cy="30" r="16" fill="#ff7675"/>
      <circle cx="70" cy="70" r="16" fill="#ff7675"/>
      <circle cx="30" cy="70" r="16" fill="#ff7675"/>
      <circle cx="70" cy="30" r="16" fill="#ff7675"/>
      <circle cx="50" cy="50" r="18" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="3"/>
    </svg>
  `,
  star: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 50,0 Q 50,50 100,50 Q 50,50 50,100 Q 50,50 0,50 Q 50,50 50,0 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="4"/>
    </svg>
  `,
  heart: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 50,32 C 60,10 92,15 92,46 C 92,72 50,96 50,96 C 50,96 8,72 8,46 C 8,15 40,10 50,32 Z" fill="#ff7675" stroke="#d63031" stroke-width="4"/>
    </svg>
  `,
  bubble: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">
      <rect x="5" y="10" width="110" height="60" rx="18" fill="#ffffff" stroke="#2d3436" stroke-width="4"/>
      <polygon points="35,70 38,88 52,70" fill="#ffffff" stroke="#2d3436" stroke-width="4"/>
      <polygon points="32,68 38,82 55,68" fill="#ffffff"/>
      <text x="60" y="47" font-family="system-ui, sans-serif" font-size="20" font-weight="900" fill="#2d3436" text-anchor="middle">XOXO</text>
    </svg>
  `,
  dino: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 30,80 C 25,65 20,40 30,30 C 35,25 45,22 55,25 C 65,28 70,35 68,48 C 66,55 72,60 80,62 C 88,64 92,72 88,80 C 85,85 75,85 70,82 C 60,78 50,82 45,84 Z" fill="#7bed9f" stroke="#2ed573" stroke-width="3"/>
      <path d="M 35,76 C 33,65 31,52 38,44 C 42,39 48,39 52,42 C 55,44 54,58 52,66 C 50,72 45,75 35,76 Z" fill="#eccc68" opacity="0.8"/>
      <polygon points="25,30 22,25 28,26" fill="#ff6b81"/>
      <polygon points="32,22 30,16 37,19" fill="#ff6b81"/>
      <polygon points="42,18 42,12 48,16" fill="#ff6b81"/>
      <polygon points="53,19 55,13 58,19" fill="#ff6b81"/>
      <circle cx="42" cy="30" r="3" fill="#2f3542"/>
      <circle cx="41" cy="29" r="1" fill="#ffffff"/>
      <ellipse cx="45" cy="33" rx="3" ry="2" fill="#ff4757" opacity="0.6"/>
    </svg>
  `,
  chatgpt: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
      <rect x="5" y="5" width="110" height="60" rx="10" fill="#0f0f10" stroke="#10a37f" stroke-width="4"/>
      <text x="60" y="28" font-family="'Courier New', Courier, monospace" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">HOLD ON, LET ME</text>
      <text x="60" y="44" font-family="'Outfit', sans-serif" font-size="14" font-weight="900" fill="#10a37f" text-anchor="middle">ChatGPT</text>
      <text x="60" y="56" font-family="'Courier New', Courier, monospace" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">THIS.</text>
    </svg>
  `,
  introvert: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80">
      <rect x="5" y="5" width="110" height="70" rx="8" fill="#ffbe76" stroke="#f0932b" stroke-width="4"/>
      <rect x="12" y="12" width="96" height="20" rx="4" fill="#eb4d4b"/>
      <text x="60" y="27" font-family="'Outfit', 'Arial Black', sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">CAUTION</text>
      <text x="60" y="52" font-family="'Outfit', sans-serif" font-size="13" font-weight="bold" fill="#30336b" text-anchor="middle">INTROVERT</text>
      <text x="60" y="66" font-family="sans-serif" font-size="7" font-weight="bold" fill="#30336b" text-anchor="middle" opacity="0.85">DO NOT APPROACH</text>
    </svg>
  `,
  ghost: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 25,80 C 25,40 30,20 50,20 C 70,20 75,40 75,80 C 75,84 70,88 66,84 C 62,80 58,80 54,84 C 50,88 46,88 42,84 C 38,80 34,80 30,84 C 26,88 25,84 25,80 Z" fill="#f5f6fa" stroke="#dcdde1" stroke-width="3"/>
      <path d="M 33,45 Q 50,49 67,45 C 71,45 74,48 73,52 L 70,60 C 69,63 65,65 62,64 Q 50,60 38,64 C 35,65 31,63 30,60 L 27,52 C 26,48 29,45 33,45 Z" fill="#2f3542"/>
      <path d="M 38,50 L 44,52" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 56,50 L 62,52" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="30" cy="64" r="3.5" fill="#ff7675" opacity="0.6"/>
      <circle cx="70" cy="64" r="3.5" fill="#ff7675" opacity="0.6"/>
    </svg>
  `,
  idiot: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 50">
      <rect x="3" y="3" width="114" height="44" rx="22" fill="#1da1f2" stroke="#ffffff" stroke-width="3"/>
      <g transform="translate(15, 13) scale(1.1)">
        <path d="M 9,0 L 11.5,4 L 16,3 L 15,7.5 L 18,11 L 13.5,12 L 12.5,16.5 L 8,14.5 L 4.5,17.5 L 4.5,13 L 0,12 L 3,8.5 L 1.5,4 L 6,4.5 Z" fill="#ffffff"/>
        <path d="M 5,9 L 7.5,11.5 L 13,6" fill="none" stroke="#1da1f2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="73" y="32" font-family="'Outfit', sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">Idiot</text>
    </svg>
  `,
  adhd: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 65">
      <rect x="5" y="10" width="105" height="45" rx="8" fill="none" stroke="#2d3436" stroke-width="4"/>
      <rect x="110" y="22" width="8" height="21" rx="3" fill="#2d3436"/>
      <rect x="12" y="17" width="22" height="31" fill="#ff7675" rx="3"/>
      <rect x="37" y="17" width="22" height="31" fill="#ffeaa7" rx="3"/>
      <rect x="62" y="17" width="22" height="31" fill="#55efc4" rx="3"/>
      <rect x="87" y="17" width="22" height="31" fill="#74b9ff" rx="3"/>
      <rect x="18" y="22" width="79" height="21" rx="4" fill="rgba(255,255,255,0.9)" stroke="#2d3436" stroke-width="2"/>
      <text x="57" y="37" font-family="'Outfit', sans-serif" font-size="11" font-weight="900" fill="#2d3436" text-anchor="middle">ADHD POWERED</text>
    </svg>
  `,
  anxiety: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60">
      <text x="60" y="35" font-family="'Arial Black', 'Helvetica Neue', sans-serif" font-size="20" font-weight="900" fill="#000000" text-anchor="middle" letter-spacing="-1">anxiety</text>
      <path d="M 22,41 Q 60,54 98,41" fill="none" stroke="#ff9900" stroke-width="4" stroke-linecap="round"/>
      <path d="M 98,41 L 88,38 M 98,41 L 93,48" stroke="#ff9900" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `,
  florkPillow: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80">
      <path d="M 15,35 C 15,25 35,20 50,20 C 65,20 85,25 85,35 C 85,45 65,50 50,50 C 35,50 15,45 15,35 Z" fill="#ffffff" stroke="#2d3436" stroke-width="3"/>
      <path d="M 25,30 C 35,32 65,32 75,30" fill="none" stroke="#dfe6e9" stroke-width="2"/>
      <path d="M 30,35 C 32,25 45,22 55,24 C 65,26 70,35 68,45 C 65,48 55,50 45,48 C 35,45 30,40 30,35 Z" fill="#ffffff" stroke="#2d3436" stroke-width="3"/>
      <path d="M 40,32 Q 43,35 46,32 M 52,32 Q 55,35 58,32" fill="none" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 45,43 C 55,42 70,45 75,55 C 75,60 65,65 50,65 C 35,65 25,60 25,55 C 28,45 35,44 45,43 Z" fill="#74b9ff" stroke="#2d3436" stroke-width="3"/>
      <rect x="72" y="42" width="12" height="15" rx="2" fill="#ff7675" stroke="#2d3436" stroke-width="2"/>
      <path d="M 84,45 C 87,45 87,54 84,54" fill="none" stroke="#2d3436" stroke-width="2"/>
    </svg>
  `,
  skeletonOk: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 30,45 C 30,25 70,25 70,45 C 70,55 64,62 58,62 L 58,72 L 42,72 L 42,62 C 36,62 30,55 30,45 Z" fill="#ffffff" stroke="#2d3436" stroke-width="4"/>
      <line x1="46" y1="66" x2="46" y2="72" stroke="#2d3436" stroke-width="3"/>
      <line x1="50" y1="66" x2="50" y2="72" stroke="#2d3436" stroke-width="3"/>
      <line x1="54" y1="66" x2="54" y2="72" stroke="#2d3436" stroke-width="3"/>
      <line x1="42" y1="66" x2="58" y2="66" stroke="#2d3436" stroke-width="3"/>
      <ellipse cx="43" cy="45" rx="6" ry="7" fill="#2d3436"/>
      <ellipse cx="57" cy="45" rx="6" ry="7" fill="#2d3436"/>
      <polygon points="50,53 47,58 53,58" fill="#2d3436"/>
      <path d="M 32,35 Q 28,30 30,25" fill="none" stroke="#2d3436" stroke-width="2"/>
      <line x1="80" y1="95" x2="80" y2="80" stroke="#2d3436" stroke-width="5" stroke-linecap="round"/>
      <rect x="72" y="72" width="16" height="10" rx="3" fill="#ffffff" stroke="#2d3436" stroke-width="3"/>
      <circle cx="62" cy="65" r="9" fill="none" stroke="#2d3436" stroke-width="4"/>
      <path d="M 75,72 L 75,45" fill="none" stroke="#2d3436" stroke-width="4" stroke-linecap="round"/>
      <circle cx="75" cy="45" r="2" fill="#2d3436"/>
      <path d="M 81,72 L 83,48" fill="none" stroke="#2d3436" stroke-width="4" stroke-linecap="round"/>
      <circle cx="83" cy="48" r="2" fill="#2d3436"/>
      <path d="M 87,74 L 91,53" fill="none" stroke="#2d3436" stroke-width="4" stroke-linecap="round"/>
      <circle cx="91" cy="53" r="2" fill="#2d3436"/>
    </svg>
  `,
  lightbulb: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 35,50 C 35,35 40,25 50,25 C 60,25 65,35 65,50 C 65,58 58,64 58,70 L 42,70 C 42,64 35,58 35,50 Z" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="3.5"/>
      <rect x="43" y="70" width="14" height="6" fill="#b2bec3" stroke="#2d3436" stroke-width="2"/>
      <rect x="45" y="76" width="10" height="4" fill="#b2bec3" stroke="#2d3436" stroke-width="2"/>
      <path d="M 47,80 L 53,80 L 50,83 Z" fill="#2d3436"/>
      <path d="M 45,58 L 50,44 L 55,58" fill="none" stroke="#d63031" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="50" y1="12" x2="50" y2="18" stroke="#fdcb6e" stroke-width="3" stroke-linecap="round"/>
      <line x1="22" y1="30" x2="28" y2="34" stroke="#fdcb6e" stroke-width="3" stroke-linecap="round"/>
      <line x1="78" y1="30" x2="72" y2="34" stroke="#fdcb6e" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="52" x2="27" y2="52" stroke="#fdcb6e" stroke-width="3" stroke-linecap="round"/>
      <line x1="80" y1="52" x2="73" y2="52" stroke="#fdcb6e" stroke-width="3" stroke-linecap="round"/>
      <text x="50" y="93" font-family="'Caveat', cursive, sans-serif" font-size="10" font-weight="bold" fill="#2d3436" text-anchor="middle">Inspire &amp; Create</text>
    </svg>
  `,
  snoopy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <path d="M 28,85 L 72,85 L 75,108 L 25,108 Z" fill="#ff7675" stroke="#2d3436" stroke-width="3"/>
      <text x="50" y="102" font-family="'Outfit', 'Arial Black', sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">JOE COOL</text>
      <path d="M 42,85 L 42,75 L 58,75 L 58,85" fill="#ffffff" stroke="#2d3436" stroke-width="3"/>
      <rect x="42" y="80" width="16" height="4" fill="#2d3436"/>
      <path d="M 32,55 C 32,35 48,32 58,35 C 68,38 72,48 70,58 C 68,68 55,75 42,75 C 32,75 32,65 32,55 Z" fill="#ffffff" stroke="#2d3436" stroke-width="3"/>
      <ellipse cx="29" cy="53" rx="4" ry="3.5" fill="#2d3436"/>
      <path d="M 38,44 Q 50,47 62,44 C 65,44 67,46 66,49 L 64,54 C 63,56 60,58 57,57 Q 50,54 43,57 C 40,58 37,56 36,54 L 34,49 C 33,46 35,44 38,44 Z" fill="#2d3436"/>
      <path d="M 40,48 L 45,50" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
      <path d="M 64,52 C 67,52 74,60 74,72 C 74,78 70,80 67,78 C 62,75 62,58 64,52 Z" fill="#2d3436"/>
    </svg>
  `,
  skeletonBlanket: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110">
      <path d="M 20,95 C 20,55 35,40 55,40 C 75,40 90,55 90,95 C 90,105 20,105 20,95 Z" fill="#ff7675" stroke="#2d3436" stroke-width="3.5"/>
      <path d="M 38,45 C 38,45 55,52 72,45" fill="none" stroke="#b2bec3" stroke-width="1.5"/>
      <path d="M 40,55 C 40,42 70,42 70,55 C 70,62 65,68 60,68 L 60,76 L 50,76 L 50,68 C 45,68 40,62 40,55 Z" fill="#ffffff" stroke="#2d3436" stroke-width="3"/>
      <circle cx="49" cy="54" r="4.5" fill="#2d3436"/>
      <circle cx="61" cy="54" r="4.5" fill="#2d3436"/>
      <polygon points="55,59 53,63 57,63" fill="#2d3436"/>
      <line x1="48" y1="71" x2="62" y2="71" stroke="#2d3436" stroke-width="2"/>
      <polygon points="40,95 70,95 78,85 48,85" fill="#55efc4" stroke="#2d3436" stroke-width="2.5"/>
      <polygon points="48,85 78,85 75,65 52,65" fill="#00b894" stroke="#2d3436" stroke-width="2.5"/>
      <rect x="58" y="70" width="10" height="7" fill="#ffffff" opacity="0.9"/>
      <line x1="38" y1="90" x2="44" y2="88" stroke="#2d3436" stroke-width="2"/>
      <line x1="39" y1="92" x2="45" y2="90" stroke="#2d3436" stroke-width="2"/>
      <line x1="72" y1="90" x2="66" y2="88" stroke="#2d3436" stroke-width="2"/>
      <line x1="73" y1="92" x2="67" y2="90" stroke="#2d3436" stroke-width="2"/>
    </svg>
  `,
  pointingFlork: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M 25,85 C 25,45 32,25 50,25 C 68,25 72,45 70,85 Z" fill="#ffffff" stroke="#000000" stroke-width="3.5"/>
      <path d="M 36,44 Q 50,47 64,44 C 67,44 69,46 68,49 L 66,54 C 65,56 62,58 59,57 Q 50,54 41,57 C 38,58 35,56 34,54 L 32,49 C 31,46 33,44 36,44 Z" fill="#2d3436"/>
      <path d="M 38,48 L 43,50" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M 64,55 C 68,60 76,68 76,82" fill="none" stroke="#000000" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 74,51 C 74,48 76,45 78,45 C 80,45 80,48 78,50 L 86,49 C 88,49 88,52 86,52 L 78,53 C 78,55 80,57 78,59 C 76,60 74,58 74,55 Z" fill="#2d3436" stroke="#000000" stroke-width="2"/>
    </svg>
  `,
  panda: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="45" rx="30" ry="26" fill="#ffffff" stroke="#2d3436" stroke-width="3.5"/>
      <ellipse cx="25" cy="27" rx="9" ry="8" fill="#2d3436" stroke="#2d3436" stroke-width="2"/>
      <ellipse cx="75" cy="27" rx="9" ry="8" fill="#2d3436" stroke="#2d3436" stroke-width="2"/>
      <ellipse cx="38" cy="45" rx="8" ry="10" fill="#2d3436" transform="rotate(-15, 38, 45)"/>
      <ellipse cx="62" cy="45" rx="8" ry="10" fill="#2d3436" transform="rotate(15, 62, 45)"/>
      <circle cx="39" cy="43" r="3" fill="#ffffff"/>
      <circle cx="61" cy="43" r="3" fill="#ffffff"/>
      <circle cx="37" cy="45" r="1" fill="#ffffff"/>
      <circle cx="63" cy="45" r="1" fill="#ffffff"/>
      <ellipse cx="50" cy="51" rx="4" ry="2.5" fill="#2d3436"/>
      <path d="M 46,55 Q 50,58 54,55" fill="none" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="28" cy="52" rx="4" ry="2.5" fill="#ff7675" opacity="0.6"/>
      <ellipse cx="72" cy="52" rx="4" ry="2.5" fill="#ff7675" opacity="0.6"/>
      <path d="M 33,68 C 30,78 30,90 50,90 C 70,90 70,78 67,68 Z" fill="#ffffff" stroke="#2d3436" stroke-width="3.5"/>
      <path d="M 30,68 C 22,70 20,78 28,82 C 32,84 35,76 33,68 Z" fill="#2d3436" stroke="#2d3436" stroke-width="1.5"/>
      <path d="M 68,66 C 76,64 82,54 80,48 C 76,44 70,56 68,66 Z" fill="#2d3436" stroke="#2d3436" stroke-width="1.5"/>
      <ellipse cx="77" cy="50" rx="3.5" ry="4" fill="#ffb8b8" transform="rotate(15, 77, 50)"/>
      <ellipse cx="32" cy="88" rx="7" ry="6" fill="#2d3436"/>
      <ellipse cx="68" cy="88" rx="7" ry="6" fill="#2d3436"/>
    </svg>
  `,
  jerry: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <ellipse cx="28" cy="28" rx="14" ry="16" fill="#d58237" stroke="#2d3436" stroke-width="3"/>
      <ellipse cx="28" cy="28" rx="9" ry="11" fill="#ffb8b8"/>
      <ellipse cx="72" cy="28" rx="14" ry="16" fill="#d58237" stroke="#2d3436" stroke-width="3"/>
      <ellipse cx="72" cy="28" rx="9" ry="11" fill="#ffb8b8"/>
      <path d="M 35,45 C 32,55 35,68 50,68 C 65,68 68,55 65,45 C 62,35 38,35 35,45 Z" fill="#d58237" stroke="#2d3436" stroke-width="3"/>
      <ellipse cx="50" cy="58" rx="14" ry="10" fill="#fdecda"/>
      <ellipse cx="43" cy="42" rx="4" ry="8" fill="#ffffff" stroke="#2d3436" stroke-width="2"/>
      <ellipse cx="57" cy="42" rx="4" ry="8" fill="#ffffff" stroke="#2d3436" stroke-width="2"/>
      <ellipse cx="44" cy="43" rx="2" ry="4" fill="#2d3436"/>
      <ellipse cx="56" cy="43" rx="2" ry="4" fill="#2d3436"/>
      <ellipse cx="50" cy="51" rx="4.5" ry="3.5" fill="#2d3436"/>
      <path d="M 45,58 Q 50,64 55,58" fill="none" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="28" y1="52" x2="16" y2="50" stroke="#2d3436" stroke-width="1.5"/>
      <line x1="28" y1="56" x2="14" y2="57" stroke="#2d3436" stroke-width="1.5"/>
      <line x1="72" y1="52" x2="84" y2="50" stroke="#2d3436" stroke-width="1.5"/>
      <line x1="72" y1="56" x2="86" y2="57" stroke="#2d3436" stroke-width="1.5"/>
      <path d="M 40,65 C 38,75 35,95 50,95 C 65,95 62,75 60,65 Z" fill="#d58237" stroke="#2d3436" stroke-width="3"/>
      <path d="M 44,70 C 42,75 42,90 50,90 C 58,90 58,75 56,70 Z" fill="#fdecda"/>
      <path d="M 15,80 L 35,70 L 35,95 L 15,90 Z" fill="#feec5b" stroke="#2d3436" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="20" cy="85" r="2" fill="#d4af37"/>
      <circle cx="28" cy="78" r="3" fill="#d4af37"/>
      <path d="M 38,72 Q 28,75 22,81" fill="none" stroke="#d58237" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 62,72 Q 48,78 35,82" fill="none" stroke="#d58237" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 58,92 Q 78,92 72,70" fill="none" stroke="#d58237" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,
  slothFlash: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
      <path d="M 28,85 L 72,85 C 80,105 75,108 50,108 C 25,108 20,105 28,85 Z" fill="#eb4d4b" stroke="#2d3436" stroke-width="3"/>
      <circle cx="50" cy="98" r="8" fill="#f1c40f" stroke="#ffffff" stroke-width="1.5"/>
      <polygon points="49,93 53,97 47,99 51,103" fill="none" stroke="#2d3436" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 30,55 C 30,32 70,32 70,55 C 70,72 65,76 50,76 C 35,76 30,72 30,55 Z" fill="#eb4d4b" stroke="#2d3436" stroke-width="3"/>
      <polygon points="70,45 80,40 73,48" fill="#f1c40f" stroke="#2d3436" stroke-width="1.5"/>
      <polygon points="30,45 20,40 27,48" fill="#f1c40f" stroke="#2d3436" stroke-width="1.5"/>
      <ellipse cx="50" cy="57" rx="16" ry="13" fill="#f5cd79" stroke="#2d3436" stroke-width="2"/>
      <path d="M 37,53 C 37,53 43,58 45,58 C 47,58 46,51 38,51 Z" fill="#cf8a4f" stroke="#2d3436" stroke-width="1"/>
      <path d="M 63,53 C 63,53 57,58 55,58 C 53,58 54,51 62,51 Z" fill="#cf8a4f" stroke="#2d3436" stroke-width="1"/>
      <circle cx="43" cy="54" r="2.5" fill="#2d3436"/>
      <circle cx="57" cy="54" r="2.5" fill="#2d3436"/>
      <ellipse cx="50" cy="60" rx="3.5" ry="2" fill="#2d3436"/>
      <path d="M 44,65 Q 50,67 56,65" fill="none" stroke="#2d3436" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,
  spiderman: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
      <line x1="50" y1="0" x2="50" y2="40" stroke="#b2bec3" stroke-width="2"/>
      <g transform="translate(50, 65) rotate(180)">
        <ellipse cx="0" cy="0" rx="20" ry="26" fill="#eb4d4b" stroke="#2d3436" stroke-width="3"/>
        <path d="M 0,-26 L 0,26 M -20,0 L 20,0 M -14,-18 L 14,18 M -14,18 L 14,-18" stroke="#2d3436" stroke-width="1" opacity="0.6"/>
        <path d="M -8,0 C -8,-8 8,-8 8,0 C 8,8 -8,8 -8,0 Z" fill="none" stroke="#2d3436" stroke-width="1" opacity="0.6"/>
        <path d="M -15,0 C -15,-15 15,-15 15,0 C 15,15 -15,15 -15,0 Z" fill="none" stroke="#2d3436" stroke-width="1" opacity="0.6"/>
        <path d="M -4,-2 C -8,-8 -16,-6 -16,-2 C -16,4 -10,8 -4,2 Z" fill="#ffffff" stroke="#2d3436" stroke-width="2.5"/>
        <path d="M 4,-2 C 8,-8 16,-6 16,-2 C 16,4 10,8 4,2 Z" fill="#ffffff" stroke="#2d3436" stroke-width="2.5"/>
      </g>
      <path d="M 38,30 C 35,42 45,46 50,42 M 62,30 C 65,42 55,46 50,42" fill="none" stroke="#eb4d4b" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 38,30 C 35,42 45,46 50,42 M 62,30 C 65,42 55,46 50,42" fill="none" stroke="#2d3436" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `,
  wasted: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50">
      <g transform="translate(80, 36)">
        <text font-family="'Arial Black', Impact, sans-serif" font-size="30" font-weight="900" fill="#000000" text-anchor="middle" stroke="#000000" stroke-width="8" stroke-linejoin="round" letter-spacing="-1">wasted</text>
        <text font-family="'Arial Black', Impact, sans-serif" font-size="30" font-weight="900" fill="#c0392b" text-anchor="middle" letter-spacing="-1">wasted</text>
      </g>
    </svg>
  `,
  blah: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">
      <path d="M 22,22 C 8,22 8,46 22,46 C 8,46 8,70 22,70 C 8,70 8,94 22,94 L 98,94 C 112,94 112,70 98,70 C 112,70 112,46 98,46 C 112,46 112,22 98,22 Z" fill="#1e272e" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.2))"/>
      <text x="60" y="38" font-family="'Arial Black', sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">BLAH...</text>
      <text x="60" y="62" font-family="'Arial Black', sans-serif" font-size="18" font-weight="900" fill="#1e272e" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" text-anchor="middle" letter-spacing="0.5">BLAH...</text>
      <text x="60" y="62" font-family="'Arial Black', sans-serif" font-size="18" font-weight="900" fill="#1e272e" text-anchor="middle" letter-spacing="0.5">BLAH...</text>
      <text x="60" y="86" font-family="'Arial Black', sans-serif" font-size="15" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">BLAH...</text>
    </svg>
  `
};

export default function ResultScreen({ localCutouts, remoteCutouts, onReset }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('classic-strip');
  const [caption, setCaption] = useState('Smile Film');
  const [placedStickers, setPlacedStickers] = useState([]);
  const [renderedImage, setRenderedImage] = useState(null);
  
  // Color Adjustment States
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Trigger re-compositing when template, caption, or cutouts change
  useEffect(() => {
    const renderComposite = async () => {
      const config = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];
      // Limit the cutout frame count dynamically based on the template requirements (e.g. 3 vs 4)
      const croppedLocal = localCutouts.slice(0, config.frameCount);
      const croppedRemote = remoteCutouts.slice(0, config.frameCount);

      const dataUrl = await createPhotostrip(croppedLocal, croppedRemote, config, caption);
      setRenderedImage(dataUrl);
    };

    renderComposite();
  }, [selectedTemplateId, caption, localCutouts, remoteCutouts]);

  const handleTemplateChange = (id) => {
    setSelectedTemplateId(id);
    const template = TEMPLATES.find((t) => t.id === id);
    if (template) {
      setCaption(template.captionText);
    }
  };

  const addSticker = (type) => {
    setPlacedStickers((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        x: 50,
        y: 50
      }
    ]);
  };

  const removeSticker = (id) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDragStart = (e, stickerId) => {
    e.preventDefault();
    const container = document.querySelector('.result-image-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMove = (moveEvent) => {
      const clientX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;

      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      setPlacedStickers((prev) =>
        prev.map((s) => (s.id === stickerId ? { ...s, x, y } : s))
      );
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  const handleDownload = () => {
    if (!renderedImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');

      // 1. Draw composite image with brightness adjustments
      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 2. Add Draggable stickers
      const stickerPromises = placedStickers.map((s) => {
        return new Promise((resolve) => {
          const stickerImg = new Image();
          stickerImg.onload = () => {
            const cx = (s.x / 100) * canvas.width;
            const cy = (s.y / 100) * canvas.height;
            const size = canvas.width * 0.15; // 15% scale
            ctx.drawImage(stickerImg, cx - size / 2, cy - size / 2, size, size);
            resolve();
          };
          const svgContent = STICKER_SVGS[s.type];
          stickerImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
        });
      });

      Promise.all(stickerPromises).then(() => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.download = `photobooth-strip-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };
    img.src = renderedImage;
  };

  return (
    <div className="result-screen fade-in">
      <div className="result-layout-wrapper">
        {/* Left Sidebar: Templates & Customization */}
        <div className="editor-sidebar card">
          <h3 className="section-title">Design Studio</h3>
          <p className="sidebar-subtitle">Choose a template style & edit your photostrip!</p>

          {/* Template Selection Grid */}
          <div className="decor-section">
            <h4>Select Template Theme</h4>
            <div className="template-picker-grid">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  className={`template-thumb ${selectedTemplateId === t.id ? 'active' : ''}`}
                  onClick={() => handleTemplateChange(t.id)}
                >
                  <div 
                    className={`thumb-preview ${
                      t.frameStyle.background.type === 'pattern' 
                        ? `bg-pattern-${t.frameStyle.background.value}` 
                        : ''
                    }`}
                    style={{ 
                      background: t.frameStyle.background.type === 'color' 
                        ? t.frameStyle.background.value 
                        : undefined 
                    }}
                  >
                    {t.layout === 'vertical-strip' ? (
                      <div 
                        className={`thumb-layout-strip ${
                          t.id === 'vintage-love' ? 'vintage-love-thumb' : 
                          t.id === 'friends-forever' ? 'friends-forever-thumb' :
                          t.id === 'friends-scrapbook' ? 'friends-scrapbook-thumb' :
                          t.id === 'valentine-strip' ? 'valentine-strip-thumb' :
                          t.id === 'live-in-moment' ? 'live-in-moment-thumb' : ''
                        }`}
                      >
                        {Array.from({ length: t.frameCount }).map((_, idx) => (
                          <div key={idx} className="thumb-box"></div>
                        ))}
                      </div>
                    ) : t.layout === 'grid-2x2' ? (
                      <div className="thumb-layout-grid">
                        <div className="thumb-box"></div>
                        <div className="thumb-box"></div>
                        <div className="thumb-box"></div>
                        <div className="thumb-box"></div>
                      </div>
                    ) : (
                      <div className="thumb-layout-polaroid">
                        <div className="thumb-box-polaroid"></div>
                      </div>
                    )}
                  </div>
                  <span className="thumb-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Caption Editor */}
          <div className="decor-section">
            <h4>Label Caption</h4>
            <input
              type="text"
              className="caption-editor-input"
              placeholder="Write a custom title..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={35}
            />
          </div>

          {/* Cute Stickers */}
          <div className="decor-section">
            <h4>Stickers</h4>
            <div className="decor-dock">
              <button onClick={() => addSticker('kitty')} className="sticker-btn" title="Cute Kitty" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.kitty }} />
              <button onClick={() => addSticker('flower')} className="sticker-btn" title="Flower" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.flower }} />
              <button onClick={() => addSticker('star')} className="sticker-btn" title="Sparkle Star" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.star }} />
              <button onClick={() => addSticker('heart')} className="sticker-btn" title="Love Heart" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.heart }} />
              <button onClick={() => addSticker('bubble')} className="sticker-btn" title="XOXO Bubble" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.bubble }} />
              <button onClick={() => addSticker('dino')} className="sticker-btn" title="Cute Dino" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.dino }} />
              <button onClick={() => addSticker('chatgpt')} className="sticker-btn" title="ChatGPT" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.chatgpt }} />
              <button onClick={() => addSticker('introvert')} className="sticker-btn" title="Introvert Sign" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.introvert }} />
              <button onClick={() => addSticker('ghost')} className="sticker-btn" title="Cool Ghost" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.ghost }} />
              <button onClick={() => addSticker('idiot')} className="sticker-btn" title="Verified Idiot" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.idiot }} />
              <button onClick={() => addSticker('adhd')} className="sticker-btn" title="ADHD Battery" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.adhd }} />
              <button onClick={() => addSticker('anxiety')} className="sticker-btn" title="Anxiety" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.anxiety }} />
              <button onClick={() => addSticker('florkPillow')} className="sticker-btn" title="Sleeping Flork" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.florkPillow }} />
              <button onClick={() => addSticker('skeletonOk')} className="sticker-btn" title="Skeleton OK" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.skeletonOk }} />
              <button onClick={() => addSticker('lightbulb')} className="sticker-btn" title="Lightbulb" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.lightbulb }} />
              <button onClick={() => addSticker('snoopy')} className="sticker-btn" title="Joe Cool" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.snoopy }} />
              <button onClick={() => addSticker('skeletonBlanket')} className="sticker-btn" title="Coding Skeleton" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.skeletonBlanket }} />
              <button onClick={() => addSticker('pointingFlork')} className="sticker-btn" title="Cool Flork" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.pointingFlork }} />
              <button onClick={() => addSticker('panda')} className="sticker-btn" title="Cute Panda" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.panda }} />
              <button onClick={() => addSticker('jerry')} className="sticker-btn" title="Jerry Mouse" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.jerry }} />
              <button onClick={() => addSticker('slothFlash')} className="sticker-btn" title="Flash Sloth" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.slothFlash }} />
              <button onClick={() => addSticker('spiderman')} className="sticker-btn" title="Spider-Man" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.spiderman }} />
              <button onClick={() => addSticker('wasted')} className="sticker-btn" title="Wasted" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.wasted }} />
              <button onClick={() => addSticker('blah')} className="sticker-btn" title="Blah Blah Blah" dangerouslySetInnerHTML={{ __html: STICKER_SVGS.blah }} />
            </div>
            <p className="decor-hint">Drag stickers onto the photo. Double click to delete.</p>
          </div>

          {/* Color Adjustments */}
          <div className="adjustment-section">
            <h4>Color Adjustments</h4>
            <div className="slider-group">
              <label>Brightness: <span>{brightness}%</span></label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
              />
            </div>
            <div className="slider-group">
              <label>Contrast: <span>{contrast}%</span></label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
              />
            </div>
            <div className="slider-group">
              <label>Saturation: <span>{saturation}%</span></label>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="action-buttons horizontal">
            <button onClick={handleDownload} className="btn btn-primary download-btn">
              Download Image
            </button>
            <button onClick={onReset} className="btn btn-secondary reset-btn">
              Reset Session
            </button>
          </div>
        </div>

        {/* Right Side: Re-rendering Image Canvas Preview */}
        <div className="preview-container card">
          <div 
            className="result-image-container"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
            }}
          >
            {renderedImage ? (
              <img src={renderedImage} alt="Live Composite Preview" className="result-image" />
            ) : (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Generating design...</p>
              </div>
            )}
            
            {placedStickers.map((s) => (
              <div
                key={s.id}
                className="draggable-sticker"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                }}
                onMouseDown={(e) => handleDragStart(e, s.id)}
                onTouchStart={(e) => handleDragStart(e, s.id)}
                onDoubleClick={() => removeSticker(s.id)}
                dangerouslySetInnerHTML={{ __html: STICKER_SVGS[s.type] }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
