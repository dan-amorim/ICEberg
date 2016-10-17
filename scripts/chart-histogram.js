//Globais: N/A
(function (viz) {
	'use strict';
	viz.histogram = {
		data : {},
		x : {},
		y : {},
		svg : {},
		brush : {},
		build : function() {
			//Dimensões do gráfico
			var margin = {top: 10, right: 30, bottom: 30, left: 30};
			var bound = d3.select("#histogram-chart").node().getBoundingClientRect();
			var width = bound.width - margin.left - margin.right;
			var height = bound.height - margin.top - margin.bottom;		
			//Valores máximos e mínimos de x
			var max_x = d3.max(viz.ice.data,function(d) {
				return d3.max(d.values,function(d) {
					return d.x
				});
			});
			var min_x = d3.min(viz.ice.data,function(d) {
				return d3.min(d.values,function(d) {
					return d.x
				});
			});	
			//Construindo escala X
			viz.histogram.x = d3.scaleLinear()
				.rangeRound([0,width])
				.domain([min_x,max_x]);
			var bins = d3.histogram()
				.domain(viz.histogram.x.domain())
				.thresholds(viz.histogram.x.ticks(40))
				(viz.histogram.data);
			//Construindo escala Y
			viz.histogram.y = d3.scaleLinear()
				.domain([0, d3.max(bins,function(d) {return d.length})])
				.range([height, 0]);
			//Criando o SVG do gráfico
			viz.histogram.svg = d3.select("#histogram-chart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");		
			//Criando as barras
			var bars = viz.histogram.svg.selectAll(".bar-histogram")
				.data(bins)
				.enter()
				.append("rect")
				.attr("class","bar-histogram")
				.attr("x", function(d) { return viz.histogram.x(d.x0); })
				.attr("y", function(d) { return viz.histogram.y(d.length); })
				.attr("width", viz.histogram.x(bins[0].x1) - viz.histogram.x(bins[0].x0) - 1)
				.attr("height", function(d) { return height - viz.histogram.y(d.length); });	
			//Criando o eixo X
			viz.histogram.svg.append("g")
				.attr("class", "hist-axis-x")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(viz.histogram.x));
			//Criando o Brush
			viz.histogram.brush = d3.brushX()
				.extent([[0, 0], [width, height]])
				.on("end", viz.histogram.brushed);
			viz.histogram.svg.append("g")
			  .attr("class", "brush")
			  .call(viz.histogram.brush)
			  .call(viz.histogram.brush.move, viz.histogram.x.range());							
		},
		resetBrush : function() {
			viz.histogram.svg.select(".brush")
			  .call(viz.histogram.brush.move, viz.histogram.x.range());		
		},
		brushed : function() {			
			if (d3.event.sourceEvent) { console.log(d3.event.sourceEvent.type); }
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "mouseup") {
				viz.ice.x.domain(
					d3.event.selection.map(viz.histogram.x.invert)
				);
				viz.ice.update(false);
			}
		},
		update : function() {
			//TODO: Remover dependência das dimensões
			//TODO: Consertar - Só a primeira transição funciona
			var margin = {top: 10, right: 30, bottom: 30, left: 30};
			var bound = d3.select("#histogram-chart").node().getBoundingClientRect();
			var width = bound.width - margin.left - margin.right;
			var height = bound.height - margin.top - margin.bottom;		
			//Novos valores máximos de X
			var max_x = d3.max(viz.ice.data,function(d) {
				return d3.max(d.values,function(d) {
					return d.x
				});
			});
			var min_x = d3.min(viz.ice.data,function(d) {
				return d3.min(d.values,function(d) {
					return d.x
				});
			});		
			//Atualizando escala X
			viz.histogram.x.domain([min_x,max_x]);	
			var bins = d3.histogram()
				.domain(viz.histogram.x.domain())
				.thresholds(viz.histogram.x.ticks(40))
				(viz.histogram.data);
			//Atualizando escala Y
			viz.histogram.y.domain([0, d3.max(bins,function(d) {return d.length})]);

			
		}
	};
}(window.viz = window.viz || {}));