const USER_WIDTH = $(window).width();
const DEV_WIDTH = 1670;
const INIT_RADIUS_SCALE = 5 / DEV_WIDTH * USER_WIDTH;
const RADIUS_SCALE = 30 / DEV_WIDTH * USER_WIDTH;
const SEPARATION_SCALE = 300 / DEV_WIDTH * USER_WIDTH;
const SPIKE_SCALE = 200 / DEV_WIDTH * USER_WIDTH;
const SPIKE_ANGLE = 13;
const PI = Math.PI;

$('#sel-range').slider();

let colorList = {
    'danger':'#000000',
    'conflict':'#FFFF00', 
    'crowd':'#1CE6FF', 
    'phone':'#FF34FF', 
    'unexpected':'#FF4A46',
    'future':'#008941',
    'work':'#006FA6',
    'stock':'#A30059',
    'parking':'#FFDBE5',
    'class':'#BA0900',
    'assignment':'#0000A6',
    'face-to-face':'#63FFAC'
}

let s = d3.select('svg');
s.attr('viewBox', 
    '0 0 ' + (8 * SEPARATION_SCALE).toString() + ' ' + (4 * SEPARATION_SCALE).toString());

let data = null;
let isIntroDone = false;

// Load data
d3.json('data.json', function(err, d) {
    if(err) {
        console.log(err);
    } else {
        data = d;
        drawText();
    }
});

function drawCircles() {
    s.selectAll()
        .data(data)
        .enter()
        .append('circle')
        .style('fill', '#446e9b')
        .attr('stroke', '#000') 
        .attr('r', INIT_RADIUS_SCALE)
        // auto space the circles in x direction
        .attr('cx', function(d) {
            return SEPARATION_SCALE * d.x;
        })
        // start circles above the viewbox
        .attr('cy', function(d) {
            return -2 * INIT_RADIUS_SCALE;
        });

        transitionCircles();
}

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
                // fill spikes according to colorList definitions
                .attr('fill', function(d) {
                    return colorList[d.type] != '#' ? colorList[d.type] : 'white'
                })
                .on('mouseover', function() {
                    // only fade in new text once the old has faded out
                    if ($('#event-time').css('opacity') == '0') {
                        var c = s.selectAll('circle')._groups[0][this.__data__.day];
                        $('#event-time').text(c.__data__.day_of_week + ', ' + this.__data__.time_str);
                        $('#event-detail').text(this.__data__.detail);
                        $('#event-time').fadeTo(200, 1);
                        $('#event-detail').fadeTo(200, 1);
                    }
                })
                .on('mouseout', function() {
                    // fade out text when leaving a spike
                    $('#event-time').fadeTo(100, 0);
                    $('#event-detail').fadeTo(100, 0);
                });
        });
    
    // once spikes are drawn, fade out the intro...
    $('#event-time').fadeTo(200, 0);
    $('#event-detail').fadeTo(200, 0, function() {
        // only show instruction text one time
        if (!isIntroDone) {
            $(this).text('Scroll over a spike to learn more.');
            $(this).delay(1000).fadeTo(200, 1);
            isIntroDone = !isIntroDone;
        }
    })
}

// returns a string of vertex points, e.g. '0,0 1,2 2,0'
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
        // move circles to final y positions
        .attr('cy', function(d) {
            return SEPARATION_SCALE * d.y;
        })
        .transition()
        .duration(1000)
        // scale radii according to number of events that day
        .attr('r', function(d) {
            return RADIUS_SCALE * Math.log(d.events.length + 1)
        });

        // draw spikes after circles settle
        setTimeout(drawSpikes, 1700);
}

function drawText() {
    // draw intro text
    $('#event-time').delay(1000).fadeTo(200, 1, function() {
        $('#event-detail').delay(1000 ).fadeTo(200, 1, function() {
            setTimeout(drawCircles, 1000);
        });
    }); 
}

function filterType(type, range) {
    redrawSpikes();
    // go through and delete spikes outside of range
    s.selectAll('polygon')
        .each(function(d, i) {
            if (d.rating < parseInt(range[0]) || d.rating > parseInt(range[1])) {
                this.remove();
            }
        });
    // from those remaining, delete spikes of the wrong type
    s.selectAll('polygon')
        .each(function(d, i) {
            if (type == 'all') {
                return;
            }
            if (d.type != type) {
                this.remove();
            }
        });
}

function reset() {
    // reset controls
    $('#sel-type').val('all');
    $('#sel-range').slider('destroy');
    $('#sel-range').slider();
    redrawSpikes();
}

function redrawSpikes() {
    // remove all spikes
    s.selectAll('polygon')
        .each(function(d, i) {
            this.remove();
        });
    // then re-draw them
    drawSpikes();
}