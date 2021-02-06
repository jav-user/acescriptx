// ==UserScript==
// @name Heyzo
// @namespace Heyzo Scripts
// @match https://en.heyzo.com/*
// @grant none
// ==/UserScript==

function pimpThumbnails() {
	return $(
		[".movie:not(.nmovie)", "#actor_other_movie > div:not(.nmovie)"].join(
			", "
		)
	).each((i, m) => {
		var movie = $(m).find("a").attr("target", "_blank").prop("href");
		var code = movie.match(/[0-9]{4}/)[0];
		var $release = $(m).find(".release");
		$release.html(
			`<a 
				href="${movie}" 
				target="_blank">${$release.text().replace("Release:", "["+code+"]")}
			</a>`
		);
		$(m).addClass("nmovie");
	});
}

$(document).ready(function () {
	var $thumbs = pimpThumbnails();
	console.log($thumbs.length + " pimped...");
	setInterval(() => {
		var $thumbs = pimpThumbnails();
		console.log($thumbs.length + " pimped...");
	}, 10 * 1000);
});
