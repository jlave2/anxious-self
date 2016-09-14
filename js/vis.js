const USER_WIDTH = $(window).width();
const DEV_WIDTH = 1670;
const INIT_RADIUS_SCALE = 5 / DEV_WIDTH * USER_WIDTH;
const RADIUS_SCALE = 30 / DEV_WIDTH * USER_WIDTH;
const SEPARATION_SCALE = 300 / DEV_WIDTH * USER_WIDTH;
//const OFFSET_SCALE = 25 / DEV_WIDTH * USER_WIDTH;
const SPIKE_SCALE = 200 / DEV_WIDTH * USER_WIDTH;
const SPIKE_ANGLE = 13;
const PI = Math.PI;

let colorList = {
    'danger':'#FF6961',
    'conflict':'#FFB347', 
    'crowd':'#FDFD96', 
    'phone':'#77DD77', 
    'unexpected':'#AEC6CF',
    'future':'#779ECB',
    'work':'#966FD6',
    'stock':'#',
    'parking':'#',
    'class':'#',
    'assignment':'#',
    'face':'#'
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
        drawCircles();
    }
});

function drawCircles() {
    s.selectAll()
        .data(data)
        .enter()
        .append('circle')
        .style('fill', '#33A0A0')
        .attr('stroke', '#000') 
        .attr('r', INIT_RADIUS_SCALE)
        .attr('cx', function(d) {
            return SEPARATION_SCALE * d.x;// + OFFSET_SCALE * (Math.random() - 0.5)
        })
        .attr('cy', function(d) {
            return -2* INIT_RADIUS_SCALE;// * d.y //+ OFFSET_SCALE * (Math.random() - 0.5)
        });

        transitionCircles();
}

// Original -- works, but not very clean
/*function drawSpikes() {
    var circleList = s.selectAll('circle')._groups[0];
    for (var circle = 0; circle < circleList.length; circle++) {
        var c = circleList[circle];
        var cx = c.cx.baseVal.value;
        var cy = c.cy.baseVal.value;
        var r = c.r.baseVal.value;        
        var eventsList = c.__data__.events;
        var numberOfEvents = c.__data__.events.length;
        
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
                .attr('fill', colorList[e.type] != '' ? colorList[e.type] : 'white')
        }
    }
}*/

function drawSpikes() {
    s.selectAll('circle')
        // for each circle object (day)
        .each(function(d, i){
            // record its x and y position...
            var cx = this.cx.baseVal.value;
            var cy = this.cy.baseVal.value;
            // ...and its radius
            var r = this.r.baseVal.value;   
            s.selectAll()
                // then bind each event that day to a polygon
                .data(d.events)
                .enter()
                .append('polygon')
                .attr('points', function(d) {
                    return polygonPtsString(cx, cy, r, d.time_float, d.rating, false);
                })
                .attr('stroke', 'black')
                .attr('fill', function(d) {
                    return colorList[d.type] != '#' ? colorList[d.type] : 'white'
                })
                .on('mouseover', function() {
                    var c = s.selectAll('circle')._groups[0][this.__data__.day];
                    $('#event-time').text(c.__data__.day_of_week + ', ' + this.__data__.time_str);
                    $('#event-detail').text(this.__data__.detail);
                    $('#event-time').fadeTo(10, 1);
                    $('#event-detail').fadeTo(10, 1);
                })
                .on('mouseout', function() {
                   $('#event-time').fadeTo(10, 0);                    
                   $('#event-detail').fadeTo(10, 0);                    
                });
        });

    $('#event-detail').delay(500).fadeTo(200, 1);
}

/*function drawSpikes() {
    s.selectAll('circle')
        .each(function(d) {
            // record its x and y position...
            var cx = this.cx.baseVal.value;
            var cy = this.cy.baseVal.value;
            // ...and its radius
            var r = this.r.baseVal.value;  
            d3.select(this)
                .selectAll('polygon')
                .data(d.events)
                .enter()
                .append('polygon')
                .attr('points', function(e) {
                    console.log(e);
                    return polygonPtsString(cx, cy, r, d.time_float, d.rating, false);
                })
                .attr('stroke', 'black')
                .attr('fill', function(d) {
                    return colorList[d.type] != '' ? colorList[d.type] : 'white'
                })
        })
        //.data(this.__data__.events)
        //.enter()
        //.append('polygon')
        //.attr('points', '0,0 10,10 20,10')
        //.attr('fill', 'red')

    console.log(s.selectAll('circle').node());
}*/

function polygonPtsString(cx, cy, r, eventTime, eventRating, selected) {
    var spikeSize = selected ? (1.5 * SPIKE_SCALE) : SPIKE_SCALE;
    var p1x = (cx - r * Math.sin(PI / 12 * eventTime - SPIKE_ANGLE * PI / 180)).toString();
    var p1y = (cy + r * Math.cos(PI / 12 * eventTime - SPIKE_ANGLE * PI / 180)).toString();
    var p2x = (cx - r * Math.sin(PI / 12 * eventTime + SPIKE_ANGLE * PI / 180)).toString();
    var p2y = (cy + r * Math.cos(PI / 12 * eventTime + SPIKE_ANGLE * PI / 180)).toString();
    var p3x = (cx - (r + spikeSize * eventRating / 10) * Math.sin(PI / 12 * eventTime)).toString();
    var p3y = (cy + (r + spikeSize * eventRating / 10) * Math.cos(PI / 12 * eventTime)).toString();
    var ptsString = p1x + ',' + p1y + ' ' +
                    p2x + ',' + p2y + ' ' +
                    p3x + ',' + p3y;
    return ptsString;
}

function transitionCircles() {
    s.selectAll('circle')
        .data(data)
        .transition()
        .duration(600)
        .attr('cy', function(d) {
            return SEPARATION_SCALE * d.y;
        })
        .transition()
        .duration(1000)
        .attr('r', function(d) {
            return RADIUS_SCALE * Math.log(d.events.length + 1)
        });

        setTimeout(drawSpikes, 1700);
}