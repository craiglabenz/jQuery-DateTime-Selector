(function($){
	$.fn.splitDateTime = function(customOptions) {
		// Merge our customOptions onto the defaultOptions
		var options = $.extend({}, $.fn.splitDateTime.defaultOptions, customOptions);
		
		var d = new Date();
		var year = d.getFullYear();
		
		// And now, make it do.
		return this.each(function(){
			var that = $(this);
			that.name = that.attr('name');
			that.wrap('<div class="split-datetime '+ options.wrapperClass +'"></div>').hide();
			that.wrapper = that.parent();
			
			that.originalValue = that.val();
			that.originalValue = (that.originalValue !== '') ? that.originalValue : options.defaultValue;

			// parse out the string into awesome data
			var tmp = that.originalValue.split(' ');
			var originalDate = tmp[0].split('-'); // YYYY-MM-DD
			var originalTime = tmp[1].split(':'); // HH:MM:SS
			
			// get original date values
			that.originalYear = that.selectedYear = originalDate[0];
			that.originalMonth = that.selectedMonth = originalDate[1] - 1;
			that.originalDay = that.selectedDay = originalDate[2];

			// get original time values
			that.originalHour = that.selectedHour = originalTime[0];
			that.originalMinute = that.selectedMinute = originalTime[1];
			that.originalSecond = that.selectedSecond = originalTime[2];
			
			// build the HTML
			that.wrapper.append('<div class="select-wrapper" style="float:left;"></div>');
			that.innerDiv = that.wrapper.find('div');
			that.innerDiv.append($.fn.splitDateTime.buildMonthSelect(that.selectedMonth, that.name));
			that.innerDiv.append('&nbsp;');
			that.innerDiv.append($.fn.splitDateTime.buildDaySelect(that.selectedDay, that.selectedMonth, that.selectedYear, that.name));
			that.innerDiv.append('&nbsp;');
			that.innerDiv.append($.fn.splitDateTime.buildYearSelect(that.selectedYear, year - 1, year + 5, that.name));
			that.innerDiv.append('<br />');
			that.innerDiv.append($.fn.splitDateTime.buildHourSelect(that.selectedHour, that.name));
			that.innerDiv.append("&nbsp;:&nbsp;");
			that.innerDiv.append($.fn.splitDateTime.buildMinuteSelect(that.selectedMinute, options.minuteIncrement, that.name));
			if (options.useSeconds) {
				that.innerDiv.append("&nbsp;:&nbsp;");
				that.innerDiv.append($.fn.splitDateTime.buildSecondSelect(that.selectedSecond, options.secondIncrement, that.name));
			}
			that.innerDiv.append('&nbsp;');
			that.innerDiv.append($.fn.splitDateTime.buildAMPM(that.selectedHour, that.name));
			
			// add select:change events
			that.innerDiv.find('select').change(function(){
				$.fn.splitDateTime.updateTime($(this).closest('div.select-wrapper'), that.name, options);
			});
			
			// when month or year is changed, update the days
			that.innerDiv.find('select[name='+ that.name +'_month], select[name='+ that.name +'_year]').change(function(){
				$.fn.splitDateTime.updateDays($(this).closest('div.select-wrapper'), that.name);
			});
			
			// if this input had nothing in it, set that value to the default. this makes a form saveable without requiring any changes.
			if (that.attr('value') === '') { that.attr('value', options.defaultValue); }
		});
	};
	
	var year = new Date();
	year = year.getFullYear();
	$.fn.splitDateTime.defaultOptions = {
		useSeconds : false,
		minuteIncrement : 5,
		secondIncrement : 5,
		wrapperClass : '',
		defaultValue : year +'-01-01 00:00:00',
		updateTimeCallback : function(){ console.log('marco'); }
	};
	
	$.fn.splitDateTime.updateTime = function(selectWrapper, name, options) {
		var timeInput = selectWrapper.siblings('input[name='+ name +']');
		var ampm = selectWrapper.find('select[name='+ name +'_ampm]').val();
		var hour = parseInt(selectWrapper.find('select[name='+ name +'_hour]').val(), 10);

		if (ampm === 'pm') {
			if (hour < 12) { // if 1pm or later, make it 13 hundred hours, or later. if noon, leave as noon.
				hour += 12;
			}
		} else if (ampm === 'am') {
			if (hour === 12) { // if 12am, make 0 hundred hours
				hour = '12';
			}
		}
		
		var newTimeValue = selectWrapper.find('select[name='+ name +'_year]').val() + '-' + (parseInt(selectWrapper.find('select[name='+ name +'_month]').val(), 10) + 1) + '-' + selectWrapper.find('select[name='+ name +'_day]').val() + ' ' + hour + ':' + selectWrapper.find('select[name='+ name +'_minute]').val();
		if (options.useSeconds) {
			newTimeValue += ":" + selectWrapper.find('select[name='+ name +'_second]').val();
		} else {
			newTimeValue += ":00";
		}
		timeInput.attr('value', newTimeValue);
		options.updateTimeCallback(selectWrapper, name);
	};
	
	$.fn.splitDateTime.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	$.fn.splitDateTime.buildMonthSelect = function(selectedMonth, name) {
		var html = '<select name="'+ name +'_month"><option value=""> --- </option>';
		var counter = 0;
		$.each($.fn.splitDateTime.months, function(key, value) {
			var selected = (counter === selectedMonth) ? "selected='selected'" : '';
			html += "<option "+ selected +" value='"+ counter +"'>"+ value +"</option>";
			counter++;
		});
		html += "</select>";
		return html;
	};
	
	$.fn.splitDateTime.getMaxDays = function(month, year) {
		month = parseInt(month, 10);
		year = parseInt(year, 10);
		var maxDays = 30;
		if (month === 0 || month === 2 || month === 4 || month === 6 || month === 7 || month === 9 || month === 11) {
			maxDays = 31;
		} else if (month === 1) { // February
			if (year % 4 === 0) {
				maxDays = 29;
			} else {
				maxDays = 28;
			}
		}
		return maxDays;
	};
	
	$.fn.splitDateTime.buildDaySelect = function(selectedDay, month, year, name) {
		maxDays = $.fn.splitDateTime.getMaxDays(month, year);
		var html = "<select name='"+ name +"_day'><option value=''> --- </option>";
		for (var i = 1; i <= maxDays; i++) {
			var selected = (parseInt(i, 10) === parseInt(selectedDay, 10)) ? "selected='selected'" : '';
			html += "<option "+ selected +" value='"+ i +"'>"+ i +"</option>";
		}
		html += "</select>";
		return html;
	};
	
	$.fn.splitDateTime.updateDays = function(selectWrapper, name) {
		var selectedDay = selectWrapper.find('select[name='+ name +'_day]').val();
		var selectedMonth = selectWrapper.find('select[name='+ name +'_month]').val();
		var selectedYear = selectWrapper.find('select[name='+ name +'_year]').val();
		var newDays = $.fn.splitDateTime.buildDaySelect(selectedDay, selectedMonth, selectedYear, name);
		$('select[name='+ name +'_day]').replaceWith(newDays);
	};
	
	$.fn.splitDateTime.buildYearSelect = function(selectedYear, minYear, maxYear, name) {
		var html = "<select name='"+ name +"_year'><option value=''> --- </option>";
		for (var i = minYear; i <= maxYear; i++) {
			var selected = (parseInt(i, 10) === parseInt(selectedYear, 10)) ? "selected='selected'" : '';
			html += "<option "+ selected +" value='"+ i +"'>"+ i +"</option>";
		}
		html += "</select>";
		return html;
	};
	
	$.fn.splitDateTime.buildHourSelect = function(selectedHour, name) {
		selectedHour = (selectedHour > 12) ? selectedHour - 12 : selectedHour;
		var hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
		
		var html = "<select name='"+ name +"_hour'><option value=''> --- </option>";
		$.each(hours, function(key, value){
			var selected = (parseInt(value, 10) === parseInt(selectedHour, 10)) ? "selected='selected'" : '';
			// account for a midnight-hour selection
			selected = (selected === '' && (parseInt(value, 10) === 12 && parseInt(selectedHour, 10) === 0)) ? "selected='selected'" : selected;
			html += "<option "+ selected +" value='"+ padLeadingZero(value) +"'>"+ padLeadingZero(value) +"</option>";
		});
		html += "</select>";
		return html;
	};
	
	$.fn.splitDateTime.buildMinuteSelect = function(selectedMinute, minuteIncrement, name) {
		// if minuteIncrement is 5, but selectedMinute = 37, subract 2 from selectedMinute. T. I. T. S.
		selectedMinute = ((selectedMinute % minuteIncrement) !== 0) ? selectedMinute - (selectedMinute % minuteIncrement) : selectedMinute;
		
		minutes = [];
		for (var i = 0; i <= 59; i++) {
			if (i % parseInt(minuteIncrement, 10) === 0) {
				minutes.push(i);
			}
		}
		
		var html = "<select name='"+ name +"_minute'><option value=''> --- </option>";
		$.each(minutes, function(key, value){
			var selected = (parseInt(value, 10) === parseInt(selectedMinute, 10)) ? "selected='selected'" : '';
			html += "<option "+ selected +" value='"+ padLeadingZero(value) +"'>"+ padLeadingZero(value) +"</option>";
		});
		html += "</select>";
		return html;
	};
	
	$.fn.splitDateTime.buildAMPM = function(hour, name){
		var ampm = ['am', 'pm'];
		var am_or_pm = (hour > 11) ? 'pm' : 'am';
		var html = "<select name='"+ name +"_ampm'><option value=''> --- </option>'";
		$.each(ampm, function(key, value){
			var selected = (am_or_pm === value) ? "selected='selected'" : '';
			html += "<option "+ selected +" value='"+ value +"'>"+ value +"</option>";
		});
		html += "</select>";
		return html;
	};
	
	$.fn.splitDateTime.buildSecondSelect = function(selectedSecond, secondIncrement, name) {
		selectedSecond = ((selectedSecond % secondIncrement) !== 0) ? selectedSecond - (selectedSecond % secondIncrement) : selectedSecond;
		seconds = [];
		for (var i = 0; i <= 59; i++) {
			if (i % parseInt(secondIncrement, 10) === 0) {
				seconds.push(i);
			}
		}
		
		var html = "<select name='"+ name +"_second'><option value=''> --- </option>";
		$.each(seconds, function(key, value){
			var selected = (parseInt(value, 10) === parseInt(selectedSecond, 10)) ? "selected='selected'" : '';
			html += "<option "+ selected +" value='"+ padLeadingZero(value) +"'>"+ padLeadingZero(value) + "</option>";
		});
		html += "</select>";
		return html;
	};
	
})(jQuery);

function padLeadingZero(str_orig) {
	str = str_orig + "";
	return (str.length === 1) ? '0' + str : str;
}
