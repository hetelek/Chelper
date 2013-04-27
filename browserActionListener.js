chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.nextMove != null)
		$("#status").text("Move: " + request.nextMove);
	else
		$("#status").text("Waiting...");

	$('.container').html("<h4 id=\"status\">" + request.nextMove + "</h4>");
});

$('.container').html("<img src=\"spinner.gif\" id=\"spinner\" />");

chrome.tabs.executeScript(null, { file: "jquery-1.9.1.min.js" });
chrome.tabs.executeScript(null, { file: "chess.js" });