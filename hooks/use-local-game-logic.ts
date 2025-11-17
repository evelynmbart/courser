import { Camelot } from "@/lib/camelot";
import type { BoardState, LegalMove, TurnState } from "@/lib/camelot/types";
import { useEffect, useState } from "react";

interface UseLocalGameLogicProps {
  /** Callback when a turn is submitted. Return false to prevent default turn switching */
  onTurnSubmitted?: (params: {
    boardState: BoardState;
    currentTurn: "white" | "black";
    turnState: TurnState;
    notation: string;
  }) => void | Promise<void>;

  /** Callback when game is reset */
  onGameReset?: () => void | Promise<void>;
}

export function useLocalGameLogic(props?: UseLocalGameLogicProps) {
  // Game state
  const [boardState, setBoardState] = useState<BoardState>(
    Camelot.Board.getInitialBoardState()
  );
  const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");
  const [winner, setWinner] = useState<string | null>(null);

  // Turn state
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<LegalMove[]>([]);

  // Store board state at the beginning of a turn for cancellation
  const [turnStartBoardState, setTurnStartBoardState] =
    useState<BoardState | null>(null);

  // History
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // UI messages
  const [message, setMessage] = useState<string>("");

  // Check for mandatory jumps at turn start
  useEffect(() => {
    if (winner || turnState) return;

    const hasJump =
      Camelot.Logic.checkFirstMovePossibleJumps(boardState, currentTurn)
        .length > 0;
    if (hasJump) {
      setMessage("You must capture! Select a piece to see available captures.");
    } else {
      setMessage("");
    }
  }, [currentTurn, boardState, winner, turnState]);

  const handleSquareClick = (square: string) => {
    if (winner) return;

    // If turn in progress
    if (turnState) {
      const currentSquare = turnState.moves[turnState.moves.length - 1];

      // Clicking current position - deselect
      if (square === currentSquare) {
        // Can't deselect if moves have been made
        if (turnState.moves.length > 1) {
          return;
        }
        setTurnState(null);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Clicking a legal move - continue turn
      if (legalMoves.some((move) => move.to === square)) {
        const result = Camelot.Logic.executeStep(
          square,
          boardState,
          turnState,
          currentTurn,
          legalMoves
        );

        if (result.success && result.newBoardState && result.newTurnState) {
          setMessage(result.message);
          setBoardState(result.newBoardState);
          setTurnState(result.newTurnState);
          setSelectedSquare(
            result.newTurnState.moves[result.newTurnState.moves.length - 1]
          );
          setLegalMoves(result.legalNextMoves);
          if (result.legalNextMoves.length === 0) {
            setMessage(
              "No more legal moves. Click Submit Turn to end your turn."
            );
          }
        }
        if (!result.success) {
          console.error("Error executing step", result.error);
        }
        return;
      }

      // Clicking elsewhere during mandatory continuation - not allowed
      if (turnState.mustContinue) {
        return;
      }

      // Clicking elsewhere if no legal moves - not allowed
      if (legalMoves.length === 0) {
        return;
      }

      // Clicking elsewhere during optional continuation - allow it (implicitly ends turn)
      // Fall through to piece selection
    }

    // Starting a new turn or selecting a piece
    const piece = boardState[square];
    if (piece && piece.color === currentTurn) {
      const moves = Camelot.Logic.getInitialMoves(
        square,
        boardState,
        currentTurn
      );

      if (moves.length === 0) {
        setMessage("This piece has no legal moves.");
        return;
      }

      setSelectedSquare(square);
      setLegalMoves(moves);

      // Store the current board state before starting the turn
      setTurnStartBoardState(boardState);

      // Start a new turn state
      setTurnState(Camelot.Logic.createEmptyTurnState(square));
      setMessage("Select where to move.");
    }
  };

  const handleSubmitTurn = async () => {
    if (!turnState || turnState.mustContinue) return;

    // Record the move
    const notation = Camelot.Logic.getTurnNotation(turnState);
    if (notation) {
      setMoveHistory([...moveHistory, notation]);
    }

    // Check for win
    const winCondition = Camelot.Logic.checkWinCondition(
      boardState,
      currentTurn
    );
    if (winCondition) {
      setWinner(currentTurn);
      setMessage(`${currentTurn} wins by ${winCondition}!`);
    } else {
      // Call custom callback if provided
      if (props?.onTurnSubmitted && notation) {
        await props.onTurnSubmitted({
          boardState,
          currentTurn,
          turnState,
          notation,
        });
      }

      // Default: Switch turns
      setCurrentTurn(currentTurn === "white" ? "black" : "white");
    }

    // Reset turn state
    setTurnState(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setTurnStartBoardState(null);
    setMessage("");
  };

  const handleReset = async () => {
    setBoardState(Camelot.Board.getInitialBoardState());
    setCurrentTurn("white");
    setTurnState(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setTurnStartBoardState(null);
    setMoveHistory([]);
    setWinner(null);
    setMessage("");

    if (props?.onGameReset) {
      await props.onGameReset();
    }
  };

  const cancelTurn = () => {
    // Restore the board state to before the turn started
    if (turnStartBoardState) {
      setBoardState(turnStartBoardState);
    }

    setTurnState(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setTurnStartBoardState(null);
    setMessage("");
  };

  return {
    // State
    boardState,
    setBoardState,
    currentTurn,
    setCurrentTurn,
    winner,
    setWinner,
    turnState,
    setTurnState,
    selectedSquare,
    setSelectedSquare,
    legalMoves,
    setLegalMoves,
    moveHistory,
    setMoveHistory,
    message,
    setMessage,

    // Actions
    handleSquareClick,
    handleSubmitTurn,
    handleReset,
    cancelTurn,
  };
}
