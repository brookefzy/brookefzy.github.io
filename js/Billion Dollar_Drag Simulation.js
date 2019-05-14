   ///////setting up/////////////////////////////////////////////////
   var width = 800
   var height = 800
   ////////wrapping text function////////////////////////////////////
   function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }


   const GRID_SIZE = 75;
   const GRID_COLS = 9;
   const svg = d3.select("#vis")
             .append("svg")
             .attr("width", width)
             .attr("height", height)
             .attr("text-anchor", "middle")
             .attr("font-family", "sans-serif");

             
   const drag = function (simulation) {
       function dragstarted(d) {
         if (!d3.event.active) simulation.alphaTarget(0.3).restart();
         d.fx = d.x;
         d.fy = d.y;
         }
   
       function dragged(d) {
         d.fx = d3.event.x;
         d.fy = d3.event.y;
         }
       
       function dragended(d) {
         if (!d3.event.active) simulation.alphaTarget(0);
         d.fx = null;
         d.fy = null;
         }
       
       return d3.drag()
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended);
     }
   
   ////////////////read data//////////////////////////////////////////////////////////         
   const myData = d3.csv("https://raw.githubusercontent.com/TianyuSu/Innovation-Immigration/master/Data_BillionDollar/dataEmployee.csv")
       .then(function(myData){(myData)
       console.log(myData)
   ////Sort Data
   let dataEmployee = myData.slice(0)
     let dataFounder= myData.sort(function(x,y){
     return d3.descending(x.ImmiOrNot, y.ImmiOrNot)
     })
     // let dataEmployee = myData.sort(function(x,y){
     //   return d3.descending(x.EmployeeNum, y.EmployeeNum)
     // })
   
     let dataFounderNoradius=[]
     for(var i = 0; i<dataFounder.length;i++){
       let row = {}
       row.Company = dataFounder[i].Company
       row.Valuation = dataFounder[i].Valuation //for the radius
       row.EmployeeNum = dataFounder[i].EmployeeNum
       row.FounderNation = dataFounder[i].FounderNation
       row.ValuePerEmployee = dataFounder[i].ValuPerEmployee
       row.ImmiOrNot = dataFounder[i].ImmiOrNot
       row.Radius = 15
       dataFounderNoradius.push(row)
     }
   
   
     const GRID_ROWS = Math.ceil(myData.length / GRID_COLS); 
     ////////////call tooptip//////////////////////////////////        
     tooltip = d3.select("#vis")
         .append("div")
         .style("position", "absolute")
         .style("z-index", "10")
         .style("visibility", "hidden")
         .style("color", "white")
         .style("padding", "8px")
         .style("background-color", "rgba(0, 0, 0, 0.75)")
         .style("border-radius", "6px")
         .style("font", "12px sans-serif");
   
   
    //////////////////Create Grid//////////////////////////////////
     let grid = {
       cells : [],
       init : function() {
         this.cells = [];
         for(var c = 0; c < GRID_COLS; c++) {
           for(var r = 0; r < GRID_ROWS; r++) {
             var cell;
             cell = {
               x : c * GRID_SIZE,
               y : r * GRID_SIZE,
               occupied : false
             };
             this.cells.push(cell);
           };
         };
       },
         
       sqdist : function(a, b) {
         return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
       },
   
       occupyNearest : function(p) {
         var minDist = 1000000;
         var d;
         var candidate = null;
         for(var i = 0; i < this.cells.length; i++) {
           if(!this.cells[i].occupied && ( d = this.sqdist(p, this.cells[i])) < minDist) {
             minDist = d;
             candidate = this.cells[i];
           }
         }
         if(candidate)
           candidate.occupied = true;
         return candidate;
       }
     }
   ////////////////////initiate first graph//////////////////////////////
     grid.init();
   
     var nodes = dataFounderNoradius.map(d => Object.create(d));
     var simulation = d3.forceSimulation(nodes).force("center", d3.forceCenter(width / 2, height / 2))
     var node = svg.append("g")
         .attr("stroke-width", 1.5)
         .selectAll("circle")
         .data(nodes)
         .join("circle")
         .attr("r", d=>d.Radius)
         .attr("opacity", 1)
         .attr("fill", d => (d.ImmiOrNot == 1 ) ? '#f3e834' : '#428494')
         .call(drag(simulation))
         .on('mouseover', 
            function (d) {
               d3.select(this)
                 .attr('opacity', 1.5)
                 .attr('r',d=> 2 * d.Radius);
               tooltip.style("visibility", "visible");
               tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").html(`
             <div style='float: right'>
               Company: ${d.Company} <br/>
               Valuation: ${d.Valuation} Billion <br/>
               Number of Employee: ${d.EmployeeNum} <br/>
               Founder: 
             </div>`)
           })
         .on("mousemove", function (d) {
           tooltip.style("visibility", "visible");
           tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").html(`
           <div style='float: right'>
           Company: ${d.Company} <br/>
           Valuation: ${d.Valuation} Billion <br/>
           Number of Employee: ${d.EmployeeNum} <br/>
           Founder: 
           </div>`)
         })
         .on("mouseout", function(d){
             d3.select(this)
             .attr('opacity', 0.8)
             .attr('r',d=>d.Radius)
             tooltip.style("visibility", "hidden")
           })
           
    const text = svg.append("g")
                    .selectAll("text")
                    .data(nodes)
                    .join("text")
                    .attr("class", "nodetext")
                    .attr("x", d => d.x)
                    .attr("y", d => d.y-15)
                    .attr("fill", "#FFFFFF")
                    .text(d => (d.Company))


     
     simulation.on("tick", () => {
     grid.init();
     node.each(function(d) { 
             let gridpoint = grid.occupyNearest(d);
             if (gridpoint) {            
                 d.x += (gridpoint.x - d.x) * .05;
                 d.y += (gridpoint.y - d.y) * .05;
               }
            })
           .attr("cx", d => d.x)
           .attr("cy", d => d.y);
     text
     .attr("x", d => d.x)
     .attr("y", d => d.y+4);      
     });
   
     /////////////////////update Data Function///////////////////////////
     function update(selectedData){
      console.log(selectedData, 2828282282)
   
       grid.init();
       var newnodes = selectedData.map(d => Object.create(d));
       var newsimulation = d3.forceSimulation(newnodes).force("center", d3.forceCenter(width / 2, height / 2))
       var newnode = svg.selectAll("circle")
         .attr("stroke-width", 1.5)
         .data(newnodes)
         .join("circle")
         .attr("r", d=>d.Radius)
         .attr("opacity", 1)
         .attr("fill", d => (d.ImmiOrNot == 1 ) ? '#f3e834' : '#428494')
         .call(drag(newsimulation))
         .on('mouseover', 
            function (d) {
               d3.select(this)
                 .attr('opacity', 0.5)
                 .attr('r',d=> 2 * d.Radius);
               tooltip.style("visibility", "visible");
               tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").html(`
             <div style='float: right'>
               Company: ${d.Company} <br/>
               Valuation: ${d.Valuation} Billion <br/>
               Number of Employee: ${d.EmployeeNum} <br/>
               Founder: 
             </div>`)
           })
         .on("mousemove", function (d) {
           tooltip.style("visibility", "visible");
           tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px").html(`
           <div style='float: right'>
           Company: ${d.Company} <br/>
           Valuation: ${d.Valuation} Billion <br/>
           Number of Employee: ${d.EmployeeNum} <br/>
           Founder: 
           </div>`)
         })
         .on("mouseout", function(d){
             d3.select(this)
             .attr('opacity', 0.8)
             .attr('r',d=>d.Radius)
             tooltip.style("visibility", "hidden")
           });

 var newtext = svg.selectAll("text")
          //  .selectAll("text")
           .data(newnodes)
           .join("newtext")
           .attr("class", "nodetext")
           .attr("x", d => d.x)
           .attr("y", d => d.y-15)
           .attr("fill", "#FFFFFF")
           .text(d => (d.Company));        
   


     newsimulation.on("tick", () => {
     grid.init();
     newnode.each(function(d) { 
             let gridpoint = grid.occupyNearest(d);
             if (gridpoint) {            
   
                 d.x += (gridpoint.x - d.x) * .05;
                 d.y += (gridpoint.y - d.y) * .05;
               
               }
            })
           .attr("cx", d => d.x)
           .attr("cy", d => d.y);
           newtext
           .attr("x", d => d.x)
           .attr("y", d => d.y+4);   
     });
     }
   
            // When the button is changed, run the updateChart function 
   var selectedData;
     d3.select('#mySelect')
         .on("change", function () {
   
           var sect = document.getElementById("mySelect");
           var section = sect.value;
           if(section==1){
             selectedData=dataEmployee;
           }else{selectedData = dataFounderNoradius}
           
           update(selectedData);
         })
   })
   