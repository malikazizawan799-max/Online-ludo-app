import {
  canTokenMove,
  getLegalMoves,
  executeMove,
  selectBestBotMove,
  getNextTurn,
  START_OFFSETS,
  SAFE_SQUARES,
} from './ludoEngine';
import { PlayerColor } from '../types/game';

// Self-contained test suite runner executable in browser or test runner
export function runEngineTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let passed = true;

  function assert(condition: boolean, message: string) {
    if (condition) {
      results.push(`✅ PASS: ${message}`);
    } else {
      results.push(`❌ FAIL: ${message}`);
      passed = false;
    }
  }

  // 1. Yard exit condition
  assert(!canTokenMove(-1, 5), 'Token in yard cannot move on 5');
  assert(canTokenMove(-1, 6), 'Token in yard CAN move on 6');

  // 2. Exact home finish rule
  assert(canTokenMove(54, 2), 'Token at 54 can move on 2 to reach 56');
  assert(!canTokenMove(54, 3), 'Token at 54 CANNOT overshoot 56 on roll 3');
  assert(!canTokenMove(56, 1), 'Token already at Home (56) cannot move');

  // 3. Legal move listing
  const initialTokens: Record<PlayerColor, [number, number, number, number]> = {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
  };
  assert(getLegalMoves('red', 4, initialTokens).length === 0, 'No legal moves for roll 4 when all tokens in yard');
  assert(getLegalMoves('red', 6, initialTokens).length === 4, 'All 4 tokens can move on roll 6 when in yard');

  // 4. Move execution and spawn
  const moveSpawn = executeMove('red', 0, 6, initialTokens);
  assert(moveSpawn.nextTokens.red[0] === 0, 'Rolling 6 spawns token 0 to position 0');
  assert(moveSpawn.awardedExtraTurn === true, 'Rolling 6 awards an extra turn');

  // 5. Normal movement
  const midTokens: Record<PlayerColor, [number, number, number, number]> = {
    red: [10, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1],
  };
  const moveForward = executeMove('red', 0, 4, midTokens);
  assert(moveForward.nextTokens.red[0] === 14, 'Token at 10 moves 4 squares to 14');
  assert(!moveForward.awardedExtraTurn, 'Normal roll < 6 does not award extra turn without capture');

  // 6. Capture on unprotected square
  // Red start is 0. If Red is at step 13, global square is 13.
  // Green start is 13. If Green is at step 0, global square is 13.
  // Wait, global 13 is Green start, which is a SAFE star square!
  // Let's test a non-safe square, e.g. global square 5 (not in SAFE_SQUARES).
  // Red at step 5 -> global 5.
  // Blue start is 39. To reach global 5: (39 + step) % 52 == 5 => 39 + 18 = 57 => 57 % 52 = 5.
  // So Blue at step 18 has global square 5.
  const captureBoard: Record<PlayerColor, [number, number, number, number]> = {
    red: [2, -1, -1, -1], // Red at step 2, rolling 3 lands on step 5 (global 5)
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [18, -1, -1, -1], // Blue at step 18 (global 5)
  };
  const captureResult = executeMove('red', 0, 3, captureBoard);
  assert(captureResult.capturedColor === 'blue', 'Red captures Blue at global square 5');
  assert(captureResult.nextTokens.blue[0] === -1, 'Captured Blue token returns to yard (-1)');
  assert(captureResult.awardedExtraTurn === true, 'Capture awards an extra turn');

  // 7. Safe square prevents capture
  // Global 0 is Red start (Safe square).
  // Yellow start is 26. Yellow at step 26 has global (26 + 26) % 52 = 0.
  // If Red is at step 0 (global 0) and Yellow lands on global 0:
  const safeBoard: Record<PlayerColor, [number, number, number, number]> = {
    red: [0, -1, -1, -1], // at safe square global 0
    green: [-1, -1, -1, -1],
    yellow: [22, -1, -1, -1], // roll 4 lands on step 26 (global 0)
    blue: [-1, -1, -1, -1],
  };
  const safeResult = executeMove('yellow', 0, 4, safeBoard);
  assert(safeResult.capturedColor === undefined, 'No capture occurs on Safe Star square');
  assert(safeResult.nextTokens.red[0] === 0, 'Red token remains safe on star square');

  // 8. Bot AI priorities (Capture over normal advance)
  const botBoard: Record<PlayerColor, [number, number, number, number]> = {
    red: [2, 10, -1, -1], // Token 0 can land on step 5 (capture Blue). Token 1 advances from 10 to 13.
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [18, -1, -1, -1], // Vulnerable at global 5
  };
  const bestBotMove = selectBestBotMove('red', 3, botBoard);
  assert(bestBotMove === 0, 'Bot AI correctly prioritizes capturing opponent token');

  // 9. Turn progression
  assert(getNextTurn('red', ['red', 'green', 'yellow', 'blue']) === 'green', 'Next turn after Red is Green');
  assert(getNextTurn('blue', ['red', 'green', 'yellow', 'blue']) === 'red', 'Next turn wraps from Blue to Red');
  assert(getNextTurn('red', ['red', 'yellow']) === 'yellow', '2-Player turn alternates Red to Yellow');

  return { passed, results };
}
