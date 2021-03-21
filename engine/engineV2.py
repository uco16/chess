#!/usr/bin/env python3

"""
A Basic Chess Engine.

Author: U.C.Özer

Goal: A chess program that gives out a recommended move after a basic
evaluation. For now, the evaluation will only depend on material.

Version 2: This version is more object oriented, programming each piece as its
own object that keeps track of the places that it is allowed to go.
This is probably more computationally intensive but on this small scale it
should not matter if we have to keep track of the ~10 objects.

      0 1 2 3 4 5 6 7
      a b c d e f g h
   7 8 w  black player
   6 7
   5 6
   4 5
   3 4
   2 3
   1 2
   0 1 b  white player

"""

import os

# Let's define the board as an object.

class ChessGame:

    """An object representing the chess board with information about position
    of the pieces and the moves played so far."""

    def __init__(self):
        self.position = [['  ' for j in range(8)] for i in range(8)]
        self.pieces = self.setup_pieces()
        self.possible_moves = self.update_possible_moves()
        self.history = {0: self.position}
        self.turn = 1
        self.isCheck = False
        self.enpassantflag = [None, (None, None, None)]  # see 'move' function
        self.captured = list()  # captures throughout the whole game
        self.winner = None

    def __getitem__(self, key):
        """Called to evaluate self[key]

        :key: Chess notation 'a1' to 'h8'.
        :returns: ChessPiece object on that location.

        """
        return self.getPiece(matrix_notation(key))

    def getPiece(self, location):
        for Piece in self.pieces:
            if Piece.location == location:
                return Piece

    def setup_pieces(self):
        """Generates 8x8 matrix representing the starting board with entries
        given by ChessPiece objects."""
        pieces = []
        # testing setup
        # knight
        pieces.append(Knight(colour='white', Game=self, location=(3, 3)))
        # king
        pieces.append(King(colour='white', Game=self, location=(2, 2)))
        # rook
        pieces.append(Rook(colour='black', Game=self, location=(5, 4)))
        # rook
        pieces.append(Rook(colour='white', Game=self, location=(4, 4)))
        # bishop
        pieces.append(Bishop(colour='black', Game=self, location=(1, 5)))
        # queen
        pieces.append(Queen(colour='black', Game=self, location=(3, 4)))

        # proper setup
        #for col in range(8):  # white pawns
        #    pieces.append(Pawn(colour='white', Game=self, location=(col, 1)))
        #for col in range(8):  # black pawns
        #    pieces.append(Pawn(colour='black', Game=self, location=(col, 6)))
        #PieceList = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]
        #for col in range(8):
        #    pieces.append(PieceList[col](colour='white', Game=self,
        #                                 location=(col, 0)))
        #for col in range(8):
        #    pieces.append(PieceList[col](colour='black', Game=self,
        #                                 location=(col, 7)))

        for Piece in pieces:
            col, row = Piece.location
            self.position[col][row] = Piece.name
        return pieces

    def update_possible_moves(self):
        for obj in self.pieces:
            if isinstance(obj, ChessPiece):
                obj.update_allowed_movements()

    def play(self):
        while self.winner == None:
            self.print_matrix_representation()
            foundLegalMove = False
            while not foundLegalMove:
                move = self.prompt_move()
                if move:
                    if self.isLegal(*move):
                        foundLegalMove = True
                        self.mv(*move)
                    else:
                        print("Illegal Move")
            os.system('clear')

    def prompt_move(self):
       """Prompts the user for a move.

       Returns True if the move is valid and False if it is not."""
       try:
           initial = matrix_notation(input("Move from "))
           final = matrix_notation(input("Move to "))
           return (initial, final)
       except ValueError:
           print("Invalid Input: Please use 'a1' through 'h8' as inputs.")

    def rm(self, pos):
        "Removes a chess piece from the board."
        piece = self.position[pos[0]][pos[1]]
        if piece == '  ':
            t = "ChessGame.rm: cannot remove {pos}: no piece at that location"
            print(t.format(pos=pos))
        else:
            self.position[pos[0]][pos[1]] = '  '

    def mv(self, initial, final):
        "Moves piece from initial to final position."
        piece = self.position[initial[0]][initial[1]]
        self.position[initial[0]][initial[1]] = '  '
        self.position[final[0]][final[1]] = piece
        if piece[1] == 'P':
            flag = self.enpassantflag
            self.handle_enpassant(initial, final)
        self.history[self.turn] = self.position
        #self.update_possible_moves()
        self.turn += 1

    def changed_squares(self):
        "Find squares that changed since last turn."
        changed_squares = list()
        last_pos = self.history[self.turn-1]
        for i in range(8):
            for j in range(8):
                if last_pos[i][j] != self.position[i][j]:
                    changed_squares.append((i,j))
        return changed_squares

    def print_matrix_representation(self):
        # a1=(0,0) is in the lower left and h8=(7,7) in the upper right
        print("Turn {}: {} to move".format(self.turn, ['black',
                                                       'white'][self.turn%2]))
        print("    " + "- "*12)
        for row in range(8):
            line = '{} |'.format(8-row)
            for col in range(8):
                line += ' ' + self.position[col][7-row]
            line += ' |'
            print(line)
        print("    " + "- "*12)
        print("     a  b  c  d  e  f  g  h")

    def handle_enpassant(self, initial, final):
        # Only gets called after a pawn move has been done.
        # After a pawn moves two fields, set en passant flag.
        if abs(final[1]-initial[1]) == 2:
            epsquares = tuple((final[0] + i, final[1]) for i in (-1, 0, +1))
            self.enpassantflag = [self.turn, epsquares]

        # If a pawn is on a square with an en passant flag
        epturn, epsquares = self.enpassantflag
        if any(initial == x for x in epsquares) and self.turn == epturn+1:
            # Position of the pawn that moved last turn:
            pawnsquare = epsquares[1]
            # If we land over or under this square, remove the enemy pawn
            if (initial[1] == pawnsquare[1]
                    and abs(final[1] - pawnsquare[1]) == 1
                    and final[0] == pawnsquare[0]):
                self.rm(pawnsquare)

    def isLegal(self, initial, final):
        """Check if a move is legal in the current position.

        :returns: Boolean
        """
        if any(not isinstance(x, int) for x in initial + final):
            print("Invalid Move: Non-integers.")
            return False
        if any(n < 0 and n > 7 for n in initial + final):
            print("Invalid Move: Out of bounds.")
            return False

        piece = self.position[initial[0]][initial[1]]
        if piece == '  ':
            print("Invalid Move: No chess piece at selected position.")
            return False
        if ((piece[0] == 'w' and self.turn%2 != 1)
                or (piece[0] == 'b' and self.turn%2 != 0)):
            print("Invalid Move: Not your turn.")
            return False
        target = self.position[final[0]][final[1]]
        if piece[0] == target[0]:
            print("Invalid Move: Cannot capture your own piece.")
            return False

        # --- Pawn ---
        if piece[1] == 'P':
            # If a pawn is on a square with an en passant flag
            epturn, epsquares = self.enpassantflag
            if ((initial == epsquares[0] or initial == epsquares[2])
                    and self.turn == epturn+1):
                # Position of the pawn that moved last turn:
                pawnsquare = epsquares[1]
                # If we land over or under this square, it is a valid move
                if (initial[1] == pawnsquare[1]     # COMMENT 21 March: seems like we
                                                    # do not need to check this, since initial is already
                                                    # established to be an epsquare?
                        and abs(final[1] - pawnsquare[1]) == 1
                        and final[0] == pawnsquare[0]):
                    return True  # en passant capture

            if piece == 'wP':
                sign = +1
                baserow = 1
            else:
                sign = -1
                baserow = 6
            if final[1] == initial[1] + sign:  # move one row up/down
                if (final[0] == initial[0] and target == '  '):
                    return True  # move onto empty square
                elif (abs(final[0] - initial[0]) == 1
                      and target[0] != '  '):
                    return True  # capture diagonally
            elif (final[1] == initial[1] + sign*2  # move two rows up/down
                  and final[0] == initial[0]):
                if (initial[1] == baserow  # on starting row
                    and self.position[initial[0]][initial[1] + sign] == '  '
                    and target == '  '):  # path is empty
                    return True

        # --- Bishop ---
        if piece[1] == 'B':
            if abs(initial[0]-final[0]) == abs(initial[1]-final[1]):
                for col in range(min(initial[0], final[0])+1,
                                 max(initial[0], final[0])):
                    for row in range(min(initial[1], final[1])+1,
                                     max(initial[1], final[1])):
                        if self.position[col][row] != '  ':
                            return False

                # for loop went through without a return
                return True

        # --- Queen ---
        if piece[1] == 'Q':
            # Bishop Logic
            if abs(initial[0]-final[0]) == abs(initial[1]-final[1]):
                for col in range(min(initial[0], final[0])+1,
                                 max(initial[0], final[0])):
                    for row in range(min(initial[1], final[1])+1,
                                     max(initial[1], final[1])):
                        if self.position[col][row] != '  ':
                            return False

                # for loop went through without a return
                return True

            # Rook Logic
            if final[0] == initial[0]:
                cols = [initial[0]]
                rows = [i for i in range(min(initial[1], final[1])+1,
                                         max(initial[1], final[1]))]
            elif final[1] == initial[1]:
                cols = [i for i in range(min(initial[0], final[0])+1,
                                         max(initial[0], final[0]))]
                rows = [initial[1]]
            else:
                return False

            for col in cols:
                for row in rows:
                    if self.position[col][row] != '  ':
                        return False
            # for loop went through without a return
            return True

        # If no True value was returned until now:
        return False


class ChessPiece(object):

    """A general parent class for all chess pieces."""

    def __init__(self, colour, Game, location):
        self.colour = colour  # white, black
        self.Game = Game
        self.location = location
        self.allowed_movements = []

    def include_move(self, col, row):
        """If the spot is empty or a piece of another colour, add the move to
        the allowed moves. Return the object on the target square."""
        if col in range(8) and row in range(8):
            obj = self.Game.getPiece((col, row))
            if isinstance(obj, ChessPiece):
                if obj.colour != self.colour:
                    self.allowed_movements.append((col, row))
                    return obj
            elif obj == None:
                self.allowed_movements.append((col, row))
                return obj
            else:
                msg = 'Expected ChessPiece or None but received {}'.format(obj)
                raise TypeError(msg)

    def update_allowed_movements(self):
        pass


class Pawn(ChessPiece):

    def __init__(self, colour, Game, location):
        ChessPiece.__init__(self, colour, Game, location)
        self.name = '{}P'.format(self.colour[0])

class King(ChessPiece):

    def __init__(self, colour, Game, location):
        ChessPiece.__init__(self, colour, Game, location)
        self.name = '{}K'.format(self.colour[0])

    def update_allowed_movements(self):
        """Find the allowed movements in the current Game position."""
        for col in range(self.location[0]-1, self.location[0]+2):
            for row in range(self.location[1]-1, self.location[1]+2):
                self.include_move(col, row)

class Knight(ChessPiece):

    def __init__(self, colour, Game, location):
        ChessPiece.__init__(self, colour, Game, location)
        self.name = '{}N'.format(self.colour[0])

    def update_allowed_movements(self):
        mycol, myrow = self.location
        for col in range(mycol-2, mycol+3):
            for row in range(myrow-2, myrow+3):
                if abs(mycol - col) + abs(myrow - row) == 3:
                    self.include_move(col, row)

class DistancePiece(ChessPiece):

    def __init__(self, colour, Game, location, directions):
        ChessPiece.__init__(self, colour, Game, location)
        self.directions = directions

    # Rooks, Bishops and Queens share the same movement options, just in
    # different directions (vertical/horizontal or diagonal or both)
    def update_allowed_movements(self):
        mycol, myrow = self.location
        for (x, y) in self.directions:
            d = 1
            encounteredBarrier = False
            while (not encounteredBarrier
                   and mycol+x*d in range(8)
                   and myrow+y*d in range(8)):
                obj = self.include_move(mycol+x*d, myrow+y*d)
                if isinstance(obj, ChessPiece):
                    if obj.colour != self.colour:
                        encounteredBarrier = True
                d+=1

class Rook(DistancePiece):

    def __init__(self, colour, Game, location):
        directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        DistancePiece.__init__(self, colour, Game, location,
                               directions=directions)
        self.name = '{}R'.format(self.colour[0])

class Bishop(DistancePiece):

    def __init__(self, colour, Game, location):
        directions = [(1, 1), (1, -1), (-1, -1), (-1, 1)]
        DistancePiece.__init__(self, colour, Game, location,
                               directions=directions)
        self.name = '{}B'.format(self.colour[0])

class Queen(DistancePiece):

    def __init__(self, colour, Game, location):
        rook_dir = [(0, 1), (0, -1), (1, 0), (-1, 0)]
        bishop_dir = [(1, 1), (1, -1), (-1, -1), (-1, 1)]
        DistancePiece.__init__(self, colour, Game, location,
                               directions=rook_dir+bishop_dir)
        self.name = '{}Q'.format(self.colour[0])

def chess_notation(entry):
    """Gives the chess notation for a given matrix position.

    :entry: A tuple of indices ranging from 0 to 7, representing the board.
    :returns: A string in modern chess notation.
    """
    column, row = entry
    letter = 'abcdefgh'[column]
    return letter + str(row + 1)

def matrix_notation(square):
    """Gives the matrix entry representing a given square on the board.

    :square: A string in chess notation, representing a square on the board.
    :returns: A tuple of indices (i, j), ranging from 0 to 7.
    """
    letter, row = square
    column = 'abcdefgh'.index(letter)
    return (column, int(row) - 1)

def tests():
    print("Testing:")
    functions = {
        #function name: (function, input, expected_output)
        'chess_notation': (chess_notation, (0, 0), 'a1'),
        'matrix_notation': (matrix_notation, 'a1', (0,0)),
    }
    for fname in functions:
        function, input, expected_output = functions[fname]
        output = function(input)
        if output == expected_output:
            result = 'Success'
        else:
            result = 'Failure'
        print(fname, result)


def play():
    "Play a game of chess against another player."
    newGame = ChessGame()
    newGame.print_matrix_representation()
    aKnight = newGame['d4']
    print('knight:', [chess_notation(x) for x in aKnight.allowed_movements])
    wKing = newGame['c3']
    print('king:', [chess_notation(x) for x in wKing.allowed_movements])
    aRook = newGame['f5']
    print('wrook:', [chess_notation(x) for x in aRook.allowed_movements])
    bRook = newGame['e5']
    print('brook:', [chess_notation(x) for x in bRook.allowed_movements])
    bBishop = newGame['b6']
    print('Bishop:', [chess_notation(x) for x in bBishop.allowed_movements])
    aQueen = newGame['d5']
    print('Queen:', [chess_notation(x) for x in aQueen.allowed_movements])

play()
