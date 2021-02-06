// ==UserScript==
// @name H2RMangas
// @namespace H2RMangas Scripts
// @match https://hentai2read.com/hentai-list/*
// @require https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.js
// @require https://nesmdev.github.io/ndev/ndev.1.0.1.js
// @grant none
// ==/UserScript==

setTimeout(() => {
	$(".nav.nav-pills.nav-sm.push-5-t")
		.append(
			`<li><input type="checkbox" id="nselect-all" /> Select All</li>`
		)
		.find("#nselect-all")
		.on("change", function () {
			var checked = $(this).prop("checked");
			console.log("checked", checked);
			$(".nselect")
				.prop("checked", $(this).prop("checked"))
				.trigger("change");
		});

	$(".book-grid-item").each((i, item) => {
		console.log(item);
		if ($(item).hasClass("blacklisted")) {
			return;
		}
		var $select = $(`<input type="checkbox" class="nselect"/>`);
		$(item).parent().before($select);
		$select.on("change", function () {
			var checked = $(this).prop("checked");
			$(item).toggleClass("nselected", checked);
			$(item)
				.find(".overlay-button a")
				.each((i, a) => {
					var href = $(a).prop("href");
					var url = new nurl(href);
					url.toggleHash("#ndownload", checked);
					$(a).attr("target", "_blank").prop("href", url.toString());
					var allSelected = $(".nselect:not(:checked)").length == 0;
					$("#nselect-all").prop("checked", allSelected);
				})
				.last()
				.addClass("ndownload");
		});
	});
}, 2 * 1000);

$("body").append(`
	<style>
		.bookmarked .title-text {
			color: #9ad6ee;
			font-style: italic;
		}

		.nselected {
	 		border: 5px dotted #9ad6ee;
		}
	</style>
`);
