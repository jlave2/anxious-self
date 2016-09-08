let s = d3.select('svg');
let w = s.attr('width');
let h = s.attr('height');

console.log(w, h);

var data = null;

d3.json('/data.json', function(d) {
    data = d;
    bindData();
});

function bindData() {
    s.selectAll('circle')
        .data(data)
        .enter()
        .append('circle') 
        .attr({
            'r':Math.floor((Math.random() * 50) + 1),
            'cx':function(d) {return d.x;},
            'cy':function(d) {return d.y;}})
        .style('fill', 'teal');
}


/*for (let j=1; j<=3; j++) {
    for(let i=1; i<=7; i++) {
        s.append('circle') 
            .attr('r', Math.floor((Math.random() * 50) + 1))
            .attr('cx', i * w / 8)
            .attr('cy', j * h / 4)
            .style('fill', 'teal');
    }
}*/