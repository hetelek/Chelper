chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if (request.nextMove != null)
	{
		$("#spinner").hide();
		$("#status").text(request.nextMove);
		$("#status").show();
	}
	else
	{
		$("#status").hide();
		$("#spinner").show();
	}
});

$("#status").click(function()
{
	chrome.tabs.getSelected(null, function(tab)
	{
		chrome.tabs.sendMessage(tab.id, { move: $("#status").text() });
	});
});

chrome.tabs.executeScript(null, { file: "jquery-1.11.2.min.js" });
chrome.tabs.executeScript(null, { file: "chess.js" });