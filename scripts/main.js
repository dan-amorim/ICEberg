//Globais: N/A
(function (viz) {
	'use strict';
	viz.selection = {
		icevar : "",
		intvar : ""
	};
	viz.init = function() {
		'use strict';
		var varlist = Object.keys(data.xvalues).sort();		
		viz.updateData(data,varlist[0],varlist[0]);
		viz.initUI(varlist,varlist);
		$("#interaction-list").controlgroup({
			direction : "vertical"
		});
		viz.histogram.build();
		viz.interaction.build();
		viz.ice.build();		
	};
	viz.onVarlistChange = function() {
		viz.selection.icevar = $('input[name=variable]:checked', '#variable-list').val();
		viz.selection.intvar = $('input[name=interaction]:checked', '#interaction-list').val();
		viz.updateData(data,viz.selection.icevar,viz.selection.intvar);
		viz.histogram.resetBrush();
		viz.histogram.update();
		viz.ice.update();
		viz.interaction.update();
	};
	viz.onInteractionChange = function() {
		viz.selection.icevar = $('input[name=variable]:checked', '#variable-list').val();
		viz.selection.intvar = $('input[name=interaction]:checked', '#interaction-list').val();
		viz.updateData(data,viz.selection.icevar,viz.selection.intvar);
		viz.ice.update(false);
		viz.interaction.update();
	};	
	viz.initUI = function(varlist,intlist) {
		varlist.forEach(function(item,i) {
			$("<input>")
				.attr("type","radio")
				.attr("value",item)
				.attr("name","variable")
				.attr("id","var_" + item)
				.prop("checked", item == varlist[0])
				.appendTo($("#variable-list"));
			$("<label>" + item + "</item>")
				.attr("for","var_" + item)
				.appendTo($("#variable-list"));
			$("input").checkboxradio({
				icon: false
			});		
			$("#variable-list").controlgroup({
				direction : "vertical"
			});			
		});
		$("#variable-list input").on("change",viz.onVarlistChange)
		intlist.forEach(function(item,i) {
			$("<input>")
				.attr("type","radio")
				.attr("value",item)
				.attr("name","interaction")
				.prop("checked", item == intlist[0])
				.attr("id","int_" + item)
				.appendTo($("#interaction-list"));
			$("<label>" + item + "</item>")
				.attr("for","int_" + item)
				.appendTo($("#interaction-list"));
			$("input").checkboxradio({
				icon: false
			});		
			$("#variable-list").controlgroup({
				direction : "vertical"
			});			
		});		
		$("#interaction-list input").on("change",viz.onInteractionChange)
	}
	//Biblioteca de cores
	viz.colors = {
		gradient : [
			"hsl(359,91.1%,69.2%)", 
			"hsl(50,100%,75.9%)", 
			"hsl(136,41.2%,56.7%)"
		],
		gray : "rgb(77,77,77)"
	}
	//Atualizando dados
	viz.updateData = function(data,vname,iname) {
		viz.ice.data = data.series.map(function(d) {
			return {
				interaction : d.original[iname],
				values : d.ice[vname].map(function(e,i) {
					return {
						x: data.xvalues[vname][i],
						y: e
					}
				})
			};
		});
		viz.interaction.data = viz.ice.data.map(function(d) { return d.interaction});
		viz.histogram.data = data.series.map(function(d) {
			return d.original[vname];
		});	
	
	}
}(window.viz = window.viz || {}));

/*
var data = {
	xvalues : {
		"X1" : [0.2, 0.4, 0.6, 0.8, 1.0],
		"X2" : [-3, -1.5, -0, 1.5, 3]
	},
	series : []
};
*/

$(function(){	
	'use strict';
	viz.init();
});
