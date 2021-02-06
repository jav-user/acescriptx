// ==UserScript==
// @name Hla
// @namespace Hla Scripts
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery-toast-plugin/1.3.2/jquery.toast.min.js
// @require https://jav-user.github.io/acescript/common/nes-1.0.2.js
// @match https://hentaila.com/*
// @grant none
// ==/UserScript==

$(document).ready(function () {
	setTimeout(() => {
		renderTitle();
		renderArticles();
	}, 1000);

	$("body").append(
		`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-toast-plugin/1.3.2/jquery.toast.min.css" integrity="sha512-wJgJNTBBkLit7ymC6vvzM1EcSWeM9mmOu+1USHaRBbHkm6W9EgM0HY27+UtUaprntaYQJF75rc8gjxllKs5OIQ==" crossorigin="anonymous" />`
	);
});

function toast_(text) {
	$.toast({
		text: text,
		icon: "success",
		position: "bottom-right",
	});
}

function renderTitle() {
	$("h1").after(function () {
		var title = "[H] " + $(this).text() + ` (${window.location.hostname})`;

		return $(`<a href="javascript:;">copy-title</a>`).on(
			"click",
			function () {
				new nstring(title).copy();
				toast_(title + " copied!!");
			}
		);
	});
}

async function renderArticles() {
	var $articles = Array.from($(".episodes-list article"));

	for (var article of $articles) {
		var url = $(article).find("a").prop("href");

		await $.get(url).then((html) => renderLinks(article, html));
	}
}
function renderLinks(article, html) {
	var html_ = "";
	var links = Array.from($(html).find(".download-links a"))
		.map((link) => $(link).prop("href"))
		.sort();

	links.forEach((link) => {
		var url = new URL(link);
		var host = url.hostname
			.split(".")
			.reverse()
			.slice(0, 2)
			.reverse()
			.join(".");

		console.log(host);
		//console.log(link);
		html_ += `
		[<a style="color: #EA4C89"
			class="nlink"
			host="${host}"
			target="_blank" 
			href="${url.href}">${host}</a>] |
		<a href="javascript:;" 
			class="ncopy"
			url="${url.href}">copy</a> |
		<a style="color: #EA4C89" 
			href="javascript:;"  
			class="ncopy-all" 
			host="${host}">copy-all</a><br/>`;
	});
	var $html = $("<small>" + html_ + "</hr></small>");
	$html.find(".ncopy").on("click", function () {
		var href = $(this).attr("url");
		new nstring(href).copy();
		toast_(href + " copied!!");
	});

	$html.find(".ncopy-all").on("click", function () {
		var host = $(this).attr("host");
		var links = Array.from($(`[host="${host}"][class="nlink"]`)).map(
			(a) => a.href
		);
		new nstring(links.join("\n")).copy();
		toast_(links.length + ` links copied!! (${host})`);
		// new nstring(url.href).copy()
		// alert(url.href +" copied!!" )
	});

	$(article).after($html);
	// console.log(html_);
}
