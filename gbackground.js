
var GSeparator;
var GBookmarksTree = null;

NodeList.prototype.forEach = function(func)
{
	for(var idx = 0, len = this.length; idx < len; idx++)
	{
		func(this[idx], idx);
	}
}

function createFolder(parentFolder, fullName)
{
	var names = fullName.split(GSeparator, 2);
	var folder;
	for(var idx = 0, len = parentFolder.children.length; idx < len; idx++)
	{
		if(parentFolder.children[idx].title == names[0])
		{
			folder = parentFolder.children[idx];
			break;
		}
	}
	if(!folder)
	{
		folder = { title: names[0], id: names[0], children: new Array() };
		parentFolder.children.push(folder);
	}
	if(names[1])
	{
		createFolder(folder, names[1]);
	}
}

function findFolder(parentFolder, fullName)
{
	var names = fullName.split(GSeparator, 2);
	for(var idx = 0, len = parentFolder.children.length; idx < len; idx++)
	{
		var child = parentFolder.children[idx];
		if(child.url == undefined && child.title == names[0])
		{
			return names[1] ? findFolder(child, names[1]) : child;
		}
	}
}

function handleStateChange()
{
	if(this.readyState == 4)
	{
		GSeparator = getGSeparator();
		var parser = new DOMParser();
		GBookmarksTree = { children: new Array() };
		var xmlDoc = parser.parseFromString(this.responseText, 'text/xml');
		xmlDoc.querySelectorAll('label').forEach(function(node)
		{
			createFolder(GBookmarksTree, node.textContent);
		});
		xmlDoc.querySelectorAll('bookmark').forEach(function(node)
		{
			var bm =
			{
				title: node.querySelector('title').textContent,
				url: node.querySelector('url').textContent,
				id: node.querySelector('id').textContent
			};
			var label = node.querySelector('label');
			if(label)
			{
				findFolder(GBookmarksTree, label.textContent).children.push(bm);
			}
			else
			{
				GBookmarksTree.children.push(bm);
			}
		});
		sortFolder(GBookmarksTree);
	}
}

function sortFolder(folder)
{
	var children = folder.children;
	if(children)
	{
		children.sort(sorting);
		for(var idx = 0, len = children.length; idx < len; idx++)
		{
			var child = children[idx];
			if(child.children)
			{
				sortFolder(child);
			}
		}
	}
}

function sorting(b1, b2)
{
	if(b1.children && b2.url) { return -1; }
	if(b2.children && b1.url) { return 1; }
	var t1 = b1.title, t2 = b2.title;
	return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
}

function setUseGoogleBookmarks(useGoogleBookmarks)
{
	if(useGoogleBookmarks)
	{
		chrome.browserAction.setBadgeText({ text: "G" });
		if(!GBookmarksTree)
		{
			loadGBookmakrs();
		}
	}
	else
	{
		chrome.browserAction.setBadgeText({ text: "" });
	}
}
function loadGBookmakrs()
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = handleStateChange;
	xhr.open("GET", 'http://www.google.com/bookmarks/?output=xml&num=10000', true);
	xhr.send();
}

setUseGoogleBookmarks(isUseGoogleBookmarks());
// vim: noet
