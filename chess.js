function hasClass(element, cls)
{
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function getCurrentBoard()
{
	var gameContainer = document.getElementById("game_container");
	var child = gameContainer.firstChild;
	while (child)
	{
		if (!hasClass(child, "visibilityHidden"))
		{
			var startOfBoardNum = child.id.lastIndexOf("_") + 1;
			var boardIdentifier = child.id.substring(startOfBoardNum, child.id.length);
			return boardIdentifier;
		}
		
		child = child.nextSibling;
	}
	
	return 1;
}

function getFenString()
{
	var boardIdentifier = getCurrentBoard();
	var board = document.getElementById("chessboard_" + boardIdentifier + "_boardarea");

	if (!board)
		return null;
	
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

	// get the current player
	var currentPlayer;
	if (hasClass(document.getElementById("white_timer_" + boardIdentifier), "active"))
		currentPlayer = "w";
	else
		currentPlayer = "b";

	// setup variables
	var fenStr = "";
	var i = 0;
	
	// loop through, and add the board to the fen string
	var key;
	for (key in chessBoard)
	{
		if (i != 0 && i % 8 == 0)
			fenStr += "/";
		
		fenStr += chessBoard[key];
		i++;
	}

	// add the current player's turn (white/black)
	fenStr += " " + currentPlayer;
	
	// add the available casteles
	fenStr += " KQkq";
	
	// add the times (not needed)
	fenStr += " - 0 1";
	
	return fenStr;
}

function getNextMove()
{
	// get the fen string
	var fenStr = getFenString();
	
	if (!fenStr)
	{
		chrome.runtime.sendMessage({ nextMove: null });
		return;
	}
	
	// make the request
	$.post("http://nextchessmove.com/", { fen: fenStr }).done(function(data)
	{
		// once finished, extract the move
		var startOfMove = data.indexOf("data-move=\\'") + 12;
		var move = data.substring(startOfMove, startOfMove + 4);
		chrome.runtime.sendMessage({ nextMove: move });
	});
}

getNextMove();
