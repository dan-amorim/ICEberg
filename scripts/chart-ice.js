//Globais: N/A
(function (viz) {
	'use strict';
	//ICE
	viz.ice = {
		data : {},
		x : {},
		y : {},
		z : {},
		svg : {},
		updateMaxMin : function() {
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
			var max_y = d3.max(viz.ice.data,function(d) {
				return d3.max(d.values,function(d) {
					return d.y
				});
			});
			var min_y = d3.min(viz.ice.data,function(d) {
				return d3.min(d.values,function(d) {
					return d.y
				});
			});	
			var max_z = d3.max(viz.ice.data,function(d) {
				return d.interaction
			});
			var min_z = d3.min(viz.ice.data,function(d) {
				return d.interaction
			});		
			return {
				x : { max: max_x, min : min_x},
				y : { max: max_y, min : min_y},
				z : { max: max_z, min : min_z}
			};
		},
		build : function() {
			var margin = {top: 10, right: 30, bottom: 30, left: 30};
			var bound = d3.select("#ice-chart").node().getBoundingClientRect();
			var width = bound.width - margin.left - margin.right;
			var height = bound.height - margin.top - margin.bottom;		
			//Valores máximos e mínimos
			var v = viz.ice.updateMaxMin();
			//Escalas
			viz.ice.x = d3.scaleLinear()
				.domain([v.x.min,v.x.max])
				.range([0,width]);
			viz.ice.y = d3.scaleLinear()
				.domain([v.y.min,v.y.max])
				.range([height,0]);		
			viz.ice.z = d3.scaleLinear()
				.domain([v.z.min, (v.z.min+v.z.max)/2, v.z.max])
				.range(viz.colors.gradient);
			//Split do gráfico pelo Crossfilter
			
			//Criando o SVG do gráfico
			viz.ice.svg = d3.select("#ice-chart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
			//Marcando clip path
			viz.ice.svg.append("defs").append("clipPath")
				.attr("id", "clip")
				.append("rect")
				.attr("width", width)
				.attr("height", height);			
			//Criando eixos
			viz.ice.svg.append("g")
				.attr("class", "ice-axis-x")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(viz.ice.x));
			viz.ice.svg.append("g")
				.attr("class", "ice-axis-y")
				.call(d3.axisLeft(viz.ice.y));				
			//Criando linhas
			var line = d3.line()
				.x(function(d) {
					return viz.ice.x(d.x)
				})
				.y(function(d) {
					return viz.ice.y(d.y)
				});
			var iceseries = viz.ice.svg.selectAll(".iceseries")
				.data(viz.ice.data)
				.enter()
				.append("path")
				.attr("class","iceseries")
				.attr("fill","none")
				.style("opacity", 0.8)
				.attr("d",function(d) { return line(d.values) })
				//.style("opacity", function(d) {return d.interaction < 0.5 ? 0.9 : 0.1; })
				.style("stroke", function(d) { 
					if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }
					else { return viz.ice.z(d.interaction);  }
				});
				
		},
		update : function(update_scale=true, brushed) {
			console.log(brushed);
			var margin = {top: 10, right: 30, bottom: 30, left: 30};
			var bound = d3.select("#ice-chart").node().getBoundingClientRect();
			var width = bound.width - margin.left - margin.right;
			var heigh = bound.height - margin.top - margin.bottom;		
			
			if (update_scale) {		
				//Valores máximos e mínimos
				var v = viz.ice.updateMaxMin();
				//Escalas
				viz.ice.x.domain([v.x.min,v.x.max]);
				viz.ice.y.domain([v.y.min,v.y.max]);		
				viz.ice.z.domain([v.z.min, (v.z.min+v.z.max)/2, v.z.max]);					
			}

			//Criando linhas
			var line = d3.line()
				.x(function(d) {
					return viz.ice.x(d.x)
				})
				.y(function(d) {
					return viz.ice.y(d.y)
				});
			var t0 = d3.transition().duration(500);
			var iceseries = viz.ice.svg.selectAll(".iceseries")
				.data(viz.ice.data);
			iceseries.exit().remove();
			iceseries.enter()
				.append("path")
				.attr("class","iceseries")
				.attr("fill","none")
				.attr("d",function(d) { return line(d.values); })
				.style("opacity", function(d) {
					if (brushed) {
						if (d.interaction > brushed[0] && d.interaction < brushed[1]) { return 0.8; }
						else { return 0.1; }
					}
					else { return 0.8 }
				})
				.style("stroke", function(d) { 
					if (brushed) {
						if (d.interaction > brushed[0] && d.interaction < brushed[1]) { 
							if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }
							else { return viz.ice.z(d.interaction);  }	
						}
						else { return viz.colors.gray; }
					}		
					else {
						if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }
						else { return viz.ice.z(d.interaction);  }
					}
				});
			iceseries.transition(t0)
				.attr("d",function(d) { 
					return line(d.values);
				})
				.style("opacity", function(d) {
					if (brushed) {
						if (d.interaction > brushed[0] && d.interaction < brushed[1]) { return 0.8; }
						else { return 0.1; }
					}
					else { return 0.8 }
				})
				.style("stroke", function(d) { 
					if (brushed) {
						if (d.interaction > brushed[0] && d.interaction < brushed[1]) { 
							if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }
							else { return viz.ice.z(d.interaction);  }	
						}
						else { return viz.colors.gray; }
					}		
					else {
						if (viz.selection.icevar == viz.selection.intvar) { return viz.colors.gray; }
						else { return viz.ice.z(d.interaction);  }
					}
				});
			//Atualizando eixos
			viz.ice.svg.select(".ice-axis-x")
				.transition(t0)
				.call(d3.axisBottom(viz.ice.x));
			viz.ice.svg.select(".ice-axis-y")
				.transition(t0)
				.call(d3.axisLeft(viz.ice.y));				
		}
	};
}(window.viz = window.viz || {}));
