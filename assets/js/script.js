var s = d3.select('svg');

console.log(s);

s.attr('height', 800);
s.attr('width', 800);

s.append('circle') 
    .attr('r', 25)
    .attr('cx', 50)
    .attr('cy', 200)
    .style('fill', 'red');