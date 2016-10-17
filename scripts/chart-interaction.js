//Globais: N/A
(function (viz) {
	'use strict';
	//Histograma de interação
	viz.interaction = {
		data : {},
		x : {},
		y : {},
		z : {},
		svg : {},		
		brush : {},
		build : function() {
			var formatCount = d3.format(",.0f");
			//Dimensões do gráfico
			var margin = {top: 10, right: 30, bottom: 30, left: 30};
			var bound = d3.select("#interaction-histogram").node().getBoundingClientRect();
			var width = bound.width - margin.left - margin.right;
			var height = bound.height - margin.top - margin.bottom;		
			//Escalas
			var min_x = d3.min(viz.interaction.data);
			var max_x = d3.max(viz.interaction.data);
			viz.interaction.x = d3.scaleLinear()
				.rangeRound([0,width])
				.domain([min_x,max_x]);
			var bins = d3.histogram()
				.domain(viz.interaction.x.domain())
				.thresholds(viz.interaction.x.ticks(20))
				(viz.interaction.data);
			viz.interaction.y = d3.scaleLinear()
				.domain([0, d3.max(bins,function(d) {return d.length})])
				.range([height, 0]);
			viz.interaction.z = d3.scaleLinear()
				.domain([min_x, (min_x+max_x)/2, max_x])
				.range(viz.colors.gradient);				
			//Criando o SVG do gráfico

			viz.interaction.svg = d3.select("#interaction-histogram").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");		
			//Criando as barras
			var bars = viz.interaction.svg.selectAll(".bar-interaction")
				.data(bins)
				.enter()
				.append("rect")
				.attr("class","bar-interaction")
				.attr("transform", function(d) { return "translate(" + viz.interaction.x(d.x0) + "," + viz.interaction.y(d.length) + ")"; })
				.attr("x", 1)
				.attr("width", viz.interaction.x(bins[0].x1) - viz.interaction.x(bins[0].x0) - 1)
				.attr("height", function(d) { 
					return height - viz.interaction.y(d.length); 
				})
				.style("fill",function(d) { 
					if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }				
					else { return viz.interaction.z((d.x0+d.x1)/2); }
				});	
			viz.interaction.svg.append("g")
				.attr("class", "int-axis-x")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(viz.interaction.x));	
			//Criando o Brush
			viz.interaction.brush = d3.brushX()
				.extent([[0, 0], [width, height]])
				.on("end", viz.interaction.brushed);
			viz.interaction.svg.append("g")
			  .attr("class", "brush")
			  .call(viz.interaction.brush)
			  .call(viz.interaction.brush.move, viz.interaction.x.range());							
		},
		brushed : function() {
			if (d3.event.sourceEvent) { console.log(d3.event.sourceEvent.type); }
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "mouseup") {				
				viz.ice.update(
					false,
					d3.event.selection.map(viz.interaction.x.invert)				
				);
			}			
		},
		update : function() {
			//TODO: Remover dependência das dimensões
			//TODO: Consertar - Só a primeira transição funciona
			var margin = {top: 10, right: 30, bottom: 30, left: 30};
			var bound = d3.select("#interaction-histogram").node().getBoundingClientRect();
			var width = bound.width - margin.left - margin.right;
			var height = bound.height - margin.top - margin.bottom;					
			//Atualizando escala x
			var max_x = d3.max(viz.interaction.data);
			var min_x = d3.min(viz.interaction.data);
			viz.interaction.x.domain([min_x,max_x]);	
			var bins = d3.histogram()
				.domain(viz.interaction.x.domain())
				.thresholds(viz.interaction.x.ticks(20))
				(viz.interaction.data);
			viz.interaction.y.domain([0, d3.max(bins,function(d) {return d.length})]);
			viz.interaction.z = d3.scaleLinear()
				.domain([min_x, (min_x+max_x)/2, max_x])
				.range(viz.colors.gradient);				
			//Criando barras conforme necessário
			var bars = viz.interaction.svg.selectAll(".bar-interaction")				
				.data(bins);
			//Removendo barras desnecessárias
			bars.exit().remove();						
			//Adicionando novas barras
			bars.enter().append("rect")
				.attr("class","bar-interaction")
				.attr("transform", function(d) { return "translate(" + viz.interaction.x(d.x0) + "," + viz.interaction.y(d.length) + ")"; })
				.attr("x", 1)
				.style("fill",function(d) { 
					if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }				
					else { return viz.interaction.z((d.x0+d.x1)/2); }
				})
				.attr("width", viz.interaction.x(bins[0].x1) - viz.interaction.x(bins[0].x0) - 1)
				.attr("height", function(d) { return height - viz.interaction.y(d.length); });					
			//Posicionando as barras
			bars.transition().duration(1000)
				.attr("transform", function(d) { return "translate(" + viz.interaction.x(d.x0) + "," + viz.interaction.y(d.length) + ")"; })
				.attr("x", 1)
				.style("fill",function(d) { 
					if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }				
					else { return viz.interaction.z((d.x0+d.x1)/2); }
				})
				.attr("width", viz.interaction.x(bins[0].x1) - viz.interaction.x(bins[0].x0) - 1)
				.attr("height", function(d) { return height - viz.interaction.y(d.length); });			
			//Refazendo o eixo
			viz.interaction.svg.select(".int-axis-x")
				.transition().duration(1000)
				.call(d3.axisBottom(viz.interaction.x));				
		}
	};
}(window.viz = window.viz || {}));