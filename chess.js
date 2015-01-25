var whiteOnTop, squareSize, lastFen, lastMove;
var boardLocation = new Array(2);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	// click the first piece
	clickSquare(request.move.substr(0, 2));
	
	// click the target square after waiting 500 milliseconds
	window.setTimeout(function() { clickSquare(request.move.substr(2, 2)); }, 500);
});
  
function getCurrentBoard()
{
	// get the current displayed game
	var currentDisplayedGame = $("#game_container").children("div:not(.visibilityHidden)");

	if (currentDisplayedGame)
	{
		// get the identifier
		var id = currentDisplayedGame.attr("id");
		var startOfBoardNum = id.lastIndexOf("_") + 1;
		var boardIdentifier = id.substring(startOfBoardNum);
		
		return boardIdentifier;
	}

	return null;
}

function simulateClick(x, y)
{
    var el = document.elementFromPoint(x, y);
    var evt = document.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window, 1, 0, 0, x, y, false, false, false, false, 0, null);

    el.dispatchEvent(evt);
}

function collectTextNodes(element, texts)
{
	for (var child = element.firstChild; child !== null; child = child.nextSibling)
	{
		if (child.nodeType == 3)
            texts.push(child);
		else if (child.nodeType == 1)
            collectTextNodes(child, texts);
    }
}

function getTextWithSpaces(element)
{
	var texts = [];
    collectTextNodes(element, texts);
	for (var i = texts.length; i > 0; i--)
        texts[i]= texts[i].data;
		
    return texts.join(' ');
}

function getPgnString()
{
	var pgnContainer = document.getElementById("notation_" + getCurrentBoard());
	return getTextWithSpaces(pgnContainer);
}

function getFenString()
{
	// get the board identifier
	var boardIdentifier = getCurrentBoard();
	var board = document.getElementById("chessboard_" + boardIdentifier + "_boardarea");

	if (!board)
		return null;
	
	// get the locations
	boardLocation[0] = $(board).offset().left;
	boardLocation[1] = $(board).offset().top;
	
	var chessBoard = {
				"a8": "1", "b8": "1", "c8": "1", "d8": "1", "e8": "1", "f8": "1", "g8": "1", "h8": "1",
				"a7": "1", "b7": "1", "c7": "1", "d7": "1", "e7": "1", "f7": "1", "g7": "1", "h7": "1",
				"a6": "1", "b6": "1", "c6": "1", "d6": "1", "e6": "1", "f6": "1", "g6": "1", "h6": "1",
				"a5": "1", "b5": "1", "c5": "1", "d5": "1", "e5": "1", "f5": "1", "g5": "1", "h5": "1",
				"a4": "1", "b4": "1", "c4": "1", "d4": "1", "e4": "1", "f4": "1", "g4": "1", "h4": "1",
				"a3": "1", "b3": "1", "c3": "1", "d3": "1", "e3": "1", "f3": "1", "g3": "1", "h3": "1",
				"a2": "1", "b2": "1", "c2": "1", "d2": "1", "e2": "1", "f2": "1", "g2": "1", "h2": "1",
				"a1": "1", "b1": "1", "c1": "1", "d1": "1", "e1": "1", "f1": "1", "g1": "1", "h1": "1"
			};
			
	// get the board
	child = board.firstChild;
	while (child)
	{
		if (child.style.display != "none")
		{
			if (child.hasOwnProperty("src"))
			{
				squareSize = child.width;
				
				var piecePlayerStart = child.src.lastIndexOf("/") + 1;
				var piecePlayer = child.src.substring(piecePlayerStart, ++piecePlayerStart);
				var piece = child.src.substring(piecePlayerStart, piecePlayerStart + 1);
				
				var pieceLocationStart = child.id.lastIndexOf("_") + 1;
				var pieceLocation = child.id.substring(pieceLocationStart);
				
				if (piecePlayer == "w")
					piece = piece.toUpperCase();
				else
					piece = piece.toLowerCase();
				
				chessBoard[pieceLocation] = piece;
			}
		}
		
		child = child.nextSibling;
	}

	// get the timers
	var whiteTimer = $("#white_timer_" + boardIdentifier);
	var blackTimer = $("#black_timer_" + boardIdentifier);
	
	// find who's on top/bottom
	if (whiteTimer.parent().attr("id") == "topplayerdiv_" + boardIdentifier)
		whiteOnTop = true;
	else
		whiteOnTop = false;
		
	// get the current player
	var currentPlayer;
	if (whiteTimer.hasClass("active"))
		currentPlayer = "w";
	else if (blackTimer.hasClass("active"))
		currentPlayer = "b";
	else
	{
		// couldn't auto detect
		// for now we'll randomly select one
		if (Math.floor(Math.random() * 2) % 2 == 1)
			currentPlayer = "w";
		else
			currentPlayer = "b";
	}

	// setup variables
	var fenStr = "";
	var i = 0;
	
	// loop through, and add the board to the fen string
	var current1Count = 0;
	var counting1s = false;
	var key;
	for (key in chessBoard)
	{
		if (i != 0 && i % 8 == 0)
		{
			if (current1Count != 0)
			{
				fenStr += current1Count;
				current1Count = 0;
			}

			fenStr += "/";
		}
		
		if (chessBoard[key] == '1')
			current1Count++;
		else
		{
			if (current1Count != 0)
			{
				fenStr += current1Count;
				current1Count = 0;
			}

			fenStr += chessBoard[key];
		}

		i++;
	}

	if (current1Count != 0)
		fenStr += current1Count;

	// add the current player's turn (white/black)
	fenStr += " " + currentPlayer;
	
	// add the available casteles
	fenStr += " KQkq";
	
	// add the times (not needed)
	fenStr += " - 0 1";
	
	return fenStr;
}

function clickSquare(square)
{
	var letters = [ "a", "b", "c", "d", "e", "f", "g", "h" ];
	
	// get the number
	var yNum = parseInt(square[1] - 1);
	
	// if white is on top, reverse the array
	if (whiteOnTop)
		letters.reverse();
	else
		yNum = 7 - yNum;
	
	// calculate piece locations
	var targetY = yNum * squareSize + (squareSize / 2);
	var targetX = letters.indexOf(square[0]) * squareSize + (squareSize / 2);
	
	// simulate the click
	simulateClick(boardLocation[0] + targetX, boardLocation[1] + targetY);
}

function getNextMove()
{
	// get the fen string
	var currentFen = getFenString();
	
	if (currentFen == lastFen)
	{
		chrome.runtime.sendMessage({ nextMove: lastMove });
	}
	else if (!currentFen)
	{
		chrome.runtime.sendMessage({ nextMove: null });
	}
	else
	{
		$.post("https://nextchessmove.com/calculate", { fen: currentFen }).done(function(data)
		{
			lastFen = currentFen;

			// once finished, extract the move
			var startOfMove = data.indexOf("data-move=\\'") + 12;
			lastMove = data.substring(startOfMove, startOfMove + 4);
			chrome.runtime.sendMessage({ nextMove: lastMove });
		});
	}
}

getNextMove();