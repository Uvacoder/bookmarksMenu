
function setMouseButtonAction(select, button)
{
	localStorage[button] = select.selectedIndex;
}

function setIntProperty(input, maxLimit)
{
	var value = input.value;
	var re = /^\d+$/;
	if(!re.test(value) || (maxLimit != undefined && value > maxLimit))
	{
		input.setAttribute('class', 'error');
		return;
	}
	input.removeAttribute('class');
	localStorage[input.id] = value;
}

function setBoolProperty(property, value)
{
	if(value)
	{
		localStorage[property] = true;
	}
	else
	{
		delete localStorage[property];
	}
}

function setFontFamily(fontFamily)
{
	localStorage['fontFamily'] = fontFamily.options[fontFamily.selectedIndex].value;
}

function setMenuMaxWidthMesure(maxWidthMesure)
{
	localStorage['maxWidthMesure'] = maxWidthMesure.options[maxWidthMesure.selectedIndex].value;
}

function setBookmarkHidden(title, useGoogleBookmarks, hidden)
{
	var key = (useGoogleBookmarks ? 'g_' : '') + 'bookmark_' + title;
	if(hidden == true)
	{
		localStorage[key] = true;
	}
	else
	{
		delete localStorage[key];
	}
}

function setColor(el)
{
	if(/^[0-9A-F]{6}$/i.test(el.value))
	{
		localStorage[el.id] = el.value;
	}
}

function showHideElem(id)
{
	var elemStyle = $(id).style;
	elemStyle.display = elemStyle.display == 'none' ? 'inline' : 'none';
}

function setUseGoogleBookmarks(useGoogleBookmarks)
{
	localStorage['useGoogleBookmarks'] = useGoogleBookmarks;
	var bookmarksShowHide = $('bookmarksShowHide');
	bookmarksShowHide.querySelector('.googleBookmarksSettings').style.display = useGoogleBookmarks ? 'block' : 'none';
	bookmarksShowHide.querySelector('.chromeBookmarksSettings').style.display = useGoogleBookmarks ? 'none' : 'block';
	chrome.extension.getBackgroundPage().setUseGoogleBookmarks(useGoogleBookmarks, true);
}

chrome.extension.onRequest.addListener(function(request)
{
	if(request == 'GoogleBookmarksIsReady')
	{
		var GBookmarksTree = chrome.extension.getBackgroundPage().GBookmarksTree;
		var googleBookmarksSettings = $('bookmarksShowHide').querySelector('.googleBookmarksSettings');
		googleBookmarksSettings.querySelectorAll('.gbookmark').forEach(function(node)
		{
			node.parentElement.removeChild(node);
		});
		var children = GBookmarksTree.children;
		for(var i = 0, len = children.length; i < len; i++)
		{
			var child = children[i];
			var div = document.createElement('div');
			div.setAttribute('class', 'gbookmark');

			var checkbox = document.createElement('input');
			checkbox.setAttribute('type', 'checkbox');
			if(!isBookmarkHidden(child.title, true))
			{
				checkbox.setAttribute('checked', 'checked');
			}
			checkbox.setAttribute('onchange', 'setBookmarkHidden("' + child.title + '", true, !this.checked)');

			var label = document.createElement('label');
			label.appendChild(checkbox);

			var img = document.createElement('img');
			img.setAttribute('class', 'favicon');
			img.setAttribute('src', getFavicon(child.url));
			label.appendChild(img);
			label.appendChild(document.createTextNode(child.title));

			div.appendChild(label);

			googleBookmarksSettings.appendChild(div);
		}
	}
});

function setFolderSeparator(folderSeparator)
{
	var newFolderSeparator = folderSeparator.value;
	if(newFolderSeparator == '')
	{
		folderSeparator.setAttribute('class', 'error');
	}
	else
	{
		folderSeparator.removeAttribute('class');
		if(newFolderSeparator != getFolderSeparator())
		{
			localStorage['folderSeparator'] = newFolderSeparator;
			chrome.extension.getBackgroundPage().loadGBookmakrs();
		}
	}
}

function showTab(span)
{
	var currentTab = span.parentNode;
	var tabs = currentTab.parentNode.getElementsByTagName('li');
	for(var idx = tabs.length - 1; idx >= 0; idx--)
	{
		if(tabs[idx].getAttribute('class') == 'fgTab')
		{
			tabs[idx].setAttribute('class', 'bgTab');
			$(tabs[idx].getAttribute('for')).style.display = 'none';
			break;
		}
	}
	currentTab.setAttribute('class', 'fgTab');
	$(currentTab.getAttribute('for')).style.display = 'block';
}

function resetWindowSettings()
{
	with(localStorage)
	{
		removeItem('winMaxWidth');
		removeItem('winMaxHeight');
		removeItem('fontFamily');
		removeItem('fontSize');
		removeItem('favIconWidth');
		removeItem('maxWidth');
		removeItem('maxWidthMesure');
		removeItem('scrollBarWidth');
		removeItem('showTooltip');
	}
	document.querySelectorAll('input.color').forEach(function(node)
	{
		localStorage.removeItem(node.id);
	});
	initWindowSettingsTab();
}

HTMLSelectElement.prototype.selectByValue = function(value)
{
	this.selectedIndex = document.evaluate('count(option[@value="' + value + '"]/preceding-sibling::option)',
			this, null, XPathResult.NUMBER_TYPE, null).numberValue;
}

function initWindowSettingsTab()
{
	$('winMaxWidth').value = getWindowMaxWidth();
	$('winMaxHeight').value = getWindowMaxHeight();
	$('fontFamily').selectByValue(getFontFamily());
	$('fontSize').value = getFontSize();
	$('favIconWidth').value = getFavIconWidth();
	$('maxWidth').value = getMaxWidth();
	$('maxWidthMesure').selectByValue(getMaxWidthMesure());
	$('scrollBarWidth').value = getScrollBarWidth();
	$('showTooltip').checked = isShowTooltip();
	document.querySelectorAll('input.color').forEach(function(node)
	{
		node.color.fromString(getColor(node.id));
	});
}

document.addEventListener("DOMContentLoaded", function()
{
	chrome.i18n.initElements();
	for(var idx = 0; idx < 3; idx++)
	{
		$('btn' + idx).selectedIndex = getButtonAction(idx);
	}

	if(isSwitchToNewTab())
	{
		$('switchToNewTab').checked = true;
	}

	var useGoogleBookmarks = isUseGoogleBookmarks();
	$(useGoogleBookmarks ? 'useGoogleBookmarks' : 'useChromeBookmarks').checked = true;
	setUseGoogleBookmarks(useGoogleBookmarks);
	$('folderSeparator').value = getFolderSeparator();
	chrome.bookmarks.getTree(function(nodes)
	{
		var chromeBookmarksSettings = $('bookmarksShowHide').querySelector('.chromeBookmarksSettings');
		for(var i = 0, nodesLength = nodes.length; i < nodesLength; i++)
		{
			var children = nodes[i].children;
			for(var j = 0, childrenLength = children.length; j < childrenLength; j++)
			{
				var children2 = children[j].children;
				for(var k = 0, children2Length = children2.length; k < children2Length; k++)
				{
					var child = children2[k];
					var div = document.createElement('div');
					div.setAttribute('class', 'bookmark');

					var checkbox = document.createElement('input');
					checkbox.setAttribute('type', 'checkbox');
					if(!isBookmarkHidden(child.title))
					{
						checkbox.setAttribute('checked', 'checked');
					}
					checkbox.setAttribute('onchange', 'setBookmarkHidden("' + child.title + '", false, !this.checked)');

					var label = document.createElement('label');
					label.appendChild(checkbox);

					var img = document.createElement('img');
					img.setAttribute('class', 'favicon');
					img.setAttribute('src', getFavicon(child.url));
					label.appendChild(img);
					label.appendChild(document.createTextNode(child.title));

					div.appendChild(label);

					chromeBookmarksSettings.appendChild(div);
				}
			}
		}
	});

	jscolor.init();
	initWindowSettingsTab();
}, false);

// vim:noet
