"use client";

import { useLocalGameLogic } from "@/hooks/use-local-game-logic";
import { ChivalryBoard } from "./chivalry-board";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function LocalGameClient() {
  const {
    boardState,
    currentTurn,
    winner,
    turnState,
    selectedSquare,
    legalMoves,
    moveHistory,
    message,
    handleSquareClick,
    handleSubmitTurn,
    handleReset,
    cancelTurn,
  } = useLocalGameLogic();

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex justify-center">
        <ChivalryBoard
          boardState={boardState}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onSquareClick={handleSquareClick}
          playerColor="white"
          disabled={!!winner}
        />
      </div>

      <div className="w-full lg:w-80 space-y-4">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Game Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Turn:</span>
              <span className="font-medium capitalize">{currentTurn}</span>
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

            {message && (
              <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                <div className="text-sm text-amber-900 dark:text-amber-100">
                  {message}
                </div>
              </div>
            )}

            {winner && (
              <div className="mt-4 p-3 bg-primary/10 rounded-md text-center">
                <div className="font-bold text-lg capitalize">
                  {winner} Wins!
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
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
            <Button
              onClick={handleReset}
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
              moveHistory.map((move, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-muted-foreground w-8">
                    {index + 1}.
                  </span>
                  <span className="font-mono">{move}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
