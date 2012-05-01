# jQuery DateTime Selector

## Overview
Given a standard text input of form:  

	<input type="text" value="YYYY-MM-DD HH:MM:SS" />
	
the selector plugin replaces said input with dropdowns to control each datetime component. Quietly manages the original hidden input underneath so your forms will still submit normally.

This is, obviously, most useful when collecting datetime values from users who are prone to giving you invalid formats.

## QuickStart
`example.html` has a complete working example with two non-colliding inputs. However, an example call would be like so:  

	<input name="datetime" type="text" value="2014-04-04 12:05:00" />
	
	<script src="jquery.js"></script>
	<script src="split-datetime.jquery.js"></script>
	
	<script>
	var exampleValues = {
		useSeconds : true,
		minuteIncrement : 5,
		secondIncrement : 5,
		wrapperClass : 'marco polo',
		updateTimeCallback : function(selectWrapper, name){ console.log(arguments); }
		};
	$('input').splitDateTime(exampleValues);
	</script>

## Parameters
`useSeconds` : Determines if a seconds dropdown is created, or a value of 00 is always used. Defaults to false.  
`minuteIncrement` : Having a minute dropdown of all 60 minutes can be cumbersome if that granularity of accuracy is not even necessary. Thus, trim your available options by providing an increment. An irregular values in the initialized (say, 42 minutes with an increment of 10), will be rounded down. Defaults to 5.  
`secondIncrement` : Same as above.  
`wrapperClass` : For syling purposes, this string will be appended to the class attribute of the datetime selector. Defaults to ''.  
`defaultTime` : A filler value for empty inputs. Defaults to midnight of January 1st of the current year.   
`updateTimeCallback` : Callback hook for immediately after your hidden input's value attribute has been updated. This function will be passed the wrapping div (not yet cast with jQuery), and the name attribute of this the associated input.

## Other Niceties
1. Shows correct number of days per month.
2. Accounts for leap years.
3. Updates day dropdown on month or year change. Day values made invalid by such a change are reset, highlighting the error.