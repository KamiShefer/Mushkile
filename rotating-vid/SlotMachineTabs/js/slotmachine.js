var columnReadyCounter = 0;

// This is the callback function for the "hiding" animations
// it gets called for each animation (since we don't know which is slowest)
// the third time it's called, then it resets the column positions
function ifReadyThenReset() {
	
	columnReadyCounter++;
	
	if (columnReadyCounter == 3) {
		$(".col").not(".current .col").css("top", 350);
		columnReadyCounter = 0;
	}

};

// When the DOM is ready
$(function() {	
	// first tab and first content box are default current
	$(".tabs li:first-child a, .content-box:first").addClass("current");
	$(".box-wrapper .current .col").css("top", 0);
	
	$("#slot-machine-tabs").delegate(".tabs a", "click", function() {
		
		$el = $(this);
		console.log($el);
		rollImgs($el);

	});

});

function rollImgs($el) {
	console.log($el);
	var $allContentBoxes = $(".content-box"),
	$el, $colOne
	hrefSelector = "",
	speedOne = 300;

	if ( (!$el.hasClass("current")) && ($(":animated").length == 0 ) ) {
		
		// current tab correctly set
		$allTabs.removeClass("current");
		$el.addClass("current");
			
		// each column is animated upwards to hide
		// kind of annoyingly redudundant code
		$colOne = $(".box-wrapper .current .col-one");
		$colOne.animate({
			"top": -$colOne.height()
		}, speedOne);
		
		// new content box is marked as current
		$allContentBoxes.removeClass("current");		
		hrefSelector = $el.attr("class");
		$(hrefSelector).addClass("current");
	
		// columns from new content area are moved up from the bottom
		// also annoying redundant and triple callback seems weird
		// $(".box-wrapper .current .col-one").animate({
		// 	"top": 0
		// }, speedOne, function() {
		// 	ifReadyThenReset();
		// });
	};
}

$allTabs = $(".content-box")
let id = 0;
console.log($allTabs);
setInterval(
 	() => {
		//$allTabs.each(function(index, element) {rollImgs($(element))});
		rollImgs($($allTabs[id%10]));
		id++;
 	}, 50
 )
