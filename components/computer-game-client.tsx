"use client";

import { useLocalGameLogic } from "@/hooks/use-local-game-logic";
import { Camelot, CamelotEngine } from "@/lib/camelot";
import { GameState } from "@/lib/camelot/types";
import { useEffect, useState } from "react";
import { ChivalryBoard } from "./chivalry-board";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Difficulty = "easy" | "medium" | "hard" | "expert";
type PlayerColor = "white" | "black";

export function ComputerGameClient() {
  // Game configuration
  const [humanColor, setHumanColor] = useState<PlayerColor>("white");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [gameStarted, setGameStarted] = useState(false);

  // Engine
  const [engine, setEngine] = useState<CamelotEngine | null>(null);

  // UI messages for engine
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const [engineStats, setEngineStats] = useState<string>("");

  // Use shared game logic
  const {
    boardState,
    setBoardState,
    currentTurn,
    setCurrentTurn,
    winner,
    setWinner,
    turnState,
    selectedSquare,
    legalMoves,
    moveHistory,
    setMoveHistory,
    message,
    setMessage,
    handleSquareClick: baseHandleSquareClick,
    handleSubmitTurn: baseHandleSubmitTurn,
    handleReset: baseHandleReset,
    cancelTurn,
  } = useLocalGameLogic({
    onTurnSubmitted: async ({ currentTurn }) => {
      // After human submits, switch to computer
      const computerColor = humanColor === "white" ? "black" : "white";
      setCurrentTurn(computerColor);
    },
  });

  // Initialize engine when game starts
  useEffect(() => {
    if (gameStarted && !engine) {
      const newEngine = new CamelotEngine(
        CamelotEngine.getDifficultyPreset(difficulty)
      );
      setEngine(newEngine);
    }
  }, [gameStarted, difficulty, engine]);

  // Computer move logic
  useEffect(() => {
    if (
      !gameStarted ||
      !engine ||
      winner ||
      turnState ||
      currentTurn === humanColor ||
      isEngineThinking
    ) {
      return;
    }

    // It's the computer's turn
    setIsEngineThinking(true);
    setMessage("Computer is thinking...");

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const gameState: GameState = {
          white_castle_moves: 0,
          black_castle_moves: 0,
          board_state: boardState,
        };

        const analysis = engine.getBestMove(gameState, currentTurn);

        if (analysis.bestMove) {
          // Apply the move
          setBoardState(analysis.bestMove.finalBoardState);

          // Record the move
          setMoveHistory([...moveHistory, analysis.bestMove.notation]);

          // Update stats
          const evalStr = engine.getEvaluationString(analysis);
          setEngineStats(
            `Depth: ${
              analysis.depth
            } | Eval: ${evalStr} | Nodes: ${analysis.nodes.toLocaleString()} | Time: ${
              analysis.timeMs
            }ms`
          );

          // Check for win
          const winCondition = Camelot.Logic.checkWinCondition(
            analysis.bestMove.finalBoardState,
            currentTurn
          );

          if (winCondition) {
            setWinner(currentTurn);
            setMessage(`Computer wins by ${winCondition}!`);
          } else {
            // Switch turns to human
            setCurrentTurn(humanColor);
            setMessage("");
          }
        } else {
          // No legal moves for computer - human wins
          setWinner(humanColor);
          setMessage(`You win! Computer has no legal moves.`);
        }
      } catch (error) {
        console.error("Engine error:", error);
        setMessage("Engine error occurred");
      } finally {
        setIsEngineThinking(false);
      }
    }, 100);
  }, [
    gameStarted,
    engine,
    boardState,
    currentTurn,
    humanColor,
    winner,
    turnState,
    isEngineThinking,
    moveHistory,
  ]);

  // Wrapper for square click that checks if it's human's turn
  const handleSquareClick = (square: string) => {
    if (!gameStarted || currentTurn !== humanColor) return;
    baseHandleSquareClick(square);
  };

  // Wrapper for submit turn
  const handleSubmitTurn = () => {
    baseHandleSubmitTurn();
  };

  const handleStartGame = () => {
    setGameStarted(true);
    baseHandleReset();
    setEngineStats("");
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setEngine(null);
    baseHandleReset();
    setEngineStats("");
    setIsEngineThinking(false);
  };

  // Setup screen
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <Card className="p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Play vs Computer
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Play as</label>
              <Select
                value={humanColor}
                onValueChange={(value) => setHumanColor(value as PlayerColor)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as Difficulty)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Easy</span>
                      <span className="text-xs text-muted-foreground">
                        Depth 3, 500ms
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Medium</span>
                      <span className="text-xs text-muted-foreground">
                        Depth 5, 2s
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hard">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Hard</span>
                      <span className="text-xs text-muted-foreground">
                        Depth 8, 5s
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="expert">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Expert</span>
                      <span className="text-xs text-muted-foreground">
                        Depth 12, 10s
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleStartGame} className="w-full" size="lg">
              Start Game
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Game screen
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex justify-center">
        <ChivalryBoard
          boardState={boardState}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
          playerColor={humanColor}
          disabled={!!winner || currentTurn !== humanColor || isEngineThinking}
          lastMove={moveHistory[moveHistory.length - 1]}
        />
      </div>

      <div className="w-full lg:w-80 space-y-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Game Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Turn:</span>
              <span className="font-medium capitalize">
                {currentTurn === humanColor ? "You" : "Computer"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Color:</span>
              <span className="font-medium capitalize">{humanColor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium capitalize">{difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed Moves:</span>
              <span className="font-medium">{moveHistory.length}</span>
            </div>

            {turnState && turnState.moves.length > 1 && (
              <div className="mt-2 p-2 bg-accent rounded-md">
                <div className="text-xs text-muted-foreground mb-1">
                  Current Turn:
                </div>
                <div className="font-mono text-xs">
                  {turnState.moves.join(" → ")}
                </div>
              </div>
            )}

            {isEngineThinking && (
              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <div className="text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  Computer is thinking...
                </div>
              </div>
            )}

            {message && !isEngineThinking && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  {message}
                </div>
              </div>
            )}

            {engineStats && !isEngineThinking && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <div className="text-xs text-muted-foreground mb-1">
                  Last Engine Analysis:
                </div>
                <div className="text-xs font-mono">{engineStats}</div>
              </div>
            )}

            {winner && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md text-center">
                <div className="font-bold text-lg">
                  {winner === humanColor ? "You Win!" : "Computer Wins!"}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            {currentTurn === humanColor && (
              <>
                {turnState && (
                  <Button
                    onClick={cancelTurn}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel Turn
                  </Button>
                )}
                <Button
                  onClick={handleSubmitTurn}
                  className="flex-1"
                  disabled={!turnState || turnState.mustContinue || !!winner}
                >
                  Submit Turn
                </Button>
              </>
            )}
            <Button
              onClick={handleNewGame}
              className="bg-transparent"
              variant="outline"
            >
              New Game
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Move History</h2>
          <div className="max-h-64 overflow-y-auto space-y-1 text-sm">
            {moveHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No moves yet
              </p>
            ) : (
              moveHistory.map((move, index) => {
                const moveNum = Math.floor(index / 2) + 1;
                const isWhiteMove = index % 2 === 0;
                return (
                  <div key={index} className="flex gap-2">
                    {isWhiteMove && (
                      <span className="text-muted-foreground w-8">
                        {moveNum}.
                      </span>
                    )}
                    {!isWhiteMove && <span className="w-8" />}
                    <span className="font-mono">{move}</span>
                    {humanColor === (isWhiteMove ? "white" : "black") && (
                      <span className="text-muted-foreground text-xs">
                        (you)
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
