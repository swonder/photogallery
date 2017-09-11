/*****************************************************************
* Shawn Wonder                                                   *
* 02/08/2016                                                     *
* Implementation of a basic photo gallery (JSON VERSION)         *
******************************************************************/

"use strict"

jQuery(function($) {
  var picinfo = $.map(piclist, function(el) { return el })
	var catid = 1;          //Set category equal to the first array of pictures
	var thmbid = 1;         //Set thumbnail equal to the first thumb in array
	var prevthumb = 0;
	var picInterval;
	var active;
	var next;
	var slideshowActive = true;
	var numImages = 0;

	//Create the select box and category description box and add to page
	var $sel = $('<select>').attr('id', 'category').appendTo('#categorybox');
	$.each(picinfo, function(key, category) {
		//Create the select box and add the categories
		$sel.append($("<option>").attr('value',category['index']).text(category['title']));
	});
	$('<div>').attr('id', 'catdescr').appendTo('#categorybox').css('float', 'right');

	loadCategory();
	loadControls();

	//Change the category when it is selected in the dropdown
	$('#category').change(function() {
		catid = $(this).children(':selected').attr('value');
		loadCategory();
	});

	function loadCategory() {
		numImages = 0;
		thmbid = 1;
		prevthumb = 0;

		if(slideshowActive) { setSlideshow(false); }
		var category = picinfo[catid-1];

		//Clear any existing images
		$('#sliderbox').html('');
		$('#imagebox').html('');

		$('#sliderbox')
			.append($('<div>')
				.append($('<ul>')
				.attr('id', 'imglist')
				.css({'overflow': 'hidden', 'list-style': 'none', 'margin': '0', 'padding': '10px 0 10px 0'})
		));

		//Loop over the array in the piclist.js
		$.each(category, function(category_key, category_value) {
      switch(category_key) {
        case 'description':
          $('#catdescr').html('');
          $('#catdescr').html(category_value).hide().fadeIn('slow');
          break;
        case 'images':
          $.each(category_value, function(image_key, image_info) {
            //console.log(value2);
    			  var thumbnail = baseurl + image_info['thumbnail'];
            var fullsize = baseurl + image_info['fullsize'];

            //Load all the thumbs into the sliderbox
    		    $('#imglist')
    				.append($('<li>')
    				.css({'float': 'left', 'margin': '0'})
    				.append($('<a>')
    				.append($('<img/>')
    				//The number and the id have been revesed below
    				//so the string will be easy to parse into a number
    				.attr('id', (numImages) + 'thmbimg')
    				.attr('src', thumbnail)
    				.attr('title', image_info['title'])
    				.addClass('thumbnail'))));

    		    //Load the fullsize images on top of each other
    		    $('#imagebox')
    				.append($('<img/>')
    				.attr('src', fullsize)
    				.attr('id', (numImages) + 'fsimg')
    				.addClass('mediumimg'));
            numImages++;
          });
        }
      });

		//Set the first image to active
		$('0fsimg').addClass('active');
		$('#' + prevthumb + 'thmbimg').addClass('opacity75');
		setClick();
		//Set a small time out so the first image has enough time to load into the DOM
		//this time out lets the loadInfo() grab the correct height on the image
		setTimeout(function(){
			loadImage('0fsimg');
		}, 250);
		if(slideshowActive) { setSlideshow(true); }
	}

	//Handle all the button events
	$('body').on('click', '.button', function() {
		switch($(this).attr('id')) {
			case 'play':
				slideshowActive = true;
				$('#playbox').addClass('buttonselected');
				$('#stopbox').removeClass('buttonselected');
				setSlideshow(true);
				break;
			case 'stop':
				slideshowActive = false;
				$('#stopbox').addClass('buttonselected');
				$('#playbox').removeClass('buttonselected');
				setSlideshow(false);
				break;
		}
	});

	function setClick() {
		//When the user clicks an image, load the image into the main category
		$('.thumbnail').unbind().click(function() {
			if(slideshowActive) { setSlideshow(false); }
			$('#' + prevthumb + 'thmbimg').removeClass('opacity75').addClass('opacity100');
		 	var tid = parseInt($(this).attr('id'));
			prevthumb = tid;
			$('#' + tid + 'thmbimg').addClass('opacity75');
			loadImage(tid + 'fsimg');
			if(slideshowActive) {	setSlideshow(true);	}
		});
	}

	function loadInfo(id) {
		var title;
		var description;
    if(thmbid+1 <= numImages) {
			title = piclist['category'+catid]['images']['image'+(thmbid+1)]['title'];
			description = piclist['category'+catid]['images']['image'+(thmbid+1)]['description'];
		} else {
			title = piclist['category'+catid]['images']['image1']['title'];
			description = piclist['category'+catid]['images']['image1']['description'];
		}

		//Set the height of the parent container to the image height so the info box is in the right position
		var imgHeight = $('#' + id + 'fsimg').height();
		$('#imagebox').css('height', imgHeight)

		$('#infobox').remove('#infobox');
		$('#imagebox').append($('<div>')
		.attr('id', 'infobox')
		.html(title + " - " + description)
		);
	}

	function loadControls() {
		//Play
		$('#controlsbox').append($('<div>')
		.attr('id', 'playbox')
		.attr('class', 'left')
		);
		$('#playbox').append($('<img>')
		.attr('id', 'play')
		.attr('src', 'images/playfilled.png')
		.attr('class', 'button control')
		.attr('title', 'Start the gallery')
		);
		//Stop
		$('#controlsbox').append($('<div>')
		.attr('id', 'stopbox')
		.attr('class', 'left')
		);
		$('#stopbox').append($('<img>')
		.attr('id', 'stop')
		.attr('src', 'images/pausefilled.png')
		.attr('class', 'button control')
		.attr('title', 'Stop the gallery')
		);
		$('#playbox').addClass('buttonselected');
	}

	function slideSwitch() {
		//Get the active image
		active = $('#imagebox img.active');
		//If the active image doesn't exist - set the last image active
		if (active.length == 0) {
			active = $('#imagebox img:first');
		}

		//Set the next image equal to the next image or the first image
		next =  active.next('img').length ? active.next('img') : $('#imagebox img:first');
		next.css('opacity', '0.0')
		.addClass('active')
		.animate({opacity: 1.0}, 1000, function() {
			active.removeClass('active last-active');
		});
		$('#' + prevthumb + 'thmbimg').removeClass('opacity75').addClass('opacity100');
		thmbid = parseInt(next.attr('id'));
		$('#' + thmbid + 'thmbimg').addClass('opacity75');
		prevthumb = thmbid;
		loadInfo(thmbid);
	}

	function loadImage(image) {
		active = $('#imagebox img.active');
		//Set active class to the last active class
		active.removeClass('active last-active');
		active = $('#' + image);
		active.addClass('active');
		thmbid = parseInt(active.attr('id'));
		loadInfo(thmbid);
	}

	function setSlideshow(state) {
		state ?	picInterval = setInterval(slideSwitch, 6000) : clearInterval(picInterval);
	}
});
