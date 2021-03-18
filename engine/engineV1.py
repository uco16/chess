#!/usr/bin/env python3

"""
A Basic Chess Engine

Author: U.C.Özer

Goal: A chess program that gives out a recommended move after a basic
evaluation.
For now, the evaluation will only depend on material.

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
        self.position = default_position()
        self.possible_moves = default_allowed_moves()
        self.history = {0: self.position}
        self.turn = 1
        self.isCheck = False
        self.enpassantflag = [None, (None, None, None)]  # see 'move' function
        self.captured = list()  # captures throughout the whole game
        self.winner = None


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


#    def update_possible_moves(self):
#        # WORK IN PROGRESS
#
#        for square in self.changed_squares():
#            piece = self.position[square[0]][square[1]]
#            if piece == '  ':  # square now empty
#                # no moves from this square
#                self.possible_moves[square] = None
#                # pawns can move into the square
#                eligible_pawn_squares = []
#                if self.position[square[0]][square[1]-1] == 'wP':
#                    eligible_pawn_squares.append(self.position[square[0]][square[1]-1])
#                if (square[1] == 3
#                        and self.position[square[0]][square[1]-1] == '  '
#                        and self.position[square[0]][square[1]-2] == 'wP'):
#                    eligible_pawn_squares.append(self.position[square[0]][1])
#                if self.position[square[0]][square[1]+1] == 'bP':
#                    eligible_pawn_squares.append(self.position[square[0]][square[1]+1])
#                if (square[1] == 4
#                        and self.position[square[0]][square[1]+1] == '  '
#                        and self.position[square[0]][square[1]+2] == 'bP'):
#                    eligible_pawn_squares.append(self.position[square[0]][6])
#                for eps in eligible_pawn_squares:
#                    if self.possible_moves[eps] != None:
#                        self.possible_moves[eps].append(square)
#                    else:
#                        self.possible_moves[eps] = [square]
#        # WORK IN PROGRESS


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

#    def isPossible(self, initial, final):
#        """Alternative approach to isLegal."""
#        if self.possible_moves[initial] != None:
#            for possible in self.possible_moves[initial]:
#                if final == possible:
#                    return True
#
#        return False

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
                if (initial[1] == pawnsquare[1]
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

        # --- King ---
        if piece[1] == 'K':
            if max(abs(initial[i] - final[i]) for i in range(len(initial))) == 1:
                return True

        # --- Knight ---
        if piece[1] == 'N':
            if abs(final[0]-initial[0]) < 3 and abs(final[1]-initial[1]) < 3:
                if final[0]+final[1]-initial[0]-final[1] in [-1, 1, -3, 3]:
                    return True

        # --- Rook ---
        if piece[1] == 'R':
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

    def analytical_to_positions(self):
        """Convert a move like 'Ne3' or 'e5' to the corresponding moves on the
        board."""
        pass



def default_position():
    """Generates 8x8 matrix representing the starting board with entries
    representing the pieces."""
    matrix = [['  ' for j in range(8)] for i in range(8)]
    #Pawns
    for col in range(8):
        matrix[col][1] = 'wP'
    for col in range(8):
        matrix[col][6] = 'bP'
    #Pieces
    pieces = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    for col in range(8):
        matrix[col][0] = 'w' + pieces[col]
    for col in range(8):
        matrix[col][7] = 'b' + pieces[col]

    return matrix

def default_allowed_moves():
    """Dictionary whose keys are locations (i, j) and entries are
    allowed moves from the default game position."""
    allowedmoves = dict()
    #  --- PAWNS ---
    for col in range(8):
        allowedmoves[(col, 1)] = [(col, 2), (col, 3)]  # wP
        allowedmoves[(col, 6)] = [(col, 5), (col, 4)]  # bP

    # --- Knights ---
    for col in (1, 6):
        for i in (-1, +1):
            allowedmoves[(col, 1)] = [(col+i, 3)]  # wN
            allowedmoves[(col, 1)] = [(col+i, 5)]  # bN

    return allowedmoves

def make_move(position, movecolour):
    """Find the best chess move in a given position.

    :position: An 8x8 matrix whose entries are strings representing the pieces
        'P': Pawn, 'K': King, 'Q': Queen, 'R': Rook, 'B': Bishop, 'N': Knight
    :movecolour: 'white' or 'black'
    :returns: A string in modern chess notation (e.g: 'e5' or 'Ne3')
    """
    return move

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

#tests()

def play():
    "Play a game of chess against another player."
    Game = ChessGame()
    Game.play()

play()
