
const USER_WIDTH = $(window).width();
const DEV_WIDTH = 1670;
const RADIUS_SCALE = 30 / DEV_WIDTH * USER_WIDTH;
const SEPARATION_SCALE = 250 / DEV_WIDTH * USER_WIDTH;
const OFFSET_SCALE = 25 / DEV_WIDTH * USER_WIDTH;
const SPIKE_SCALE = 150 / DEV_WIDTH * USER_WIDTH;
const SPIKE_ANGLE = 8;
const PI = Math.PI;

var colorList = {
    'danger':'#CD0000',
    'crowd':'#8E388E', 
    'conflict':'#7171C6', 
    'phone':'#388E8E', 
    'unexpected':'#71C671',
    'future':'#8E8E38',
    'work':'#C5C1AA',
    'stock':'#C67171',
    'parking':'#555555',
    'class':'#1C86EE',
    'assignment':'',
    'face':'#FFC0CB'
}

let s = d3.select('svg');
s.attr('viewBox', 
    '0 0 ' + (8 * SEPARATION_SCALE).toString() + ' ' + (4 * SEPARATION_SCALE).toString());

var data = null;

// Load data
d3.json('/data.json', function(err, d) {
    if(err) {
        console.log(err);
    } else {
        data = d;
        //console.log(data[0].events.length);
        drawCircles();
        drawSpikes();
    }
});

function drawCircles() {
    s.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', function(d) {
            return RADIUS_SCALE * Math.log(d.events.length + 1)
        })
        .attr('cx', function(d) {
            return SEPARATION_SCALE * d.x //+ OFFSET_SCALE * (Math.random() - 0.5)
        })
        .attr('cy', function(d) {
            return SEPARATION_SCALE * d.y //+ OFFSET_SCALE * (Math.random() - 0.5)
        })
        .style('fill', 'teal')
        .attr('stroke', 'black')        
        .on('mouseover', function(d) {
            console.log(d3.selectAll('circle'));
            s.append('text')
                .text(d.date)
                .attr('x', SEPARATION_SCALE * d.x)
                .attr('y', SEPARATION_SCALE * d.y)
                .attr('fill', 'white')
                .attr('font-family', 'sans-serif')
                .attr('font-size', 24)
                .attr('font-weight', 'bold')
        })
        .on('mouseout', function() {
            s.selectAll('text').remove()
        });
}

function drawSpikes() {
    var circleList = s.selectAll('circle')._groups[0];
    for (var circle = 0; circle < circleList.length; circle++) {
        var c = circleList[circle];
        var cx = c.cx.baseVal.value;
        var cy = c.cy.baseVal.value;
        var eventsList = c.__data__.events;
        var numberOfEvents = c.__data__.events.length;
        var r = c.r.baseVal.value;
        
        for (var event = 0; event < eventsList.length; event++) {
            var e = eventsList[event];
            // Create string of svg points
            var p1x = (cx - r * Math.sin(PI / 12 * e.time_float - SPIKE_ANGLE * PI / 180)).toString();
            var p1y = (cy + r * Math.cos(PI / 12 * e.time_float - SPIKE_ANGLE * PI / 180)).toString();
            var p2x = (cx - r * Math.sin(PI / 12 * e.time_float + SPIKE_ANGLE * PI / 180)).toString();
            var p2y = (cy + r * Math.cos(PI / 12 * e.time_float + SPIKE_ANGLE * PI / 180)).toString();
            var p3x = (cx - (r + SPIKE_SCALE * e.rating / 10) * Math.sin(PI / 12 * e.time_float)).toString();
            var p3y = (cy + (r + SPIKE_SCALE * e.rating / 10) * Math.cos(PI / 12 * e.time_float)).toString();
            var polyStr = p1x + ',' + p1y + ' ' +
                          p2x + ',' + p2y + ' ' +
                          p3x + ',' + p3y;
            s.append('polygon')
                .attr('points', polyStr)
                .attr('stroke', 'black')
                .attr('fill', colorList[e.type] != '' ? colorList[e.type] : 'white');
        }

        //s.append('polygon')
        //    .attr('points', '')
    }
}